import { ApiClient } from "../../../api/client";

type Props = {
    wsUrl: string,
    wsRef: React.RefObject<WebSocket | null>,
    authToken: string | null,
    handlers: {
        onOpen: () => void,
        onClose: () => void,
        onError: () => void,
        onMessage: (data: any) => void,
    },
    onReconnect?: () => void,
    initialReconnectDelay?: number
    maxReconnectDelay?: number
}

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
  INIT_CONNECTION = "INIT_CONNECTION", // For the "connected" state (online/offline)
  CONNECTED = "CONNECTED" // For the "connected" state (online/offline)
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
      handlers.onMessage(data);
    };
  };

  openConnection();
}