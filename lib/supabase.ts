import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    'https://njpxvjjssmsxnwofbimv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getUserRole() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role || 'driver'
}
