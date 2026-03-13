// Placeholder for GET /api/v1/documents/{id}/download
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  // TODO: Implement GET /api/v1/documents/{id}/download - Download with signed URL
  console.log(`Downloading document ${id} with format ${format}`);
  return NextResponse.json({ message: `Download document ${id} endpoint` }, { status: 200 });
}
