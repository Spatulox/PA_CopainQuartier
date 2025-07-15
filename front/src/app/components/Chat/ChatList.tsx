import { Link, useNavigate } from "react-router-dom";
import { Channel, ChatClass } from "../../../api/chat";
import { User } from "../../../api/user";
import { Route } from "../../constantes";
import { useEffect, useState } from "react";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import Errors from "../shared/errors";
import { ErrorMessage } from "../../../api/client";
import { popup } from "../../scripts/popup-slide";
import { CreateChannel } from "./ChatCreate";
import './Chat.css';

type ListProps = {
  channels: Channel[];
  action: (channel_id:string, user_id: string | undefined) => void;
  user : User
};

type ListSimpleProps = {
  channels: Channel[];
};

export function ChannelList(/*{ channels }: ListSimpleProps*/) {
  const navigate = useNavigate()
  const [channel, setChannel] = useState<Channel[] | null>(null)
  const [err, setErrors] = useState<ErrorMessage | null>(null)
  const {me, isAdmin} = useAuth()
  const [onDelete, setOnDelete] = useState(0)
  const [refresh, setRefresh]= useState(0)

  useEffect(() => {
    (async () => {
      const client = new ChatClass()
      try{
        const chan = await client.getChannel()
        setChannel(chan)
        setErrors(null)
      } catch(e){
        setErrors(client.errors)
      }
      setOnDelete(r => r +1)
    })()
  }, [refresh])

  if(channel == null){
    return <Loading title="Chargement des channels" />
  }

  if(err != null){
      return <Errors errors={err} />
  }

  async function handlAction(channel: Channel, user_id: string | undefined){
    if(!me){
      popup("Impossible de réaliser l'action")
      return
    }

    const client = new ChatClass()
    if(channel.admin?._id == me?._id){
      try{
        await client.deleteChat(channel._id)
        const chan = await client.getChannel()
        setChannel(chan)
        setErrors(null)
      } catch(e){
        setErrors(client.errors)
      }
    } else {
      try{  
        await client.leaveChat(channel._id)
        const chan = await client.getChannel()
        setChannel(chan)
        setErrors(null)
      } catch(e){
        setErrors(client.errors)
      }
    }
    setOnDelete(r => r +1)
  }

  return (
  <div className="channel-list-container">
    <h2>Mes channels</h2>
    <div className="channel-list">
      {channel.length === 0 ? (
        <p>Aucun channel trouvé.</p>
      ) : (
        channel.map((channel) => (
          <p key={channel._id} className="channel-item">
            <button><Link to={`${Route.chat}/${channel._id}`}>{channel.name}</Link></button>
            <button onClick={()=>handlAction(channel, me?._id)}>
                {me?._id == channel.admin?._id ? "Supprimer le Chat" : "Quitter le Chat"}
            </button>
          </p>
        ))
      )}
    </div>
    <div className="create-channel-container">
      <CreateChannel update={onDelete} action={() => setRefresh(r => r+1)} />
    </div>
  </div>
  )
}