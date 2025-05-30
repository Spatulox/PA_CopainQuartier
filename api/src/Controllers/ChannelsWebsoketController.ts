// --- Dépendances et imports ---
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { getChannelById, saveMessageToChannel } from '../Services/channels/channels';
import { getCurrentUserByToken } from '../Middleware/auth';
import { getUserById } from '../Services/users/usersPublic';
import { ObjectID } from '../DB_Schema/connexion';
import { UserRole, UserTable } from '../DB_Schema/UserSchema';

// --- Stockage des connexions et abonnements ---
export const accessMap = new Map<WebSocket, number>();
export const channelClients = new Map<string, Set<WebSocket>>();
const INIT_TIMEOUT = 60 * 60 * 1000; // 1h

// --- Types de messages ---
type InitMsg = { type: "INIT"; token: string; };
type ChatMsg = { type: "MESSAGE"; content: string; username: string };
type ErrorMsg = { type: "ERROR"; error: string; };
type HistoryMsg = { type: "HISTORY"; messages: any[]; };
type ServerMsg = ErrorMsg | HistoryMsg | ChatMsg

// --- Utilitaires ---
function send(ws: WebSocket, msg: ServerMsg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
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
    if (!channel) return send(ws, { type: "ERROR", error: "Channel inexistant" });

    // --- INIT ---
    if (msg.type === "INIT") {
      const user = await getCurrentUserByToken(msg.token);
      if (
        !user ||
        (!channel.members.map((m: any) => m._id.toString()).includes(user._id.toString()) && user.role !== UserRole.admin)
      ) {
        return send(ws, { type: "ERROR", error: "Accès refusé à ce channel" });
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
        username: userMap.get(m.author?._id.toString()) || "Inconnu"
      }));
      send(ws, { type: "HISTORY", messages });
      return;
    }

    // --- Vérification d'accès ---
    const lastInit = accessMap.get(ws);
    if (!lastInit || Date.now() - lastInit > INIT_TIMEOUT) {
      return send(ws, { type: "ERROR", error: "Session expirée, veuillez vous reconnecter." });
    }

    // --- MESSAGE ---
    if (msg.type === "MESSAGE") {
      const user = await getUserById(new ObjectID(msg.user_id));
      if (
        !user ||
        (!channel.members.map((m: any) => m._id.toString()).includes(msg.user_id.toString()) && user.role !== UserRole.admin)
      ) {
        return send(ws, { type: "ERROR", error: "Accès refusé" });
      }
      // Diffusion
      const clients = channelClients.get(channel_id) || new Set();
      const chatMsg: ServerMsg = { type: "MESSAGE", content: msg.content, username: user.name || "Inconnu" };
      clients.forEach(client => send(client, chatMsg));
      await saveMessageToChannel(user, validChannelId, msg);
      return;
    }

    // --- Type inconnu ---
    send(ws, { type: "ERROR", error: "Type de message inconnu" });
  } catch (e) {
    send(ws, { type: "ERROR", error: "Erreur serveur" });
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