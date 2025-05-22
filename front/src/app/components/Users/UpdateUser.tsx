import React, { useState } from "react";
import { User, UserRole } from "../../../api/user";
import { useAuth } from "../shared/auth-context";
import { ShowChat, ShowChatButton } from "../Chat/SingleChat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";

type UpdateUserProps = {
    theuser: User;
    user: User | null;
    onUpdate: (id: string, update: UpdateUserType | UpdateUserTypeAdmin) => void;
    onApprove?: (id: string, bool: boolean) => void;
    onDelete?: (id: string) => void;
};

export type UpdateUserType = {
    name: string,
    lastname: string,
    address: string,
    phone: string
}

export type UpdateUserTypeAdmin = {
    role: UserRole
}

export function UpdateUser({
    theuser,
    user,
    onUpdate,
    onApprove,
    onDelete
}: UpdateUserProps) {
    const { isAdmin } = useAuth();
    if(!theuser){
        return <p>Impossible de charger l'utilisateur</p>
    }

    const [name, setName] = useState(theuser.name || "");
    const [lastname, setLastname] = useState(theuser.lastname || "");
    const [phone, setPhone] = useState(theuser.phone || "");
    const [address, setAddress] = useState(theuser.address || "");
    const [role, setRole] = useState<UserRole>(theuser.role == UserRole.admin ? UserRole.admin : UserRole.member);
    const navigate = useNavigate()

    // Détermine si l'utilisateur courant édite son propre profil
    const isSelf = user?._id === theuser._id;

    function handleUpdate() {
        if (isAdmin && theuser) {
            onUpdate(theuser._id, { role });
        } else if (isSelf && theuser) {
            onUpdate(theuser._id, { name, lastname, phone, address });
        }
    }
    
    if(theuser && user)
    return (
        <div key={theuser._id}>
            <h2>Modifier l'utilisateur</h2>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleUpdate();
                }}
            >
                <div>
                    <label>
                        Prénom :
                        {isSelf ? (
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        ) : (
                            <span>{theuser.name}</span>
                        )}
                    </label>
                </div>
                <div>
                    <label>
                        Nom :
                        {isSelf ? (
                            <input
                                type="text"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                            />
                        ) : (
                            <span>{theuser.lastname}</span>
                        )}
                    </label>
                </div>
                <div>
                    <label>
                        Téléphone :
                        {isSelf ? (
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        ) : (
                            <span>{theuser.phone}</span>
                        )}
                    </label>
                </div>
                <div>
                    <label>
                        Adresse :
                        {isSelf ? (
                            <input
                                type="text"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        ) : (
                            <span>{theuser.address}</span>
                        )}
                    </label>
                </div>
                <div>
                    <label>
                        Email :
                        <span>{theuser.email}</span>
                    </label>
                </div>
                <div>
                    <label>
                        Rôle :
                        {isAdmin && !isSelf ? (
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value as UserRole)}
                            >
                                {Object.values(UserRole).map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        ) : (
                            <span>{theuser.role}</span>
                        )}
                    </label>
                </div>
                <div>
                    <label>
                        Score au troc :
                        <span>{theuser.troc_score ? theuser.troc_score : "N/A"}</span>
                    </label>
                </div>
                <div>
                    <label>
                        Vérifié :
                        <span>{theuser.verified ? "Oui" : "Non"}</span>
                    </label>
                </div>
                <div>
                    <h3>Group Chat</h3>
                        <div>
                            <span>Channels</span>
                            <ul>
                                {(user?.role == UserRole.admin || user?._id == theuser._id) && theuser.group_chat_list_ids.length > 0 && theuser.group_chat_list_ids.map((chat: Channel) => (
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
                        </div>
                        <div>
                            {theuser.hasOwnProperty("common_channels") && theuser.common_channels!.length > 0 && (
                                <>
                                <span>Common Channels</span>
                                <ul>
                                    {theuser.hasOwnProperty("common_channels") && theuser.common_channels!.length > 0 && theuser.common_channels!.map((chat: Channel) => (
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
                                </>
                            )}
                        </div>
                </div>
                <div>
                    <button id={theuser._id} onClick={() => navigate((theuser._id))}>Voir l'utilisateur</button>

                    <button type="submit" onClick={() => onUpdate(user._id, {name, lastname, phone, address, role})}>Mettre à jour</button>
                    
                    { onApprove && (
                        <button onClick={() => onApprove(theuser._id, true)}>Approuver l'utilisateur</button>
                    )}
                    
                    {onDelete && (
                        <button onClick={() => onDelete(theuser._id)}>Supprimer l'utilisateur</button>
                    )}
                </div>
            </form>
        </div>
    );
}