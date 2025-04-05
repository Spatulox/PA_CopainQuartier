import { createExpressServer } from 'routing-controllers';
import { UserController } from './src/User/UserController';
import { ApiKeyCheckMiddleware } from './middlewares';
import { closeDB, openDB } from './src/connexion';


async function main(){
  await openDB()
  const app = createExpressServer({
    middlewares: [ApiKeyCheckMiddleware],
    controllers: [UserController],
  });
  
  app.listen(3000);
  
  process.on("exit", async () => {
    await closeDB()
    console.log("Connexions fermées");
  });
}

main()