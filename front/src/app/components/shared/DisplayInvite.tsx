import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Invite, InviteClass } from "../../../api/invite";
import Loading from "./loading";
import NotFound from "./notfound";
import Errors from "./errors";
import { popup } from "../../scripts/popup-slide";

function DisplayInvite(){
    const { id } = useParams<{ id: string }>();
    const [error, setErrors] = useState<Array<any> | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [invite, setInvites] = useState<Invite | null>()
    

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
    }, [id])
    
    async function handleJoinChat(){
        const client = new InviteClass()
        try {
            if(id){
                await client.joinByInvite(id)
            }
            setErrors([])
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
    return <>
        <div className="invite">
            <h3>{invite?.channel.name}</h3>
            <span>Nombre de personnes : {invite?.channel.members.length}</span>
            <p>{invite?.channel.description}</p>
            <button onClick={handleJoinChat}>Rejoindre</button>
        </div>
    </>
}


export default DisplayInvite