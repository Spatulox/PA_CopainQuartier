import { useEffect, useState } from "react"
import { User, UserRole } from "../../../api/user"
import { Channel, AdminChatClass } from "../../../api/chat"
import Loading from "../shared/loading"
import { useNavigate, useParams } from "react-router-dom"
import { Route } from "../../constantes"
import { ShowChat, ShowChatButton } from "./SingleChat"
import { useAuth } from "../shared/auth-context";

function ManageAdminChat(){
    return <h1>Manage one</h1>
}

function ManageOneChat(){
    const [channel, setChannel] = useState<Channel | null>(null)
    const { id } = useParams<{ id: string }>();
    const { me, isAdmin } = useAuth();
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            if(id){
                const client = new AdminChatClass()
                const chan = await client.getChannelById(id)
                setChannel(chan)
            }
        })()
    }, [id])

    useEffect(() => {
        if(!isAdmin){
            navigate(Route.notfound)
            return
        }
    }, [id, isAdmin, navigate])

    if(!channel || !me || !id){
        return <Loading />
    }

    if(channel){
        return <ShowChat
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


    useEffect(() => {
        (async () => {
            const client = new AdminChatClass()
            const chan = await client.getAllChannel()
            setChannels(chan)
        })()
    }, [])

    useEffect(() => {
        if(!isAdmin){
            navigate(Route.notfound)
            return
        }
    }, [id, isAdmin, navigate])

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