export async function GET(request: Request) {
  const testMessage = {
    message: `Hello World! It is ${Date.now()}.`,
  };
  return new Response(JSON.stringify(testMessage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
