import { User, UserClass, UserRole } from "../../../api/user";
import { ShowChat, ShowChatButton } from "../Chat/SingleChat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { Channel } from "../../../api/chat";
import { useEffect, useState } from "react";
import NotFound from "../shared/notfound";
import { ApiClient } from "../../../api/client";

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
    const [asked, setAsked] = useState(false)

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

    function handleAsked(){
        onRequest && theUserObject && onRequest(theUserObject._id)
        setAsked(true)
    }

    if(notFound){
        return <NotFound />
    }

    const baseUrl = new ApiClient().baseURL

    if(theUserObject)
    return (
        <div key={theUserObject._id}>
            <div>
                <h3>{theUserObject.name} {theUserObject.lastname}</h3>
                <img className="profile-picture" src={`${baseUrl}/${theUserObject.image_link}`} alt="image profile" />
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
                {
                    onRequest && !asked &&
                    user?._id !== theUserObject._id &&
                    user?.friends && !(theUserObject._id in user?.friends) &&
                    (<button onClick={handleAsked}>Demander en ami</button>)}
            </div>
        </div>
    );
}