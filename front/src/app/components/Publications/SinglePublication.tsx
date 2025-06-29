import {Publication} from "../../../api/publications";
import {User, UserRole} from "../../../api/user";
import {Activity} from "../../../api/activity";
import {ApiClient} from "../../../api/client";
import "./Publications.css";


export enum ShowPublicationButton {
    Publication = 1 << 0,        // 1 (0b001)
    ViewActivity = 1 << 1, // 2 (0b010)
    Manage = 1 << 2,          // 4 (0b100)
    All = ViewActivity | Publication | Manage, // 7
    None = 0
}

type ShowPublicationProps = {
    pub: Publication,
    user: User | null,
    onViewPublication?: (id: string) => void,
    onViewActivity?: (id: string) => void,
    onManage?: (id: string) => void,
    buttonShow: ShowPublicationButton
}

export function ShowPublication({
                                    pub,
                                    user,
                                    onViewPublication,
                                    onViewActivity,
                                    onManage,
                                    buttonShow
                                }: ShowPublicationProps) {
    const baseUrl = new ApiClient().baseURL;
    return (
        <div key={pub._id} className="publication-card">

                <div className="publication-meta none">
                    <h3 className="none">{pub.name}</h3>

                </div>
                <div className=" end">
                    <span>{new Date(pub.created_at).toLocaleDateString()}</span>
                </div>

            {pub.image_link && (<img src={`${baseUrl}/${pub.image_link}`} alt=""/>)}
            <p>{pub.description}</p>
            <p>{pub.body}</p>
            <div className="publication-buttons">
                {typeof pub.author === "object" && pub.author?._id !== null
                    ? pub.author?.name
                    : pub.author.toString()}
                <div>
                    {/* Bouton Voir l'activité associée */}
                    {(buttonShow & ShowPublicationButton.ViewActivity) !== 0 &&
                        onViewActivity &&
                        typeof pub.activity === "object" &&
                        pub.activity !== null &&
                        "_id" in pub.activity && (
                            <button
                                id={pub.activity._id}
                                onClick={() => onViewActivity((pub.activity as Activity)._id)}
                            >
                                Voir l'activité associée
                            </button>
                        )}

                    {/* Bouton Voir la publication */}
                    {(buttonShow & ShowPublicationButton.Publication) !== 0 && onViewPublication && (
                        <button id={pub._id} onClick={() => onViewPublication(pub._id)}>
                            Voir la Publication
                        </button>
                    )}

                    {/* Bouton Gérer */}
                    {(buttonShow & ShowPublicationButton.Manage) !== 0 &&
                        onManage &&
                        typeof pub.author === "object" && ((
                                pub.author !== null &&
                                user?._id === pub.author._id)
                            || (user?.role == UserRole.admin)) && (
                            <button onClick={() => onManage(pub._id)}>
                                Gérer la publication
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
}