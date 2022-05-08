import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
} from 'aws-lambda';
import { ObjectSchema } from 'joi';

import { Event } from '../interface/interface';

const middlewareJoiValidate = (
  validateSchema: ObjectSchema,
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn = async (request): Promise<void> => {
    const path = request.event.rawPath || request.event.resource;
    try {
      if (path === '/signup' || path === '/login') {
        const { email, password } = request.event.body;
        const value = await validateSchema.validateAsync({
          email,
          password,
        });
        console.log('value: ', value);
      }
      // if (path === '/getPresignedUrl' || path === '/getAllImages') {
      //   const { Authorization } = request.event.headers;
      //   const value = await validateSchema.validateAsync({
      //     accessToken: Authorization,
      //   });
      //   console.log('value: ', value);
      // }
      // if (path === '/removeImage/{image}') {
      //   const { Authorization } = request.event.headers;
      //   const { image } = request.event.pathParameters;
      //   const value = await validateSchema.validateAsync({
      //     accessToken: Authorization,
      //     imageName: image,
      //   });
      //   console.log('value: ', value);
      // }
    } catch (error) {
      console.log(error);
      // Initialize response
      request.response = request.response ?? {};
      // Add (.error) to response
      request.response.error = `${error}`;
      // Override an error
      request.error = new Error(`Error joi validate ${error}`);
      // handle the error
      return request.response;
    }
  };
  return { before };
};

const middlewareEditResponse = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
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
  return { after };
};

export const middyfy = (
  handler: {
    (event: Event<any>);
    (event: any, context: Context, callback: Callback<any>);
  },
  validateSchema: ObjectSchema,
) => {
  return middy(handler)
    .use(middyJsonBodyParser())
    .use(middlewareJoiValidate(validateSchema))
    .use(middlewareEditResponse());
};
