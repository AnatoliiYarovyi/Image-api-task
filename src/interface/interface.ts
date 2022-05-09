export interface Event<T> {
  body?: T;
  requestContext?: { authorizer: { claims: { email: T } } };
  pathParameters?: {
    image: T;
  };
}

export interface Request<T> {
  event: {
    rawPath?: T; // post
    resource?: T; // get & delete
    body?: {
      email: T;
      password: T;
    };
  };
  response?: any;
  error?: any;
}
