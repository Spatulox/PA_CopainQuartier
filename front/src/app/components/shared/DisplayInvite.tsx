import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Invite, InviteClass } from "../../../api/invite";
import Loading from "./loading";
import NotFound from "./notfound";
import Errors from "./errors";
import { popup } from "../../scripts/popup-slide";
import { useAuth } from "./auth-context";
import { User } from "../../../api/user";
import { ChatClass } from "../../../api/chat";

function DisplayInvite(){
    const { id } = useParams<{ id: string }>();
    const [error, setErrors] = useState<Array<any> | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [invite, setInvites] = useState<Invite | null>()
    const [refresh, setRefresh] = useState(0)
    const {me} = useAuth()
    

    useEffect(() => {
        (async () => {
            const client = new InviteClass()
            try {
                if(id){
                    const inv = await client.getInvite(id)
                    if(!inv){
                        setNotFound(true)
                        return
                    }
                    setInvites(inv)
                }
                setErrors([])
            } catch (e) {
                console.error(e)
                setErrors(client.errors)
            }
        })()
    }, [id, refresh])
    
    async function handleJoinChat(){
        const client = new InviteClass()
        try {
            if(id){
                await client.joinByInvite(id)
            }
            setErrors([])
            setRefresh (r => r + 1)
        } catch (e) {
            console.error(e)
            setErrors(client.errors)
        }
    }

    async function handleLeaveChat(){
        const client = new ChatClass()
        try {
            if(id){
                if(invite?.channel._id){
                    await client.leaveChat(invite?.channel._id)
                } else {
                    popup("Ce channel n'existe pas...")
                    return
                }
            }
            setErrors([])
            setRefresh (r => r + 1)
        } catch (e) {
            console.error(e)
            setErrors(client.errors)
        }
    }

    if(!id){
        return <Loading title="Chargement de l'invitation" />
    }

    if(notFound){
        return <NotFound />
    }

    if(error != null && error.length > 0){
        return <Errors errors={error} />
    }
    if(!invite){
        return <NotFound />
    }

    return (
    <>
        <div className="invite">
        <h3>{invite?.channel.name}</h3>
        <span>Nombre de personnes : {invite?.channel.members.length}</span>
        <p>{invite?.channel.description}</p>
        {/* Affichage conditionnel du bouton */}
        {(() => {
            if (!invite) return null;
            const adminId = invite?.channel.admin?._id;
            const isAuthor = me?._id === adminId;
            const isMember = invite.channel.members
            .filter((m): m is User => typeof m === "object" && m !== null && "_id" in m)
            .some((m) => m && m._id === me?._id);


            if (isAuthor) {
            return null;
            } else if (isMember) {
            return (
                <button onClick={handleLeaveChat} >
                Quitter
                </button>
            );
            } else {
            return (
                <button onClick={handleJoinChat}>
                Rejoindre
                </button>
            );
            }
        })()}
        </div>
    </>
    );

}


export default DisplayInvite