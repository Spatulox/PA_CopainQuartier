import { User, UserClass, UserRole } from "../../../api/user";
import { ShowChat, ShowChatButton } from "../Chat/SingleChat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";
import { useEffect, useState } from "react";
import NotFound from "../shared/notfound";

type ShowUserProps = {
    theuser: string | null,
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
    const [theUserObject, setTheUser] = useState<User | null>(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        (async () => {
            const client = new UserClass
            try {
                if(!theuser){
                    setNotFound(true)
                    return
                }
                const res = await client.getUserByID(theuser)
                setTheUser(res)
                setNotFound(false)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [theuser])

    if(notFound){
        return <NotFound />
    }


    if(theUserObject)
    return (
        <div key={theUserObject._id}>
            <div>
                <h3>{theUserObject.name} {theUserObject.lastname}</h3>
                <section>
                    <h3>Coordonnées</h3>
                    <ul>
                        <li>Rôle : {theUserObject.role}</li>
                        <li>Score au Troc : {theUserObject.troc_score}</li>
                    </ul>
                </section>
            </div>
            <div>
                {onViewUser && (<button id={theUserObject._id} onClick={() => onViewUser((theUserObject._id))}>Voir l'utilisateur</button>)}
                {user?.role == UserRole.admin && onManage && (
                    <button id={theUserObject._id} onClick={() => onManage(theUserObject._id)}>
                        Gérer l'utilisateur
                    </button>
                )}
                {onRequest && (<button onClick={() => onRequest(theUserObject._id)}>Demander en ami</button>)}
            </div>
        </div>
    );
}