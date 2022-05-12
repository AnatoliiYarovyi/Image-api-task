export interface Event<T> {
  body?: T;
  requestContext?: { authorizer: { claims: { email: T } } };
  pathParameters?: {
    image: T;
  };
}

export interface Request<T> {
  event: {
    rawPath?: T; // post - path
    resource?: T; // get & delete - path
    body?: {
      email: T;
      password: T;
    };
  };
  response?: any;
  error?: any;
}
