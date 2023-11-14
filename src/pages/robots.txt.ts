export const GET = async () => {
  return new Response(
    `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
};
