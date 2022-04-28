import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';

const middlewareEditResponse = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn = async (request): Promise<void> => {
    const { email, password } = request.event.body;
    const schema = Joi.object({
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      }),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
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
      throw error;
    }
  };
  const after: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    const { statusCode, body } = request.response;

    request.response = {
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode,
      body: JSON.stringify(body),
    };
  };

  return { before, after };
};

export const middyfy = handler => {
  return middy(handler)
    .use(middyJsonBodyParser())
    .use(middlewareEditResponse());
};
