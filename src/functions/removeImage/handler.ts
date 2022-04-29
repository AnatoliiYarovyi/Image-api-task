import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

const handler = async (event: Event) => {
  try {
    const s3 = new AWS.S3();
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const email = event.requestContext.authorizer.claims.email;
    const { image } = event.pathParameters;
    const imageLink = `https://s3.amazonaws.com/image.s3.bucket/images/${image}`;

    // remove linkImage(object) from dynamoDB
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

      // remove image(object) from bucket
      const params = {
        Bucket: BUCKET_NAME,
        Key: `images/${image}`,
      };
      await s3
        .deleteObject(params, function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
          } else {
            console.log(data);
          }
        })
        .promise();

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
