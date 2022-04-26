import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const handler = async (event: Event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const email = event.requestContext.authorizer.claims.email;
    const { image } = event.pathParameters;
    const imageLink = `https://s3.amazonaws.com/image.s3.bucket/images/${image}`;
    console.log('image: ', image);
    console.log('event.pathParameters: ', event.pathParameters);

    const resaltDb = await dynamodb
      .get({ TableName: 'ImageTable', Key: { id: email } })
      .promise();

    if (
      resaltDb.Item === undefined ||
      resaltDb.Item.imageLink.includes(imageLink) === false
    ) {
      return {
        statusCode: 200,
        body: {
          message: 'Image not found',
        },
      };
    } else {
      const imageLinkArr: string[] = resaltDb.Item.imageLink;
      const newImage = {
        id: email,
        imageLink: imageLinkArr.filter(image => image !== imageLink),
      };
      await dynamodb.put({ TableName: 'ImageTable', Item: newImage }).promise();

      const body = {
        status: 'success',
        message: 'Get all images successful',
        imageLink: newImage.imageLink,
      };

      return {
        statusCode: 200,
        body,
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: error,
    };
  }
};

export const removeImage = middyfy(handler);
