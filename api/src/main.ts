import 'reflect-metadata';
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { UserController } from './Controllers/UserController';
import { connectDB } from './DB_Schema/connexion';
import { ErrorHandler } from './Middleware/error-handling';
import { authMiddleware, getCurrentUser } from './Middleware/auth';
import { ActivityController } from './Controllers/ActivitiesController';
import { AccountController } from './Controllers/AccountController';
import { ChannelsController } from './Controllers/ChannelsControllers';
import { PublicationsController } from './Controllers/PublicationsController';
import { TrocController } from './Controllers/TrocsController';
import { WebSocketServer } from 'ws';
import http from 'http';
import { handleMessage } from './Controllers/ChannelsWebsoketController';
import { parse } from 'url';


async function main(){
  await connectDB()

  const port = 3000


  const routingControllerOptions: RoutingControllersOptions = {
    authorizationChecker: authMiddleware,
    currentUserChecker: getCurrentUser,
    middlewares: [ErrorHandler],
    controllers: [AccountController,
      ActivityController,
      ChannelsController,
      PublicationsController,
      TrocController,
      UserController],
    defaultErrorHandler: false
  }

  const app = createExpressServer(routingControllerOptions);
  const server = http.createServer(app)
  const wss = new WebSocketServer({ server });

  server.listen(port);
  wss.on('connection', (ws, req) => {
    console.log('Client connecté');
  
    const pathname = parse(req.url || '').pathname;
    if(!pathname){
      console.log("wtf")
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
      handleMessage(wss, ws, data, channelId);
    });
  
    ws.on('close', () => {
      console.log('Client déconnecté');
    });
  });
}
main()