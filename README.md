# 🌍 GeoWatch

**A global webcam guessing game.** GeoWatch shows you real daylight snapshots from 40,000+ webcams worldwide — identify the city from 3 options. The faster you answer, the more points you earn.

**[▶ Play at geowatchgame.vercel.app](https://geowatchgame.vercel.app)**

---

## Features

- **40,000+ webcams** via Windy Webcams API, cached for 10 minutes
- **Continent balancing** — "All" filter distributes cameras evenly across all continents via round-robin
- **Region filter** — play only Europe, Asia, Americas, Africa, Oceania or Middle East
- **Streak bonus** — chain correct answers for extra points
- **Zoom Mode** — image starts zoomed in and gradually reveals itself
- **Hint system** — buy continent (−150 pts) or climate hints (−200 pts)
- **Fun Facts** — AI-generated facts (Claude Haiku) after a correct answer, cached in Supabase
- **OpenStreetMap** — location revealed on a map after each answer
- **Duel mode** — challenge a friend with a 6-digit code
- **Badges** — earn 🏅⭐💎👑 for perfect rounds, displayed on the leaderboard
- **Daily Challenge** — same cameras for all players each day, global daily ranking
- **Leaderboard** — split into 5-round and 10-round rankings, top 20 each
- **Stats page** — personal records, accuracy per continent, recent games
- **Share results** — export your score card as an image
- **Bilingual** — full English and German UI (EN/DE toggle)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite (JSX) |
| Styling | Inline styles |
| Database | Supabase (PostgreSQL) |
| API Proxy | Supabase Edge Functions (Deno) |
| Webcam Data | Windy Webcams API |
| Fun Facts | Anthropic Claude Haiku (claude-haiku-4-5-20251001) + Supabase cache |
| Maps | OpenStreetMap embed |
| Hosting | Vercel |

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## Supabase Schema

```sql
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, score INTEGER NOT NULL,
  rounds INTEGER DEFAULT 5, date TEXT NOT NULL, badges INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS duels (
  code TEXT PRIMARY KEY, sequence JSONB NOT NULL, rounds INTEGER DEFAULT 5,
  challenger_name TEXT, challenger_score INTEGER DEFAULT 0,
  challenger_done BOOLEAN DEFAULT FALSE, opponent_name TEXT,
  opponent_score INTEGER, status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS daily_leaderboard (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, score INTEGER NOT NULL,
  date TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS funfacts (
  city TEXT PRIMARY KEY, fact TEXT NOT NULL, source TEXT, url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE funfacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_read" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_insert" ON leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "duels_read" ON duels FOR SELECT USING (true);
CREATE POLICY "duels_insert" ON duels FOR INSERT WITH CHECK (true);
CREATE POLICY "duels_update" ON duels FOR UPDATE USING (true);
CREATE POLICY "daily_read" ON daily_leaderboard FOR SELECT USING (true);
CREATE POLICY "daily_insert" ON daily_leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "funfacts_read" ON funfacts FOR SELECT USING (true);
CREATE POLICY "funfacts_insert" ON funfacts FOR INSERT WITH CHECK (true);
```

---

## Scoring

| | Points |
|---|---|
| Correct answer (base) | 500 |
| Speed bonus (max) | +500 |
| **Max per round** | **1,000** |
| Wrong answer / timeout | 0 |
| Continent hint | −150 |
| Climate hint | −200 |
| 2x streak | +50 |
| 3x streak | +100 |
| 4x streak | +150 |
| 5x+ streak | +200 |

---

## Badge System

| Badge | Requirement |
|---|---|
| 🏅 | 1–9 perfect rounds |
| ⭐ | 10–19 perfect rounds |
| 💎 | 20–49 perfect rounds |
| 👑 | 50+ perfect rounds |

---

## License

MIT
