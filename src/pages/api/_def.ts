import { ensureAuth } from "@/utils/auth";
import type { APIRoute } from "astro";

export class APIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type TypedResponse<T> = Response & {
  json(): Promise<T>;
};

type APIRouteParams = Parameters<APIRoute>;
type Context = APIRouteParams[0];
type FuncParams<RequestBody> = {
  params: Context["params"];
  cookies: Context["cookies"];
  request: Omit<Context["request"], "json" | "formData"> & {
    json: () => Promise<RequestBody>;
    formData: () => Promise<RequestBody>;
  };
};

export const Endpoint =
  <RequestBody, ReturnData>(
    func: (funcParams: FuncParams<RequestBody>) => Promise<ReturnData>,
  ) =>
  async (funcParams: FuncParams<RequestBody>) => {
    try {
      const response = await func(funcParams);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }) as TypedResponse<ReturnData>;
    } catch (error) {
      console.log(error);
      if (error instanceof APIError) {
        return new Response(null, {
          status: error.status,
          statusText: error.message,
        }) as TypedResponse<ReturnData>;
      }
    }
    return new Response(null, {
      status: 500,
    }) as TypedResponse<ReturnData>;
  };

export const SecureEndpoint =
  <RequestBody, ReturnData>(
    func: (funcParams: FuncParams<RequestBody>) => Promise<ReturnData>,
  ) =>
  async (params: FuncParams<RequestBody>) => {
    try {
      await ensureAuth(params.cookies.get("token")?.value);
    } catch {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      }) as TypedResponse<ReturnData>;
    }

    return Endpoint(func)(params);
  };
