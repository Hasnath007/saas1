import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request: Request, env: any) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

    if (request.method === 'POST') {
      const body = await request.json()
      const { data, error } = await supabase.from('leads').insert([body])
      return new Response(JSON.stringify({ data, error }), { status: 200 })
    }

    return new Response("Use POST to send data.", { status: 200 })
  },
}
