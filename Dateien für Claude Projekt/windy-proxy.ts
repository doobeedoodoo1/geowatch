// supabase/functions/windy-proxy/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { apiKey, offset = 0, limit = 50, webcamId } = await req.json();
    if (!apiKey) return new Response(JSON.stringify({ error: "apiKey fehlt" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    // Einzelne Kamera (für Image-Refresh bei abgelaufener URL)
    const url = webcamId
      ? `https://api.windy.com/webcams/api/v3/webcams/${webcamId}?include=location,player,images`
      : `https://api.windy.com/webcams/api/v3/webcams?limit=${limit}&offset=${offset}&status=active&include=location,player,images`;

    const res  = await fetch(url, { headers: { "x-windy-api-key": apiKey } });
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
