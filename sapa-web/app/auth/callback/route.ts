import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { response.cookies.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { response.cookies.set({ name, value: '', ...options }) },
        },
      }
    )
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && session?.user) {
      // Concede 3 créditos grátis se o perfil ainda não existe
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: perfil } = await admin
        .from('perfis')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!perfil) {
        await admin.from('perfis').insert({
          id: session.user.id,
          creditos: 3,
          assinatura_ativa: false,
          criado_em: new Date().toISOString(),
        })
      }
    }
    if (!error) return response
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
