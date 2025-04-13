import { ExpressMiddlewareInterface } from 'routing-controllers';

export class ApiKeyCheckMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any): any {
    const apiKey = request.headers['api-key'];
    const exceptions = ["/home"];
    const currentPath = request.path;

    if (!apiKey && !exceptions.includes(currentPath)) {
      response.status(401).send('API Key is missing');
    } else {
      next(); // Si on ne met next() pas ca reste bloqué içi
    }
  }
}
