import { useNavigate } from "react-router-dom";
import { Activity } from "../../../api/activity";
import { User } from "../../../api/user";
import { useState } from "react";
import { Route } from "../../constantes";

type UpdateActivityProps = {
    activity: Activity;
    user: User | undefined;
    onUpdate: (id: string, option: object) => void;
    onDelete: (id: string) => void;
};

export function UpdateActivity({
    activity,
    user,
    onUpdate,
    onDelete
}: UpdateActivityProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState(activity.title || "");
    const [description, setDescription] = useState(activity.description || "");
    const [dateReservation, setDateReservation] = useState(
        activity.date_reservation
            ? new Date(activity.date_reservation).toISOString().split("T")[0]
            : ""
    );

    function handleUpdate() {
        if (onUpdate) {
            onUpdate(activity._id, {
                title,
                description,
                date_reservation: dateReservation,
            });
        }
    }

    return (
        <div key={activity._id}>
            <h2>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </h2>
            <div>
                <span>
                    <input
                        type="text"
                        value={activity.author?.name || ""}
                        disabled
                    />
                </span>
                <span>
                    <input
                        type="text"
                        value={new Date(activity.created_at).toLocaleDateString()}
                        disabled
                    />
                </span>
                <p>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </p>
                <span>
                    <input
                        type="date"
                        value={dateReservation}
                        onChange={e => setDateReservation(e.target.value)}
                    />
                </span>
            </div>
            <div>
                <strong>Publication :</strong>
                {activity.publication?.name}
                <div>
                    <button onClick={() => navigate(`${Route.publications}/${activity.publication._id}`)}>Voir la publication</button>
                    <button onClick={() => window.location.reload()}>Recharger la page</button>
                    <button onClick={handleUpdate}>Update Activity</button>
                    <button onClick={() => onDelete(activity._id)}>Supprimer l'activité</button>
                </div>
            </div>
        </div>
    );
}