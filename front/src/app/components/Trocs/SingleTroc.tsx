import React from "react";
import { User, UserRole } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";
import { Troc, TrocStatus, TrocType } from "../../../api/troc";
import { useAuth } from "../shared/auth-context";
import ChatPage from "../Chat/ChatPage";
import { ApiClient } from "../../../api/client";
import "./Trocs.css"

// Enum pour les boutons
export enum ShowTrocButton {
    Troc = 1 << 0,           // 1 (0b00001) : Voir le troc
    Manage = 1 << 1,         // 2 (0b00010) : Gérer le troc
    Reserve = 1 << 2,        // 4 (0b00100) : Réserver le troc
    Cancel = 1 << 3,         // 8 (0b01000) : Annuler le troc
    Approve = 1 << 4,        //16 (0b10000) : Approve le troc
    Complete = 1 << 5,        //16 (0b10000) : Approve le troc
    Leave = 1 << 6,
    ShowChannel = 1 << 7,
    All = Troc | Manage | Reserve | Cancel | Approve | Complete | Leave,
    None = 0
}

type ShowTrocProps = {
    troc: Troc;
    user: User | undefined;
    onViewTroc?: (id: string) => void;
    onManage?: (id: string) => void;
    onComplete?: (id: string) => void;
    onReserve?: (id: string) => void;
    onCancel?: (id: string) => void;
    onApprove?: (id: string, bool: boolean) => void;
    onLeave?: (id: string) => void;
    buttonShow: ShowTrocButton;
};

export function ShowTroc({
    troc,
    user,
    onViewTroc,
    onManage,
    onComplete,
    onReserve,
    onCancel,
    onApprove,
    onLeave,
    buttonShow
}: ShowTrocProps) {
    const navigate = useNavigate();
    const {isAdmin} = useAuth()
    const baseUrl = new ApiClient().baseURL;
    return (
        <div className="troc-card" key={troc._id}>
            <h2>{troc.title}</h2>
            {troc.image_link && (<img src={`${baseUrl}/${troc.image_link}`} alt="" />)}
            <div>
                <span>Auteur : {troc.author ? troc.author.email : ""}</span>
                <span>Créé le : {new Date(troc.created_at).toLocaleDateString()}</span>
                <p>{troc.description}</p>
                {(isAdmin || user?._id == troc.author?._id) && (
                    <>
                    <ul>
                        <li>Visibilité : {troc.visibility}</li>
                        <li>Status : {troc.status}</li>
                        <li>Type : {troc.type}</li>
                    </ul>
                    </>
                )}
                {(user?._id != troc.author?._id && !isAdmin) && (
                    <>
                    <ul>
                        <li>Type : {troc.type}</li>
                    </ul>
                    </>
                )}
                {troc.reserved_at && (
                    <span>Réservé le : {new Date(troc.reserved_at).toLocaleDateString()}</span>
                )}
                {troc.reserved_by && troc.reserved_by.length > 0 && (
                    <span>Réservé par : {troc.reserved_by.map((user) => (
                        user?.email
                    ))}</span>
                )}
            </div>
            <div>
                {/* Bouton "Voir le troc" */}
                <div className="button-group">
                {(buttonShow & ShowTrocButton.Troc) !== 0 && (
                    <button onClick={() =>
                        onViewTroc
                            ? onViewTroc(troc._id)
                            : navigate(`${Route.troc}/${troc._id}`)
                    }>
                        Voir le troc
                    </button>
                )}
                </div>

                {(buttonShow & ShowTrocButton.Approve) !== 0 && (
                    <button onClick={() =>
                        onApprove
                            ? onApprove(troc._id, true)
                            : ""
                    }>
                        Approuver le troc
                    </button>
                )}

                {(buttonShow & ShowTrocButton.Approve) !== 0 && (
                    <button onClick={() =>
                        onApprove
                            ? onApprove(troc._id, false)
                            : ""
                    }>
                        Ne pas approuver le troc
                    </button>
                )}

                {/* Bouton "Gérer le troc" */}
                {(buttonShow & ShowTrocButton.Manage) !== 0 &&
                    onManage &&
                    user &&
                    (troc.author?._id === user._id || user.role === UserRole.admin) && (
                        <button onClick={() => onManage(troc._id)}>
                            Gérer le troc
                        </button>
                )}

                {(buttonShow & ShowTrocButton.Complete) !== 0 &&
                    onComplete &&
                    user &&
                    troc.status !== TrocStatus.completed &&
                    (troc.author?._id === user._id || user.role === UserRole.admin) && (
                        <button onClick={() => onComplete(troc._id)}>
                            Fermer/Completer le troc
                        </button>
                )}

                {/* Bouton "Réserver le troc" */}
                {(buttonShow & ShowTrocButton.Reserve) !== 0 &&
                    onReserve &&
                    user && troc.author?._id !== user._id &&
                    troc.status !== TrocStatus.reserved &&
                    !troc.reserved_by.some(reservedUser => reservedUser && reservedUser._id === user._id)
                    &&
                    (
                        <button onClick={() => onReserve(troc._id)}>
                            Réserver
                        </button>
                )}

                {/* Bouton "Annuler le troc" si je suis owner */}
                {(buttonShow & ShowTrocButton.Cancel) !== 0 &&
                    onCancel &&
                    user &&
                    troc.author?._id === user._id &&
                    troc.reserved_by.length > 0 &&
                    (
                        <button onClick={() => onCancel(troc._id)}>
                            Annuler la réservation
                        </button>
                    )
                }

                {/* Bouton "Annuler le troc" si je l'ai réservé */}
                {(buttonShow & ShowTrocButton.Cancel) !== 0 &&
                    onCancel &&
                    user &&
                    troc.reserved_by.some(reservedUser => reservedUser && reservedUser._id === user._id) &&
                    troc.type !== TrocType.serviceMorethanOnePerson &&
                    (
                        <button onClick={() => onCancel(troc._id)}>
                            Annuler la réservation
                        </button>
                    )
                }

                {/* Bouton "Annuler le troc" si je l'ai réservé ET que c'est un serviceMoreThanOnePerson */}
                {(buttonShow & ShowTrocButton.Cancel) !== 0 &&
                    onLeave &&
                    user &&
                    troc.reserved_by.some(reservedUser => reservedUser && reservedUser._id === user._id) &&
                    troc.type === TrocType.serviceMorethanOnePerson &&
                    (
                        <button onClick={() => onLeave(troc._id)}>
                            Quitter la réservation
                        </button>
                    )
                }
            </div>
            <div className="channel-wrapper">
                {/* Show Channel if it's the admin of the person which "join" the troc */}
                {   (buttonShow & ShowTrocButton.ShowChannel) !== 0 &&   
                    troc.channel != null && user &&
                    (
                        troc.author?._id == user?._id || // admin
                        troc.channel.members.some(reservedUser => reservedUser && reservedUser === user._id)
                    ) &&
                    <ChatPage id_channel={troc.channel._id} />
                }
            </div>
        </div>
    );
}