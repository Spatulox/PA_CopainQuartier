import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Channel, ChatClass } from "../../../api/chat";
import { User } from "../../../api/user";
import { FieldForm, PopupForm } from "../Popup/PopupForm";
import { ShowChat, ShowChatButton } from "./SingleChat";
import { Route } from "../../constantes";
import { useEffect, useState } from "react";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import Errors from "../shared/errors";
import { ErrorMessage } from "../../../api/client";

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
  const [channel, setChannel] = useState<Channel[]>([])
  const [err, setErrors] = useState<ErrorMessage | null>(null)

  useEffect(() => {
    (async () => {
      const client = new ChatClass()
      try{
        const chan = await client.getChannel()
        setChannel(chan)
      } catch(e){
        setErrors(client.errors)
      }
    })()
  }, [])

  if(channel && channel.length == 0){
    return <Loading title="Chargement des channels" />
  }

  if(err != null){
      return <Errors errors={err} />
  }

  return (
  <div>
    <h2>Mes channels</h2>
    {channel.length === 0 ? (
      <p>Aucun channel trouvé.</p>
    ) : (
      channel.map((chan) => (
        <p key={chan._id}>
          <Link to={`/chat/${chan._id}`}>{chan.name}</Link>
        </p>
      ))
    )}
  </div>
  )
}

export function ManageChannelList({ channels, action, user }: ListProps) {
  return (
  <div>
    <h2>Mes channels</h2>
    {channels.length === 0 ? (
      <p>Aucun channel trouvé.</p>
    ) : (
      channels.map((channel) => (
        <p key={channel._id}>
          <button><Link to={`${Route.chat}/${channel._id}`}>{channel.name}</Link></button>
          <span>{channel.description}</span>
          <button onClick={()=>action(channel._id, user?._id)}>
              {user?._id == channel.admin?._id ? "Supprimer le Chat" : "Quitter le Chat"}
          </button>
        </p>
      ))
    )}
  </div>
  )
};