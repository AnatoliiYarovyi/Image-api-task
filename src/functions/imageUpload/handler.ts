import { middyfy } from '../../libs/lambda';
import { Event } from './interface';

const handler = async (event: Event) => {
  const image = event.body;

  const body = {
    status: 'success',
    message: `Email ${event.requestContext.authorizer.claims.email} has been authorized`,
  };

  return {
    statusCode: 200,
    body,
  };
};

export const imageUpload = middyfy(handler);
