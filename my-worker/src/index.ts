import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

    // 1. Registration: POST /register
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/register') {
      try {
        const body = await request.json();
        const { name, email, password, region } = body;

        // Check if email already exists in registration table
        const { data: exists } = await supabase
          .from('registration')
          .select('id')
          .eq('email', email)
          .single();

        if (exists) {
          return new Response(
            JSON.stringify({ error: "EMAIL_EXISTS" }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Insert new registration
        const { data, error } = await supabase
          .from('registration')
          .insert([{ name, email, password, region }]);
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: true }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Invalid request", details: err }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Leads: GET/POST
    if (request.method === 'GET') {
      const { data, error } = await supabase.from('leads').select('*');
      const status = error ? 400 : 200;
      return new Response(
        JSON.stringify({ data, error }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const { data, error } = await supabase.from('leads').insert([body]);
        const status = error ? 400 : 201;
        return new Response(
          JSON.stringify({ data, error }),
          { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON or Supabase error', details: err }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      "Use GET/POST /leads or POST /register.",
      { status: 200, headers: corsHeaders }
    );
  }
};
