import Publications from "./PublicationsPage";
import { Publication } from "../../../api/publications";
import { User } from "../../../api/user";

export function ShowPublication({
    pub,
    user,
    onView,
    onManage
}: {
    pub: Publication,
    user: User | null,
    onView?: (id: string) => void,
    onManage?: (id: string) => void
}) {
    return (
        <div key={pub._id}>
            <div>
                <h3>{pub.name}</h3>
                <span>{new Date(pub.created_at).toLocaleDateString()}</span>
            </div>
            <p>{pub.body}</p>
            <div>
                {typeof pub.author_id === "object" && pub.author_id !== null
                    ? pub.author_id.name
                    : pub.author_id?.toString()}
                <div>
                    {onView != null ? <button onClick={() => onView(pub._id)}>Voir la Publication</button> : "" }
                    {onManage != null && typeof pub.author_id === "object" && pub.author_id !== null && user?._id === pub.author_id?._id &&
                        <button onClick={() => onManage(pub._id)}>Gérer la publication</button>
                    }
                </div>
            </div>
        </div>
    );
}
