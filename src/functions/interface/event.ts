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
