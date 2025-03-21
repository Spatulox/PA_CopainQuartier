import { createExpressServer } from 'routing-controllers';
import { UserController } from './src/User/UserController';
import { ApiKeyCheckMiddleware } from './middlewares';
import { mongoose } from './src/connexion';

const app = createExpressServer({
  middlewares: [ApiKeyCheckMiddleware],
  controllers: [UserController],
});

app.listen(3000);

process.on("exit", async () => {
	await mongoose.disconnect();
	console.log("Connexions fermées");
});