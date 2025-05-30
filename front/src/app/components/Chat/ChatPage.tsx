import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { Channel, ChatClass, Message } from "../../../api/chat";
import ChatRoom, { ChannelRight } from "./ChatRoom";

enum MsgType {
  INIT = "INIT",
  HISTORY = "HISTORY",
  MESSAGE = "MESSAGE",
  ERROR = "ERROR",
}

function ChatPage() {
  const { me } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Déconnecté");
  const [channel, setChannel] = useState<Channel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Pour le reconnexion automatique
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectDelay = useRef<number>(1000); // 1s de base

  // Fonction pour ouvrir la connexion WebSocket
  const openWebSocket = React.useCallback(() => {
    if (!id) return;

    const ws = new window.WebSocket(`ws://localhost:3000/channel/${id}`);
    wsRef.current = ws;

    const user = new ChatClass();
    setToken(user.getAuthToken());

    const fetchChannel = async () => {
      const chan = await user.getChannelById(id);
      setChannel(chan);
    };
    fetchChannel();

    ws.onopen = () => {
      setStatus("Connecté");
      reconnectDelay.current = 1000;
      ws.send(JSON.stringify({ type: MsgType.INIT, token: user.getAuthToken() }));
      setMessages([]);
    };

    ws.onclose = () => {
      setStatus("Déconnecté");
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.2, 30000); // max 30s
        openWebSocket();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      setStatus("Erreur");
      ws.close(); // Ferme pour déclencher onclose et donc la reconnexion
    };

    ws.onmessage = async (event) => {
      let data = typeof event.data === "string" ? event.data : await event.data.text();
      let msg;
      try { msg = JSON.parse(data); } catch { return; }

      if (msg.type === MsgType.ERROR) {
        alert(msg.error);
        ws.close();
        return;
      }
      if (msg.type === MsgType.HISTORY) setMessages(msg.messages);
      if (msg.type === MsgType.MESSAGE) setMessages(prev => [...prev, msg]);
    };
  }, [id]);

  // useEffect principal
  useEffect(() => {
    openWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [id, openWebSocket]);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envoi d'un message
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (input && wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: MsgType.MESSAGE, content: input, user_id: me?._id }));
      setInput("");
    }
  };

  if (!id) return <div>Liste des channels ici</div>;
  if (!me) return <NotFound />;

  const statusColor = status === "Connecté" ? "#00FF00" : "#FF0000";
  const thechannelAuth =
    channel?.member_auth === ChannelRight.read_send
      ? ChannelRight.read_send
      : ChannelRight.read_only;

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