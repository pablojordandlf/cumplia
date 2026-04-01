// TODO: conectar al ESP del proyecto (Mailchimp / Resend / Loops / etc.)
// cuando esté disponible la integración.
export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as { email?: string; sector?: string };
  const { email, sector } = body;

  // Basic validation
  if (!email || !email.includes('@') || !sector) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Log for now — replace with ESP call when ready
  console.log({ email, sector, timestamp: new Date().toISOString() });

  return Response.json({ success: true });
}
