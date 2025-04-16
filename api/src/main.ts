import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { UserController } from './Controllers/UserController';
import { connectDB } from './DB_Schema/connexion';
import { ErrorHandler } from './Middleware/error-handling';
import { authMiddleware, getCurrentUser } from './Middleware/auth';


async function main(){
  await connectDB()

  const port = 3000


  const routingControllerOptions: RoutingControllersOptions = {
    authorizationChecker: authMiddleware,
    currentUserChecker: getCurrentUser,
    middlewares: [ErrorHandler],
    controllers: [UserController],
    defaultErrorHandler: false
  }

  const app = createExpressServer(routingControllerOptions);
  app.listen(port);

}
main()