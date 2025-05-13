import React from "react";
import { User, UserRole } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";
import { Troc, TrocStatus } from "../../../api/troc";

// Enum pour les boutons
export enum ShowTrocButton {
    Troc = 1 << 0,           // 1 (0b0001) : Voir le troc
    Manage = 1 << 1,         // 2 (0b0010) : Gérer le troc
    Reserve = 1 << 2,        // 4 (0b0100) : Réserver le troc
    Cancel = 1 << 3,         // 8 (0b1000) : Annuler le troc
    All = Troc | Manage | Reserve | Cancel, // 7
    None = 0
}

type ShowTrocProps = {
    troc: Troc;
    user: User | undefined;
    onViewTroc?: (id: string) => void;
    onManage?: (id: string) => void;
    onReserve?: (id: string) => void;
    onCancel?: (id: string) => void;
    buttonShow: ShowTrocButton;
};

export function ShowTroc({
    troc,
    user,
    onViewTroc,
    onManage,
    onReserve,
    onCancel,
    buttonShow
}: ShowTrocProps) {
    const navigate = useNavigate();

    return (
        <div key={troc._id}>
            <h2>{troc.title}</h2>
            <div>
                <span>Auteur : {troc.author ? troc.author.email : ""}</span>
                <span>Créé le : {new Date(troc.created_at).toLocaleDateString()}</span>
                <p>{troc.description}</p>
                {user?._id == troc.author?._id || user?.role == UserRole.admin && (
                    <>
                    <ul>
                        <li>Visibilité : {troc.visibility}</li>
                        <li>Status : {troc.status}</li>
                        <li>Type : {troc.type}</li>
                    </ul>
                    </>
                )}
                {user?._id != troc.author?._id && user?.role != UserRole.admin && (
                    <>
                    <ul>
                        <li>Type : {troc.type}</li>
                    </ul>
                    </>
                )}
                {troc.reserved_at && (
                    <span>Réservé le : {new Date(troc.reserved_at).toLocaleDateString()}</span>
                )}
                {troc.reserved_by && (
                    <span>Réservé par : {troc.reserved_by}</span>
                )}
            </div>
            <div>
                {/* Bouton "Voir le troc" */}
                {(buttonShow & ShowTrocButton.Troc) !== 0 && (
                    <button onClick={() =>
                        onViewTroc
                            ? onViewTroc(troc._id)
                            : navigate(`${Route.troc}/${troc._id}`)
                    }>
                        Voir le troc
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

                {/* Bouton "Réserver le troc" */}
                {(buttonShow & ShowTrocButton.Reserve) !== 0 &&
                    onReserve &&
                    user &&
                    troc.status !== TrocStatus.reserved && (
                        <button onClick={() => onReserve(troc._id)}>
                            Réserver le troc
                        </button>
                )}

                {/* Bouton "Annuler le troc" */}
                {(buttonShow & ShowTrocButton.Cancel) !== 0 &&
                    onCancel &&
                    user &&
                    troc.status !== TrocStatus.reserved && (
                        <button onClick={() => onCancel(troc._id)}>
                            Réserver le troc
                        </button>
                )}
            </div>
        </div>
    );
}