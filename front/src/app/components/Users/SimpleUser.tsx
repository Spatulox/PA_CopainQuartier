import { User } from "../../../api/user";
import { ShowChat, ShowChatButton } from "../Chat/SingleChat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";

export enum ShowUserButton {
    ViewUser = 1 << 0, // 2 (0b010)
    Manage = 1 << 1,          // 4 (0b100)
    Approve = 1 << 2,          // 4 (0b100)
    Delete = 1 << 3,          // 4 (0b100)
    All = ViewUser | Manage | Approve | Delete, // 7
    None = 0
}

type ShowUserProps = {
    theuser: User,
    user: User | null,
    onViewUser?: (id: string) => void,
    onApprove?: (id: string, bool: boolean) => void,
    onDelete?: (id: string) => void,
    onManage?: (id: string) => void,
    buttonShow: ShowUserButton
}

export function ShowUser({
    theuser,
    user,
    onViewUser,
    onApprove,
    onDelete,
    onManage,
    buttonShow
}: ShowUserProps) {
    const navigate = useNavigate()
    if(theuser)
    return (
        <div key={theuser._id}>
            <div>
                <h3>{theuser.name} {theuser.lastname}</h3>
                <section>
                    <h3>Coordonnées</h3>
                    <ul>
                        <li>Prénom : {theuser.name}</li>
                        <li>Nom : {theuser.lastname}</li>
                        <li>Email : {theuser.email}</li>
                        <li>Téléphone : {theuser.phone}</li>
                        <li>Rôle : {theuser.role}</li>
                        <li>Score au Troc : {theuser.troc_score}</li>
                        <li>Vérifié : {theuser.verified ? "Oui" : "Non"}</li>
                    </ul>
                    <h3>Group Chat</h3>
                    <ul>
                        {theuser.group_chat_list_ids.length > 0 && theuser.group_chat_list_ids.map((chat: Channel) => (
                            <ShowChat
                                key={chat._id}
                                channel={chat}
                                user={theuser}
                                onViewChat={(id) => navigate(`${Route.chat}/${id}`)}
                                onManage={(id) => navigate(`${Route.manageChannels}/${id}`)}
                                buttonShow={ShowChatButton.Chat | ShowChatButton.Manage}
                            />
                        ))}
                    </ul>
                </section>
            </div>
            <div>
                {(buttonShow & ShowUserButton.ViewUser) !== 0 &&
                    onViewUser && (
                        <button id={theuser._id} onClick={() => onViewUser((theuser._id))}>Voir l'utilisateur</button>
                )}

                {(buttonShow & ShowUserButton.Manage) !== 0 && onManage && (
                    <button id={theuser._id} onClick={() => onManage(theuser._id)}>
                        Gérer l'utilisateur
                    </button>
                )}

                {(buttonShow & ShowUserButton.Approve) !== 0 &&
                    onApprove && (
                        <button onClick={() => onApprove(theuser._id, true)}>
                            Approuver l'utilisateur
                        </button>
                )}

                {(buttonShow & ShowUserButton.Delete) !== 0 &&
                    onDelete && (
                        <button onClick={() => onDelete(theuser._id)}>
                            Approuver l'utilisateur
                        </button>
                )}
            </div>
        </div>
    );
}