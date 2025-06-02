import { useEffect, useState } from "react"
import { User, UserRole } from "../../../api/user"
import { Channel, AdminChatClass } from "../../../api/chat"
import Loading from "../shared/loading"
import { useNavigate, useParams } from "react-router-dom"
import { Route } from "../../constantes"
import { ShowChat, ShowChatButton } from "./SingleChat"
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound"
import { ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"

function ManageAdminChat(){
    return <h1>Manage one</h1>
}

function ManageOneChat(){
    const [channel, setChannel] = useState<Channel | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const { id } = useParams<{ id: string }>();
    const { me, isAdmin } = useAuth();
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            if(id){
                const client = new AdminChatClass()
                try{
                    const chan = await client.getChannelById(id)
                    if(!chan){
                        setNotFound(true)
                        return
                    }
                    setNotFound(false)    
                    setChannel(chan)
                } catch(e){
                    setErrors(client.errors)
                }
            }
        })()
    }, [id])

    useEffect(() => {
        if(!isAdmin){
            navigate(Route.notfound)
            return
        }
    }, [id, isAdmin, navigate])

    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }

    if(!channel || !me || !id){
        return <Loading />
    }

    if(channel){
        return <ShowChat
            key={channel._id}
            channel={channel}
            user={me}
            buttonShow={ShowChatButton.None}
        />
    }
}


function ManageChat(){
    const [channel, setChannels] = useState<Channel[] | null>(null)
    const { id } = useParams<{ id: string }>();
    const { me, isAdmin } = useAuth();
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false)


    useEffect(() => {
        (async () => {
            const client = new AdminChatClass()
            const chan = await client.getAllChannel()
            if(!chan){
                setNotFound(true)
                return
            }
            setNotFound(false)
            setChannels(chan)
        })()
    }, [])

    useEffect(() => {
        if(!isAdmin){
            navigate(Route.notfound)
            return
        }
    }, [id, isAdmin, navigate])

    if(notFound){
        return <NotFound />
    }

    if(!channel || !me){
        return <Loading />
    }

    if(id){
        return <ManageOneChat />
    }

    if(channel && channel.length == 0){
        return <p>Aucun Channels trouvé</p>
    }
    // Manage Admin Chat
    return <>
        {channel && channel.map((chan) => (
            <ShowChat
                key={chan._id}
                channel={chan}
                user={me}
                onViewChat={() => navigate(`${Route.chat}/${chan._id}`)}
                onManage={() => navigate(`${Route.manageChannels}/${chan._id}`)}
                buttonShow={ShowChatButton.Chat | ShowChatButton.Manage}
            />
        ))}
    </>
}


export default ManageChat