import { useState } from "react";
import { Publication } from "../../../api/publications";
import { User } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";

type UpdatePublicationProps = {
    publication: Publication;
    user: User | undefined;
    onUpdate: (id: string, option: object) => void;
    onDelete: (id: string) => void;
};

export function UpdatePublication({
    publication,
    user,
    onUpdate,
    onDelete
}: UpdatePublicationProps) {
    const [name, setName] = useState(publication.name || "");
    const [body, setBody] = useState(publication.body || "");
    const navigate = useNavigate()

    function handleUpdate() {
        if (onUpdate) {
            onUpdate(publication._id, {
                name,
                body,
            });
        }
    }

    return (
        <div key={publication._id}>
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
                <span>
                    <input
                        type="text"
                        value={new Date(publication.created_at).toLocaleDateString()}
                        disabled
                    />
                </span>
                <p>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                    />
                </p>
            </div>
            <div>
                <button onClick={handleUpdate}>Update Publication</button>
                <button onClick={() => onDelete(publication._id)}>Supprimer la publication</button>
            </div>
        </div>
    );
}
