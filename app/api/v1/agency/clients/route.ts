// Placeholder for POST/GET /api/v1/agency/clients
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // TODO: Implement POST /api/v1/agency/clients - Create client (requires agency plan)
  const body = await request.json();
  console.log('Creating client:', body);
  return NextResponse.json({ message: 'Create client endpoint' }, { status: 200 });
}

export async function GET(request: Request) {
  // TODO: Implement GET /api/v1/agency/clients - List clients with compliance_summary
  return NextResponse.json({ message: 'List clients endpoint' }, { status: 200 });
}
