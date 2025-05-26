import { useNavigate } from "react-router-dom";
import { Activity } from "../../../api/activity";
import { User } from "../../../api/user";
import { useEffect, useState } from "react";
import { Route } from "../../constantes";
import { ErrorMessage } from "../../../api/client";

type UpdateActivityProps = {
    activity: Activity;
    APIerror: any;
    user: User | undefined;
    onUpdate: (id: string, option: object) => void;
    onDelete: (id: string) => void;
};

export function UpdateActivity({
    activity,
    APIerror,
    user,
    onUpdate,
    onDelete
}: UpdateActivityProps) {
    const navigate = useNavigate();
    const [err, setError] = useState<string[]>([])
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
        setError([])
    }

    useEffect(() => {
        if(APIerror){
            const errTMP: string[] = []
            for (const err in APIerror){
                errTMP.push(`${err} : ${APIerror[err]}`)
            }
            if(errTMP.length > 0){
                setError(errTMP)
            }
        } else {
            setError([])
        }
    }, [APIerror])
    

    return (
        <div key={activity._id}>
            {err && err.length > 0 && <>
                <div className="error-messages">
                    {err.map((e: any) => (
                    <p>{e}</p>
                    ))}
                </div>
            </>}
            <h2>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </h2>
            <div>
                <span>
                    <button onClick={ () => navigate(`${Route.user}/${activity.author?._id}`)}>{activity.author?.email || activity.author?._id == user?._id ? user?.email : "Unknown"}</button>
                </span>
                <div>
                    <span>
                        Date de création :{new Date(activity.created_at).toLocaleDateString()}
                    </span>
                </div>
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
                    {activity.publication && (
                        <button onClick={() => navigate(`${Route.publications}/${activity.publication._id}`)}>Voir la publication</button>
                    )}
                    <button onClick={() => window.location.reload()}>Recharger la page</button>
                    <button onClick={handleUpdate}>Update Activity</button>
                    <button onClick={() => onDelete(activity._id)}>Supprimer l'activité</button>
                </div>
            </div>
        </div>
    );
}