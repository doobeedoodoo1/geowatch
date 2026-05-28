# 🌍 GeoWatch

**A global webcam guessing game.** GeoWatch shows you real daylight snapshots from 40,000+ webcams worldwide — identify the city from 3 options. The faster you answer, the more points you earn.

**[▶ Play at geowatchgame.vercel.app](https://geowatchgame.vercel.app)**

---

## Features

- **40,000+ webcams** via Windy Webcams API, refreshed every 2 hours
- **Streak bonus** — chain correct answers for extra points
- **Zoom Mode** — image starts zoomed in and gradually reveals itself
- **Hint system** — buy continent (−150 pts) or climate hints (−200 pts)
- **Region filter** — play only Europe, Asia, Americas, Africa, Oceania or Middle East
- **Fun Facts** — AI-generated facts about each location after a correct answer
- **Duel mode** — challenge a friend to the same camera sequence with a 6-digit code
- **Badges** — earn 🏅⭐💎👑 for perfect rounds, displayed on the leaderboard
- **Daily Challenge** *(coming soon)* — same cameras for all players, global daily ranking
- **Stats page** — personal records, accuracy per continent, recent games
- **Share results** — export your score card as an image for Instagram/X
- **Bilingual** — full English and German UI with one-click toggle

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Database | Supabase (PostgreSQL) |
| API Proxy | Supabase Edge Functions (Deno) |
| Webcam Data | [Windy Webcams API](https://api.windy.com) |
| Fun Facts | Anthropic Claude API |
| Maps | OpenStreetMap |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Windy API key](https://api.windy.com/keys) (Webcams type)
- A free [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com) (for Fun Facts)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/geowatch.git
cd geowatch
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Supabase Setup

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS leaderboard (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  score      INTEGER NOT NULL,
  date       TEXT NOT NULL,
  badges     INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duels (
  code             TEXT PRIMARY KEY,
  sequence         JSONB NOT NULL,
  rounds           INTEGER DEFAULT 5,
  challenger_name  TEXT,
  challenger_score INTEGER DEFAULT 0,
  challenger_done  BOOLEAN DEFAULT FALSE,
  opponent_name    TEXT,
  opponent_score   INTEGER,
  status           TEXT DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_read"   ON leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_insert" ON leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "duels_read"   ON duels FOR SELECT USING (true);
CREATE POLICY "duels_insert" ON duels FOR INSERT WITH CHECK (true);
CREATE POLICY "duels_update" ON duels FOR UPDATE USING (true);
```

### Deploy the Edge Function

```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase functions deploy windy-proxy
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Deploy to Vercel

1. Push to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Add the three environment variables in Vercel project settings
4. Deploy — done

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
| 2x streak bonus | +50 |
| 3x streak bonus | +100 |
| 4x streak bonus | +150 |
| 5x+ streak bonus | +200 |

---

## Badge System

| Badge | Requirement |
|---|---|
| 🏅 | 1–9 perfect rounds |
| ⭐ | 10–19 perfect rounds |
| 💎 | 20–49 perfect rounds |
| 👑 | 50+ perfect rounds |

A perfect round = all answers correct in one game.

---

## License

MIT
