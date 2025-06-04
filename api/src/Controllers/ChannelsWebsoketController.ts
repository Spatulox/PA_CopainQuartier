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
export const channelClients = new Map<string, Set<WebSocket>>();
const INIT_TIMEOUT = 60 * 60 * 1000; // 1h

// --- Types de messages ---
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
type InitMsg = { type: MsgType.INIT; token: string; };
type ChatMsg = { type: MsgType.MESSAGE; content: string; user_id: string, username: string, date: Date };
type ErrorMsg = { type: MsgType.ERROR; error: string; };
type HistoryMsg = { type: MsgType.HISTORY; messages: any[]; };
type VocalMsg = { type: MsgType.JOIN_VOCAL | MsgType.LEAVE_VOCAL; token: string; };
type ServerMsg = ErrorMsg | HistoryMsg | ChatMsg

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
      if (!channelClients.has(channel_id)) channelClients.set(channel_id, new Set());
      channelClients.get(channel_id)!.add(ws);

      // Envoi de l'historique
      if(!channel.messages){
        return
      }
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
      return;
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
        if (client !== ws){
          client.send(JSON.stringify(msg));
        }
      });
      console.log(msg)
      return
    }

    // --- Type inconnu ---
    send(ws, { type: MsgType.ERROR, error: "Type de message inconnu" });
  } catch (e) {
    send(ws, { type: MsgType.ERROR, error: "Erreur serveur" });
    console.error(e);
  }
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