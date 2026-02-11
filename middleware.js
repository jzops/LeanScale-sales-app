import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for customer routing
 *
 * Supports multiple routing patterns (in priority order):
 * 1. Subdomain: customer.clients.leanscale.team/page
 * 2. Path-based: clients.leanscale.team/c/customer/page
 * 3. Query param: localhost:3000/page?customer=slug (development)
 *
 * Injects customer slug into request via header and cookie for downstream access
 */
export async function middleware(request) {
  const { hostname, pathname, searchParams } = request.nextUrl;

  // Check for path-based routing: /c/customer-slug/rest-of-path
  const pathMatch = pathname.match(/^\/c\/([a-z0-9-]+)(\/.*)?$/i);

  if (pathMatch) {
    // Path-based routing detected - rewrite URL and set customer context
    const customerSlug = pathMatch[1].toLowerCase();
    const remainingPath = pathMatch[2] || '/';

    // Rewrite the URL to remove /c/customer-slug prefix
    const url = request.nextUrl.clone();
    url.pathname = remainingPath;

    // Set slug on request headers so getServerSideProps can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-customer-slug', customerSlug);

    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });

    // Set cookie for client-side access
    response.cookies.set('customer-slug', customerSlug, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  }

  // Extract customer slug from subdomain or query param
  let customerSlug = extractCustomerSlug(hostname, searchParams);

  if (!customerSlug) {
    // No customer context on this route — clear any persistent cookie
    // from a previous /c/{slug}/ visit to prevent cross-contamination.
    // We delete first to ensure the maxAge:86400 cookie is removed,
    // then set a fresh session-scoped 'demo' cookie.
    customerSlug = 'demo';
  }

  // Set slug on request headers so getServerSideProps can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-customer-slug', customerSlug);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Clear persistent cookie if falling back to demo
  if (customerSlug === 'demo') {
    response.cookies.delete('customer-slug');
  }

  // Set cookie for client-side access
  // Using session cookie (no maxAge) for non-path-based routing
  // so visiting the main site always shows demo branding
  response.cookies.set('customer-slug', customerSlug, {
    httpOnly: false, // Allow JS access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // No maxAge = session cookie (cleared when browser closes)
    // This prevents /c/formance from persisting to main site
  });

  return response;
}

/**
 * Extract customer slug from hostname or query parameters
 *
 * Supports:
 * - parafimy.clients.leanscale.team → "parafimy" (subdomain)
 * - localhost:3000?customer=parafimy → "parafimy" (development)
 */
function extractCustomerSlug(hostname, searchParams) {
  // Development: Check for ?customer=slug query parameter first
  const queryCustomer = searchParams.get('customer');
  if (queryCustomer) {
    return queryCustomer.toLowerCase();
  }

  // Handle localhost/development environments
  if (
    hostname === 'localhost' ||
    hostname.startsWith('127.0.0.1') ||
    hostname.includes('replit')
  ) {
    return null; // Will default to demo
  }

  // Production: Extract subdomain from hostname
  // e.g., "parafimy.clients.leanscale.team" → "parafimy"
  const parts = hostname.split('.');

  // Check for clients.leanscale.team pattern (4 parts)
  // parafimy.clients.leanscale.team → ["parafimy", "clients", "leanscale", "team"]
  if (parts.length === 4 && parts[1] === 'clients') {
    const subdomain = parts[0].toLowerCase();

    // Validate subdomain format (alphanumeric and hyphens only)
    if (/^[a-z0-9-]+$/i.test(subdomain)) {
      return subdomain;
    }
  }

  // For Netlify preview deploys (deploy-preview-123--site.netlify.app)
  // or branch deploys, default to demo
  if (hostname.includes('netlify')) {
    return null;
  }

  // For Vercel preview deploys
  if (hostname.includes('vercel')) {
    return null;
  }

  // No customer subdomain detected
  return null;
}

/**
 * Middleware matcher configuration
 * Run on all routes except API, static files, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/* (API routes - CustomerContext passes slug via query param)
     * - /_next/* (Next.js internals)
     * - Static files (images, favicon, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
