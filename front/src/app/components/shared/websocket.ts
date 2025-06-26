import { Message, MsgType } from "../../../api/chat";
import { ApiClient } from "../../../api/client";
import { config } from "../../../api/utils/config";

export type OfferMsg = {type: MsgType.OFFER, offer: any}
export type AnswerMsg = {type: MsgType.ANSWER, answer: any}
export type IceCandidateMsg = {
  type: MsgType.CANDIDATE,
  candidate: any
}
export type InitMsg = { type: MsgType.INIT; token: string; };
export type ChatMsgRecieve = { type: MsgType.MESSAGE; content: string; user_id: string, image_link: string | null | undefined, username: string, date: Date };
export type ChatMsgSend = { type: MsgType.MESSAGE; content: string; user_id: string };
export type ErrorMsg = { type: MsgType.ERROR; error: string; };
export type HistoryMsg = { type: MsgType.HISTORY; messages: Message[]; };
export type ConnectedMsg = {type: MsgType.CONNECTED; token: string[]};
export type ConnectedChannelMsg = {type: MsgType.CONNECTED_CHANNEL; token_connected_client: string[]};
export type InitConnectedMsg = {type: MsgType.INIT_CONNECTION; token: string};
export type VocalMsg = { type: MsgType.JOIN_VOCAL | MsgType.LEAVE_VOCAL; user_id: string; };


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
            MESSAGE?: (msg: ChatMsgRecieve) => void,
            ERROR?: (msg: ErrorMsg) => void,
            OFFER?: (msg: OfferMsg) => void,
            ANSWER?: (msg: AnswerMsg) => void,
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
 * @param {string} wsUrl - Partial URL du serveur WebSocket (/online or /channel/:id)
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
  
  if (!wsUrl.startsWith("/") && !config.websocketUrl.endsWith("/")) {
    wsUrl = `/${wsUrl}`;
  }
  //config.websocketUrl && wsUrl.startsWith("ws") && (wsUrl = config.websocketUrl + wsUrl);
  wsUrl = `${config.websocketUrl}${wsUrl}` || `ws://localhost:3000${wsUrl}`;

  const ws = new window.WebSocket(wsUrl);
  wsRef.current = ws;

  let reconnectDelay = initialReconnectDelay;
  let reconnectTimeout: NodeJS.Timeout | null = null;

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