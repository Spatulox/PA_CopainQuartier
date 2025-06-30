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
import { AnswerMsg, ChatMsgSend, ConnectedChannelMsg, IceCandidateMsg, OfferMsg, setupWebSocket, VocalMsg } from "../shared/websocket";
import './Chat.css';

type ChatProps = {
    id_channel?: string
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
  const [connectedUser, setConnectedUser] = useState<string[]>()
  const [videoStatus, setVideoStatus] = useState(false)
  const [cameraOrScreen, setCameraOrScreen] = useState<"camera" | "screen" | null>(null)
 
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const videoSenderRef = useRef<RTCRtpSender | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatID = id_channel || id 
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
          JOIN_VOCAL(msg) {
            popup("qqun a rejoind")
          },
          LEAVE_VOCAL(msg) {
            onLeave(msg)
            popup("qqun a quitté")
          },
        }
      }
    });
  }, [chatID]);

  function startAutoNegotiation(){
    if(peerConnectionRef.current){
      peerConnectionRef.current.onnegotiationneeded = async () => {
        const pc = peerConnectionRef.current;
        const ws = wsRef.current;
        if (!pc || !ws) return;
        if (pc.signalingState !== "stable") return;

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          const data: OfferMsg= {
            type: MsgType.OFFER,
            offer,
          };
          ws.send(JSON.stringify(data));
        } catch (e) {
          console.error("Erreur lors de la négociation :", e);
        }
      };
    }
  }

  async function onOffer(msg: OfferMsg){
    let pc = peerConnectionRef.current;
    if (!pc) {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      peerConnectionRef.current = pc;
      startAutoNegotiation()

      pc.ontrack = event => {
        setVocalStatus("Connecté");

        // Affichage audio
        const audio = document.getElementById("remoteAudio") as HTMLAudioElement;
        if (audio && event.track.kind === "audio") {
          audio.srcObject = event.streams[0];
          audio.muted = false;
          audio.autoplay = true;
          audio.volume = 1;
          audio.play();
        }

        // Affichage vidéo
        const video = document.getElementById("remoteVideo") as HTMLVideoElement;
        if (video && event.track.kind === "video") {
          video.srcObject = event.streams[0];
          video.muted = false;
          video.autoplay = true;
          video.volume = 1;
          video.play();
        }
      };

      pc.onicecandidate = event => {
        if (event.candidate && wsRef.current) {
          const data: IceCandidateMsg = {
            type: MsgType.CANDIDATE,
            candidate: event.candidate
          }
          wsRef.current.send(JSON.stringify(data));
        }
      };
    }

    await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
    let stream = localStreamRef.current;
    const ws = wsRef.current;
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
    }

    stream.getTracks().forEach(track => {
      if (!pc.getSenders().find(sender => sender.track === track)) {
        pc.addTrack(track, stream);
      }
    });
    if(!ws){
      return
    }
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    const data: AnswerMsg = {
      type: MsgType.ANSWER,
      answer,
    }
    ws.send(JSON.stringify(data));
  }

  // For futur (?) multi voc support
  async function onLeave(msg: any){
    /*if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setVocalStatus("Déconnecté");
    setInVoc(false);
    const audio = document.getElementById("remoteAudio") as HTMLAudioElement;
    if (audio) audio.srcObject = null;
    const video = document.getElementById("remoteVideo") as HTMLVideoElement;
    if (video) video.srcObject = null;*/
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
    setConnectedUser(msg.token_connected_client)
  }

  let audioCtx: AudioContext | null = null;
  async function generateSound(freq: number) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2); // 0.5 seconde par exemple

    osc.onended = () => {
      osc.disconnect();
    };
  }

  async function startVideoChat(screen_or_camera: string | null = null){
    let videoStream
    try {
      if(screen_or_camera == "screen"){
        setCameraOrScreen("screen")
        videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });  
      } else if(screen_or_camera == "camera" || screen_or_camera == null){
        setCameraOrScreen("camera")
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });  
      } else {
        setCameraOrScreen(null)
        popup("Wrong video input")
        return
      }
    } catch (error) {
      popup("L'accès à la caméra a été refusé")
      return
    }
    const videoTrack = videoStream.getVideoTracks()[0];
    if(!peerConnectionRef.current || !localStreamRef.current){
      popup("Something went wrong when starting video sharing")
      return
    }
    setVideoStatus(true)
    videoSenderRef.current = peerConnectionRef.current.addTrack(videoTrack, localStreamRef.current);
    localStreamRef.current.addTrack(videoTrack);

    const videoElem = document.getElementById('localVideo') as HTMLVideoElement
    if (videoElem) {
      videoElem.srcObject = localStreamRef.current;
      videoElem.muted = true;
      videoElem.autoplay = true;
      videoElem.playsInline = true;
    }
  }

  async function stopVideoChat(){
    if(!videoSenderRef.current){
      return
    }
    if(!peerConnectionRef.current || !videoSenderRef.current || !localStreamRef.current){
      popup("Something went wrong when stopping video")
      return
    }
    setCameraOrScreen(null)
    setVideoStatus(false)
    peerConnectionRef.current.removeTrack(videoSenderRef.current);
    videoSenderRef.current = null;

    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach(track => {
      track.stop();
      localStreamRef.current && localStreamRef.current.removeTrack(track);
    });

    const videoElem = document.getElementById('localVideo') as HTMLVideoElement;
    if (videoElem) {
      videoElem.srcObject = null;
    }
  }

  const startVoiceChat = async () => {
    if(!wsRef || !wsRef.current){
      popup("Impossible de se connecter au vocal")
      return;
    }
    if(!me || !me._id){
      popup("Veuillez réessayer dans 5 secondes")
      return
    }
    const data: VocalMsg = {
      type: MsgType.JOIN_VOCAL,
      user_id: me?._id,
    };
    wsRef.current!.send(JSON.stringify(data));

    let stream = localStreamRef.current;
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    peerConnectionRef.current = pc;
    startAutoNegotiation()

    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    const ws = wsRef
    if(!ws || !ws.current){
      popup("Impossible se se connecter")
      return
    }

    pc.onicecandidate = event => {
      if (event.candidate && ws.current) {

      const data: IceCandidateMsg = {
          type: MsgType.CANDIDATE,
          candidate: event.candidate
        };
        ws.current.send(JSON.stringify(data));
      }
    };


    pc.ontrack = event => {
      setVocalStatus("Connecté");
      // Affichage audio
      const audio = document.getElementById("remoteAudio") as HTMLAudioElement;
      if(!audio){
        popup("Problème d'audio")
        return
      }
      if (audio && event.track.kind === "audio") {
        audio.srcObject = event.streams[0];
        audio.muted = false;
        audio.autoplay = true;
        audio.volume = 1;
        audio.play();
      }

      // Affichage vidéo
      const video = document.getElementById("remoteVideo") as HTMLVideoElement;
      if(!video){
        popup("Problème de video")
        return
      }
      if (video && event.track.kind === "video") {
        const remoteVideo = event.streams[0]
        video.srcObject = remoteVideo;
        video.muted = false;
        video.autoplay = true;
        video.volume = 1;
        video.play();
        remoteVideo.onremovetrack = (e) => {
          if (e.track.kind === "video") {
            if (remoteVideo.getVideoTracks().length === 0) {
              video.srcObject = null;
            }
          }
        };
      }
    };

    setVocalStatus("En attente d'une autre personne");
    generateSound(880)

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
  };

  function leaveVoiceChat() {
    const ws = wsRef.current
    if(!ws){
      popup("Impossible de terminer le chat vocal correctement")
      return
    }
    if(!me || !me._id){
      popup("Erreur, veuillez réessayer dans 5 secondes")
      return
    }
    const data: VocalMsg = {
      type: MsgType.LEAVE_VOCAL,
      user_id: me?._id,
    };
    ws.send(JSON.stringify(data));
    stopVideoChat()
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
    generateSound(220)
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
    if (input && wsRef.current && wsRef.current.readyState === 1 && me && me._id) {
      const data: ChatMsgSend = {
        type: MsgType.MESSAGE,
        content: input,
        user_id: me._id
      }
      wsRef.current.send(JSON.stringify(data));
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
        videoStatus={videoStatus}
        shareScreenType={cameraOrScreen}
        memberRight={thechannelAuth}
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        onStartVoiceChat={startVoiceChat}
        onLeaveVoiceChat={leaveVoiceChat}
        onStartVideoShare={(screen_or_camera: string | null) => startVideoChat(screen_or_camera)}
        onStopVideoShare={stopVideoChat}
        onGenerateInvite={(id: string) => handleGenerateInvite(id)}
        messagesDivRef={messagesEndRef}
      />
      <div className="members">
        <ul>
          {channel && "members" in channel && channel.members.map((mem: User | string) => {
            if (typeof mem === 'string') {
              return <li key={mem}>{mem}</li>;
            } else if(mem) {
              return (
                <li key={mem._id}>
                  <button
                    onClick={() => setSelectedUserId(mem._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: connectedUser?.includes(mem._id) ? "greenyellow" : "red" }}
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