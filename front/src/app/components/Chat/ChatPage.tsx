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
import { User, UserClass } from "../../../api/user";
import { Route } from "../../constantes";
import { FriendsClass } from "../../../api/friend";
import { setupWebSocket } from "../shared/websocket";

/*enum MsgType {
  INIT = "INIT",
  HISTORY = "HISTORY",
  MESSAGE = "MESSAGE",
  CONNECTED_CHANNEL = "CONNECTED_CHANNEL",
  ERROR = "ERROR",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  CANDIDATE = "ICE-CANDIDATE",
  JOIN_VOCAL = "JOIN_VOCAL",
  LEAVE_VOCAL = "LEAVE_VOCAL",
  INIT_CONNECTION = "INIT_CONNECTION", // For the "connected" state (online/offline)
  CONNECTED = "CONNECTED" // For the "connected" state (online/offline)
}*/

type OfferMsg = {
  type: string,
  offer: any // (c'est un truc chelou)
}

type ConnectedChannelMsg = {
  type: string,
  token_connected_client: any // (c'est un truc chelou)
}

type IceCandidateMsg = {
  type: string,
  candidate: {
    candidate: string,
    sdpMLineIndex: number,
    sdpMid: string,
    usernameFragment: string
  }
}

type ChatProps = {
    id_channel: string
};

function ChatPage({id_channel}: ChatProps) {
  const { me } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Déconnecté");
  const [vocalStatus, setVocalStatus] = useState("Déconnecté");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const miniUserRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState<string[]>()
 
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatID = id_channel || id 

  const onReconnect = () => {
    openWebSocket();
  };

  // Fonction pour ouvrir la connexion WebSocket
  const openWebSocket = React.useCallback(() => {
    if (!chatID) return;

    const user = new ChatClass();

    setToken(user.getAuthToken());
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
          ERROR(msg) {
              alert(msg.error);
              wsRef.current?.close();
              return;
          },
          HISTORY(msg) {
              setMessages(msg.messages)
          },
          MESSAGE(msg) {
              setMessages(prev => [...prev, msg])
          },
          OFFER(msg) {
              onOffer(msg)
          },
          ANSWER(msg) {
              onAnswer(msg)
          },
          CANDIDATE(msg) {
              onCandidate(msg)
          },
          CONNECTED_CHANNEL(msg) {
              onConnected(msg)
          },
        }
      },
      onReconnect,
    });
  }, [chatID]);


  async function onOffer(msg: OfferMsg){
    let pc = peerConnectionRef.current;
    if (!pc) {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      peerConnectionRef.current = pc;

      pc.ontrack = event => {
        setVocalStatus("Connecté");
        const audio = document.getElementById("remoteAudio") as HTMLAudioElement;
        if (audio) {
          audio.srcObject = event.streams[0];
          audio.muted = false
          audio.autoplay = true
          audio.volume = 1
          audio.play();
        }
      };

      pc.onicecandidate = event => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({ type: MsgType.CANDIDATE, candidate: event.candidate }));
        }
      };
    }

    await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    wsRef.current!.send(JSON.stringify({ type: MsgType.ANSWER, answer }));
  }



  async function onAnswer(msg: any){
    const pc = peerConnectionRef.current;
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
    }
  }

  async function onCandidate(msg: IceCandidateMsg){
    const pc = peerConnectionRef.current;
    if (pc && msg.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      } catch (e) {
        console.error("Erreur ICE candidate", e);
      }
    }
  }

  async function onConnected(msg: ConnectedChannelMsg){
    setConnected(msg.token_connected_client)
  }

  const startVoiceChat = async () => {
    if(!wsRef || !wsRef.current){
      popup("Impossible de se connecter au vocal")
      return;
    }
    wsRef.current!.send(JSON.stringify({ type: MsgType.JOIN_VOCAL, token: token }));

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    peerConnectionRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    const ws = wsRef
    if(!ws || !ws.current){
      popup("Impossible se se connecter")
      return
    }

    pc.onicecandidate = event => {
      if (event.candidate && ws.current) {
        ws.current.send(JSON.stringify({ type: MsgType.CANDIDATE, candidate: event.candidate }));
      }
    };

    pc.ontrack = event => {
      setVocalStatus("Connecté")
      const audio = document.getElementById("remoteAudio") as HTMLAudioElement;
      if(!audio){
        popup("Problème d'audio")
        return
      }
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audio.muted = false;
      audio.volume = 1
      audio.play();
    };

    setVocalStatus("En attente d'une autre personne");

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        setVocalStatus("Connecté");
      }
      if (
        pc.iceConnectionState === "disconnected"
      ) {
        setVocalStatus("En attente d'une autre personne");
      }

      if (
        pc.iceConnectionState === "failed"
      ) {
        setVocalStatus("Déconnecté");
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.current.send(JSON.stringify({ type: MsgType.OFFER, offer }));
  };

  function leaveVoiceChat() {

    wsRef.current!.send(JSON.stringify({ type: MsgType.LEAVE_VOCAL, token: token }));

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const audio = document.getElementById("remoteAudio") as HTMLAudioElement | null;
    if (audio) {
      audio.srcObject = null;
      audio.volume = 0
    }

    setVocalStatus("Déconnecté");
  }



  // useEffect principal, automatic reconnect
  useEffect(() => {
    openWebSocket();
  }, [chatID, openWebSocket]);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // For the users display
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (miniUserRef.current && !miniUserRef.current.contains(event.target as Node)) {
        setSelectedUserId(null);
      }
    }
    // Ajoute le listener si selectedUserId est non null
    if (selectedUserId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Nettoie le listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedUserId]);

  // Send a message
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (input && wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: MsgType.MESSAGE, content: input, user_id: me?._id }));
      setInput("");
    }
  };

  async function handleGenerateInvite(id: string){
    try {
      const client = new InviteClass()
      const invite = await client.generateInvite(id)
      if (typeof invite === "string") {
        await navigator.clipboard.writeText(invite);
        popup("Invitation générée et copiée ! Vous pouvez la coller n'importe où");
      }
    } catch (e) {
      popup("Une erreur est survenue")
      console.error(e)
    }
  }

  async function handleSendRequest(id: string | null){
    if(!id) return
    const client = new FriendsClass()
    try {
      await client.sendAFriendsRequest(id)
      popup("Demande envoyée")
    } catch (e) {
      console.error(e)
    }
  }

  if (!chatID) return <div><ChannelList /></div>;
  if (!me) return <NotFound />;
  if(!channel){
    return <NotFound />
  }
  const statusColor = status === "Connecté" ? "#00FF00" : "#FF0000";
  const vocalStatusColor = vocalStatus === "Connecté" ? "#00FF00" : "#FF0000";
  const thechannelAuth =
    channel?.member_auth === ChannelRight.read_send
      ? ChannelRight.read_send
      : ChannelRight.read_only;
  return (
    <>
      <ChatRoom
        id={chatID}
        chat={channel}
        status={status}
        vocalStatus={vocalStatus}
        statusColor={statusColor}
        vocalStatusColor={vocalStatusColor}
        memberRight={thechannelAuth}
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        onStartVoiceChat={startVoiceChat}
        onLeaveVoiceChat={leaveVoiceChat}
        onGenerateInvite={(id: string) => handleGenerateInvite(id)}
        messagesDivRef={messagesEndRef}
      />
      <div className="members">
        <ul>
          {channel && channel.members.map((mem: User | string) => {
            if (typeof mem === 'string') {
              return <li key={mem}>{mem}</li>;
            } else if(mem) {
              return (
                <li key={mem._id}>
                  <button
                    onClick={() => setSelectedUserId(mem._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: connected?.includes(mem._id) ? "greenyellow" : "red" }}
                  >
                    {mem.name}
                  </button>
                </li>
              );
            } else {
              return (<li>Unknown</li>)
            }
          })}
        </ul>

        {/* Affiche l'iframe en dehors de la liste, pour éviter les bugs de layout */}
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