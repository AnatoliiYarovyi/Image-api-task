import Joi from 'joi';

import { Request } from '../functions/interface/interface';

const joiSchema = async (request: Request) => {
  const path = request.event.rawPath || request.event.resource;

  switch (path) {
    case '/signup' || '/login':
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
      try {
        const value = await schema.validateAsync({
          email: email,
          password: password,
        });
        console.log('value: ', value);
        return;
      } catch (error) {
        console.error(error);
      }
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
};

export default joiSchema;
