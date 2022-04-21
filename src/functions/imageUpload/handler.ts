import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

const handler = async (event: Event) => {
  try {
    const s3 = new AWS.S3();
    const image = event.body;
    const decodedFile = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );
    const params = {
      Bucket: BUCKET_NAME,
      Key: `images/${new Date().toISOString()}.jpg`,
      Body: decodedFile,
      ContentType: 'image/jpg',
    };

    const uploadResult = await s3.upload(params).promise();

    const body = {
      status: 'success',
      message: `Email ${event.requestContext.authorizer.claims.email} has been authorized`,
      uploadResult,
      image,
    };

    return {
      statusCode: 200,
      body,
    };
  } catch (e) {
    console.error(e);
    const body = {
      status: 'error',
      message: e,
    };

    return {
      statusCode: 400,
      body,
    };
  }
};

export const imageUpload = middyfy(handler);
