import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase     = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const ROUND_TIME  = 30;
const MAX_SCORE   = 1000;
const CACHE_TTL   = 10 * 60 * 1000; // 10 min — passt zur Windy Image-URL-Laufzeit (15 min)

// ── UTILS ─────────────────────────────────────────────────────────────────────
const flag = (code) => {
  if (!code || code.length < 2) return "🌍";
  try { return String.fromCodePoint(0x1F1E6 + code.toUpperCase().charCodeAt(0) - 65, 0x1F1E6 + code.toUpperCase().charCodeAt(1) - 65); }
  catch { return "🌍"; }
};
const shuffle   = (a) => [...a].sort(() => Math.random() - 0.5);
const genCode   = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const calcScore = (t) => Math.round(MAX_SCORE * 0.5 + MAX_SCORE * 0.5 * (t / ROUND_TIME));

const getOptions = (correct, pool) =>
  shuffle([correct.city, ...pool.filter(c => c.city !== correct.city).sort(() => Math.random() - 0.5).slice(0, 2).map(c => c.city)]);

const buildSeq = (pool, rounds) =>
  shuffle([...Array(pool.length).keys()]).slice(0, Math.min(rounds, pool.length));

// ── LOCAL STORAGE ─────────────────────────────────────────────────────────────
const ls = {
  get: (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── SUPABASE DB ───────────────────────────────────────────────────────────────
const db = {
  async loadLB()       { if (!supabase) return []; const { data } = await supabase.from("leaderboard").select("name,score,date").order("score", { ascending: false }).limit(20); return data || []; },
  async addScore(e)    { if (supabase) await supabase.from("leaderboard").insert([e]); },
  async loadDuel(code) { if (!supabase) return null; const { data } = await supabase.from("duels").select("*").eq("code", code).maybeSingle(); return data; },
  async saveDuel(code, payload) { if (supabase) await supabase.from("duels").upsert([{ code, ...payload }]); },
};

// ── WINDY API via Edge Function ───────────────────────────────────────────────
const callProxy = async (body) => {
  if (!supabase) throw new Error("Supabase nicht verbunden.");
  const { data, error } = await supabase.functions.invoke("windy-proxy", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
};

const PLAYER_URL = (id) => `https://webcams.windy.com/webcams/public/embed/player/${id}`;

const mapCam = (w) => ({
  id:          String(w.webcamId),
  city:        w.location?.city,
  country:     w.location?.country || w.location?.country_code,
  countryCode: w.location?.country_code,
  flag:        flag(w.location?.country_code),
  // Live-Embed bevorzugen, sonst Timelapse, sonst Standard-Player-URL
  embedUrl:    w.player?.live?.embed || w.player?.day?.embed || PLAYER_URL(w.webcamId),
  isLive:      w.player?.live?.available ?? false,
  // Fallback-Bild falls embed dunkel bleibt
  imageUrl:    w.images?.current?.preview || w.images?.current?.thumbnail || null,
});

const fetchBatch = async (apiKey, offset) => {
  const data = await callProxy({ apiKey, offset, limit: 50 });
  return (data?.webcams || [])
    .filter(w => w.location?.city && w.location?.country_code)
    .map(mapCam)
    .filter(c => c.embedUrl); // muss einen Player haben
};

const loadCams = async (apiKey, onProgress) => {
  const base    = Math.floor(Math.random() * 300);
  const offsets = Array.from({ length: 15 }, (_, i) => base + i * 50);
  let firstErr  = null;
  const results = await Promise.allSettled(
    offsets.map(async (off, i) => {
      const batch = await fetchBatch(apiKey, off);
      onProgress(i + 1, offsets.length);
      return batch;
    })
  );
  const valid = results.filter(r => { if (r.status === "rejected" && !firstErr) firstErr = r.reason; return r.status === "fulfilled"; });
  const all   = valid.flatMap(r => r.value);
  if (all.length === 0 && firstErr) throw firstErr;
  const seen  = new Set();
  return all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
};

// Frische Bild-URL holen wenn abgelaufen (Windy URLs laufen nach 15 Min. ab)
const refreshImageUrl = async (apiKey, camId) => {
  try {
    const data = await callProxy({ apiKey, webcamId: camId });
    const cam  = data?.webcams?.[0] || data; // v3 gibt evtl. direkt das Objekt zurück
    return cam?.images?.current?.preview || cam?.images?.current?.thumbnail || null;
  } catch { return null; }
};

// ══════════════════════════════════════════════════════════════════════════════
export default function GeoWatch() {
  const [screen,       setScreen]      = useState("boot");
  const [apiInput,     setApiInput]    = useState("");
  const [apiError,     setApiError]    = useState("");
  const [loadProg,     setLoadProg]    = useState([0, 15]);
  const [pool,         setPool]        = useState([]);
  const [username,     setUsername]    = useState("");
  const [rounds,       setRounds]      = useState(5);    // vom Nutzer gewählt
  const [gameRounds,   setGameRounds]  = useState(5);    // aktiv im laufenden Spiel
  const [sequence,     setSequence]    = useState([]);
  const [roundIdx,     setRoundIdx]    = useState(0);
  const [options,      setOptions]     = useState([]);
  const [timeLeft,     setTimeLeft]    = useState(ROUND_TIME);
  const [selected,     setSelected]    = useState(null);
  const [roundScores,  setRoundScores] = useState([]);
  const [camImgUrl,    setCamImgUrl]   = useState(null);
  const [imgLoading,   setImgLoading]  = useState(true);
  const [leaderboard,  setLeaderboard] = useState([]);
  const [lbLoading,    setLbLoading]   = useState(false);
  const [duelCode,     setDuelCode]    = useState("");
  const [joinInput,    setJoinInput]   = useState("");
  const [duelMeta,     setDuelMeta]    = useState(null);
  const [isDuel,       setIsDuel]      = useState(false);
  const [duelResult,   setDuelResult]  = useState(null);
  const [joinError,    setJoinError]   = useState("");
  const timerRef = useRef(null);

  const currentCam  = sequence.length && pool.length ? pool[sequence[roundIdx]] : null;
  const totalScore  = roundScores.reduce((a, b) => a + b, 0);
  const roundCount  = Math.min(gameRounds, pool.length);

  // ── BOOT ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!supabase) { setScreen("setup"); return; }
      const key   = ls.get("geowatch:windykey");
      const cache = ls.get("geowatch:camcache");
      if (cache && Date.now() - cache.fetchedAt < CACHE_TTL && cache.cams?.length > 10) {
        setPool(shuffle(cache.cams));
        setScreen(key ? "home" : "setup");
        return;
      }
      key ? fetchAndCache(key) : setScreen("setup");
    })();
  }, []);

  // ── CAM-BILD laden/refreshen ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentCam) return;
    setImgLoading(true);
    setCamImgUrl(currentCam.imageUrl);
  }, [currentCam?.id]);

  const handleImgError = useCallback(async () => {
    // URL abgelaufen → frisch holen
    const apiKey = ls.get("geowatch:windykey");
    if (!currentCam || !apiKey) { setImgLoading(false); return; }
    const fresh = await refreshImageUrl(apiKey, currentCam.id);
    setCamImgUrl(fresh);
    setImgLoading(false);
  }, [currentCam]);

  // ── FETCH CAMS ───────────────────────────────────────────────────────────
  const fetchAndCache = useCallback(async (key) => {
    setScreen("loading"); setLoadProg([0, 15]); setApiError("");
    try {
      const cams = await loadCams(key, (d, t) => setLoadProg([d, t]));
      if (cams.length < 5) throw new Error("Zu wenige aktive Kameras. Bitte 1–2 Min. warten und nochmal versuchen (neue API-Keys brauchen etwas Zeit).");
      const s = shuffle(cams);
      setPool(s);
      ls.set("geowatch:camcache", { cams: s, fetchedAt: Date.now() });
      setScreen("home");
    } catch (err) {
      setApiError(err.message || "Unbekannter Fehler");
      setScreen("setup");
    }
  }, []);

  const submitKey = useCallback(async () => {
    const key = apiInput.trim();
    if (!key) return;
    ls.set("geowatch:windykey", key);
    fetchAndCache(key);
  }, [apiInput, fetchAndCache]);

  // ── LEADERBOARD ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "leaderboard") return;
    setLbLoading(true);
    db.loadLB().then(lb => { setLeaderboard(lb); setLbLoading(false); });
  }, [screen]);

  // ── TIMER ────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (screen !== "game" || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleAnswer(null); return 0; } return t - 1; });
    }, 1000);
    return stopTimer;
  }, [screen, roundIdx, selected]);

  // ── GAME START ───────────────────────────────────────────────────────────
  const startGame = useCallback((seq = null, meta = null, p = null) => {
    const ap = p ?? pool;
    const r  = meta?.rounds ?? rounds;
    const s  = seq ?? buildSeq(ap, r);
    setGameRounds(r);
    setSequence(s); setRoundIdx(0); setRoundScores([]);
    setOptions(getOptions(ap[s[0]], ap));
    setTimeLeft(ROUND_TIME); setSelected(null);
    setIsDuel(!!meta); setDuelMeta(meta);
    setScreen("game");
  }, [pool, rounds]);

  // ── ANSWER ───────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((city) => {
    stopTimer();
    const earned = city === currentCam?.city ? calcScore(timeLeft) : 0;
    setSelected(city ?? "__timeout__");
    setRoundScores(prev => [...prev, earned]);
  }, [currentCam, timeLeft, stopTimer]);

  // ── NEXT ROUND ───────────────────────────────────────────────────────────
  const nextRound = useCallback(async () => {
    const isLast     = roundIdx + 1 >= roundCount;
    const finalScore = roundScores.reduce((a, b) => a + b, 0);
    if (isLast) {
      if (isDuel && duelMeta) {
        if (!duelMeta.challenger_done) {
          await db.saveDuel(duelCode, { ...duelMeta, challenger_score: finalScore, challenger_name: username, challenger_done: true, status: "waiting" });
          setDuelResult({ role: "challenger", myScore: finalScore, duelCode });
        } else {
          await db.saveDuel(duelMeta.code, { ...duelMeta, opponent_score: finalScore, opponent_name: username, status: "done" });
          setDuelResult({ role: "opponent", myScore: finalScore, opponentScore: duelMeta.challenger_score, opponentName: duelMeta.challenger_name });
        }
        setScreen("duel-result"); return;
      }
      await db.addScore({ name: username, score: finalScore, date: new Date().toLocaleDateString("de-DE") });
      setScreen("gameover");
    } else {
      const next = roundIdx + 1;
      setRoundIdx(next);
      setOptions(getOptions(pool[sequence[next]], pool));
      setTimeLeft(ROUND_TIME); setSelected(null);
    }
  }, [roundIdx, roundCount, roundScores, isDuel, duelMeta, username, duelCode, sequence, pool]);

  // ── DUEL ─────────────────────────────────────────────────────────────────
  const createDuel = useCallback(async () => {
    const code = genCode();
    const seq  = buildSeq(pool, rounds);
    const data = { code, sequence: seq, rounds, challenger_name: username, challenger_score: 0, challenger_done: false, status: "pending", created_at: new Date().toISOString() };
    await db.saveDuel(code, data);
    setDuelCode(code); setDuelMeta(data);
    startGame(seq, { ...data, challenger_done: false });
  }, [username, pool, rounds, startGame]);

  const joinDuel = useCallback(async () => {
    setJoinError("");
    const data = await db.loadDuel(joinInput.toUpperCase());
    if (!data)                  return setJoinError("Code nicht gefunden.");
    if (data.status === "done") return setJoinError("Duell bereits beendet.");
    if (!data.challenger_done)  return setJoinError("Herausforderer spielt noch.");
    startGame(data.sequence, { ...data, code: joinInput.toUpperCase() });
  }, [joinInput, pool, startGame]);

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app:     { minHeight:"100vh", background:"#07080d", color:"#e8e8f0", fontFamily:"'Courier New',Courier,monospace", display:"flex", flexDirection:"column", alignItems:"center" },
    scan:    { position:"fixed", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,0.012) 2px,rgba(0,255,180,0.012) 4px)", pointerEvents:"none", zIndex:9999 },
    hdr:     { width:"100%", maxWidth:900, padding:"20px 24px 0", display:"flex", alignItems:"center", justifyContent:"space-between" },
    logo:    { fontSize:22, fontWeight:900, letterSpacing:"0.15em", color:"#00ffb3", textShadow:"0 0 20px rgba(0,255,179,0.6)" },
    sub:     { fontSize:11, color:"#445566", letterSpacing:"0.2em" },
    card:    { width:"100%", maxWidth:900, padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 },
    inp:     { background:"rgba(0,255,179,0.05)", border:"1px solid rgba(0,255,179,0.3)", borderRadius:4, color:"#e8e8f0", padding:"12px 16px", fontSize:14, fontFamily:"'Courier New',Courier,monospace", outline:"none", width:"100%", boxSizing:"border-box" },
    btn:     (v="p") => ({ padding:"12px 24px", borderRadius:4, border:v==="p"?"none":"1px solid rgba(0,255,179,0.4)", background:v==="p"?"linear-gradient(135deg,#00ffb3,#00c8ff)":"transparent", color:v==="p"?"#07080d":"#00ffb3", fontFamily:"'Courier New',Courier,monospace", fontWeight:900, fontSize:13, letterSpacing:"0.15em", cursor:"pointer" }),
    div:     { height:1, background:"rgba(0,255,179,0.1)" },
    stitle:  { fontSize:11, letterSpacing:"0.25em", color:"#445566", textTransform:"uppercase" },
    pill:    { display:"inline-block", padding:"3px 10px", borderRadius:20, background:"rgba(0,255,179,0.1)", border:"1px solid rgba(0,255,179,0.3)", fontSize:11, color:"#00ffb3" },
    g2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
    score:   { fontSize:36, fontWeight:900, color:"#00ffb3", textShadow:"0 0 30px rgba(0,255,179,0.5)", textAlign:"center" },
    tbBar:   (p) => ({ height:4, background:`linear-gradient(90deg,${p>.5?"#00ffb3":p>.25?"#ffcc00":"#ff4455"} ${p*100}%,#1a1f2e ${p*100}%)`, borderRadius:2, transition:"background 0.3s" }),
    optBtn:  (st) => ({ padding:"14px 20px", borderRadius:4, border:`1px solid ${st==="c"?"#00ffb3":st==="w"?"#ff4455":"rgba(255,255,255,0.1)"}`, background:st==="c"?"rgba(0,255,179,0.15)":st==="w"?"rgba(255,68,85,0.15)":"rgba(255,255,255,0.03)", color:st==="c"?"#00ffb3":st==="w"?"#ff4455":"#e8e8f0", cursor:selected?"default":"pointer", fontSize:14, fontFamily:"'Courier New',Courier,monospace", fontWeight:700, letterSpacing:"0.06em", textAlign:"left", transition:"all 0.15s" }),
    lbRow:   (i) => ({ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:i===0?"rgba(0,255,179,0.08)":"rgba(255,255,255,0.02)", borderRadius:4, border:i===0?"1px solid rgba(0,255,179,0.3)":"1px solid rgba(255,255,255,0.05)" }),
    code:    { fontSize:34, fontWeight:900, letterSpacing:"0.4em", color:"#00ffb3", textShadow:"0 0 30px rgba(0,255,179,0.6)", textAlign:"center", padding:"18px 0" },
    infoBox: { background:"rgba(0,255,179,0.04)", border:"1px solid rgba(0,255,179,0.15)", borderRadius:4, padding:"14px 16px", fontSize:12, color:"#6677aa", lineHeight:2 },
    errBox:  { background:"rgba(255,68,85,0.08)", border:"1px solid rgba(255,68,85,0.3)", borderRadius:4, padding:"12px 16px", fontSize:12, color:"#ff8899", lineHeight:1.8 },
    rndBtn:  (sel) => ({ padding:"12px", borderRadius:4, border:`1px solid ${sel?"#00ffb3":"rgba(255,255,255,0.1)"}`, background:sel?"rgba(0,255,179,0.12)":"rgba(255,255,255,0.02)", color:sel?"#00ffb3":"#6677aa", fontFamily:"'Courier New',Courier,monospace", fontWeight:900, fontSize:13, letterSpacing:"0.1em", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }),
  };

  const optSt = (city) => !selected ? "n" : city === currentCam?.city ? "c" : city === selected ? "w" : "n";

  // ── SCREENS ──────────────────────────────────────────────────────────────

  if (screen === "boot") return (
    <div style={{ ...S.app, justifyContent:"center" }}>
      <div style={S.scan} />
      <div style={S.logo}>GEOWATCH</div>
      <div style={{ fontSize:11, color:"#334455", marginTop:8 }}>INITIALISIERUNG...</div>
    </div>
  );

  if (screen === "setup") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}><div style={S.logo}>GEOWATCH</div></div>
      <div style={S.card}>
        <div style={{ textAlign:"center", padding:"12px 0 4px" }}>
          <div style={{ fontSize:13, color:"#6677aa", lineHeight:1.8 }}>
            Nutzt die <strong style={{color:"#00ffb3"}}>Windy Webcams API</strong> — über <strong style={{color:"#00ffb3"}}>40.000 Kameras</strong> weltweit.
          </div>
        </div>
        <div style={S.div} />
        {!supabase && <div style={S.errBox}><strong style={{color:"#ffaa88"}}>⚠ Supabase nicht verbunden</strong><br/>Verbinde Supabase in Lovable (oben rechts) und lade die Seite neu.</div>}
        <div style={S.stitle}>Schritt 1 — Kostenlosen Windy API-Key holen</div>
        <div style={S.infoBox}>
          1. Öffne <a href="https://api.windy.com/keys" target="_blank" rel="noreferrer" style={{color:"#00ffb3"}}>api.windy.com/keys</a> und registriere dich<br/>
          2. <em>"Add new key"</em> → Typ: <strong>Webcams</strong><br/>
          3. Key kopieren — er braucht ca. 1–2 Min. bis er aktiv ist
        </div>
        <div style={S.stitle}>Schritt 2 — API-Key eintragen</div>
        <input style={S.inp} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={apiInput} onChange={e => setApiInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submitKey()} />
        {apiError && <div style={S.errBox}><strong style={{color:"#ffaa88"}}>⚠ Fehler</strong><br/>{apiError}</div>}
        <button style={{ ...S.btn("p"), opacity:(apiInput.trim()&&supabase)?1:0.4, padding:"14px" }}
          disabled={!apiInput.trim()||!supabase} onClick={submitKey}>▶ KAMERAS LADEN</button>
        {pool.length > 0 && <button style={S.btn("g")} onClick={() => setScreen("home")}>← CACHE NUTZEN ({pool.length} Kameras)</button>}
      </div>
    </div>
  );

  if (screen === "loading") return (
    <div style={{ ...S.app, justifyContent:"center" }}>
      <div style={S.scan} />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:24 }}>
        <div style={S.logo}>GEOWATCH</div>
        <div style={{ fontSize:12, color:"#445566", letterSpacing:"0.2em" }}>KAMERAS WERDEN GELADEN...</div>
        <div style={{ width:280, height:4, background:"#1a1f2e", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(loadProg[0]/loadProg[1])*100}%`, background:"linear-gradient(90deg,#00ffb3,#00c8ff)", borderRadius:2, transition:"width 0.4s" }} />
        </div>
        <div style={{ fontSize:11, color:"#334455" }}>Batch {loadProg[0]} / {loadProg[1]}</div>
      </div>
    </div>
  );

  if (screen === "home") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}>
        <div><div style={S.logo}>GEOWATCH</div><div style={S.sub}>GLOBAL SURVEILLANCE GAME</div></div>
        <button style={S.btn("g")} onClick={() => setScreen("leaderboard")}>◈ RANGLISTE</button>
      </div>
      <div style={S.card}>
        <div style={{ textAlign:"center", padding:"12px 0 4px" }}>
          <div style={{ fontSize:13, color:"#6677aa", lineHeight:1.7 }}>Live-Kameras weltweit · Erkenne die Stadt · 3 Optionen · Schnelligkeit zählt</div>
          <div style={{ marginTop:10, display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <span style={S.pill}>📡 {pool.length} Kameras geladen</span>
          </div>
        </div>

        <div style={S.div} />

        {/* PUNKTESYSTEM */}
        <div style={S.stitle}>Punktesystem</div>
        <div style={{ background:"rgba(0,255,179,0.04)", border:"1px solid rgba(0,255,179,0.12)", borderRadius:4, padding:"14px 16px", fontSize:12, lineHeight:2.1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"0 16px" }}>
            <span style={{ color:"#00ffb3", fontWeight:700 }}>500</span>
            <span style={{ color:"#6677aa" }}>Basispunkte für jede richtige Antwort</span>
            <span style={{ color:"#00ffb3", fontWeight:700 }}>+ 0–500</span>
            <span style={{ color:"#6677aa" }}>Schnelligkeitsbonus — je schneller, desto mehr</span>
            <span style={{ color:"#00ffb3", fontWeight:700 }}>= 1.000</span>
            <span style={{ color:"#6677aa" }}>Maximalpunkte bei sofortiger richtiger Antwort</span>
            <span style={{ color:"#ff4455", fontWeight:700 }}>0</span>
            <span style={{ color:"#6677aa" }}>Punkte bei falscher Antwort oder Zeitablauf</span>
          </div>
        </div>

        <div style={S.div} />

        {/* RUNDENANZAHL */}
        <div style={S.stitle}>Rundenanzahl wählen</div>
        <div style={S.g2}>
          <button style={S.rndBtn(rounds===5)}  onClick={() => setRounds(5)}>
            5 RUNDEN<br/><span style={{ fontSize:10, opacity:0.6 }}>max. 5.000 Pkt.</span>
          </button>
          <button style={S.rndBtn(rounds===10)} onClick={() => setRounds(10)}>
            10 RUNDEN<br/><span style={{ fontSize:10, opacity:0.6 }}>max. 10.000 Pkt.</span>
          </button>
        </div>

        <div style={S.div} />

        {/* USERNAME + START */}
        <div style={S.stitle}>Operative ID</div>
        <input style={S.inp} placeholder="Dein Username..."
          value={username} onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && username.trim() && startGame()} />
        <button style={{ ...S.btn("p"), opacity:username.trim()?1:0.4, padding:"14px", fontSize:15 }}
          disabled={!username.trim()} onClick={() => startGame()}>▶ MISSION STARTEN ({rounds} Runden)</button>

        <div style={S.div} />

        <div style={S.stitle}>Duelle</div>
        <div style={S.g2}>
          <button style={{ ...S.btn("g"), opacity:username.trim()?1:0.4 }} disabled={!username.trim()} onClick={createDuel}>⚔ ERSTELLEN</button>
          <button style={S.btn("g")} onClick={() => setScreen("join-duel")}>↗ BEITRETEN</button>
        </div>
        <button style={{ ...S.btn("g"), fontSize:11, opacity:0.5 }} onClick={() => setScreen("setup")}>⚙ API-KEY / CAMS NEU LADEN</button>
      </div>
    </div>
  );

  if (screen === "join-duel") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}><div style={S.logo}>GEOWATCH</div>
        <button style={S.btn("g")} onClick={() => { setJoinError(""); setScreen("home"); }}>← ZURÜCK</button>
      </div>
      <div style={S.card}>
        <div style={S.stitle}>Duell beitreten</div>
        <div style={S.stitle}>Dein Name</div>
        <input style={S.inp} placeholder="Username..." value={username} onChange={e => setUsername(e.target.value)} />
        <div style={S.stitle}>Duell-Code</div>
        <input style={{ ...S.inp, fontSize:24, letterSpacing:"0.3em", textTransform:"uppercase" }}
          placeholder="XXXXXX" value={joinInput} onChange={e => setJoinInput(e.target.value.toUpperCase())} maxLength={6} />
        {joinError && <div style={S.errBox}>⚠ {joinError}</div>}
        <button style={{ ...S.btn("p"), opacity:(username.trim()&&joinInput.length===6)?1:0.4 }}
          disabled={!username.trim()||joinInput.length!==6} onClick={joinDuel}>⚔ ANNEHMEN</button>
      </div>
    </div>
  );

  if (screen === "game" && currentCam) {
    const pct = timeLeft / ROUND_TIME;
    const ans = selected !== null;
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div><div style={S.logo}>GEOWATCH</div>{isDuel && <span style={S.pill}>⚔ DUELL</span>}</div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#445566" }}>RUNDE</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#00ffb3" }}>{roundIdx+1} / {roundCount}</div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:11, color:"#445566" }}>PUNKTE: <span style={{ color:"#e8e8f0", fontWeight:700 }}>{totalScore}</span></div>
            <div style={{ fontSize:18, fontWeight:900, color:pct>.5?"#00ffb3":pct>.25?"#ffcc00":"#ff4455" }}>{timeLeft}s</div>
          </div>
          <div style={S.tbBar(pct)} />

          {/* ── CAM VIEWER ─────────────────────────────────────────────────────
               Interaction-Blocker entfernt — der war der Grund für das dunkle Bild.
               Overlays sind pointer-events:none (nur visuell, blockieren keine Events im iFrame).
               Top-Overlay versteckt den Kamera-Namen, Bottom-Overlay die Windy-Branding-Leiste. */}
          <div style={{ position:"relative", width:"100%", aspectRatio:"16/9", background:"#0a0c12", borderRadius:6, overflow:"hidden", border:"1px solid rgba(0,255,179,0.2)" }}>

            {/* Top-Overlay: versteckt Kamera-Titel im Windy-Player */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:50, background:"#07080d", zIndex:10, pointerEvents:"none" }} />
            {/* Bottom-Overlay: versteckt Windy-Branding und Standort-Label */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:58, background:"#07080d", zIndex:10, pointerEvents:"none" }} />

            {/* LIVE-Badge */}
            <div style={{ position:"absolute", top:13, left:14, fontSize:10, letterSpacing:"0.18em", color: currentCam.isLive ? "#ff4455" : "#00ffb3", zIndex:20, pointerEvents:"none", background:"rgba(7,8,13,0.75)", padding:"2px 8px", borderRadius:3 }}>
              {currentCam.isLive ? "● LIVE" : "● CAM"} | ID {currentCam.id.slice(-5)}
            </div>

            {/* Live-iFrame — kein Blocker mehr darüber */}
            <iframe
              key={currentCam.id}
              src={currentCam.embedUrl}
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
              allowFullScreen={true}
              title="Live Webcam"
            />

            {/* Fallback-Bild, falls iFrame leer bleibt (seltener Grenzfall) */}
            {!currentCam.embedUrl && currentCam.imageUrl && (
              <img src={currentCam.imageUrl} alt="Webcam" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
            )}
          </div>

          <div style={{ fontSize:11, color:"#445566", letterSpacing:"0.2em" }}>WO BEFINDET SICH DIESE KAMERA?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {options.map(city => {
              const st = optSt(city);
              return (
                <button key={city} style={S.optBtn(st)} onClick={() => !ans && handleAnswer(city)}>
                  {st==="c"?"✓ ":st==="w"?"✗ ":"○ "}{city}
                </button>
              );
            })}
          </div>

          {ans && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ padding:"12px 16px", background:"rgba(0,255,179,0.05)", borderRadius:4, border:"1px solid rgba(0,255,179,0.15)" }}>
                <div style={{ fontSize:11, color:"#445566", marginBottom:4 }}>STANDORT ENTHÜLLT</div>
                <div style={{ fontSize:16, fontWeight:900, color:"#00ffb3" }}>{currentCam.flag} {currentCam.city}, {currentCam.country}</div>
                <div style={{ fontSize:13, color:selected===currentCam.city?"#00ffb3":"#ff4455", marginTop:6 }}>
                  {selected===currentCam.city ? `+${calcScore(timeLeft+1)} Punkte` : "Keine Punkte"}
                </div>
              </div>
              <button style={S.btn("p")} onClick={nextRound}>{roundIdx+1<roundCount?"NÄCHSTE RUNDE →":"ERGEBNIS →"}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "gameover") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}><div style={S.logo}>GEOWATCH</div></div>
      <div style={S.card}>
        <div style={{ textAlign:"center", padding:"12px 0" }}>
          <div style={{ fontSize:11, color:"#445566", letterSpacing:"0.2em", marginBottom:10 }}>MISSION ABGESCHLOSSEN · {gameRounds} RUNDEN</div>
          <div style={S.score}>{totalScore}</div>
          <div style={{ fontSize:12, color:"#6677aa", marginTop:4 }}>PUNKTE · MAX. {gameRounds * MAX_SCORE}</div>
        </div>
        <div style={S.div} />
        <div style={S.stitle}>RUNDEN-ÜBERSICHT</div>
        {roundScores.map((s, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,0.02)", borderRadius:4, border:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize:11, color:"#6677aa" }}>Runde {i+1} · {pool[sequence[i]]?.city} {pool[sequence[i]]?.flag}</span>
            <span style={{ fontWeight:700, color:s>0?"#00ffb3":"#ff4455" }}>{s>0?`+${s}`:"0"}</span>
          </div>
        ))}
        <div style={S.div} />
        <div style={S.g2}>
          <button style={S.btn("p")} onClick={() => startGame()}>▶ NOCHMAL</button>
          <button style={S.btn("g")} onClick={() => setScreen("leaderboard")}>◈ RANGLISTE</button>
        </div>
        <button style={S.btn("g")} onClick={() => setScreen("home")}>← HAUPTMENÜ</button>
      </div>
    </div>
  );

  if (screen === "leaderboard") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}><div style={S.logo}>RANGLISTE</div>
        <button style={S.btn("g")} onClick={() => setScreen("home")}>← ZURÜCK</button>
      </div>
      <div style={S.card}>
        {lbLoading ? (
          <div style={{ textAlign:"center", color:"#445566", padding:40 }}>Lade...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign:"center", color:"#445566", padding:40 }}>Noch keine Einträge.</div>
        ) : leaderboard.map((e, i) => (
          <div key={i} style={S.lbRow(i)}>
            <div style={{ fontSize:14, fontWeight:900, color:i===0?"#ffcc00":i===1?"#aaaacc":i===2?"#cc8866":"#445566", minWidth:24 }}>{i===0?"◈":i===1?"◇":i===2?"◆":`${i+1}.`}</div>
            <div style={{ flex:1, fontSize:13 }}>{e.name}</div>
            <div style={{ fontSize:12, color:"#6677aa" }}>{e.date}</div>
            <div style={{ fontWeight:900, color:"#00ffb3", minWidth:60, textAlign:"right" }}>{e.score}</div>
          </div>
        ))}
        <button style={{ ...S.btn("p"), marginTop:8 }} onClick={() => startGame()}>▶ SPIELEN</button>
      </div>
    </div>
  );

  if (screen === "duel-result" && duelResult) {
    const isCh = duelResult.role === "challenger";
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}><div style={S.logo}>DUELL</div></div>
        <div style={S.card}>
          {isCh ? (
            <>
              <div style={{ textAlign:"center", padding:"12px 0" }}>
                <div style={{ fontSize:11, color:"#445566", marginBottom:10 }}>DEIN ERGEBNIS</div>
                <div style={S.score}>{duelResult.myScore}</div>
              </div>
              <div style={{ padding:"16px", background:"rgba(0,255,179,0.05)", borderRadius:4, border:"1px solid rgba(0,255,179,0.2)" }}>
                <div style={{ fontSize:11, color:"#445566", marginBottom:6 }}>CODE FÜR DEINEN GEGNER</div>
                <div style={S.code}>{duelResult.duelCode}</div>
                <div style={{ fontSize:12, color:"#6677aa", textAlign:"center" }}>Gegner → "Duell beitreten" → Code eingeben</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:11, color:"#445566", textAlign:"center", padding:"10px 0" }}>ERGEBNIS</div>
              <div style={S.g2}>
                {[
                  { label:`DU (${username})`, score:duelResult.myScore, win:duelResult.myScore>=duelResult.opponentScore, color:"#00ffb3" },
                  { label:duelResult.opponentName, score:duelResult.opponentScore, win:duelResult.opponentScore>duelResult.myScore, color:"#ff4455" },
                ].map(p => (
                  <div key={p.label} style={{ padding:16, background:p.win?"rgba(0,255,179,0.08)":"rgba(255,255,255,0.02)", borderRadius:4, border:`1px solid ${p.win?"rgba(0,255,179,0.3)":"rgba(255,255,255,0.1)"}`, textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"#445566", marginBottom:4 }}>{p.label}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:p.color }}>{p.score}</div>
                    {p.win && <div style={{ fontSize:11, color:p.color, marginTop:4 }}>GEWINNER ◈</div>}
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={S.div} />
          <div style={S.g2}>
            <button style={S.btn("p")} onClick={() => startGame()}>▶ SOLO SPIELEN</button>
            <button style={S.btn("g")} onClick={() => setScreen("home")}>← MENÜ</button>
          </div>
        </div>
      </div>
    );
  }

  return <div style={{ color:"#00ffb3", padding:40 }}>Lade...</div>;
}
