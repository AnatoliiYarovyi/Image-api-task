import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const handler = async (event: Event) => {
  try {
    const cognito = new AWS.CognitoIdentityServiceProvider();

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
    // const response = await cognito.adminCreateUser(params).promise();
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
