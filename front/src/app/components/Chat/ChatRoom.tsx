import React, { useRef, useEffect } from "react";
import { Channel, Message } from "../../../api/chat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";

export enum ChannelRight {
  read_send = "read_send",
  read_only = "read_only"
}

type Props = {
  id: string;
  chat: Channel;
  status: string;
  statusColor: string;
  memberRight: ChannelRight,
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  messagesDivRef: React.RefObject<HTMLDivElement | null>;
};

const ChatRoom: React.FC<Props> = ({
  id, chat, status, statusColor, memberRight, messages, input, setInput, handleSubmit, messagesDivRef
}) => {
  const navigate = useNavigate()
  return  <div>
    <div>
      <h2>{chat.name}</h2>
      <div id="chat-info">
        <ul>
          <li>Chat ID : {chat._id}</li>
          <li>Admin : {chat.admin?.email}</li>
          {chat.activity && (<li>Activité liée : {chat.activity?.title} <button onClick={() => navigate(`${Route.activity}/${chat.activity?._id}`)} >Voir l'activité</button></li>)}
          <li>Type : {chat.type}</li>
          <li>Crée le : {new Date(chat.created_at).toDateString()}</li>
          <li>Droits : {chat.member_auth}</li>
        </ul>
      </div>
    </div>
    <div id="status" style={{ color: statusColor, marginBottom: 8 }}>{status}</div>
    <div
      id="messages"
      style={{
        border: "1px solid #ccc",
        height: 300,
        overflowY: "auto",
        marginBottom: 8,
        padding: 8,
      }}
    >
      {messages.map((msg, idx) => (
        <div key={idx}>
          <span>{msg.username}</span>
          <p>{msg.content}</p>
        </div>
      ))}
      <div ref={messagesDivRef}/>
    </div>
    {memberRight === ChannelRight.read_send && (
      <form id="formulaire" onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          id="input"
          autoComplete="off"
          placeholder="Tape ton message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <input type="submit" value="Envoyer" />
      </form>
    )}
  </div>
};

export default ChatRoom;
