import { WebSocketServer, WebSocket, RawData } from 'ws';
import { ChannelTable } from '../DB_Schema/ChannelSchema';
import { getChannelById, saveMessageToChannel } from '../Services/channels/channels';

// Will store each client connection to know if they already request the WS with the INIT message
// If yes, the client can do everything it wants
// If no, nothing will be accessible
const initAccessMap = new Map<WebSocket, number>();
const INIT_TIMEOUT = 60 * 60 * 1000; // 1h in ms


type INIT = {
    connection: string;
};

type MSG = {
    message: string;
    user_id: string;
};

// Type guards
function isINIT(obj: any): obj is INIT {
    return typeof obj === 'object' && obj !== null && 'connection' in obj;
}

function isMSG(obj: any): obj is MSG {
    return typeof obj === 'object' && obj !== null && 'message' in obj && 'user_id' in obj;
}

export async function handleMessage(wss: WebSocketServer, fromClient: WebSocket, data: RawData, channel_id: string) {
    const msgRaw = JSON.parse(data.toString());
    console.log(`Message reçu pour le channel ${channel_id}:`, msgRaw);

    if (isINIT(msgRaw)) {
        const msg: INIT = msgRaw;
        initAccessMap.set(fromClient, Date.now());
        const jwt = msg.connection;
        const channel = await getChannelById(channel_id);
        console.log(channel);
        if (channel_id && fromClient.readyState === WebSocket.OPEN) {
            fromClient.send(JSON.stringify(channel?.messages));
        }
        return;
    }

    const lastInit = initAccessMap.get(fromClient);
    if (!lastInit || Date.now() - lastInit > INIT_TIMEOUT) {
        const err = { err: "Accès refusé : veuillez vous \"reconnecter\" (INIT message)." };
        if (fromClient.readyState === WebSocket.OPEN) {
          fromClient.send(JSON.stringify(err));
        }
        return;
    }

    if (isMSG(msgRaw)) {
        const msg: MSG = msgRaw;
        wss.clients.forEach((client) => {
            if (channel_id && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msg));
            }
        });

        return await saveMessageToChannel(msg.user_id, channel_id, msg);
    }

    const err = {
        err: "Message type inconnu, plz check the input"
    };
    if (fromClient.readyState === WebSocket.OPEN) {
        fromClient.send(JSON.stringify(err));
    }
    console.log("Le message ne correspond à aucun type")
}

setInterval(() => {
    console.log("Cleaning old websocket connection")
    const now = Date.now();
    for (const [ws, timestamp] of initAccessMap.entries()) {
      if (now - timestamp > INIT_TIMEOUT) {
        initAccessMap.delete(ws);
      }
    }
  }, 10 * 60 * 1000);
