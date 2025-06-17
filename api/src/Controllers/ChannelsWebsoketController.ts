// --- Dépendances et imports ---
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { getChannelById, saveMessageToChannel } from '../Services/channels/channels';
import { getCurrentUserByToken } from '../Middleware/auth';
import { getUserById } from '../Services/users/usersPublic';
import { ObjectID } from '../DB_Schema/connexion';
import { UserRole, UserTable } from '../DB_Schema/UserSchema';
import { Channel, FilledChannel } from '../Models/ChannelModel';

// --- Stockage des connexions et abonnements ---
export const accessMap = new Map<WebSocket, number>();
export const channelClients = new Map<string, Set<WebSocket>>(); // We use a set of Websocket, in case of the user open more than one tab
//export const connectedClients = new Map<WebSocket, number>();
export const connectedClients = new Map<string, Set<WebSocket>>(); // We use a set of Websocket, in case of the user open more than one tab
const INIT_TIMEOUT = 60 * 60 * 1000; // 1h

// --- Types de messages ---
enum MsgType {
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
}
type InitMsg = { type: MsgType.INIT; token: string; };
type ChatMsg = { type: MsgType.MESSAGE; content: string; user_id: string, username: string, date: Date };
type ErrorMsg = { type: MsgType.ERROR; error: string; };
type HistoryMsg = { type: MsgType.HISTORY; messages: any[]; };
type ConnectedMsg = {type: MsgType.CONNECTED; token: string[]};
type ConnectedChannelMsg = {type: MsgType.CONNECTED_CHANNEL; token_connected_client: string[]};
type InitConnectedMsg = {type: MsgType.INIT_CONNECTION; token: string};
type VocalMsg = { type: MsgType.JOIN_VOCAL | MsgType.LEAVE_VOCAL; token: string; };
type ServerMsg = ErrorMsg | HistoryMsg | ChatMsg | ConnectedMsg | ConnectedChannelMsg

// --- Utilitaires ---
function send(ws: WebSocket, msg: ServerMsg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

async function userCanAccessThisChannel(channel: FilledChannel, msg: InitMsg | VocalMsg | ChatMsg): Promise<boolean>{

  if("content" in msg){
    msg = msg as ChatMsg
    const user = await getUserById(new ObjectID(msg.user_id));
      if (!user || (!channel.members.map((m: any) => m._id.toString()).includes(msg.user_id.toString()) && user.role !== UserRole.admin)) {
        return false
      }
      return true
  } else if("token" in msg) {
    const user = await getCurrentUserByToken(msg.token);
    if (
      !user ||
      (!channel.members.map((m: any) => m._id.toString()).includes(user._id.toString()) && user.role !== UserRole.admin)
    ) {
      return false
    }
    return true
  }
  return false
  
}

function sendWhoIsConnectedBychannel(){
  for (const [channelId, clients] of channelClients.entries()) {
    const connectedUserIds = new Set<string>();
    for (const ws of clients) {
      const userId = (ws as any).userId;
      if (userId) connectedUserIds.add(userId);
    }
    clients.forEach(ws => {
      send(ws, {
        type: MsgType.CONNECTED_CHANNEL,
        token_connected_client: Array.from(connectedUserIds)
      });
    });
  }
}


async function sendWhoIsConnectedByUsersFriends(){
  for (const [userId, wsClient] of connectedClients.entries()) {
    const friends = await getUserById(new ObjectID(userId))
    if(!friends){
      return
    }

    const res = []
    // Key is the friend, value is the channel_id (to discuss), we don't care
    for (const [key, _] of Object.entries(friends.friends)) {
      if(connectedClients.get(key)){
        res.push(key)
      }
    }

    const resToSend: ConnectedMsg = {
      type: MsgType.CONNECTED,
      token: res,
    }
    
    for (const ws of wsClient) { // We use a set of Websocket, in case of the user open more than one tab
      send(ws, resToSend);
    }
  }
}


// --- Handler principal ---
export async function handleMessage(
  wss: WebSocketServer,
  ws: WebSocket,
  data: RawData,
  channel_id: string
) {
  try {
    const msg = JSON.parse(data.toString());
    const validChannelId = new ObjectID(channel_id);
    const channel = await getChannelById(validChannelId);
    if (!channel) return send(ws, { type: MsgType.ERROR, error: "Channel inexistant" });

    // --- INIT ---
    if (msg.type === MsgType.INIT) {
      if(!userCanAccessThisChannel(channel, msg)){
        return send(ws, { type: MsgType.ERROR, error: "Accès refusé à ce channel" });
      }
      // Abonnement
      accessMap.set(ws, Date.now());

      const user = await getCurrentUserByToken(msg.token);
      // Stock the user_id, to send it to the client, to know who is connected or not
      if (user) {
        (ws as any).userId = user._id.toString();
      }
      if (!channelClients.has(channel_id)) channelClients.set(channel_id, new Set());
      channelClients.get(channel_id)!.add(ws);
      
      console.log('Client connecté to channel');
      // Send to other, which perso is connected to the channel
      sendWhoIsConnectedBychannel()
      setInterval(async () => {
        sendWhoIsConnectedBychannel()
      }, 10 * 1000);

      // Envoi de l'historique
      if(channel.messages){
        const authorIds = [...new Set(channel.messages.map((m: any) => m.author?._id?.toString()))];
        const users = await UserTable.find({ _id: { $in: authorIds } }).select('_id name').lean();
        const userMap = new Map(users.map(u => [u._id.toString(), u.name]));
        const messages = channel.messages.map((m: any) => ({
          type: "MESSAGE",
          content: m.content,
          username: userMap.get(m.author?._id.toString()) || "Inconnu",
          date: m.date
        }));
        send(ws, { type: MsgType.HISTORY, messages });
      }
      return
    }

    // --- Vérification d'accès ---
    const lastInit = accessMap.get(ws);
    if (!lastInit || Date.now() - lastInit > INIT_TIMEOUT) {
      return send(ws, { type: MsgType.ERROR, error: "Session expirée, veuillez vous reconnecter." });
    }

    // --- MESSAGE ---
    if (msg.type === MsgType.MESSAGE) {
      const user = await getUserById(new ObjectID(msg.user_id));
      if(!user || !userCanAccessThisChannel(channel, msg)){
        return send(ws, { type: MsgType.ERROR, error: "Accès refusé" });
      }
      // Diffusion
      const clients = channelClients.get(channel_id) || new Set();
      const chatMsg: ServerMsg = { type: MsgType.MESSAGE, content: msg.content, user_id: user?._id, username: user.name, date: new Date() || "Inconnu" };
      clients.forEach(client => send(client, chatMsg));
      await saveMessageToChannel(user, validChannelId, msg);
      return;
    }

    // Vocal Controller
    if (msg.type === MsgType.JOIN_VOCAL) {
      if (!channelClients.has(channel_id + "vocal")) {
        channelClients.set(channel_id + "vocal", new Set());
      }
      channelClients.get(channel_id + "vocal")!.add(ws);
      return;
    }

    if (msg.type === MsgType.LEAVE_VOCAL) {
      if (!channelClients.has(channel_id + "vocal")){
        channelClients.set(channel_id + "vocal", new Set());
      }
      channelClients.get(channel_id + "vocal")!.delete(ws);
      return;
    }

    if (msg.type === MsgType.OFFER || msg.type === MsgType.ANSWER || msg.type === MsgType.CANDIDATE) {
      if (!channelClients.has(channel_id + "vocal")){
        channelClients.set(channel_id + "vocal", new Set())
      };
      const clients = channelClients.get(channel_id + "vocal")
      clients!.forEach(client => {
        if(client != ws){ // Avoid sending audio to the client which sent the audio
          send(client, msg)
        }
      });
      return
    }

    // Rajouter un boucle qui s'execute tous les x temps, pour envoyer à l'utilisateur du channel, qui est connecté et qui ne l'est pas

    // --- Type inconnu ---
    send(ws, { type: MsgType.ERROR, error: `Type de message inconnu : ${msg.type}` });
  } catch (e) {
    send(ws, { type: MsgType.ERROR, error: "Erreur serveur" });
    console.error(e);
  }
}


export async function handleUserConnection(
  wss: WebSocketServer,
  ws: WebSocket,
  data: RawData,
) {
  let msg = JSON.parse(data.toString());
  if(msg.type === MsgType.INIT_CONNECTION) {
    msg = msg as InitConnectedMsg
    // ATTENTION: msg.user_id doit être présent dans le message !
    // Exemple: {type: "INIT_CONNECTION", user_id: "123"}
    const token = msg.token;
    if (!token) {
      send(ws, {type: MsgType.ERROR, error: "token manquant"});
      return;
    }
    const user = await getCurrentUserByToken(token)
    // Stock the user_id, to send it to the client, to know who is connected or not
    if (user) {
      //console.log(user);
      (ws as any).userId = user._id.toString();
    }
    const user_id = user._id.toString()
    console.log("Client Connecté")
    // Ajoute le WebSocket à la Map
    if (!connectedClients.has(user_id)) {
      connectedClients.set(user_id, new Set());
    }
    connectedClients.get(user_id)!.add(ws);

    // Send to other, which perso is connected to the channel
    sendWhoIsConnectedByUsersFriends()
    setInterval(async () => {
      sendWhoIsConnectedByUsersFriends()
    }, 10 * 1000);
    return;
  }
  console.error("err")
  send(ws, {type: MsgType.ERROR, error: "Impossible to appear connected"});
}

// --- Nettoyage périodique ---
setInterval(() => {
  const now = Date.now();
  for (const [ws, t] of accessMap.entries()) {
    if (now - t > INIT_TIMEOUT) {
      accessMap.delete(ws);
      for (const clients of channelClients.values()) clients.delete(ws);
    }
  }
}, 10 * 60 * 1000);