// ShowActivity.tsx

import React, { useState } from "react";
import { Activity } from "../../../api/activity";
import { User, UserRole } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";

export enum ShowActivityButton {
    Activity = 1 << 0,        // 1 (0b001)
    ViewPublication = 1 << 1, // 2 (0b010)
    Manage = 1 << 2,          // 4 (0b100)
    All = Activity | ViewPublication | Manage, // 7
    None = 0
}

type ShowActivityProps = {
    activity: Activity;
    user: User | undefined;
    onViewPublication?: (id: string) => void;
    onManage?: (id: string) => void;
    buttonShow: ShowActivityButton
};

export function ShowActivity({
    activity,
    user,
    onViewPublication,
    onManage,
    buttonShow
}: ShowActivityProps) {
    const navigate = useNavigate();

    return (
        <div key={activity._id}>
            <h2>{activity.title}</h2>
            <div>
                <span>{activity.author?.name}</span>
                <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                <p>{activity.description}</p>
                <span>{new Date(activity.date_reservation).toLocaleDateString()}</span>
                <p>Lieu : {activity.location ? activity.location : ""}</p>
            </div>
            <div>
                <strong>Publication :</strong> {activity.publication?.name}
                <div>
                    {/* Bouton "Voir l'activité" */}
                    {(buttonShow & ShowActivityButton.Activity) !== 0 && activity._id && (
                        <button onClick={() => navigate(`${Route.activity}/${activity._id}`)}>
                            Voir l'activité
                        </button>
                    )}

                    {/* Bouton "Voir la Publication associée" */}
                    {(buttonShow & ShowActivityButton.ViewPublication) !== 0 &&
                        onViewPublication &&
                        activity.publication?._id && (
                            <button onClick={() => onViewPublication(activity.publication._id)}>
                                Voir la Publication associée
                            </button>
                    )}

                    {/* Bouton "Gérer l'activité" */}
                    {(buttonShow & ShowActivityButton.Manage) !== 0 &&
                        onManage &&
                        user &&
                        (activity.author?._id === user._id || user.role === UserRole.admin) && (
                            <button onClick={() => onManage(activity._id)}>
                                Gérer l'activité
                            </button>
                    )}
                </div>
            </div>
        </div>
    );
}