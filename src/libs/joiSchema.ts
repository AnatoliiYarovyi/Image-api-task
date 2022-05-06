import Joi from 'joi';

import { Request } from '../functions/interface/interface';

const joiSchema = async (request: Request<string>) => {
  const path = request.event.rawPath || request.event.resource;
  console.log('path: ', path);

  switch (path) {
    case '/signup':
      validateEmailPassword();
      break;

    case '/login':
      validateEmailPassword();
      break;

    case '/getPresignedUrl':
      break;

    case '/getAllImages':
      break;

    case '/removeImage/{image}':
      break;

    default:
      break;
  }

  async function validateEmailPassword() {
    try {
      const { email, password } = request.event.body;
      const schema = Joi.object({
        email: Joi.string()
          .email({
            minDomainSegments: 2,
            tlds: { allow: ['com', 'net'] },
          })
          .required(),
        password: Joi.string()
          .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
          .required(),
      });
      const value = await schema.validateAsync({
        email: email,
        password: password,
      });
      console.log('value: ', value);
    } catch (error) {
      console.log(error);
      // Initialize response
      request.response = request.response ?? {};
      // Add(=error=) to response
      request.response.error = `${error}`;
      // Override an error
      request.error = new Error(`Error joi validate ${error}`);
      // handle the error
      return request.response;
    }
  }
};

export default joiSchema;
