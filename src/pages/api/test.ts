import type { APIRoute } from "astro";


export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  const product = { id, name: "Sample Product", price: 19.99 }; // Replace with actual data fetching logic

  if (!product) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response(JSON.stringify(product), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
