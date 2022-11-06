import { paths } from './schema';

export type Endpoints = Extract<keyof paths, string>;

export type Methods = 'get' | 'post' | 'delete';

export type ExtractBody<K, M extends Methods> = K extends {
  [key in M]: {
    requestBody: {
      content: { 'application/json': infer T };
    };
  };
}
  ? T
  : never;

export type PostBody<E extends Endpoints> = ExtractBody<paths[E], 'post'>;

export type ExtractResponse<K, M extends Methods> = K extends {
  [key in M]: {
    responses: {
      200: {
        content: {
          'application/json': infer T;
        };
      };
    };
  };
}
  ? T
  : never;

export type ExtractQuery<K, M extends Methods> = K extends {
  [key in M]: {
    parameters: { query: infer T };
  };
}
  ? T
  : never;
