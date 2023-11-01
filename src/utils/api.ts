import type { LoginEndpoint } from "@/pages/api/login";
import type { CreateEndpoint } from "@/pages/api/create";
import type { UploadEndpoint } from "@/pages/api/[post]/upload";
import type { UpdateEndpoint } from "@/pages/api/[post]/update";
import type { PublishEndpoint } from "@/pages/api/[post]/publish";
import type { UnpublishEndpoint } from "@/pages/api/[post]/unpublish";

type RawEndpoints = {
  "/api/login": LoginEndpoint;
  "/api/create": CreateEndpoint;
  [key: `/api/${string}/upload`]: UploadEndpoint;
  [key: `/api/${string}/update`]: UpdateEndpoint;
  [key: `/api/${string}/publish`]: PublishEndpoint;
  [key: `/api/${string}/unpublish`]: UnpublishEndpoint;
};

type Endpoints = {
  [K in keyof RawEndpoints]: {
    requestBody: Awaited<
      ReturnType<Parameters<Awaited<RawEndpoints[K]>>[0]["request"]["json"]>
    >;
    returnData: Awaited<
      ReturnType<Awaited<ReturnType<Awaited<RawEndpoints[K]>>>["json"]>
    >;
  };
};

type RequestResponse<URL extends keyof Endpoints> =
  | {
      success: false;
      error: string;
      json?: undefined;
    }
  | {
      success: true;
      json: Endpoints[URL]["returnData"];
      error?: undefined;
    };

export const request = async <URL extends keyof Endpoints>(
  url: URL,
  body: Endpoints[URL]["requestBody"],
  options: RequestInit = {},
): Promise<RequestResponse<URL>> => {
  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    console.error(response.statusText);
    return { success: false, error: response.statusText };
  }

  try {
    const data = (await response.json()) as Endpoints[URL]["returnData"];
    return { success: true, json: data };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Invalid response" };
  }
};

// export const GET = async <URL extends keyof Endpoints>(url: URL) =>
//   request(url, null, { method: "GET" });

export const POST = async <URL extends keyof Endpoints>(
  url: URL,
  body: Endpoints[URL]["requestBody"],
) => request(url, body, { method: "POST" });

// export const DELETE = async <URL extends keyof Endpoints>(url: URL) =>
//   request(url, null, { method: "DELETE" });
