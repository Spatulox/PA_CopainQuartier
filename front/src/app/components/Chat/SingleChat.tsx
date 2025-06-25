import React, { use } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../../api/user";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";

// Enum pour les boutons
export enum ShowChatButton {
    Chat = 1 << 0,         // 1 : Voir le chat
    Manage = 1 << 1,       // 2 : Gérer le channel
    Join = 1 << 2,         // 4 : Rejoindre le channel
    Leave = 1 << 3,        // 8 : Quitter le channel
    Delete = 1 << 4,       //16 : Supprimer le channel
    All = Chat | Manage | Join | Leave | Delete,
    None = 0
}

type ShowChatProps = {
    channel: Channel;
    user: User | undefined;
    onViewChat?: (id: string) => void;
    onManage?: (id: string) => void;
    onJoin?: (id: string) => void;
    onLeave?: (id: string) => void;
    onDelete? :(id: string) => void;
    buttonShow: ShowChatButton;
};

export function ShowChat({
    channel,
    user,
    onViewChat,
    onManage,
    onJoin,
    onLeave,
    onDelete,
    buttonShow
}: ShowChatProps) {
    const navigate = useNavigate();
    return (
        <div key={channel._id}>
            <h2>{channel.name}</h2>
            <div>
                <span>Créé par : {channel.admin ? channel.admin.email : ""}</span>
                <span>Créé le : {new Date(channel.created_at).toLocaleDateString()}</span>
                <p>{channel.description}</p>
                {(user?._id === channel.admin?._id || user?.role === UserRole.admin) && (
                    <ul>
                        <li>Autorisations : {channel.member_auth}</li>
                        <li>Membres : {channel.members?.length || 0}</li>
                        <li>Type : {channel.type}</li>
                    </ul>
                )}
                {(user?._id !== channel.admin?._id && user?.role != UserRole.admin) && (
                    <ul>
                        <li>Type : {channel.type}</li>
                        <li>Membres : {channel.members?.length || 0}</li>
                    </ul>
                )}
            </div>
            <div>
                {/* Bouton "Voir le chat" */}
                {(buttonShow & ShowChatButton.Chat) !== 0 && (
                    <button onClick={() =>
                        onViewChat
                            ? onViewChat(channel._id)
                            : navigate(`${Route.chat}/${channel._id}`)
                    }>
                        Voir le chat
                    </button>
                )}

                {/* Bouton "Gérer le channel" */}
                {(buttonShow & ShowChatButton.Manage) !== 0 &&
                    onManage &&
                    user &&
                    (channel.admin?._id === user._id || user.role == UserRole.admin) && (
                        <button onClick={() => onManage(channel._id)}>
                            Gérer le channel
                        </button>
                )}

                {/* Bouton "Rejoindre le channel" */}
                {(buttonShow & ShowChatButton.Join) !== 0 &&
                    onJoin &&
                    user &&
                    !isUserInChannel(channel, user) && (
                        <button onClick={() => onJoin(channel._id)}>
                            Rejoindre le channel
                        </button>
                )}

                {/* Bouton "Quitter le channel" */}
                {(buttonShow & ShowChatButton.Leave) !== 0 &&
                    onLeave &&
                    user &&
                    isUserInChannel(channel, user) && (
                        <button onClick={() => onLeave(channel._id)}>
                            Quitter le channel
                        </button>
                )}

                {/* Bouton "Supprimer le channel" */}
                {(buttonShow & ShowChatButton.Delete) !== 0 &&
                    onLeave &&
                    user &&
                    isUserInChannel(channel, user) && (
                        <button onClick={() => onLeave(channel._id)}>
                            Quitter le channel
                        </button>
                )}
            </div>
        </div>
    );
}


function isUserInChannel(channel: Channel, user: User): boolean {
  if (!user) return false;
  if (!channel.members) return false;

  // If members is an array of strings (user IDs)
  if (typeof channel.members[0] === 'string') {
    return (channel.members as string[]).includes(user._id);
  }

  // If members is an array of User objects
  return (channel.members as User[]).some((member) => member && member._id === user._id);
}