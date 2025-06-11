import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { Channel, ChatClass, Message } from "../../../api/chat";
import ChatRoom, { ChannelRight } from "./ChatRoom";
import { ChannelList } from "./ChatList";
import { popup } from "../../scripts/popup-slide";
import { InviteClass } from "../../../api/invite";

enum MsgType {
  INIT = "INIT",
  HISTORY = "HISTORY",
  MESSAGE = "MESSAGE",
  ERROR = "ERROR",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  CANDIDATE = "ICE-CANDIDATE",
  JOIN_VOCAL = "JOIN_VOCAL",
  LEAVE_VOCAL = "LEAVE_VOCAL",
}

type OfferMsg = {
  type: string,
  offer: any // (c'est un truc chelou)
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
  
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Pour le reconnexion automatique
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectDelay = useRef<number>(1000); // 1s de base

  const chatID = id_channel || id 

  // Fonction pour ouvrir la connexion WebSocket
  const openWebSocket = React.useCallback(() => {
    if (!chatID) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new window.WebSocket(`ws://localhost:3000/channel/${chatID}`);
    wsRef.current = ws;

    const user = new ChatClass();
    setToken(user.getAuthToken());

    const fetchChannel = async () => {
      const chan = await user.getChannelById(chatID);
      setChannel(chan);
    };
    fetchChannel();

    ws.onopen = () => {
      setStatus("Connecté");
      reconnectDelay.current = 1000;
      ws.send(JSON.stringify({ type: MsgType.INIT, token: user.getAuthToken() })); // if using token instead of user.getauthToken, the api will crash (and send 401)
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
      ws.close();
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
      if (msg.type === MsgType.OFFER) onOffer(msg)
      if (msg.type === MsgType.ANSWER) onAnswer(msg)
      if (msg.type === MsgType.CANDIDATE) onCandidate(msg)
    };
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
      console.log(pc.iceConnectionState)
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

    /*if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "LEAVE_CALL" }));
    }*/

    const audio = document.getElementById("remoteAudio") as HTMLAudioElement | null;
    if (audio) {
      audio.srcObject = null;
      audio.volume = 0
    }

    setVocalStatus("Déconnecté");
  }



  // useEffect principal
  useEffect(() => {
    openWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [chatID, openWebSocket]);

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

  async function handleGenerateInvite(id: string){
    console.log("coucou")
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
  );
}

export default ChatPage;