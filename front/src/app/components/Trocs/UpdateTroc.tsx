import { useNavigate } from "react-router-dom";
import { User, UserRole } from "../../../api/user";
import { useEffect, useState } from "react";
import { Route } from "../../constantes";
import { Troc, TrocStatus, TrocType, TrocVisibility } from "../../../api/troc";
import { useAuth } from "../shared/auth-context";
import "./Trocs.css"

type UpdateTrocProps = {
    troc: Troc;
    user: User | undefined;
    APIerror: any;
    onUpdate: (id: string, option: object) => void;
    onDelete: (id: string) => void;
    onCancelReservation: (id: string) => void;
    approveTroc: (id: string) => void;
};

export function UpdateTroc({
    troc,
    user,
    APIerror,
    onUpdate,
    onDelete,
    approveTroc,
    onCancelReservation
}: UpdateTrocProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState(troc.title || "");
    const [description, setDescription] = useState(troc.description || "");
    const [status, setStatus] = useState<string>(troc.status || "");
    const [type, setType] = useState<string>(troc.type || "");
    const [visibility, setVisibility] = useState<string>(troc.visibility || "");
    const [dateReservation, setDateReservation] = useState(
        troc.reserved_at
          ? new Date(troc.reserved_at).toISOString().split("T")[0]
          : ""
      );
    const [timeReservation, setTimeReservation] = useState(
        troc.reserved_at
          ? new Date(troc.reserved_at).toTimeString().slice(0,5)
          : ""
      );
    
      const fullDate = dateReservation && timeReservation
      ? new Date(`${dateReservation}T${timeReservation}`)
      : null;
      
    const {me, isAdmin} = useAuth()
    const [err, setError] = useState<string[]>([])


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

    function handleUpdate() {
        if (onUpdate) {
            onUpdate(troc._id, {
                title,
                description,
                status,
                type,
                visibility,
                reserved_at: fullDate?.toISOString(),
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
        <div key={troc._id} className="update-troc-container">
            {err && err.length > 0 && <>
            <div className="error-messages">
              {err && err.length > 0 && err.map((e: any) => (
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
                    <button onClick={ () => navigate(`${Route.user}/${troc.author?._id}`)}>{troc.author?.email || (troc.author?._id == user?._id ? user?.email : "Unknown")}</button>
                </span>
                <div>
                    <div>
                        <span>
                            Date de création :{new Date(troc.created_at).toLocaleString()}
                        </span>
                        <span>
                            Mise à jour le :{new Date(troc.updated_at).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        {/* Si Admin ou propriétaire */}
                        {(isAdmin || user?._id == troc.author?._id) && (
                            <>
                                <span>
                                    {isAdmin && status != TrocStatus.waitingForApproval && (
                                        <>
                                        Status :
                                        <select value={status} onChange={e => setStatus(e.target.value)}>
                                        {Object.values(TrocStatus).map((option: string) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                        </select> 
                                        </>
                                    )}
                                    {isAdmin && status == TrocStatus.waitingForApproval && (
                                        <>
                                        Status : {status}
                                        </>
                                    )}
                                    {!isAdmin && (
                                        <>
                                        Status : {status}
                                        </>
                                    )}
                                </span>
                                <span>
                                    Type : 
                                    <select value={type} onChange={e => setType(e.target.value)}>
                                    {Object.values(TrocType).map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    </select>
                                </span>
                                <span>
                                    Visibility : 
                                    <select value={visibility} onChange={e => setVisibility(e.target.value)}>
                                    {Object.values(TrocVisibility).map((option: string) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                    </select>
                                </span>
                                {troc.reserved_by.length > 0 ? (
                                <ul>
                                    {troc.reserved_by.map((reservedUser) => (
                                    <li key={reservedUser?._id}>{reservedUser?.email}</li>
                                    ))}
                                </ul>
                                ) : (
                                <span>Aucune réservations</span>
                                )}
                            </>
                        )}


                        {/* Si j'ai réservé le troc */}
                        {user?._id && isReservedByUser() && (
                            <>
                                <div>
                                    <span>Status : {status}</span>
                                    <span>Type : {type}</span>
                                    <span>Visibility : {visibility}</span>
                                    {troc.reserved_by.length > 1 && (
                                        <span>Réservé par {troc.reserved_by.length -1} autres personnes</span>
                                    )}
                                </div>
                            </>
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
                    {troc.type != TrocType.item && dateReservation ? (
                        <>
                        <div>
                            Réservé le : 
                            <input
                                type="date"
                                value={dateReservation}
                                onChange={e => setDateReservation(e.target.value)}
                            />
                            <input
                                type="time"
                                value={timeReservation}
                                onChange={e => setTimeReservation(e.target.value)}
                            />
                        </div>
                        </>
                    ) : (
                        <span>Réservé le : Pas de réservation(s)</span>
                    )}
                </span>
            </div>
            <div>
                <div>
                    {/* Si Admin ou propriétaire */}
                    {(isAdmin || user?._id == troc.author?._id) && (
                        <>
                        <button onClick={() => navigate(`${Route.troc}/${troc._id}`)}>Voir le troc</button>
                        <button onClick={() => window.location.reload()}>Recharger la page</button>
                        <button onClick={handleUpdate}>Update Activity</button>
                        <button onClick={() => onDelete(troc._id)}>Supprimer le troc</button>
                        </>
                    )}

                    {(isAdmin && status == TrocStatus.waitingForApproval) && (
                        <>
                        <button onClick={() => approveTroc(troc._id)}>Approver le troc</button>
                        </>
                    )}

                    {/* Si j'ai réservé le troc */}
                    {user?._id && isReservedByUser() && (
                        <>
                        <button onClick={() => onCancelReservation(troc._id)}>Annuler la réservation</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}