import AWS from 'aws-sdk';

import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

const handler = async (event: Event) => {
  try {
    const s3 = new AWS.S3();
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const email = event.requestContext.authorizer.claims.email;

    // //  --> old version save images in S3 <--
    //
    // const { image } = event.body;
    // const decodedFile = Buffer.from(
    //   image.replace(/^data:image\/\w+;base64,/, ''),
    //   'base64',
    // );
    // const params = {
    //   Bucket: BUCKET_NAME,
    //   Key: `images/${new Date().toISOString()}.jpeg`,
    //   Body: decodedFile,
    //   ContentType: 'image/jpeg',
    // };
    // const uploadResult = await s3.upload(params).promise();
    // const imageS3Link = uploadResult.Location;
    // ================================================================
    const params = {
      Bucket: BUCKET_NAME,
      Fields: {
        key: `images/${new Date().toISOString()}.jpeg`,
        acl: 'public-read',
      },
      Conditions: [
        ['content-length-range', 0, 10000000], // content length restrictions: 0-10MB
        ['starts-with', '$key', 'images/'],
        ['starts-with', '$Content-Type', 'image/'], // content type restriction
        { acl: 'public-read' },
      ],
    };

    const s3Data = {
      data: {},
    };
    s3.createPresignedPost(params, function (err, data) {
      if (err) {
        console.error('Presigning post data encountered an error', err);
      } else {
        console.log('The post data is', data);
        s3Data.data = data;
        return;
      }
    });
    const imageS3Link = `https://s3.amazonaws.com/image.s3.bucket/${params.Fields.key}`;
    // ================================================================

    const resaltDb = await dynamodb
      .get({ TableName: 'ImageTable', Key: { id: email } })
      .promise();
    if (resaltDb.Item === undefined) {
      const newImage = {
        id: email,
        imageLink: [imageS3Link],
      };
      await dynamodb.put({ TableName: 'ImageTable', Item: newImage }).promise();
    } else {
      const imageLinkArr: string[] = resaltDb.Item.imageLink;
      const newImage = {
        id: email,
        imageLink: imageLinkArr.concat(imageS3Link),
      };
      await dynamodb.put({ TableName: 'ImageTable', Item: newImage }).promise();
    }

    const body = {
      status: 'success',
      message: `Email ${email} has been authorized`,
      s3Data: s3Data.data,
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

export const getPresignedUrl = middyfy(handler);
