import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Chat as ChatClass, Channel, Message } from "../../api/chat";
import { Route } from "../constantes";

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState("Déconnecté");
  const [statusColor, setStatusColor] = useState("red");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesDivRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<ChatClass>(new ChatClass()); // <--- useRef ici !
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const user = userRef.current;

    if (!id) {
      (async () => {
        if (!await user.connect()) {
          navigate(Route.auth);
          return;
        }
        const channels = await user.getChannel();
        if (isMounted) setChannels(channels);
      })();
      return () => { isMounted = false; };
    }

    (async () => {
      if (!await user.connect()) {
        navigate(Route.auth);
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
      
        // Si event.data est un Blob, on le lit en texte
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
      wsRef.current.send(JSON.stringify({ message: input, user_id: user.user._id, channel_id: id }));
      setInput("");
    }
  };

  // Affichage de la liste des channels si pas d'id
  if (!id) {
    return (
      <div>
        <h2>Mes channels</h2>
        <ul>
          {channels.length === 0 ? (
            <li key="no-channels">Aucun channel trouvé.</li>
          ) : (
            channels.map((channel) => (
              <li key={channel._id}>
                <Link to={`/chat/${channel._id}`}>{channel.name}</Link>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  // Affichage du chat si id présent
  return (
    <div>
      <div>
        <b>Chat ID :</b> {id}
      </div>
      <div id="status" style={{ color: statusColor, marginBottom: 8 }}>{status}</div>
      <div
        id="messages"
        ref={messagesDivRef}
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          marginBottom: 8,
          padding: 8,
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>{msg.content}</div>
        ))}
      </div>
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
    </div>
  );
};

export default Chat;