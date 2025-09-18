import { NextResponse } from 'next/server';

// Bridge for legacy backend redirect pointing to /api/auth/callback
// Redirects the user to the actual OAuth callback page at /auth/callback
export async function GET(request: Request) {
  const url = new URL('/auth/callback', request.url);
  return NextResponse.redirect(url, { status: 307 });
}

// Optional: reject other methods explicitly (helps avoid 405 confusion)
export const dynamic = 'force-static';

