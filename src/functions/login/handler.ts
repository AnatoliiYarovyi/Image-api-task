import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const handler = async (event: Event) => {
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
  const response = await cognito.adminInitiateAuth(params).promise();

  const body = {
    status: 'success',
    message: 'Login successful',
    token: response.AuthenticationResult.IdToken,
  };

  return {
    statusCode: 200,
    body,
  };
};

export const login = middyfy(handler);
