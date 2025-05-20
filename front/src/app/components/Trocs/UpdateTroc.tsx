import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../../api/user";
import { useState } from "react";
import { Route } from "../../constantes";
import { Troc } from "../../../api/troc";
import { useAuth } from "../shared/auth-context";

type UpdateTrocProps = {
    troc: Troc;
    user: User | undefined;
    onUpdate: (id: string, option: object) => void;
    onDelete: (id: string) => void;
    onCancelReservation: (id: string) => void;
};

export function UpdateTroc({
    troc,
    user,
    onUpdate,
    onDelete
}: UpdateTrocProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState(troc.title || "");
    const [description, setDescription] = useState(troc.description || "");
    const [status, setStatus] = useState(troc.status || "");
    const [type, setType] = useState(troc.type || "");
    const [visibility, setVisibility] = useState(troc.visibility || "");
    const [dateReservation, setDateReservation] = useState(
        troc.reserved_at
            ? new Date(troc.reserved_at).toISOString().split("T")[0]
            : ""
    );
    const {me, isAdmin} = useAuth()

    function handleUpdate() {
        if (onUpdate) {
            onUpdate(troc._id, {
                title,
                description,
                status,
                type,
                visibility
            });
        }
    }

    function isReservedByUser(): boolean{
        if(user){
            return troc.reserved_by.some((reservedUser) => reservedUser && reservedUser._id === user._id)
        }
        return false
    }

    return (
        <div key={troc._id}>
            <h2>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </h2>
            <div>
                <span>
                    <button onClick={ () => navigate(`${Route.user}/${troc.author?._id}`)}>{troc.author?.email || troc.author?._id == user?._id ? user?.email : "Unknown"}</button>
                </span>
                <div>
                    <span>
                        Date de création :{new Date(troc.created_at).toLocaleDateString()}
                    </span>
                    <div>
                        {/* Si Admin ou propriétaire */}
                        {(isAdmin || user?._id == troc.author?._id) && (
                            <>
                                <span>{troc.status}</span>
                                <span>{troc.type}</span>
                                <span>{troc.visibility}</span>
                                <span>{troc.reserved_by.map((reservedUser) => (
                                    <ul>
                                        <li>{reservedUser?.email}</li>
                                    </ul>
                                ))}</span>
                            
                            </>
                        )}

                        {/* Si j'ai réservé le troc */}
                        {user?._id && isReservedByUser() && (
                            <></>
                        )}
                    </div>
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
                <div>
                    {/* Si Admin ou propriétaire */}
                    {(isAdmin || user?._id == troc.author?._id) && (
                        <>
                        <button onClick={() => window.location.reload()}>Recharger la page</button>
                        <button onClick={handleUpdate}>Update Activity</button>
                        <button onClick={() => onDelete(troc._id)}>Supprimer le troc</button>
                        </>
                    )}

                    {/* Si j'ai réservé le troc */}
                    {user?._id && isReservedByUser() && (
                        <>
                    <button onClick={onCancel}>Annuler la réservation</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}