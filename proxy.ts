import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() for secure server-side validation
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // 1. Strict Protected Routes Definition
  const isProtectedRoute = ['/cart', '/profile', '/admin'].some(route => path.startsWith(route))

  // 2. Logic: Not logged in & trying to access protected route -> go to login
  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    // CRITICAL: Copy cookies to the new redirect response to prevent SSR loops
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
    })
    return redirectResponse
  }

  // 3. Logic: Logged in & trying to access login page -> go to home
  if (user && path === '/login') {
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    // CRITICAL: Copy cookies to the new redirect response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
    })
    return redirectResponse
  }

  // 4. Otherwise, proceed normally
  return supabaseResponse
}

export const config = {
  matcher: ['/cart', '/profile', '/admin', '/login'],
}
