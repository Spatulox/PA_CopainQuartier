import { useEffect, useState } from "react";
import { Publication } from "../../../api/publications";
import { User } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";

type UpdatePublicationProps = {
    publication: Publication;
    APIerror: any;
    user: User | undefined;
    onUpdate: (id: string, option: object) => void;
    onDelete: (id: string) => void;
};

export function UpdatePublication({
    publication,
    user,
    APIerror,
    onUpdate,
    onDelete
}: UpdatePublicationProps) {
    const [name, setName] = useState(publication.name || "");
    const [body, setBody] = useState(publication.body || "");
    const [description, setDescription] = useState(publication.description || "");
    const [err, setError] = useState<string[]>([])
    const navigate = useNavigate()

    function handleUpdate() {
        if (onUpdate) {
            onUpdate(publication._id, {
                name,
                body,
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
        <div key={publication._id}>
            {err && err.length > 0 && (
                <div className="error-messages">
                    {err && err.length > 0 && err.map((e: any) => (
                    <p>{e}</p>
                    ))}
                </div>
            )}
            <h2>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </h2>
            <div>
                <span>
                    <button onClick={ () => navigate(`${Route.user}/${publication.author?._id}`)}>{publication.author?.email || publication.author?._id == user?._id ? user?.email : "Unknown"}</button>
                </span>
                <div>
                    <span>
                        Date de creation : {new Date(publication.created_at).toLocaleDateString()}
                    </span>
                    <span>Date de modification : {new Date(publication.updated_at).toLocaleDateString()}</span>
                </div>
                <input type="text"
                value={description}
                onChange={e =>setDescription(e.target.value)}/>
                <p>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                    />
                </p>
            </div>
            <div>
                {publication.activity != null ? <button onClick={() => navigate(`${Route.activity}/${publication.activity?._id}`)}>Voir l'activité</button> : ""}
                <button onClick={() => window.location.reload()}>Recharger la page</button>
                <button onClick={handleUpdate}>Update Publication</button>
                <button onClick={() => onDelete(publication._id)}>Supprimer la publication</button>
            </div>
        </div>
    );
}
