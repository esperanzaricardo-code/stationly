import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string; next?: string }
}) {
  const { token_hash, type, next } = searchParams

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      redirect(next || '/welcome')
    }
  }

  redirect('/login')
}
