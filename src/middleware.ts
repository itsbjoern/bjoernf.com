import { defineMiddleware } from "astro:middleware";

// Logs every request that reaches the server (API routes and non-prerendered pages).
export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.isPrerendered) {
    const url = new URL(context.request.url);
    console.log(`[${new Date().toISOString()}] ${context.request.method} ${url.pathname}`);
  }
  return next();
});
