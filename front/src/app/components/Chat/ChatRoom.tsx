import React from "react";
import { Channel, Message } from "../../../api/chat";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { ApiClient } from "../../../api/client";
import './Chat.css';

export enum ChannelRight {
  read_send = "read_send",
  read_only = "read_only"
}

type Props = {
  id: string;
  chat: Channel;
  status: string;
  statusColor: string;
  vocalStatusColor: string;
  vocalStatus: string;
  videoStatus: boolean;
  shareScreenType: "camera" | "screen" | null;
  memberRight: ChannelRight;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onStartVoiceChat: () => void;
  onLeaveVoiceChat: () => void;
  onStartVideoShare: (screen_or_camera: string | null) => void;
  onStopVideoShare: () => void;
  onGenerateInvite: (id: string) => void;
  messagesDivRef: React.RefObject<HTMLDivElement | null>;
};

const ChatRoom: React.FC<Props> = ({
                                     chat,
                                     status,
                                     vocalStatus,
                                     statusColor,
                                     vocalStatusColor,
                                     videoStatus,
                                     shareScreenType,
                                     memberRight,
                                     messages,
                                     input,
                                     setInput,
                                     handleSubmit,
                                     onStartVoiceChat,
                                     onLeaveVoiceChat,
                                     onStartVideoShare,
                                     onStopVideoShare,
                                     onGenerateInvite,
                                     messagesDivRef
                                   }) => {
  const navigate = useNavigate();
  const baseUrl = new ApiClient().baseURL;

  return (
      <div className="one-channel">
        <div>
          <h2>{chat.name}</h2>
          <div id="chat-info">
            <ul>
              <li className="none">Chat ID : {chat._id}</li>
              <li className="none">Admin : {chat.admin?.email}</li>
              {chat.activity && (
                  <li>
                    Activité liée : {chat.activity?.title} <button onClick={() => navigate(`${Route.activity}/${chat.activity._id}`)}>Voir l'activité</button>
                  </li>
              )}
              <li className="none">Type : {chat.type}</li>
              <li>Créé le : {new Date(chat.created_at).toDateString()}</li>
              <li className="none">Droits : {chat.member_auth}</li>
            </ul>
            <p className="chat-description">{chat.description}</p>
          </div>
          <button onClick={() => onGenerateInvite(chat._id)}>Générer une invitation</button>
        </div>

        <div className="none" id="status" style={{ color: statusColor, marginBottom: 8 }}>
          Chat : {status}
        </div>

        <div className="call-info-div">
          <ul>
            <li className="none" style={{ color: vocalStatusColor, marginBottom: 8 }}>
              Vocal : {vocalStatus}
            </li>
          </ul>

          {vocalStatus !== "Déconnecté" ? (
              <button onClick={onLeaveVoiceChat}>Quitter l'appel vocal</button>
          ) : (
              <button onClick={onStartVoiceChat}>Démarrer un appel vocal</button>
          )}

          {vocalStatus !== "Déconnecté" && (
              <>
                {shareScreenType === "camera" && videoStatus && (
                    <button onClick={onStopVideoShare}>Arrêter le partage vidéo</button>
                )}
                {shareScreenType === "screen" && videoStatus && (
                    <button onClick={onStopVideoShare}>Arrêter le partage d'écran</button>
                )}
                {!videoStatus && (
                    <>
                      <button onClick={() => onStartVideoShare("camera")}>Démarrer un partage vidéo</button>
                      <button onClick={() => onStartVideoShare("screen")}>Démarrer un partage d'écran</button>
                    </>
                )}
              </>
          )}
        </div>

        <div className="media">
          <audio id="remoteAudio" hidden></audio>
          <video id="localVideo" autoPlay muted playsInline></video>
          <video id="remoteVideo" autoPlay playsInline></video>
        </div>

        <div
            ref={messagesDivRef}
            id="messages"
            style={{
              border: "1px solid #ccc",
              height: 300,
              overflowY: "auto",
              marginBottom: 8,
              padding: 8,
            }}
        >
          {messages.map((msg, idx) => {
            const url = extractUrl(msg.content);
            return (
                <div key={idx}>
                  <div>
                    {msg.image_link && (
                        <img src={`${baseUrl}/${msg.image_link}`} alt="" />
                    )}
                    <span className="message-user">{msg.username}</span> :
                    <span className="message-date">{new Date(msg.date).toLocaleString()}</span>
                  </div>
                  <div>
                    <p>{msg.content}</p>
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8 }}>
                          <img
                              src={`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`}
                              alt="Aperçu du site"
                              style={{ border: '1px solid #ccc', borderRadius: 8, maxWidth: 400 }}
                          />
                          <div style={{ fontSize: 12, color: "#888" }}>{url}</div>
                        </a>
                    )}
                  </div>
                </div>
            );
          })}
        </div>

        {memberRight === ChannelRight.read_send && (
            <form id="formulaire" className="formulaire" onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
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
};

export default ChatRoom;

function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  return urls ? urls[0] : null;
}
