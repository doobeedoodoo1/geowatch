import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WINDY_BASE = "https://api.windy.com/webcams/api/v3/webcams";
const INCLUDE    = "location,images";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { apiKey, offset, limit, webcamId } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "apiKey fehlt." }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let url: string;

    if (webcamId) {
      // Einzelne Kamera für Bild-Refresh
      url = `${WINDY_BASE}/${webcamId}?include=${INCLUDE}`;
    } else {
      // Webcam-Liste mit Paginierung
      const lim = limit ?? 50;
      const off = offset ?? 0;
      url = `${WINDY_BASE}?limit=${lim}&offset=${off}&include=${INCLUDE}`;
    }

    const resp = await fetch(url, {
      headers: { "x-windy-api-key": apiKey },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(
        JSON.stringify({ error: `Windy API Fehler ${resp.status}: ${text}` }),
        { status: resp.status, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
