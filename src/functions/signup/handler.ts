import AWS from 'aws-sdk';
import { v4 } from 'uuid';
import Boom from '@hapi/boom';

import { middyfy } from '../../libs/lambda';
import { Event } from '../../interface/interface';
import validateSchemas from './validateSchema';

const handler = async (event: Event<{ email: string; password: string }>) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const { email, password } = event.body;
  const { user_pool_id } = process.env;

  const params = {
    UserPoolId: user_pool_id,
    Username: email,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ],
    MessageAction: 'SUPPRESS',
  };
  const response = await cognito
    .adminCreateUser(params)
    .promise()
    .catch(error => {
      throw Boom.unauthorized(error.message);
    });

  if (response.User) {
    const paramsForSetPass = {
      Password: password,
      UserPoolId: user_pool_id,
      Username: email,
      Permanent: true,
    };
    await cognito
      .adminSetUserPassword(paramsForSetPass)
      .promise()
      .catch(error => {
        throw Boom.unauthorized(error.message);
      });
  }

  const newUser = {
    id: v4(),
    email: email,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  await dynamodb
    .put({ TableName: 'Users', Item: newUser })
    .promise()
    .catch(error => {
      throw Boom.badImplementation(error.message);
    });

  return {
    status: 'success',
    message: 'User registration successful',
    statusCode: 201,
  };
};

export const signup = middyfy(handler, validateSchemas);
