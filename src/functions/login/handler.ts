import AWS from 'aws-sdk';
import Boom from '@hapi/boom';

import { middyfy } from '../../libs/lambda';
import { Event } from '../../interface/interface';
import validateSchemas from './validateSchema';

const handler = async (event: Event<string>) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const { email, password } = event.body;
  const { user_pool_id, client_id } = process.env;

  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: user_pool_id,
    ClientId: client_id,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  const response = await cognito
    .adminInitiateAuth(params)
    .promise()
    .catch(error => {
      throw Boom.unauthorized(error.message);
    });

  const body = {
    status: 'success',
    message: 'Login successful',
    token: response.AuthenticationResult.IdToken,
  };
  return {
    body,
    statusCode: 200,
  };
};

export const login = middyfy(handler, validateSchemas);
