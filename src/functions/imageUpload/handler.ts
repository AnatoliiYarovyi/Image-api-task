import AWS from 'aws-sdk';
import { v4 } from 'uuid';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

const handler = async (event: Event) => {
  try {
    const s3 = new AWS.S3();
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { image } = event.body;
    const decodedFile = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );
    const params = {
      Bucket: BUCKET_NAME,
      Key: `images/${new Date().toISOString()}.jpeg`,
      Body: decodedFile,
      ContentType: 'image/jpeg',
    };
    const uploadResult = await s3.upload(params).promise();

    const newImage = {
      id: v4(),
      email: event.requestContext.authorizer.claims.email,
      imageLink: uploadResult.Location,
    };
    const putResult = await dynamodb
      .put({ TableName: 'ImageTable', Item: newImage })
      .promise();

    const body = {
      status: 'success',
      message: `Email ${event.requestContext.authorizer.claims.email} has been authorized`,
      uploadResult,
      putResult,
    };

    return {
      statusCode: 200,
      body,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        message: error,
      },
    };
  }
};

export const imageUpload = middyfy(handler);
