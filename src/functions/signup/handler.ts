import AWS from 'aws-sdk';
import { v4 } from 'uuid';

import { middyfy } from '../../libs/lambda';
import { Event } from '../interface/interface';

const handler = async (event: Event<string>) => {
  try {
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
      .catch(e => {
        console.error(e);
        throw e;
      });

    if (response.User) {
      const paramsForSetPass = {
        Password: password,
        UserPoolId: user_pool_id,
        Username: email,
        Permanent: true,
      };
      await cognito.adminSetUserPassword(paramsForSetPass).promise();
    }

    const newUser = {
      id: v4(),
      email: email,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    await dynamodb.put({ TableName: 'Users', Item: newUser }).promise();

    const body = {
      status: 'success',
      message: 'User registration successful',
    };

    return {
      statusCode: 200,
      body,
    };
  } catch (error) {
    console.log('error: ', error);
    return {
      statusCode: 500,
      body: error,
    };
  }
};

export const signup = middyfy(handler);
