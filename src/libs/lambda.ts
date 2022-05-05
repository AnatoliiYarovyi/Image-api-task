import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import Joi from 'joi';

import joiSchema from './joiSchema';

const middlewareJoiValidate = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn = async (request): Promise<void> => {
    joiSchema(request);
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

export const middyfy = handler => {
  return middy(handler)
    .use(middyJsonBodyParser())
    .use(middlewareJoiValidate())
    .use(middlewareEditResponse());
};
