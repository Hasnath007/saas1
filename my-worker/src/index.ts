import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Use "*" for any, or "http://localhost:3000" for local only
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // 1. Handle CORS preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. GET: Return all leads
    if (request.method === 'GET') {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
      const { data, error } = await supabase.from('leads').select('*');
      const status = error ? 400 : 200;
      return new Response(
        JSON.stringify({ data, error }),
        {
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 3. POST: Insert new lead
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
        const { data, error } = await supabase.from('leads').insert([body]);
        const status = error ? 400 : 201;
        return new Response(
          JSON.stringify({ data, error }),
          {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON or Supabase error', details: err }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // 4. All other methods
    return new Response(
      "Use GET to read or POST to send data.",
      { status: 200, headers: corsHeaders }
    );
  }
};
