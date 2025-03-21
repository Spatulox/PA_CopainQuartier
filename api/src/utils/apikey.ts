import { createParamDecorator } from 'routing-controllers';

export function ApiKey() {
    return createParamDecorator({
      required: true,
      value: action => action.request.headers['apikey']
    });
  }