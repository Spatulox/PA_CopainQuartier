import React, { useRef, useEffect } from "react";
import { Message } from "../../../api/chat";

export enum ChannelRight {
  read_send = "read_send",
  read_only = "read_only"
}

type Props = {
  id: string;
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
  id, status, statusColor, memberRight, messages, input, setInput, handleSubmit, messagesDivRef
}) => (
  <div>
    <div>
      <b>Chat ID :</b> {id}
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
);

export default ChatRoom;
