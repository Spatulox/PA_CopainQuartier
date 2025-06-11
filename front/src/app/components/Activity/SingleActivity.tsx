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
    Join = 1 << 3,
    Leave = 1 << 4,
    Chat = 1 << 5,
    All = Activity | ViewPublication | Manage | Join | Leave, // 7
    None = 0
}

type ShowActivityProps = {
    activity: Activity;
    user: User | undefined;
    onViewPublication?: (id: string) => void;
    onJoin?: (id: string) => void;
    onLeave?: (id: string) => void;
    onManage?: (id: string) => void;
    buttonShow: ShowActivityButton
};

export function ShowActivity({
    activity,
    user,
    onViewPublication,
    onJoin,
    onLeave,
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
                <span>{new Date(activity.date_reservation).toLocaleString()}</span>
                <span>{new Date(activity.date_end).toLocaleString()}</span>
                {!isNaN(activity.max_place - activity.reserved_place) && (<p>Nombre de places restantes : {activity.max_place - activity.reserved_place}</p>)}
                <p>Lieu : {activity.location ? activity.location : ""}</p>
            </div>
            <div>
                <strong>Publication :</strong> {activity.publication?.name}
                <div>
                    {(buttonShow & ShowActivityButton.Activity) !== 0 && activity._id && (
                        <button onClick={() => navigate(`${Route.activity}/${activity._id}`)}>
                            Voir l'activité
                        </button>
                    )}

                    {(buttonShow & ShowActivityButton.Chat) !== 0 && activity._id && (
                        <button onClick={() => navigate(`${Route.chat}/${activity.channel_chat._id}`)}>
                            Voir le channel associé
                        </button>
                    )}

                    {(buttonShow & ShowActivityButton.Join) !== 0 && activity._id && onJoin && (
                        <button onClick={() => onJoin(activity._id)}>
                            Rejoindre l'activité
                        </button>
                    )}

                    {(buttonShow & ShowActivityButton.Leave) !== 0 && activity._id && onLeave && (
                        <button onClick={() => onLeave(activity._id)}>
                            Quitter l'activité
                        </button>
                    )}

                    {(buttonShow & ShowActivityButton.ViewPublication) !== 0 &&
                        onViewPublication &&
                        activity.publication?._id && (
                            <button onClick={() => onViewPublication(activity.publication._id)}>
                                Voir la Publication associée
                            </button>
                    )}

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