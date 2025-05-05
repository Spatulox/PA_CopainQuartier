import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chat as ChatClass, Channel, Message } from "../../../api/chat";
import ChannelList from "./ChannelList";
import ChatRoom from "./ChatRoom";
import { Route } from "../../constantes";

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState("Déconnecté");
  const [statusColor, setStatusColor] = useState("red");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesDivRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<ChatClass>(new ChatClass());
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const user = userRef.current;

    if (!id) {
      (async () => {
        if (!(await user.connect())) {
          navigate(Route.login);
          return;
        }
        const channels = await user.getChannel();
        if (isMounted) setChannels(channels);
      })();
      return () => {
        isMounted = false;
      };
    }

    (async () => {
      if (!(await user.connect())) {
        navigate(Route.login);
        return;
      }
      const channel = await user.getChannelById(id);
      if (!channel) {
        setStatus("Aucun channel trouvé");
        setStatusColor("orange");
        return;
      }

      const ws = new WebSocket(`ws://localhost:3000/channel/${channel._id}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("Connecté");
        setStatusColor("green");
        ws.send(JSON.stringify({ connection: user.getAuthToken() }));
      };

      ws.onclose = () => {
        setStatus("Déconnecté");
        setStatusColor("red");
      };

      ws.onerror = () => {
        setStatus("Erreur de connexion");
        setStatusColor("orange");
      };

      ws.onmessage = async (event) => {
        let dataStr = "";

        if (event.data instanceof Blob) {
          dataStr = await event.data.text();
        } else if (typeof event.data === "string") {
          dataStr = event.data;
        } else {
          console.error("Type de message WebSocket inattendu :", event.data);
          return;
        }

        let res;
        try {
          res = JSON.parse(dataStr);
        } catch (e) {
          console.error("Message reçu n'est pas du JSON valide :", dataStr);
          return;
        }

        if (res.hasOwnProperty("err")) {
          alert(res.err.toString());
          ws.close();
          return;
        }

        if (Array.isArray(res)) {
          if (isMounted) {
            setMessages((prev) => [...prev, ...res]);
          }
        }

        if (res.hasOwnProperty("message")) {
          if (isMounted) {
            setMessages((prev) => [...prev, { content: res.message }]);
          }
        }
      };
    })();

    return () => {
      isMounted = false;
      wsRef.current?.close();
    };
  }, [id, navigate]);

  useEffect(() => {
    if (messagesDivRef.current) {
      messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = userRef.current;
    if (
      input &&
      wsRef.current &&
      wsRef.current.readyState === 1 &&
      user.user && user.user._id
    ) {
      wsRef.current.send(
        JSON.stringify({
          message: input,
          user_id: user.user._id,
          channel_id: id,
        })
      );
      setInput("");
    }
  };

  if (!id) {
    return <ChannelList channels={channels} />;
  }

  return (
    <ChatRoom
      id={id}
      status={status}
      statusColor={statusColor}
      messages={messages}
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
      messagesDivRef={messagesDivRef}
    />
  );
};

export default ChatPage;
