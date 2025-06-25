import 'reflect-metadata';
import express from 'express';
import { createExpressServer, RoutingControllersOptions, useExpressServer } from 'routing-controllers';
import { AdminUserController, UserController } from './Controllers/UserController';
import { connectDB } from './DB_Schema/connexion';
import { ErrorHandler } from './Middleware/error-handling';
import { authMiddleware, getCurrentUser } from './Middleware/auth';
import { ActivityController, AdminActivityController } from './Controllers/ActivitiesController';
import { AccountController } from './Controllers/AccountController';
import { AdminChannelsController, ChannelsController } from './Controllers/ChannelsControllers';
import { AdminPublicationsController, PublicationsController } from './Controllers/PublicationsController';
import { AdminTrocController, TrocController } from './Controllers/TrocsController';
import { WebSocketServer } from 'ws';
import http from 'http';
import { channelClients, handleMessage, accessMap, handleUserConnection, connectedClients } from './Controllers/ChannelsWebsoketController';
import { parse } from 'url';
import { AuthController } from './Controllers/AuthController';
import { InviteController } from './Controllers/InviteController';
import { FriendsController } from './Controllers/FriendsController';
import { LangajeController } from './Controllers/LangajeController';

async function main(){
  await connectDB()

  const port = 3000
  const app = express()
  app.use('/img/activity', express.static('img/activity'));
  app.use('/img/publication', express.static('img/publication'));
  app.use('/img/troc', express.static('img/troc'));

  const routingControllerOptions: RoutingControllersOptions = {
    authorizationChecker: authMiddleware,
    currentUserChecker: getCurrentUser,
    middlewares: [ErrorHandler],
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    },
    controllers: [
      AdminTrocController,
      AdminUserController,
      AdminActivityController,
      AdminChannelsController,
      AdminPublicationsController,

      AccountController,
      ActivityController,
      AuthController,
      ChannelsController,
      FriendsController,
      InviteController,
      LangajeController,
      PublicationsController,
      TrocController,
      UserController],
    defaultErrorHandler: false
  }

  useExpressServer(app, routingControllerOptions);
  //const app = createExpressServer(routingControllerOptions);
  const server = http.createServer(app)
  const wss = new WebSocketServer({ server });

  server.listen(port);
  wss.on('connection', async (ws, req) => {
  
    const pathname = parse(req.url || '').pathname;
    if(!pathname){
      return
    }
    const parts = pathname.split('/');
    const channelId = parts[parts.length - 1];

    // Check inside db if channel_id exist
    // CheckChannelExist(channelId)

    // Check si l'utilisateur à le droit d'accéder au channel
    // Récupère les messages du channel
    // Envoie les messages au client
    ws.on('message', (data) => {
      if(channelId == "online"){
        handleUserConnection(wss, ws, data)
      } else {
        handleMessage(wss, ws, data, channelId);
      }
    });

    ws.on('close', () => {
      for (const clients of channelClients.values()) {
        clients.delete(ws);
      }
      accessMap.delete(ws);

      let foundUserId = null;
      for (const [user_id, sockets] of connectedClients.entries()) {
        if (sockets.has(ws)) {
          sockets.delete(ws);
          if (sockets.size === 0) {
            connectedClients.delete(user_id);
          }
          foundUserId = user_id;
          break;
        }
      }
      if (foundUserId) {
        console.log(`Client déconnecté: ${foundUserId}`);
      }
    });

  });
}
main()