import { defineMiddleware } from "astro:middleware";



export const onRequest = defineMiddleware(async (context, next) => {
  const timestamp = new Date().toISOString();
  const sessionId = context.cookies.get('habits_session')?.value || 'no-session';
  console.log(`[${timestamp}] ${context.request.method} - ${context.request.url} (Session: ${sessionId})`);

  if (context.request.method === 'OPTIONS') {
    let headers = new Headers();
    headers.set('Access-Control-Allow-Origin', 'https://bjoernf.com');
    headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    headers.set('Access-Control-Allow-Credentials', 'true');
    return new Response(null, { headers });
  }

  const response = await next();
  response.headers.set('Access-Control-Allow-Origin', 'https://bjoernf.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
});