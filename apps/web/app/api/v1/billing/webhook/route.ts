// Placeholder for POST /webhook
export async function POST(request: Request) {
  // TODO: Implement Stripe webhook handler
  return new Response(JSON.stringify({ message: 'Stripe webhook endpoint' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}