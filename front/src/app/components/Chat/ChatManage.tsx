import { useEffect, useState } from "react"
import { User, UserRole } from "../../../api/user"
import { Channel, AdminChatClass } from "../../../api/chat"
import Loading from "../shared/loading"
import { useNavigate, useParams } from "react-router-dom"
import { Route } from "../../constantes"
import { ShowChat, ShowChatButton } from "./SingleChat"
import { useAuth } from "../shared/auth-context";

const { me } = useAuth();

function ManageAdminChat(){
    return <h1>Manage one</h1>
}

function ManageOneChat(){
    const [channel, setChannel] = useState<Channel | null>(null)
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            if(id){
                const client = new AdminChatClass()
                const chan = await client.getChannelById(id)
                setChannel(chan)

                if(me?.role != UserRole.admin){
                    navigate(Route.notfound)
                    return
                }
            }
        })()
    }, [id])

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
    const [user, setUser] = useState<User | null>(null)
    const [channel, setChannels] = useState<Channel[] | null>(null)
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            const client = new AdminChatClass()
            const chan = await client.getAllChannel()
            setChannels(chan)
            const use = await client.getMe()
            setUser(use)
            await client.refreshUser()
            if(!client.isAdmin()){
                navigate(Route.notfound)
                return
            }
        })()
    }, [])

    if(!channel || !user){
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
                user={user}
                onViewChat={() => navigate(`${Route.chat}/${chan._id}`)}
                onManage={() => navigate(`${Route.manageChannels}/${chan._id}`)}
                buttonShow={ShowChatButton.Chat | ShowChatButton.Manage}
            />
        ))}
    </>
}


export default ManageChat