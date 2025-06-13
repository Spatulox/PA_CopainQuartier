import { User, UserRole } from "../../../api/user";
import { ShowChat, ShowChatButton } from "../Chat/SingleChat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";

type ShowUserProps = {
    theuser: User,
    user: User | null,
    onViewUser?: (id: string) => void,
    onRequest?: (id: string) => void,
    onManage?: (id: string) => void
}

export function MiniUser({
    theuser,
    user,
    onViewUser,
    onRequest,
    onManage
}: ShowUserProps) {
    const navigate = useNavigate()
    if(theuser)
    return (
        <div key={theuser._id}>
            <div>
                <h3>{theuser.name} {theuser.lastname}</h3>
                <section>
                    <h3>Coordonnées</h3>
                    <ul>
                        <li>Rôle : {theuser.role}</li>
                        <li>Score au Troc : {theuser.troc_score}</li>
                    </ul>
                </section>
            </div>
            <div>
                {onViewUser && (<button id={theuser._id} onClick={() => onViewUser((theuser._id))}>Voir l'utilisateur</button>)}
                {user?.role == UserRole.admin && onManage && (
                    <button id={theuser._id} onClick={() => onManage(theuser._id)}>
                        Gérer l'utilisateur
                    </button>
                )}
                {onRequest && (<button onClick={() => onRequest(theuser._id)}>Demander en ami</button>)}
            </div>
        </div>
    );
}