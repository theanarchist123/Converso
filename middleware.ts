import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
// REMOVED /sign-in and /sign-up from here - they're handled separately
const isPublicRoute = createRouteMatcher([
  '/',
  '/marketing(.*)',
  '/api/webhook(.*)',
  '/admin/login(.*)',
  '/banned(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Allow public routes for everyone
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Allow sign-in and sign-up pages for non-authenticated users
  if (!userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    return NextResponse.next();
  }
  
  // If user is authenticated, check if they're banned
  if (userId) {
    try {
      // Fetch fresh user data from Clerk API to get real-time ban status
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      
      // Check if user is banned (Clerk's native ban or our metadata)
      const isBanned = user.banned || user.publicMetadata?.status === 'banned';
      
      if (isBanned) {
        // If already on banned page, allow it
        if (req.nextUrl.pathname === '/banned') {
          return NextResponse.next();
        }
        
        // Redirect ALL other pages to banned
        console.log(`🚫 Banned user tried to access: ${req.nextUrl.pathname}`);
        return NextResponse.redirect(new URL('/banned', req.url));
      }
      
      // If authenticated user tries to access sign-in/sign-up, redirect to app
      if (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up')) {
        console.log(`✅ Authenticated user redirected from ${req.nextUrl.pathname} to /app`);
        return NextResponse.redirect(new URL('/app', req.url));
      }
    } catch (error) {
      console.error('❌ Error checking user ban status:', error);
      // If error fetching user (might be deleted), clear and redirect to sign-in
      if (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  
  // For protected routes, redirect to sign-in if not authenticated
  if (!userId) {
    console.log(`🔒 Non-authenticated user tried to access: ${req.nextUrl.pathname}`);
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};