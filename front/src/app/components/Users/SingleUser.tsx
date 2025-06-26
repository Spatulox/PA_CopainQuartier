import { User, UserRole } from "../../../api/user";
import { ShowChat, ShowChatButton } from "../Chat/SingleChat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";
import { ShowActivity, ShowActivityButton } from "../Activity/SingleActivity";
import { Activity } from "../../../api/activity";
import { ApiClient } from "../../../api/client";

export enum ShowUserButton {
    ViewUser = 1 << 0, // 2 (0b010)
    Manage = 1 << 1,          // 4 (0b100)
    Approve = 1 << 2,          // 4 (0b100)
    Delete = 1 << 3,          // 4 (0b100)
    All = ViewUser | Manage | Approve | Delete, // 7
    None = 0
}

export enum ShowAdditionnalInfo {
    Channel = 1 << 0,
    CommonChannel = 1 << 1,
    CommonActivity = 1 << 2,
    All = Channel | CommonChannel | CommonActivity,
    None = 0
}

type ShowUserProps = {
    theuser: User,
    user: User | null,
    onViewUser?: (id: string) => void,
    onApprove?: (id: string, bool: boolean) => void,
    onDelete?: (id: string) => void,
    onManage?: (id: string) => void,
    buttonShow: ShowUserButton,
    showAdditionnalInfo?: ShowAdditionnalInfo
}

export function ShowUser({
    theuser,
    user,
    onViewUser,
    onApprove,
    onDelete,
    onManage,
    buttonShow,
    showAdditionnalInfo
}: ShowUserProps) {
    const navigate = useNavigate()
    const baseUrl = new ApiClient().baseURL
    if(theuser)
    return (
        <div key={theuser._id}>
            <div>
                <h3>{theuser.name} {theuser.lastname}</h3>
                <img src={`${baseUrl}/${theuser.image_link}`} alt="" />
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
                    {showAdditionnalInfo && (<h3>Group Chat</h3>)}
                    {showAdditionnalInfo && (showAdditionnalInfo & ShowAdditionnalInfo.Channel) !== 0 && (
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
                    )}
                    {showAdditionnalInfo && (showAdditionnalInfo & ShowAdditionnalInfo.CommonChannel) !== 0 && (
                        <div>
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
                        </div>
                    )}
                    {showAdditionnalInfo && (showAdditionnalInfo & ShowAdditionnalInfo.CommonActivity) !== 0 && (
                        <div>
                            <span>Common Activities</span>
                            <ul>
                                {theuser.hasOwnProperty("common_activity") && theuser.common_activity!.length > 0 && theuser.common_activity!.map((act: Activity) => (
                                    <ShowActivity
                                        key={act._id}
                                        activity={act}
                                        user={theuser}
                                        onManage={() => navigate(`${Route.manageActivity}/${act._id}`)}
                                        buttonShow={ShowActivityButton.Activity | ShowActivityButton.Manage}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
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

                {(buttonShow & ShowUserButton.Approve) !== 0 && theuser.verified == false &&
                    onApprove && (
                        <button onClick={() => onApprove(theuser._id, true)}>
                            Approuver l'utilisateur
                        </button>
                )}

                {(buttonShow & ShowUserButton.Delete) !== 0 &&
                    onDelete && (
                        <button onClick={() => onDelete(theuser._id)}>
                            Supprimer l'utilisateur
                        </button>
                )}
            </div>
        </div>
    );
}