import { useNavigate, useParams, useRouteLoaderData } from "react-router-dom";
import Errors from "../shared/errors";
import { Route } from "../../constantes";
import { useEffect, useState } from "react";
import { Friend, FriendsClass } from "../../../api/friend";
import { ErrorMessage } from "../../../api/client";
import NotFound from "../shared/notfound";
import { User } from "../../../api/user";
import Users from "../Users/UserPage";
import { ShowAdditionnalInfo, ShowUser, ShowUserButton } from "../Users/SingleUser";
import { useAuth } from "../shared/auth-context";
import ChatPage from "../Chat/ChatPage";

function SingleFriends(){
    const [errors, setErrors] = useState<ErrorMessage | null>(null)
    const [friends, setFriends] = useState<User>()
    const [notfound, setNotfound] = useState(false)
    const { id } = useParams<{ id: string }>();
    const {me} = useAuth()
    const navigate = useNavigate()


    useEffect(() => {
        (async() => {
            const client = new FriendsClass()
            try {
                if(!id) return
                const frend = await client.getMyFriendByID(id)
                if(!frend){
                    setNotfound(true)
                    return
                }
                setNotfound(false)
                setFriends(frend)
            } catch (e) {
                console.error(e)
                setErrors(client.errors)
                setNotfound(true)
            }
        })()
    }, [id])

    if(!id){
        navigate(`${Route.friends}`)
        return 
    }
    
    if(errors){
        return <Errors errors={errors} />
    }

    if(notfound){
        return <NotFound />
    }

    if(!friends){
        return <Errors errors={{message: "Une erreur est survenue"}} />
    }

    return <>
        <ShowUser
            theuser={friends}
            user={me}
            buttonShow={ShowUserButton.None}
            showAdditionnalInfo={ShowAdditionnalInfo.CommonActivity}
        />
        {me?.friends[friends._id] ? (<ChatPage id_channel={me?.friends[friends._id]} />) : "<p>Une erreur est survenue</p>"}
        
    </>
    return <h1>t</h1>
}

export default SingleFriends