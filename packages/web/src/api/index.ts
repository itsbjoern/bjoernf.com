export const apiUrl = import.meta.env.VITE_API_URL;
import { paths } from './schema';
import {
  ExtractBody,
  Endpoints,
  Methods,
  ExtractResponse,
  ExtractQuery,
} from './schemaUtils';

export type AppHeaders = {
  Authorization?: string;
  'user-agent'?: string;
};

export type RequestOptions = {
  returnHeaders?: boolean;
  rawBody?: boolean;
};

export type FetchError = {
  message: string;
  status: number;
};

type Errorable<ResponseData> = ResponseData | { error: FetchError };

export type RequestInfo<E extends Endpoints, M extends Methods> = {
  endpoint: Endpoints;
  method: RequestInit['method'];
  headers?: AppHeaders;
  body?: ExtractBody<paths[E], M> | FormData;
  query?: ExtractQuery<paths[E], M>;
};

export const buildRequest = <
  Endpoint extends Endpoints,
  Method extends Methods,
  RequestBody extends ExtractBody<paths[Endpoint], Method> | FormData,
  QueryParams extends ExtractQuery<paths[Endpoint], Method>
>(
  method: Method,
  endpoint: Endpoint,
  data?: RequestBody,
  headers?: AppHeaders,
  query?: QueryParams
) => {
  const requestData: RequestInfo<Endpoint, Method> = {
    endpoint,
    method,
    headers,
    query,
  };
  if (data) {
    requestData.body = data;
  }

  return requestData;
};

type SuccessFunc<ResponseData> = (data: ResponseData) => void;
type FailFunc = (error: FetchError) => void;

export class APIResponse<ResponseData> extends Promise<
  Errorable<ResponseData>
> {
  successFunc: SuccessFunc<ResponseData> | undefined;
  failFunc: FailFunc | undefined;

  success(func: SuccessFunc<ResponseData>) {
    this.successFunc = func;
    return this.then((data) => {
      if ('error' in data) {
        if (this.failFunc) {
          this.failFunc(data.error);
        }
      } else {
        try {
          if (func) {
            func(data);
          }
        } catch (e) {
          if (this.failFunc) {
            const err = {
              message: 'Internal failure',
              status: -1,
            };
            this.failFunc(err);
          }
        }
      }

      return APIResponse.resolve(data);
    }) as APIResponse<ResponseData>;
  }

  failure(func?: FailFunc) {
    this.failFunc = func;
    return this.then((data) => {
      if ('error' in data) {
        if (func) {
          func(data.error);
        }
      } else {
        if (data && this.successFunc) {
          this.successFunc(data);
        }
      }
      return APIResponse.resolve(data);
    }) as APIResponse<ResponseData>;
  }
}

export const request = <
  Endpoint extends Endpoints,
  Method extends Methods,
  RequestResponse extends ExtractResponse<paths[Endpoint], Method>
>(
  { endpoint, headers, body, method, query }: RequestInfo<Endpoint, Method>,
  options?: RequestOptions
) => {
  const { returnHeaders, rawBody } = options || {};
  const requestInit: RequestInit = {
    headers: new Headers(headers),
    mode: 'cors',
    method,
  };
  if (body) {
    requestInit.body = (rawBody ? body : JSON.stringify(body)) as BodyInit;
  }
  let requestUrl = apiUrl + endpoint;
  if (query) {
    const params = new URLSearchParams(query);
    requestUrl += `?${params.toString()}`;
  }

  const promise: Promise<Errorable<RequestResponse>> = fetch(
    requestUrl,
    requestInit
  )
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject({
          message: response.statusText,
          status: response.status,
        });
      }
      return response
        .json()
        .then((data) => {
          if (returnHeaders) {
            return Promise.resolve({
              json: data,
              headers: Object.fromEntries(response.headers.entries()),
            });
          }
          return Promise.resolve(data);
        })
        .catch((err) => Promise.reject(err));
    })
    .catch((err) => Promise.resolve({ error: err }));

  return new APIResponse<RequestResponse>((resolve) => {
    return promise
      .then((data) => resolve(data))
      .catch((e) => {
        console.log('In-App error\n', e);
      });
  });
};

export const get = <
  E extends Endpoints,
  Q extends ExtractQuery<paths[E], 'get'>
>(
  endpoint: E,
  query?: Q
) => {
  return buildRequest('get', endpoint, undefined, undefined, query);
};

export const post = <
  E extends Endpoints,
  T extends ExtractBody<paths[E], 'post'> | FormData,
  Q extends ExtractQuery<paths[E], 'post'>
>(
  endpoint: E,
  data?: T,
  query?: Q
) => {
  return buildRequest('post', endpoint, data, undefined, query);
};

export const del = <
  E extends Endpoints,
  T extends ExtractBody<paths[E], 'delete'>
>(
  endpoint: E,
  data?: T
) => {
  return buildRequest('delete', endpoint, data);
};
