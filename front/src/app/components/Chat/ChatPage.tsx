import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { Channel, ChatClass, Message } from "../../../api/chat";
import { ApiClient } from "../../../api/client";
import ChatRoom, { ChannelRight } from "./ChatRoom";

function ChatPage() {

  const { me } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState<string | null>(null)
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Déconnecté");
  const [channel, setChannel] = useState<Channel | null>(null)
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Connexion WebSocket et gestion des messages
  useEffect(() => {
    if (!id) return;
    const ws = new window.WebSocket(`ws://localhost:3000/channel/${id}`);
    wsRef.current = ws;

    const user = new ChatClass()
    setToken(user.getAuthToken())

    const fetchChannel = async () => {
      const chan = await user.getChannelById(id);
      setChannel(chan);
    };
    fetchChannel();

    ws.onopen = () => {
      setStatus("Connecté");
      ws.send(JSON.stringify({ type: "INIT", token: token }));
      setMessages([]);
    };

    ws.onclose = () => setStatus("Déconnecté");
    ws.onerror = () => setStatus("Erreur");

    ws.onmessage = async (event) => {
      let data = typeof event.data === "string" ? event.data : await event.data.text();
      let msg;
      try { msg = JSON.parse(data); } catch { return; }

      if (msg.type === "ERROR") {
        alert(msg.error);
        ws.close();
        return;
      }
      if (msg.type === "HISTORY") setMessages(msg.messages);
      if (msg.type === "MESSAGE") setMessages(prev => [...prev, msg]);
    };

    return () => ws.close();
  }, [id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envoi d'un message
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (input && wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "MESSAGE", content: input, user_id: me?._id }));
      setInput("");
    }
  };

  if (!id) return <div>Liste des channels ici</div>;
  if (!me) return <NotFound />;

  const statusColor = (status == "Connecté" ? "#00FF00" : "#FF0000")
  const thechannelAuth = channel?.member_auth == ChannelRight.read_send ? ChannelRight.read_send : ChannelRight.read_only

  return (
    <ChatRoom
      id={id}
      status={status}
      statusColor={statusColor}
      memberRight={thechannelAuth}
      messages={messages}
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
      messagesDivRef={messagesEndRef}
    />
  );
}

export default ChatPage;