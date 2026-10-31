import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

// Clerk session management for the website. When no publishable key is
// configured (demo mode) the middleware is a pass-through.
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const handler = clerkPublishableKey ? clerkMiddleware() : null;

export default async function middleware(request: NextRequest, ev: unknown) {
  if (handler) return handler(request, ev as never);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
};
