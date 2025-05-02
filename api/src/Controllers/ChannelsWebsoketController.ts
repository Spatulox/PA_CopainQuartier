import { WebSocketServer, WebSocket, RawData } from 'ws';
import { ChannelTable } from '../DB_Schema/ChannelSchema';
import { getChannelById, saveMessageToChannel } from '../Services/channels/channels';
import { getCurrentUserByToken } from '../Middleware/auth';

// Will store each client connection to know if they already request the WS with the INIT message
// If yes, the client can do everything it wants
// If no, nothing will be accessible
const initAccessMap = new Map<WebSocket, number>();
const INIT_TIMEOUT = 60 * 60 * 1000; // 1h in ms

function createErrorMsg(content: string){
    return JSON.stringify({"err":content})
}

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
    try{
        const msgRaw = JSON.parse(data.toString());
        console.log(`Message reçu pour le channel ${channel_id}:`, msgRaw);

        // check if channel exist
        const channel = await getChannelById(channel_id)
        if(!channel){
            fromClient.send(createErrorMsg("This channel don't exist"))
            return
        }

        if (isINIT(msgRaw)) {
            const msg: INIT = msgRaw;
            initAccessMap.set(fromClient, Date.now());
            const jwt = msg.connection;

            // Get the user with the jwt
            const user = await getCurrentUserByToken(jwt)
            console.log(user)
            if (
                !user ||
                !channel ||
                !Array.isArray(channel.members) ||
                !channel.members.map(id => id.toString()).includes(user._id.toString())
            ) {
                fromClient.send(createErrorMsg("You don't have access to this channel"));
                return;
            }

            if (channel_id && fromClient.readyState === WebSocket.OPEN) {
                fromClient.send(JSON.stringify(channel?.messages));
            }
            return;
        }

        const lastInit = initAccessMap.get(fromClient);
        if (!lastInit || Date.now() - lastInit > INIT_TIMEOUT) {
            const err = "Accès refusé : veuillez vous \"reconnecter\" (INIT message).";
            if (fromClient.readyState === WebSocket.OPEN) {
            fromClient.send(createErrorMsg(err));
            }
            return;
        }

        if (isMSG(msgRaw)) {

            const msg: MSG = msgRaw;
            if(!channel.members.map(id => id.toString()).includes(msg.user_id.toString())){
                fromClient.send(createErrorMsg("You don't have access to it"))
                return
            }

            wss.clients.forEach((client) => {
                if (channel_id && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(msg));
                }
            });

            return await saveMessageToChannel(msg.user_id, channel_id, msg);
        }

        const err ="Unknow Message Type, plz check the input";
        if (fromClient.readyState === WebSocket.OPEN) {
            fromClient.send(createErrorMsg(err));
        }
        console.log("Le message ne correspond à aucun type")
    } catch (e: any){
        fromClient.send(createErrorMsg("Something went wrong"))
        console.log(e)
    }
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
