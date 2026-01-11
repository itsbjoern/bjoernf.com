import { defineMiddleware } from "astro:middleware";



export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  response.headers.set('Access-Control-Allow-Origin', 'https://bjoernf.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  return response;
});