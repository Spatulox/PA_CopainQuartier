// ShowActivity.tsx

import React from "react";
import { Activity } from "../../../api/activity";
import { User, UserRole } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";

type ShowActivityProps = {
    activity: Activity;
    user: User | undefined;
    onViewPublication?: (id: string) => void;
    onManage?: (id: string) => void;
};

export function ShowActivity({ activity, user, onViewPublication, onManage }: ShowActivityProps) {
    const navigate = useNavigate();

    return (
        <div>
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
                    <strong>Participants ({activity.participants?.length || 0}) :</strong>
                    <ul>
                        {activity.participants && activity.participants.length > 0 ? (
                            activity.participants.map((user) => (
                                <li key={user?._id}>{user?.name}</li>
                            ))
                        ) : (
                            <li>Rien</li>
                        )}
                    </ul>
                </div>
                <div>
                    <strong>Publication :</strong> {activity.publication?.name}
                    {onViewPublication && activity.publication?._id && (
                        <button onClick={() => onViewPublication(activity.publication._id)}>
                            Voir la Publication associée
                        </button>
                    )}
                    {onManage && user && (activity.author_id?._id === user._id || user.role == UserRole.admin) && (
                        <button onClick={() => onManage(activity._id)}>
                            Gérer l'activité
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}