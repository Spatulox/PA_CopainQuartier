import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { Channel, ChatClass, Message, MsgType } from "../../../api/chat";
import ChatRoom, { ChannelRight } from "./ChatRoom";
import { ChannelList } from "./ChatList";
import { popup } from "../../scripts/popup-slide";
import { InviteClass } from "../../../api/invite";
import { MiniUser } from "../Users/MiniUser";
import { User } from "../../../api/user";
import { Route } from "../../constantes";
import { FriendsClass } from "../../../api/friend";
import {
  AnswerMsg,
  ChatMsgSend,
  ConnectedChannelMsg,
  IceCandidateMsg,
  OfferMsg,
  setupWebSocket,
  VocalMsg,
} from "../shared/websocket";
import "./Chat.css";

function ChatPage({ id_channel }) {
  const { me } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const chatID = id_channel || id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Déconnecté");
  const [vocalStatus, setVocalStatus] = useState("Déconnecté");
  const [channel, setChannel] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [connectedUser, setConnectedUser] = useState([]);

  const miniUserRef = useRef(null);
  const messagesEndRef = useRef(null);

  const wsRef = useRef(null);

  useEffect(() => {
    if (!chatID) return;
    const user = new ChatClass();
    const fetchChannel = async () => {
      const chan = await user.getChannelById(chatID);
      setChannel(chan);
    };
    fetchChannel();

    setupWebSocket({
      wsUrl: `/channel/${chatID}`,
      wsRef,
      authToken: user.getAuthToken(),
      handlers: {
        onOpen: () => setStatus("Connecté"),
        onClose: () => setStatus("Déconnecté"),
        onError: () => setStatus("Erreur"),
        onMessage: {
          HISTORY: (msg) => setMessages(msg.messages),
          MESSAGE: (msg) => setMessages((prev) => [...prev, msg]),
          CONNECTED_CHANNEL: (msg) => setConnectedUser(msg.token_connected_client),
          JOIN_VOCAL: () => popup("qqun a rejoind"),
          LEAVE_VOCAL: () => popup("qqun a quitté"),
        },
      },
    });
  }, [chatID]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (miniUserRef.current && !miniUserRef.current.contains(event.target)) {
        setSelectedUserId(null);
      }
    }
    if (selectedUserId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedUserId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input && wsRef.current?.readyState === 1 && me?._id) {
      wsRef.current.send(JSON.stringify({
        type: MsgType.MESSAGE,
        content: input,
        user_id: me._id,
      }));
      setInput("");
    }
  };

  const handleGenerateInvite = async (id) => {
    try {
      const invite = await new InviteClass().generateInvite(id);
      if (typeof invite === "string") {
        await navigator.clipboard.writeText(invite);
        popup("Invitation générée et copiée !");
      }
    } catch (e) {
      popup("Une erreur est survenue");
    }
  };

  const handleSendRequest = async (id) => {
    try {
      await new FriendsClass().sendAFriendsRequest(id);
      popup("Demande envoyée");
    } catch (e) {
      console.error(e);
    }
  };

  if (!chatID) return <ChannelList />;
  if (!me || !channel) return <NotFound />;

  const thechannelAuth =
      channel.member_auth === ChannelRight.read_send
          ? ChannelRight.read_send
          : ChannelRight.read_only;

  return (
      <>
        <ChatRoom
            id={chatID}
            chat={channel}
            status={status}
            vocalStatus={vocalStatus}
            statusColor={status === "Connecté" ? "#00FF00" : "#FF0000"}
            vocalStatusColor={vocalStatus === "Connecté" ? "#00FF00" : "#FF0000"}
            videoStatus={false}
            shareScreenType={null}
            memberRight={thechannelAuth}
            messages={messages}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            onStartVoiceChat={() => {}}
            onLeaveVoiceChat={() => {}}
            onStartVideoShare={() => {}}
            onStopVideoShare={() => {}}
            onGenerateInvite={handleGenerateInvite}
            messagesDivRef={messagesEndRef}
        />

        <div className="members-box">
          <h3>Membres du canal</h3>
          <ul className="members-list">
            {channel.members.map((mem) => {
              if (typeof mem === "string") return <li key={mem}>{mem}</li>;
              return (
                  <li key={mem._id}>
                    <button
                        className="member-button"
                        onClick={() => setSelectedUserId(mem._id)}
                        style={{
                          color: connectedUser?.includes(mem._id) ? "greenyellow" : "red",
                        }}
                    >
                      {mem.name}
                    </button>
                  </li>
              );
            })}
          </ul>

          {selectedUserId && (
              <div ref={miniUserRef}>
                <MiniUser
                    key={selectedUserId}
                    theuser={selectedUserId}
                    user={me}
                    onViewUser={() => navigate(`${Route.user}/${selectedUserId}`)}
                    onManage={() => navigate(`${Route.manageUser}/${selectedUserId}`)}
                    onRequest={() => handleSendRequest(selectedUserId)}
                />
              </div>
          )}
        </div>
      </>
  );
}

export default ChatPage;
