export interface Event<T> {
  body?: {
    email: T;
    password: T;
  };
  requestContext?: { authorizer: { claims: { email: T } } };
  pathParameters?: {
    image: T;
  };
}

export interface Request {
  event: {
    rawPath?: string; // post
    resource?: string; // get & delete
    body?: {
      email: string;
      password: string;
    };
  };
}
