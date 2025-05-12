// ShowActivity.tsx

import React from "react";
import { Activity } from "../../../api/activity";
import { User } from "../../../api/user";

type ShowActivityProps = {
    activity: Activity;
    user: User | undefined;
    onViewPublication?: (id: string) => void;
    onManage?: (id: string) => void;
};

export function ShowActivity({
    activity,
    user,
    onViewPublication,
    onManage
}: ShowActivityProps) {
    if (!activity) return <>Loading</>;

    return (
        <div key={activity._id}>
            <h2>{activity.title}</h2>
            <div>
                Créée le {new Date(activity.created_at).toLocaleDateString()}<br />
                Réservation : {new Date(activity.date_reservation).toLocaleString()}
            </div>
            <div>
                <strong>Description :</strong>
                <div>{activity.description}</div>
            </div>
            <div>
                <strong>Auteur :</strong> {activity.author_id?.name}
            </div>
            <div>
                <strong>Publication :</strong> {activity.publication?.name}
                {onViewPublication && activity.publication?._id && (
                    <button onClick={() => onViewPublication(activity.publication._id)}>
                        Voir la Publication associée
                    </button>
                )}
                {onManage && activity.author_id?._id === user?._id && (
                    <button onClick={() => onManage(activity._id)}>
                        Gérer l'activité
                    </button>
                )}
            </div>
        </div>
    );
}
