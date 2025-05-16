import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChatClass, Channel, Message } from "../../../api/chat";
import { ManageChannelList } from "./ChatList";
import ChatRoom, { ChannelRight } from "./ChatRoom";
import { Route } from "../../constantes";
import { PopupConfirm } from "../Popup/PopupConfirm";
import { ShowChat, ShowChatButton } from "./SingleChat";
import { User, UserRole } from "../../../api/user";
import { CreateChannel } from "./ChatCreate";

function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [thechannelAuth, setChannelAuth] = useState<ChannelRight>(ChannelRight.read_only);
  const [status, setStatus] = useState("Déconnecté");
  const [statusColor, setStatusColor] = useState("red");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesDivRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<ChatClass>(new ChatClass());
  const [confirmChannelDeletion, setChannelDeletion] = useState<{ id: string, isDelete: boolean } | null>(null);
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
        setMessages([])
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

      setChannelAuth(channel.member_auth == ChannelRight.read_send ? ChannelRight.read_send : ChannelRight.read_only)

      const ws = new WebSocket(`ws://localhost:3000/channel/${channel._id}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("Connecté");
        setStatusColor("green");
        ws.send(JSON.stringify({ connection: user.getAuthToken() }));
        setMessages([])
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

  function handleAskConfirmation(id_channel: string, user_id: string | undefined) {
    const channel = channels.find(c => c._id === id_channel);
    if (channel && user_id && channel.owner?._id === user_id) {
      setChannelDeletion({ id: id_channel, isDelete: true });
    } else {
      setChannelDeletion({ id: id_channel, isDelete: false });
    }
  }

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

    async function leaveDeleteGroup(id_channel: string, user_id: string | undefined) {
      const chat = new ChatClass();
      const channel = await chat.getChannelById(id_channel);
      if (channel && user_id && channel.owner?._id === user_id) {
        await chat.deleteChat(id_channel);
      } else {
        await chat.leaveChat(id_channel);
      }
      const updatedChannels = await chat.getChannel();
      setChannels(updatedChannels);
    }

    async function refreshChannel() {
      const channels = await userRef.current.getChannel();
      setChannels(channels)
    }

    return (
      <>
        <ManageChannelList
          channels={channels}
          action={handleAskConfirmation}
          user={userRef.current.user}
        />
        {userRef.current.user?.role == UserRole.admin && (
          <button onClick={() => navigate(Route.manageChannels)}>Gérer les channels</button>
        )}
        <CreateChannel action={refreshChannel} />
        {confirmChannelDeletion && (
          <PopupConfirm
            title={confirmChannelDeletion.isDelete ? "Supprimer le chat" : "Quitter le chat"}
            description={
              confirmChannelDeletion.isDelete
                ? "Êtes-vous sûr de vouloir supprimer ce chat ? Cette action est irréversible."
                : "Êtes-vous sûr de vouloir quitter ce chat ?"
            }
            onConfirm={async () => {
              await leaveDeleteGroup(confirmChannelDeletion.id, userRef.current.user!._id);
              setChannelDeletion(null);
            }}
            onCancel={() => setChannelDeletion(null)}
            confirmLabel={confirmChannelDeletion.isDelete ? "Supprimer" : "Quitter"}
            cancelLabel="Annuler"
          />
        )}
      </>
    );
  }
  
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
      messagesDivRef={messagesDivRef}
    />
  );
};

export default ChatPage;
