import React from "react";
import { Link } from "react-router-dom";
import { Channel } from "../../../api/chat";
import { User } from "../../../api/client";

type ListProps = {
  channels: Channel[];
  action: (channel_id:string, user_id: string | undefined) => void;
  user : User
};

type ListSimpleProps = {
  channels: Channel[];
};

type CreateProps = {
  name: string,
  description: string
};

export function ChannelList({ channels }: ListSimpleProps) {
  return (
  <div>
    <h2>Mes channels</h2>
    {channels.length === 0 ? (
      <p>Aucun channel trouvé.</p>
    ) : (
      channels.map((channel) => (
        <p key={channel._id}>
          <Link to={`/chat/${channel._id}`}>{channel.name}</Link>
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
          <button><Link to={`/chat/${channel._id}`}>{channel.name}</Link></button>
          <span>{channel.description}</span>
          <button onClick={()=>action(channel._id, user?._id)}>{user?._id == channel.admin_id ? "Supprimer le Chat" : "Quitter le Chat"}</button>
        </p>
      ))
    )}
  </div>
  )
};


export function CreateChannel({}: CreateProps){

  function createChannel(){
    alert("Crée !")
  }

  return (
    <div>
      <button onClick={createChannel}>Créer un channel</button>
    </div>
  )
}