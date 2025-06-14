import { Message, MsgType } from "../../../api/chat";
import { ApiClient } from "../../../api/client";

/*enum MsgType {
  INIT = "INIT",
  HISTORY = "HISTORY",
  MESSAGE = "MESSAGE",
  ERROR = "ERROR",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  CANDIDATE = "ICE-CANDIDATE",
  JOIN_VOCAL = "JOIN_VOCAL",
  LEAVE_VOCAL = "LEAVE_VOCAL",
  INIT_CONNECTION = "INIT_CONNECTION", // For the "connected" state (online/offline)
  CONNECTED_CHANNEL = "CONNECTED_CHANNEL",
  CONNECTED = "CONNECTED" // For the "connected" state (online/offline)
}*/

type OfferMsg = {type: MsgType.OFFER, offer: any}
type IceCandidateMsg = {
  type: MsgType.CANDIDATE,
  candidate: {
    candidate: string,
    sdpMLineIndex: number,
    sdpMid: string,
    usernameFragment: string
  }
}
type InitMsg = { type: MsgType.INIT; token: string; };
type ChatMsg = { type: MsgType.MESSAGE; content: string; user_id: string, username: string, date: Date };
type ErrorMsg = { type: MsgType.ERROR; error: string; };
type HistoryMsg = { type: MsgType.HISTORY; messages: Message[]; };
type ConnectedMsg = {type: MsgType.CONNECTED; token: string[]};
type ConnectedChannelMsg = {type: MsgType.CONNECTED_CHANNEL; token_connected_client: string[]};
type InitConnectedMsg = {type: MsgType.INIT_CONNECTION; token: string};
type VocalMsg = { type: MsgType.JOIN_VOCAL | MsgType.LEAVE_VOCAL; token: string; };


type Props = {
    wsUrl: string,
    wsRef: React.RefObject<WebSocket | null>,
    authToken: string | null,
    handlers: {
        onOpen: () => void,
        onClose: () => void,
        onError: () => void,
        onMessage: {
            INIT?: (msg: InitMsg) => void,
            HISTORY?: (msg: HistoryMsg) => void,
            MESSAGE?: (msg: ChatMsg) => void,
            ERROR?: (msg: ErrorMsg) => void,
            OFFER?: (msg: OfferMsg) => void,
            ANSWER?: (msg: any) => void,
            CANDIDATE?: (msg: IceCandidateMsg) => void,
            JOIN_VOCAL?: (msg: VocalMsg) => void,
            LEAVE_VOCAL?: (msg: VocalMsg) => void,
            INIT_CONNECTION?: (msg: InitConnectedMsg) => void,
            CONNECTED?: (msg: ConnectedMsg) => void,
            CONNECTED_CHANNEL?: (msg: ConnectedChannelMsg) => void
        }
    },
    onReconnect?: () => void,
    initialReconnectDelay?: number
    maxReconnectDelay?: number
}

/**
 * Crée une connexion WebSocket avec gestion d’événements et de reconnexion
 * @param {string} wsUrl - URL du serveur WebSocket
 * @param {React.RefObject} wsRef - Référence pour stocker l’instance WebSocket
 * @param {string} authToken - Token d’authentification à envoyer à l’init
 * @param {object} handlers - Gestionnaires d’événements (onOpen, onClose, onError, onMessage)
 * @param {function} onReconnect - Callback appelé lors d’une tentative de reconnexion
 * @param {number} initialReconnectDelay - Délai initial avant reconnexion (ms)
 * @param {number} maxReconnectDelay - Délai maximal avant reconnexion (ms)
 */
export function setupWebSocket({
  wsUrl,
  wsRef,
  authToken,
  handlers,
  onReconnect,
  initialReconnectDelay = 1000,
  maxReconnectDelay = 30000
}: Props) {
  if (!wsUrl || !wsRef) return;

  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
  
  if (!wsUrl.startsWith("/")) {
    wsUrl = `/${wsUrl}`;
  }
  wsUrl = `ws://localhost:3000${wsUrl}`;

  const ws = new window.WebSocket(wsUrl);
  wsRef.current = ws;

  let reconnectDelay = initialReconnectDelay;
  let reconnectTimeout: number;

  const openConnection = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new window.WebSocket(wsUrl);
    wsRef.current = ws;

    const parts = wsUrl.split("/")
    const idOrOnline = parts[parts.length -1]

    ws.onopen = () => {
        reconnectDelay = initialReconnectDelay;
        const client = new ApiClient()
        if(idOrOnline == "online"){
            wsRef.current?.send(JSON.stringify({ type: MsgType.INIT_CONNECTION, token: client.getAuthToken() }));
        } else {
            ws.send(JSON.stringify({ type: MsgType.INIT, token: authToken }));
        }
        handlers.onOpen && handlers.onOpen();
    };

    ws.onclose = () => {
      handlers.onClose && handlers.onClose();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 1.2, maxReconnectDelay);
        openConnection();
        onReconnect && onReconnect()
      }, reconnectDelay);
    };

    ws.onerror = () => {
      handlers.onError && handlers.onError();
      ws.close();
    };

    ws.onmessage = async (event) => {
        if (!handlers.onMessage) return;
        let data = typeof event.data === "string" ? event.data : await event.data.text();
        let msg;
        try { msg = JSON.parse(data); } catch { return; }

        if (msg.type === MsgType.ERROR && handlers.onMessage.ERROR) handlers.onMessage.ERROR(msg);
        if (msg.type === MsgType.INIT && handlers.onMessage.INIT) handlers.onMessage.INIT(msg);
        if (msg.type === MsgType.HISTORY && handlers.onMessage.HISTORY) handlers.onMessage.HISTORY(msg);
        if (msg.type === MsgType.MESSAGE && handlers.onMessage.MESSAGE) handlers.onMessage.MESSAGE(msg)
        if (msg.type === MsgType.OFFER && handlers.onMessage.OFFER) handlers.onMessage.OFFER(msg)
        if (msg.type === MsgType.ANSWER && handlers.onMessage.ANSWER) handlers.onMessage.ANSWER(msg)
        if (msg.type === MsgType.CANDIDATE && handlers.onMessage.CANDIDATE) handlers.onMessage.CANDIDATE(msg)
        if (msg.type === MsgType.JOIN_VOCAL && handlers.onMessage.JOIN_VOCAL) handlers.onMessage.JOIN_VOCAL(msg);
        if (msg.type === MsgType.LEAVE_VOCAL && handlers.onMessage.LEAVE_VOCAL) handlers.onMessage.LEAVE_VOCAL(msg);
        if (msg.type === MsgType.INIT_CONNECTION && handlers.onMessage.INIT_CONNECTION) handlers.onMessage.INIT_CONNECTION(msg);
        if (msg.type === MsgType.CONNECTED_CHANNEL && handlers.onMessage.CONNECTED_CHANNEL) handlers.onMessage.CONNECTED_CHANNEL(msg)
        if (msg.type === MsgType.CONNECTED && handlers.onMessage.CONNECTED) handlers.onMessage.CONNECTED(msg);
    };

  };

  openConnection();
}