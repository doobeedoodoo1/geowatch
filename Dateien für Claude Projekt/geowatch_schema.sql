-- ═══════════════════════════════════════════════════════════════
-- GEOWATCH — Supabase Schema
-- In Supabase: SQL Editor → New query → Alles einfügen → Run
-- ═══════════════════════════════════════════════════════════════

-- Rangliste
CREATE TABLE IF NOT EXISTS leaderboard (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  score      INTEGER NOT NULL,
  date       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen nach Score
CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON leaderboard (score DESC);

-- Duell-Daten
CREATE TABLE IF NOT EXISTS duels (
  code             TEXT PRIMARY KEY,
  sequence         JSONB NOT NULL,          -- Array von Cam-Indizes
  challenger_name  TEXT,
  challenger_score INTEGER DEFAULT 0,
  challenger_done  BOOLEAN DEFAULT FALSE,
  opponent_name    TEXT,
  opponent_score   INTEGER,
  status           TEXT DEFAULT 'pending',  -- pending | waiting | done
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Alte Duelle automatisch nach 7 Tagen löschen (optional)
-- Aktiviere dazu den pg_cron Extension in Supabase unter Database → Extensions
-- SELECT cron.schedule('cleanup-duels', '0 3 * * *', $$
--   DELETE FROM duels WHERE created_at < NOW() - INTERVAL '7 days';
-- $$);

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────────────
-- Erlaubt öffentlichen Lese- und Schreibzugriff (kein Login nötig)

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels       ENABLE ROW LEVEL SECURITY;

-- Leaderboard: jeder darf lesen und eintragen
CREATE POLICY "leaderboard_read"   ON leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_insert" ON leaderboard FOR INSERT WITH CHECK (true);

-- Duels: jeder darf lesen, erstellen und aktualisieren
CREATE POLICY "duels_read"   ON duels FOR SELECT USING (true);
CREATE POLICY "duels_insert" ON duels FOR INSERT WITH CHECK (true);
CREATE POLICY "duels_update" ON duels FOR UPDATE USING (true);
