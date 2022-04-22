import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const handler = async (event: Event) => {
  try {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const dynamodb = new AWS.DynamoDB.DocumentClient();

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

    const resaltDb = await dynamodb
      .get({ TableName: 'ImageTable', Key: { id: email } })
      .promise();

    console.log('resaltDb: ', resaltDb);

    const body = {
      status: 'success',
      message: 'Login successful',
      token: response.AuthenticationResult.IdToken,
      resaltDb,
    };

    return {
      statusCode: 200,
      body,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error,
    };
  }
};

export const login = middyfy(handler);
