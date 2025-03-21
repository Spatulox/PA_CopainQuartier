import { createExpressServer } from 'routing-controllers';
import { UserController } from './src/User/UserController';
import { ApiKeyCheckMiddleware } from './middlewares';

const app = createExpressServer({
  middlewares: [ApiKeyCheckMiddleware],
  controllers: [UserController],
});

app.listen(3000);