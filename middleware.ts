import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/lib/i18n/routing';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  return await updateSupabaseSession(request, response);
}

export const config = {
  matcher: ['/', '/(ru)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
