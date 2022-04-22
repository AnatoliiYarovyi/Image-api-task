import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

const handler = async (event: Event) => {
  try {
    const s3 = new AWS.S3();
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const email = event.requestContext.authorizer.claims.email;

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
    const imageLink = uploadResult.Location;

    const resaltDb = await dynamodb
      .get({ TableName: 'ImageTable', Key: { id: email } })
      .promise();
    if (resaltDb.Item === undefined) {
      const newImage = {
        id: email,
        imageLink: [imageLink],
      };
      await dynamodb.put({ TableName: 'ImageTable', Item: newImage }).promise();
    } else {
      const imageLinkArr = resaltDb.Item.imageLink;
      const newImage = {
        id: email,
        imageLink: imageLinkArr.concat(imageLink),
      };
      await dynamodb.put({ TableName: 'ImageTable', Item: newImage }).promise();
    }

    const body = {
      status: 'success',
      message: `Email ${email} has been authorized`,
      uploadResult,
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
