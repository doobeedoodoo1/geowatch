import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase     = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const ROUND_TIME = 30;
const MAX_SCORE  = 1000;
const CACHE_TTL  = 2 * 60 * 60 * 1000;

// ── CONTINENT MAP ─────────────────────────────────────────────────────────────
const CONTINENT_MAP = {
  DE:"EU",AT:"EU",CH:"EU",FR:"EU",GB:"EU",IT:"EU",ES:"EU",PT:"EU",NL:"EU",BE:"EU",
  SE:"EU",NO:"EU",DK:"EU",FI:"EU",PL:"EU",CZ:"EU",SK:"EU",HU:"EU",RO:"EU",BG:"EU",
  HR:"EU",RS:"EU",SI:"EU",BA:"EU",ME:"EU",MK:"EU",AL:"EU",GR:"EU",TR:"EU",UA:"EU",
  BY:"EU",LT:"EU",LV:"EU",EE:"EU",MD:"EU",RU:"EU",IS:"EU",IE:"EU",LU:"EU",MT:"EU",CY:"EU",
  US:"NA",CA:"NA",MX:"NA",GT:"NA",BZ:"NA",HN:"NA",SV:"NA",NI:"NA",CR:"NA",PA:"NA",
  CU:"NA",JM:"NA",HT:"NA",DO:"NA",PR:"NA",TT:"NA",BB:"NA",LC:"NA",VC:"NA",GD:"NA",
  BR:"SA",AR:"SA",CL:"SA",CO:"SA",PE:"SA",VE:"SA",EC:"SA",BO:"SA",PY:"SA",UY:"SA",GY:"SA",SR:"SA",
  CN:"AS",JP:"AS",KR:"AS",IN:"AS",ID:"AS",TH:"AS",VN:"AS",PH:"AS",MY:"AS",SG:"AS",
  TW:"AS",HK:"AS",BD:"AS",PK:"AS",LK:"AS",NP:"AS",MM:"AS",KH:"AS",LA:"AS",MN:"AS",
  KZ:"AS",UZ:"AS",KG:"AS",TJ:"AS",TM:"AS",AF:"AS",IR:"AS",IQ:"AS",SY:"AS",LB:"AS",
  JO:"AS",SA:"AS",AE:"AS",QA:"AS",KW:"AS",BH:"AS",OM:"AS",YE:"AS",IL:"AS",
  ZA:"AF",NG:"AF",KE:"AF",ET:"AF",GH:"AF",TZ:"AF",UG:"AF",MA:"AF",DZ:"AF",TN:"AF",
  EG:"AF",LY:"AF",SD:"AF",CM:"AF",CI:"AF",SN:"AF",MZ:"AF",ZM:"AF",ZW:"AF",AO:"AF",MG:"AF",RW:"AF",MU:"AF",
  AU:"OC",NZ:"OC",FJ:"OC",PG:"OC",
};
const getContinent = (cc) => CONTINENT_MAP[cc?.toUpperCase()] || "EU";
const CONTINENT_NAMES = {
  en: { EU:"Europe", NA:"North America", SA:"South America", AS:"Asia", AF:"Africa", OC:"Oceania", ME:"Middle East" },
  de: { EU:"Europa",  NA:"Nordamerika",  SA:"Südamerika",   AS:"Asien", AF:"Afrika", OC:"Ozeanien", ME:"Naher Osten" },
};
const contName = (code, lang = "en") => (CONTINENT_NAMES[lang] || CONTINENT_NAMES.en)[code] || code;

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en: {
    initializing:          "INITIALIZING...",
    supabaseError:         "⚠ Supabase not connected",
    supabaseErrorDesc:     "Connect Supabase in Lovable (top right) and reload the page.",
    step1:                 "Step 1 — Get a free Windy API key",
    step2:                 "Step 2 — Enter API key",
    errorLabel:            "⚠ Error",
    loadCameras:           "▶ LOAD CAMERAS",
    useCache:              (n) => `← USE CACHE (${n} cameras)`,
    loadingCameras:        "LOADING CAMERAS...",
    leaderboard:           "◈ LEADERBOARD",
    leaderboardTitle:      "LEADERBOARD",
    tagline:               "Live cameras worldwide · Identify the city · 3 options · Speed matters",
    camerasLoaded:         (n) => `📡 ${n} cameras loaded`,
    scoring:               "Scoring",
    basePoints:            "Base points for each correct answer",
    speedBonus:            "Speed bonus — the faster, the more",
    maxPoints:             "Max points for instant correct answer",
    zeroPoints:            "Points for wrong answer or timeout",
    selectRounds:          "Select Rounds",
    fiveRounds:            "5 ROUNDS",
    tenRounds:             "10 ROUNDS",
    fifteenRounds:         "15 ROUNDS",
    twentyRounds:          "20 ROUNDS",
    max5k:                 "max. 5,000 pts.",
    max10k:                "max. 10,000 pts.",
    max15k:                "max. 15,000 pts.",
    max20k:                "max. 20,000 pts.",
    region:                "Region",
    regionAll:             "🌍 All",
    regionEurope:          "🌍 Europe",
    regionAmericas:        "🌎 Americas",
    regionAsia:            "🌏 Asia",
    regionAfrica:          "🌍 Africa",
    regionOceania:         "🌏 Oceania",
    regionMiddleEast:      "🌍 Middle East",
    regionTooFew:          "Not enough cameras in this region — playing with all cameras.",
    zoomModeLabel:         "ZOOM MODE",
    zoomHint:              "🔍 ZOOM",
    operativeId:           "Operative ID",
    usernamePlaceholder:   "Your username...",
    startMission:          (n) => `▶ START MISSION (${n} Rounds)`,
    duels:                 "Duels",
    createDuel:            "⚔ CREATE",
    joinDuelBtn:           "↗ JOIN",
    reloadCameras:         "⚙ API-KEY / RELOAD CAMERAS",
    back:                  "← BACK",
    joinDuelTitle:         "Join Duel",
    yourName:              "Your Name",
    duelCode:              "Duel Code",
    accept:                "⚔ ACCEPT",
    codeNotFound:          "Code not found.",
    duelEnded:             "Duel already ended.",
    challengerPlaying:     "Challenger is still playing.",
    duelBadge:             "⚔ DUEL",
    roundLabel:            "ROUND",
    scoreLabel:            "SCORE",
    streakLabel:           (n) => `🔥 ${n}x STREAK`,
    newRecord:             "NEW STREAK RECORD!",
    noImage:               "NO IMAGE AVAILABLE",
    whereIsCamera:         "WHERE IS THIS CAMERA?",
    hintContinent:         "💡 CONTINENT  −150 pts",
    hintClimate:           "🌡️ CLIMATE  −200 pts",
    hintContinentLabel:    "CONTINENT",
    hintClimateLabel:      "CLIMATE",
    hintLoading:           "Loading hint...",
    locationRevealed:      "LOCATION REVEALED",
    pointsEarned:          (n) => `+${n} points`,
    streakBonus:           (n) => `+${n} streak bonus`,
    hintPenalty:           (n) => `−${n} hint penalty`,
    noPoints:              "No points",
    loadingFunFact:        "LOADING FUN FACT...",
    funFactError:          "FUN FACT ERROR",
    funFact:               "◈ FUN FACT",
    nextRound:             "NEXT ROUND →",
    results:               "RESULTS →",
    missionComplete:       (n) => `MISSION COMPLETE · ${n} ROUNDS`,
    pointsMax:             (n) => `POINTS · MAX. ${n}`,
    roundSummary:          "Round Summary",
    roundN:                (n) => `Round ${n}`,
    playAgain:             "▶ PLAY AGAIN",
    mainMenu:              "← MAIN MENU",
    loading:               "Loading...",
    noEntries:             "No entries yet.",
    play:                  "▶ PLAY",
    badgeRanking:          "Badge Ranking",
    perfectRounds:         "perfect rounds",
    yourScore:             "YOUR SCORE",
    codeForOpponent:       "CODE FOR YOUR OPPONENT",
    opponentInstruction:   "Opponent → Join duel → Enter code",
    result:                "RESULT",
    you:                   (name) => `YOU (${name})`,
    winner:                "WINNER ◈",
    playSolo:              "▶ PLAY SOLO",
    menu:                  "← MENU",
    tooFewCameras:         "Too few active cameras. Please wait 1–2 min and try again (new API keys need some time to activate).",
    unknownError:          "Unknown error",
    emptyResponse:         "Empty response from API",
    usernameRequired:      "Please enter a username",
    backToMenu:            "← BACK TO MENU",
    dailyChallenge:        "DAILY CHALLENGE",
    dailySubtitle:         (n) => `${n} players today`,
    alreadyPlayed:         "Already played today",
    startDailyBtn:         "▶ START DAILY CHALLENGE",
    dailyComplete:         "DAILY CHALLENGE COMPLETE",
    dailyRank:             (rank, total) => `Rank ${rank} of ${total} players today`,
    nextChallenge:         (cd) => `Next challenge in ${cd}`,
    todayTop:              "TODAY'S TOP 10",
    shareResult:           "📤 SHARE RESULT",
    stats:                 "STATS",
    statsTitle:            "STATISTICS",
    gamesPlayed:           "Games Played",
    totalScore:            "Total Score",
    bestGame:              "Best Game",
    accuracy:              "Accuracy",
    bestStreak:            "Best Streak",
    byContinent:           "Accuracy by Continent",
    recentGames:           "Recent Games",
    resetStats:            "↺ Reset Stats",
    noStats:               "No stats yet — play some rounds!",
    correct:               "correct",
    // Time Attack
    timeAttack:            "⏱ TIME ATTACK",
    timeAttackSub:         "max. rounds in 3 min",
    timeAttackLabel:       "TIME ATTACK",
    roundsDone:            (n) => `${n} rounds`,
    globalTimer:           "TIME LEFT",
    // Photo Compare
    photoCompare:          "🖼 PHOTO COMPARE",
    photoCompareSub:       "which image is in …?",
    photoCompareQ:         (cont) => `Which image is in ${cont}?`,
    leftBtn:               "◀ LEFT",
    rightBtn:              "RIGHT ▶",
    // Friends
    friendsLB:             "👥 FRIENDS",
    friendsTitle:          "FRIENDS LEADERBOARD",
    createGroup:           "CREATE GROUP",
    joinGroup:             "JOIN GROUP",
    groupCode:             "Group Code",
    groupCreated:          (code) => `Group created! Code: ${code}`,
    groupJoined:           (n) => `Joined! ${n} members in group.`,
    groupNotFound:         "Group not found.",
    members:               "Members",
    inviteText:            (code) => `Join my GeoWatch friends group! Code: ${code} → geowatchgame.vercel.app`,
    copyCode:              "📋 COPY INVITE",
  },
  de: {
    initializing:          "INITIALISIERUNG...",
    supabaseError:         "⚠ Supabase nicht verbunden",
    supabaseErrorDesc:     "Verbinde Supabase in Lovable (oben rechts) und lade die Seite neu.",
    step1:                 "Schritt 1 — Kostenlosen Windy API-Key holen",
    step2:                 "Schritt 2 — API-Key eintragen",
    errorLabel:            "⚠ Fehler",
    loadCameras:           "▶ KAMERAS LADEN",
    useCache:              (n) => `← CACHE NUTZEN (${n} Kameras)`,
    loadingCameras:        "KAMERAS WERDEN GELADEN...",
    leaderboard:           "◈ RANGLISTE",
    leaderboardTitle:      "RANGLISTE",
    tagline:               "Live-Kameras weltweit · Erkenne die Stadt · 3 Optionen · Schnelligkeit zählt",
    camerasLoaded:         (n) => `📡 ${n} Kameras geladen`,
    scoring:               "Punktesystem",
    basePoints:            "Basispunkte für jede richtige Antwort",
    speedBonus:            "Schnelligkeitsbonus — je schneller, desto mehr",
    maxPoints:             "Maximalpunkte bei sofortiger richtiger Antwort",
    zeroPoints:            "Punkte bei falscher Antwort oder Zeitablauf",
    selectRounds:          "Rundenanzahl wählen",
    fiveRounds:            "5 RUNDEN",
    tenRounds:             "10 RUNDEN",
    fifteenRounds:         "15 RUNDEN",
    twentyRounds:          "20 RUNDEN",
    max5k:                 "max. 5.000 Pkt.",
    max10k:                "max. 10.000 Pkt.",
    max15k:                "max. 15.000 Pkt.",
    max20k:                "max. 20.000 Pkt.",
    region:                "Region",
    regionAll:             "🌍 Alle",
    regionEurope:          "🌍 Europa",
    regionAmericas:        "🌎 Amerika",
    regionAsia:            "🌏 Asien",
    regionAfrica:          "🌍 Afrika",
    regionOceania:         "🌏 Ozeanien",
    regionMiddleEast:      "🌍 Naher Osten",
    regionTooFew:          "Zu wenige Kameras in dieser Region — spiele mit allen Kameras.",
    zoomModeLabel:         "ZOOM-MODUS",
    zoomHint:              "🔍 ZOOM",
    operativeId:           "BENUTZER ID",
    usernamePlaceholder:   "Dein Benutzername...",
    startMission:          (n) => `▶ MISSION STARTEN (${n} Runden)`,
    duels:                 "Duelle",
    createDuel:            "⚔ ERSTELLEN",
    joinDuelBtn:           "↗ BEITRETEN",
    reloadCameras:         "⚙ API-KEY / CAMS NEU LADEN",
    back:                  "← ZURÜCK",
    joinDuelTitle:         "Duell beitreten",
    yourName:              "Dein Name",
    duelCode:              "Duell-Code",
    accept:                "⚔ ANNEHMEN",
    codeNotFound:          "Code nicht gefunden.",
    duelEnded:             "Duell bereits beendet.",
    challengerPlaying:     "Herausforderer spielt noch.",
    duelBadge:             "⚔ DUELL",
    roundLabel:            "RUNDE",
    scoreLabel:            "PUNKTE",
    streakLabel:           (n) => `🔥 ${n}x SERIE`,
    newRecord:             "NEUER SERIEN-REKORD!",
    noImage:               "KEIN BILD VERFÜGBAR",
    whereIsCamera:         "WO BEFINDET SICH DIESE KAMERA?",
    hintContinent:         "💡 KONTINENT  −150 Pkt.",
    hintClimate:           "🌡️ KLIMA  −200 Pkt.",
    hintContinentLabel:    "KONTINENT",
    hintClimateLabel:      "KLIMA",
    hintLoading:           "Tipp wird geladen...",
    locationRevealed:      "STANDORT ENTHÜLLT",
    pointsEarned:          (n) => `+${n} Punkte`,
    streakBonus:           (n) => `+${n} Serienbonus`,
    hintPenalty:           (n) => `−${n} Tipp-Abzug`,
    noPoints:              "Keine Punkte",
    loadingFunFact:        "FUN FACT WIRD GELADEN...",
    funFactError:          "FUN FACT FEHLER",
    funFact:               "◈ FUN FACT",
    nextRound:             "NÄCHSTE RUNDE →",
    results:               "ERGEBNIS →",
    missionComplete:       (n) => `MISSION ABGESCHLOSSEN · ${n} RUNDEN`,
    pointsMax:             (n) => `PUNKTE · MAX. ${n}`,
    roundSummary:          "Runden-Übersicht",
    roundN:                (n) => `Runde ${n}`,
    playAgain:             "▶ NOCHMAL",
    mainMenu:              "← HAUPTMENÜ",
    loading:               "Lade...",
    noEntries:             "Noch keine Einträge.",
    play:                  "▶ SPIELEN",
    badgeRanking:          "Abzeichen-Rangfolge",
    perfectRounds:         "perfekte Runden",
    yourScore:             "DEIN ERGEBNIS",
    codeForOpponent:       "CODE FÜR DEINEN GEGNER",
    opponentInstruction:   `Gegner → "Duell beitreten" → Code eingeben`,
    result:                "ERGEBNIS",
    you:                   (name) => `DU (${name})`,
    winner:                "GEWINNER ◈",
    playSolo:              "▶ SOLO SPIELEN",
    menu:                  "← MENÜ",
    tooFewCameras:         "Zu wenige aktive Kameras. Bitte 1–2 Min. warten und nochmal versuchen (neue API-Keys brauchen etwas Zeit).",
    unknownError:          "Unbekannter Fehler",
    emptyResponse:         "Leere Antwort von API",
    usernameRequired:      "Bitte einen Benutzernamen eingeben",
    backToMenu:            "← ZUM MENÜ",
    dailyChallenge:        "TÄGLICHE CHALLENGE",
    dailySubtitle:         (n) => `${n} Spieler heute`,
    alreadyPlayed:         "Heute bereits gespielt",
    startDailyBtn:         "▶ CHALLENGE STARTEN",
    dailyComplete:         "TÄGLICHE CHALLENGE ABGESCHLOSSEN",
    dailyRank:             (rank, total) => `Platz ${rank} von ${total} Spielern heute`,
    nextChallenge:         (cd) => `Nächste Challenge in ${cd}`,
    todayTop:              "HEUTIGE TOP 10",
    shareResult:           "📤 ERGEBNIS TEILEN",
    stats:                 "STATISTIKEN",
    statsTitle:            "STATISTIKEN",
    gamesPlayed:           "Gespielte Runden",
    totalScore:            "Gesamtpunkte",
    bestGame:              "Bestes Spiel",
    accuracy:              "Trefferquote",
    bestStreak:            "Bester Streak",
    byContinent:           "Trefferquote nach Kontinent",
    recentGames:           "Letzte Spiele",
    resetStats:            "↺ Stats zurücksetzen",
    noStats:               "Noch keine Statistiken — spiel ein paar Runden!",
    correct:               "richtig",
    // Time Attack
    timeAttack:            "⏱ ZEITANGRIFF",
    timeAttackSub:         "max. Runden in 3 Min",
    timeAttackLabel:       "ZEITANGRIFF",
    roundsDone:            (n) => `${n} Runden`,
    globalTimer:           "ZEIT ÜBRIG",
    // Photo Compare
    photoCompare:          "🖼 BILDVERGLEICH",
    photoCompareSub:       "welches Bild liegt in …?",
    photoCompareQ:         (cont) => `Welches Bild liegt in ${cont}?`,
    leftBtn:               "◀ LINKS",
    rightBtn:              "RECHTS ▶",
    // Friends
    friendsLB:             "👥 FREUNDE",
    friendsTitle:          "FREUNDE RANGLISTE",
    createGroup:           "GRUPPE ERSTELLEN",
    joinGroup:             "GRUPPE BEITRETEN",
    groupCode:             "Gruppen-Code",
    groupCreated:          (code) => `Gruppe erstellt! Code: ${code}`,
    groupJoined:           (n) => `Beigetreten! ${n} Mitglieder in der Gruppe.`,
    groupNotFound:         "Gruppe nicht gefunden.",
    members:               "Mitglieder",
    inviteText:            (code) => `Tritt meiner GeoWatch-Freundesgruppe bei! Code: ${code} → geowatchgame.vercel.app`,
    copyCode:              "📋 CODE KOPIEREN",
  },
};

// ── FAQ DATA ──────────────────────────────────────────────────────────────────
const FAQ_DATA = {
  en: [
    // ── Basics
    { q: "How does GeoWatch work?",
      a: "GeoWatch shows you a real webcam snapshot from somewhere in the world — without any location info. You have 30 seconds to pick the correct city from 3 options. The faster you answer, the more points you earn. Each correct answer gives you 500 base points plus up to 500 speed bonus points (max. 1,000 per round)." },
    { q: "Where do the camera images come from?",
      a: "GeoWatch uses the Windy Webcams API with over 40,000 real webcams worldwide. All images are daylight snapshots — so you always see a bright, recognisable picture regardless of the time of day." },
    { q: "How is the score calculated?",
      a: "Every correct answer earns 500 base points. On top of that you get a speed bonus: the faster you answer within the 30-second timer, the more bonus points you receive (up to +500). A wrong answer or timeout gives 0 points. Hints reduce your score (see below)." },
    // ── Game Modes
    { q: "How many rounds can I choose?",
      a: "On the home screen you can choose between 5, 10, 15, or 20 rounds. The maximum possible score scales accordingly: 5,000 pts for 5 rounds up to 20,000 pts for 20 rounds." },
    { q: "What is Time Attack mode? ⏱",
      a: "In Time Attack mode you have exactly 3 minutes to complete as many rounds as possible — there is no round limit! Each round gives you 20 seconds. The game ends when the global timer hits zero. Your total score and the number of completed rounds are saved to a dedicated Time Attack leaderboard." },
    { q: "What is Photo Compare mode? 🖼",
      a: "Two webcam images are shown side by side. Your task: tap the image that is located in the named continent (e.g. \"Which image is in Asia?\"). One image is always from the correct continent, the other from a different one. 5 rounds, 500 points per correct answer." },
    { q: "What is the Daily Challenge? 🌍",
      a: "Every day at midnight (UTC) a new set of 5 cameras is generated — the same for every player worldwide. You can only play the Daily Challenge once per day. Your score appears on the daily leaderboard so you can see exactly where you rank. A countdown shows when the next challenge starts." },
    { q: "What is Zoom Mode? 🔍",
      a: "Activate Zoom Mode on the home screen to make the game harder. The camera image starts heavily zoomed in and slowly zooms out over the full 30 seconds. The earlier you guess correctly, the more points you get — because the image is still very zoomed in and difficult to identify." },
    // ── Scoring & Bonuses
    { q: "What is the Streak Bonus? 🔥",
      a: "Answer multiple questions correctly in a row to build a streak and earn bonus points on top of your round score:\n2× streak = +50 pts · 3× = +100 pts · 4× = +150 pts · 5× or more = +200 pts per round.\nThe streak resets to zero on any wrong answer or timeout." },
    { q: "How do hints work? 💡",
      a: "During a round you can buy up to two hints — but each one costs points:\n• Continent hint (−150 pts): reveals which continent the camera is located on.\n• Climate hint (−200 pts): an AI describes the typical climate of the location without naming the city or country.\nHints can only be used once per round and are deducted from your final round score (minimum 0 pts)." },
    { q: "What are badges? 🏅",
      a: "You earn a badge every time you complete a perfect round — meaning all answers in that session were correct. Badges accumulate across all game modes (5R, 10R, 15R, 20R, Time Attack):\n🏅 1–9 perfect rounds · ⭐ 10–19 · 💎 20–49 · 👑 50+ perfect rounds.\nYour badge appears next to your name on the leaderboard." },
    // ── Multiplayer
    { q: "How do Duels work? ⚔️",
      a: "Click \"Create\" in the Duels section on the home screen. You play first and receive a 6-digit code. Share the code with a friend — they enter it under \"Join Duel\" and play the exact same camera sequence. The player with the higher score wins. The result is shown to both players." },
    { q: "What is the Friends Leaderboard? 👥",
      a: "Create a private group by clicking \"Friends\" in the top menu. You receive a 6-digit group code — share it with your friends. Once they join, you can all see each other's scores across every game mode (5R, 10R, 15R, 20R, Time Attack) on a private leaderboard. Your group is saved on your device so you don't have to re-enter the code." },
    // ── Filters & Settings
    { q: "What does the Region filter do?",
      a: "On the home screen you can restrict which cameras appear in your game. Choose from: All, Europe, Americas, Asia, Africa, Oceania, or Middle East. If a region has fewer than 5 available cameras, the game automatically falls back to all cameras." },
    { q: "What are AI Fun Facts? 🤖",
      a: "After every correct answer, an AI (Claude by Anthropic) generates a short, interesting fact about the city — 2–3 sentences with a source link. Fun Facts are generated in your chosen language (EN/DE) and cached so the same city never triggers a second API call." },
    // ── Stats & Leaderboard
    { q: "What does the Stats page show?",
      a: "The Stats page tracks your personal history on this device: total games played, total score, best single game, overall accuracy, best streak ever, accuracy broken down by continent, and your last 10 games. It also shows a Play Calendar — a GitHub-style grid of the days you have played, including streak awards (🔥 3 days · ⭐ 7 days · 💎 30 days in a row)." },
    { q: "What is the Play Calendar? 📅",
      a: "The Play Calendar on the Stats page shows the last 16 weeks as a coloured grid — each square represents one day. Days you played are highlighted in green. Below the calendar you can see your current daily streak and earn awards for playing 3, 7, or 30 days in a row." },
    { q: "How is the Leaderboard structured?",
      a: "The global leaderboard is split into separate columns: 5 Rounds, 10 Rounds, 15 Rounds, 20 Rounds, and Time Attack. Each column shows the top 20 scores of all time. Badges are displayed next to player names. The Friends Leaderboard works the same way but shows only the scores of your friend group." },
  ],
  de: [
    // ── Grundlagen
    { q: "Wie funktioniert GeoWatch?",
      a: "GeoWatch zeigt dir ein echtes Webcam-Bild von irgendwo auf der Welt — ohne Ortsangabe. Du hast 30 Sekunden Zeit, die richtige Stadt aus 3 Optionen zu wählen. Je schneller du antwortest, desto mehr Punkte bekommst du. Jede richtige Antwort bringt 500 Basispunkte plus bis zu 500 Schnelligkeitsbonus (max. 1.000 pro Runde)." },
    { q: "Woher kommen die Kamerabilder?",
      a: "GeoWatch nutzt die Windy Webcams API mit über 40.000 echten Webcams weltweit. Alle Bilder sind Tageslicht-Aufnahmen — du siehst also immer ein helles, gut erkennbares Bild, unabhängig von der aktuellen Uhrzeit." },
    { q: "Wie wird der Score berechnet?",
      a: "Jede richtige Antwort bringt 500 Basispunkte. Dazu kommt ein Schnelligkeitsbonus: Je früher du innerhalb der 30 Sekunden antwortest, desto mehr Bonuspunkte erhältst du (bis zu +500). Eine falsche Antwort oder Zeitablauf gibt 0 Punkte. Tipps reduzieren deinen Score (siehe unten)." },
    // ── Spielmodi
    { q: "Wie viele Runden kann ich wählen?",
      a: "Auf der Startseite kannst du zwischen 5, 10, 15 oder 20 Runden wählen. Die maximal erreichbare Punktzahl steigt entsprechend: 5.000 Pkt bei 5 Runden bis 20.000 Pkt bei 20 Runden." },
    { q: "Was ist der Zeitangriff-Modus? ⏱",
      a: "Im Zeitangriff-Modus hast du genau 3 Minuten Zeit, um so viele Runden wie möglich zu absolvieren — es gibt kein Runden-Limit! Pro Runde hast du 20 Sekunden. Das Spiel endet wenn der globale Timer auf null läuft. Dein Gesamtscore und die Anzahl der abgeschlossenen Runden werden in einer eigenen Zeitangriff-Rangliste gespeichert." },
    { q: "Was ist der Bildvergleich-Modus? 🖼",
      a: "Zwei Webcam-Bilder werden nebeneinander angezeigt. Deine Aufgabe: Tippe auf das Bild, das im genannten Kontinent liegt (z.B. \"Welches Bild liegt in Asien?\"). Ein Bild stammt immer aus dem richtigen Kontinent, das andere nicht. 5 Runden, 500 Punkte pro richtiger Antwort." },
    { q: "Was ist die Tägliche Challenge? 🌍",
      a: "Jeden Tag um Mitternacht (UTC) werden 5 neue Kameras generiert — dieselben für alle Spieler weltweit. Die Tägliche Challenge kann nur einmal pro Tag gespielt werden. Dein Score erscheint in der Tages-Rangliste, sodass du genau siehst wo du im Vergleich stehst. Ein Countdown zeigt wann die nächste Challenge startet." },
    { q: "Was ist der Zoom-Modus? 🔍",
      a: "Aktiviere den Zoom-Modus auf der Startseite für mehr Schwierigkeit. Das Kamerabild startet stark hereingezoomt und zoomt über die gesamten 30 Sekunden langsam heraus. Je früher du richtig rätst, desto mehr Punkte bekommst du — denn das Bild ist noch stark vergrößert und schwer zu erkennen." },
    // ── Punkte & Boni
    { q: "Was ist der Serien-Bonus? 🔥",
      a: "Beantworte mehrere Fragen hintereinander richtig, um eine Serie aufzubauen und Bonuspunkte zu erhalten:\n2× Serie = +50 Pkt · 3× = +100 Pkt · 4× = +150 Pkt · 5× oder mehr = +200 Pkt pro Runde.\nDie Serie bricht bei jeder falschen Antwort oder Zeitablauf ab." },
    { q: "Wie funktionieren Tipps? 💡",
      a: "Während einer Runde kannst du bis zu zwei Tipps kaufen — jeder kostet aber Punkte:\n• Kontinent-Tipp (−150 Pkt): verrät auf welchem Kontinent die Kamera steht.\n• Klima-Tipp (−200 Pkt): eine KI beschreibt das typische Klima des Standorts, ohne Stadt oder Land zu nennen.\nTipps können pro Runde nur einmal genutzt werden und werden vom Runden-Score abgezogen (Minimum 0 Pkt)." },
    { q: "Was sind Abzeichen? 🏅",
      a: "Du erhältst ein Abzeichen für jede perfekte Runde — d.h. alle Antworten einer Spielsitzung waren richtig. Abzeichen sammeln sich über alle Spielmodi (5R, 10R, 15R, 20R, Zeitangriff):\n🏅 1–9 perfekte Runden · ⭐ 10–19 · 💎 20–49 · 👑 50+ perfekte Runden.\nDein Abzeichen erscheint neben deinem Namen in der Rangliste." },
    // ── Multiplayer
    { q: "Wie funktionieren Duelle? ⚔️",
      a: "Klicke im Abschnitt \"Duelle\" auf der Startseite auf \"Erstellen\". Du spielst als Erster und erhältst einen 6-stelligen Code. Teile den Code mit einem Freund — er gibt ihn unter \"Beitreten\" ein und spielt dieselbe Kamera-Sequenz. Wer mehr Punkte hat gewinnt. Das Ergebnis wird beiden Spielern angezeigt." },
    { q: "Was ist die Freunde-Rangliste? 👥",
      a: "Klicke oben im Menü auf \"Freunde\". Erstelle eine Gruppe und erhalte einen 6-stelligen Gruppen-Code — teile ihn mit deinen Freunden. Sobald sie beigetreten sind, seht ihr alle gegenseitig eure Scores in allen Spielmodi (5R, 10R, 15R, 20R, Zeitangriff) in einer privaten Rangliste. Deine Gruppe wird auf deinem Gerät gespeichert, du musst den Code nicht erneut eingeben." },
    // ── Filter & Einstellungen
    { q: "Was macht der Regionen-Filter?",
      a: "Auf der Startseite kannst du einschränken welche Kameras im Spiel erscheinen. Wähle aus: Alle, Europa, Amerika, Asien, Afrika, Ozeanien oder Naher Osten. Hat eine Region weniger als 5 verfügbare Kameras, fällt das Spiel automatisch auf alle Kameras zurück." },
    { q: "Was sind KI-Fun Facts? 🤖",
      a: "Nach jeder richtigen Antwort generiert eine KI (Claude von Anthropic) einen kurzen, interessanten Fakt über die Stadt — 2–3 Sätze mit einem Quellenlink. Fun Facts werden in deiner gewählten Sprache (DE/EN) generiert und gecacht, sodass dieselbe Stadt keinen zweiten API-Aufruf auslöst." },
    // ── Statistiken & Rangliste
    { q: "Was zeigt die Statistiken-Seite?",
      a: "Die Statistiken-Seite zeigt deine persönliche Spielhistorie auf diesem Gerät: gespielte Spiele gesamt, Gesamtpunkte, bestes Einzelspiel, Gesamttrefferquote, bester Streak, Trefferquote aufgeschlüsselt nach Kontinent sowie deine letzten 10 Spiele. Außerdem siehst du den Spielkalender — ein GitHub-ähnliches Raster der Tage an denen du gespielt hast." },
    { q: "Was ist der Spielkalender? 📅",
      a: "Der Spielkalender auf der Statistiken-Seite zeigt die letzten 16 Wochen als farbiges Raster — jedes Kästchen ist ein Tag. Tage an denen du gespielt hast, sind grün markiert. Unter dem Kalender siehst du deinen aktuellen Tages-Streak und kannst Awards verdienen: 🔥 3 Tage · ⭐ 7 Tage · 💎 30 Tage in Folge gespielt." },
    { q: "Wie ist die Rangliste aufgebaut?",
      a: "Die globale Rangliste ist in separate Spalten aufgeteilt: 5 Runden, 10 Runden, 15 Runden, 20 Runden und Zeitangriff. Jede Spalte zeigt die Top 20 aller Zeiten. Abzeichen werden neben den Spielernamen angezeigt. Die Freunde-Rangliste funktioniert genauso, zeigt aber nur die Scores deiner Freundesgruppe." },
  ],
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
const flag = (code) => {
  if (!code || code.length < 2) return "🌍";
  try { return String.fromCodePoint(0x1F1E6 + code.toUpperCase().charCodeAt(0) - 65, 0x1F1E6 + code.toUpperCase().charCodeAt(1) - 65); }
  catch { return "🌍"; }
};
const shuffle       = (a) => [...a].sort(() => Math.random() - 0.5);
const genCode       = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const calcScore     = (t) => Math.round(MAX_SCORE * 0.5 + MAX_SCORE * 0.5 * (t / ROUND_TIME));
const camLabel      = (c) => `${c.city} (${c.country})`;
const calcStreakBonus = (s) => s >= 5 ? 200 : s === 4 ? 150 : s === 3 ? 100 : s === 2 ? 50 : 0;

const matchRegion = (continent = "", region) => {
  const c = continent.toLowerCase();
  switch (region) {
    case "europe":     return c.includes("eu") || c.includes("europe");
    case "americas":   return c.includes("america") || c === "na" || c === "sa";
    case "asia":       return c.includes("asia") || c === "as";
    case "africa":     return c.includes("africa") || c === "af";
    case "oceania":    return c.includes("oceania") || c.includes("australia") || c === "oc";
    case "middleeast": return c.includes("middle") || c === "me";
    default:           return true;
  }
};

const getOptions = (correct, pool) => {
  const usedCountries = new Set([correct.country]);
  const others = shuffle(pool.filter(c => c.city !== correct.city && c.country !== correct.country));
  const distractors = [];
  for (const cam of others) {
    if (!usedCountries.has(cam.country)) {
      usedCountries.add(cam.country);
      distractors.push(cam);
      if (distractors.length === 2) break;
    }
  }
  // Fallback: falls nicht genug verschiedene Länder vorhanden
  if (distractors.length < 2) {
    const used = new Set(distractors.map(c => c.city));
    for (const cam of shuffle(pool.filter(c => c.city !== correct.city))) {
      if (!used.has(cam.city)) { distractors.push(cam); used.add(cam.city); }
      if (distractors.length === 2) break;
    }
  }
  return shuffle([camLabel(correct), ...distractors.slice(0, 2).map(camLabel)]);
};

const buildBalancedSeq = (pool, rounds, continent = "ALL") => {
  if (continent && continent !== "ALL") {
    const filtered = pool.map((c, i) => ({ c, i })).filter(({ c }) => getContinent(c.countryCode) === continent);
    return shuffle(filtered).slice(0, rounds).map(({ i }) => i);
  }
  const groups = {};
  pool.forEach((cam, idx) => {
    const cont = getContinent(cam.countryCode);
    if (!groups[cont]) groups[cont] = [];
    groups[cont].push(idx);
  });
  const conts = Object.keys(groups).filter(k => groups[k].length > 0);
  conts.forEach(k => { groups[k] = shuffle(groups[k]); });
  const result = [];
  let i = 0;
  while (result.length < rounds) {
    const cont = conts[i % conts.length];
    if (groups[cont].length > 0) result.push(groups[cont].shift());
    i++;
    if (i > rounds * conts.length) break;
  }
  return shuffle(result);
};

const seededRandom = (seed) => {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
};

const getDailySequence = (pool) => {
  const today = new Date().toISOString().slice(0, 10);
  const seed  = today.split("-").reduce((a, b) => a * 31 + parseInt(b), 0);
  const rng   = seededRandom(seed);
  const idx   = [...Array(pool.length).keys()];
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 5);
};

// ── LOCAL STORAGE ─────────────────────────────────────────────────────────────
const ls = {
  get: (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── SUPABASE DB ───────────────────────────────────────────────────────────────
const db = {
  async loadLB() {
    if (!supabase) return { five: [], ten: [], fifteen: [], twenty: [] };
    const [r5, r10, r15, r20] = await Promise.all([
      supabase.from("leaderboard").select("name,score,date,badges").eq("rounds", 5).order("score", { ascending: false }).limit(20),
      supabase.from("leaderboard").select("name,score,date,badges").eq("rounds", 10).order("score", { ascending: false }).limit(20),
      supabase.from("leaderboard").select("name,score,date,badges").eq("rounds", 15).order("score", { ascending: false }).limit(20),
      supabase.from("leaderboard").select("name,score,date,badges").eq("rounds", 20).order("score", { ascending: false }).limit(20),
    ]);
    return { five: r5.data || [], ten: r10.data || [], fifteen: r15.data || [], twenty: r20.data || [] };
  },
  async addScore({ name, score, date, rounds = 5 }) {
    if (!supabase || !name?.trim()) return;
    await supabase.from("leaderboard").insert([{ name: name.trim(), score, date, rounds }]);
  },
  async getFunFact(city, lang = "en") {
    if (!supabase) return null;
    const key = `${city}__${lang}`;
    const { data } = await supabase.from("funfacts").select("fact,source,url").eq("city", key).maybeSingle();
    return data || null;
  },
  async saveFunFact(city, fact, source, url, lang = "en") {
    if (!supabase) return;
    const key = `${city}__${lang}`;
    await supabase.from("funfacts").upsert([{ city: key, fact, source, url }]);
  },
  async loadDailyLB(date) {
    if (!supabase) return [];
    const { data } = await supabase.from("daily_leaderboard").select("name,score,date").eq("date", date).order("score", { ascending: false }).limit(20);
    return data || [];
  },
  async addDailyScore({ name, score, date }) {
    if (!supabase || !name?.trim()) return;
    const { error } = await supabase.from("daily_leaderboard").insert([{ name: name.trim(), score, date }]);
    if (error) console.error("addDailyScore INSERT error:", error);
  },
  async loadDuel(code)        { if (!supabase) return null; const { data } = await supabase.from("duels").select("*").eq("code", code).maybeSingle(); return data; },
  async saveDuel(code, payload) { if (supabase) await supabase.from("duels").upsert([{ code, ...payload }]); },
  async loadTimeAttackLB() {
    if (!supabase) return [];
    const { data } = await supabase.from("time_attack_lb").select("name,score,rounds_completed,date,badges").order("score", { ascending: false }).limit(20);
    return data || [];
  },
  async addTimeAttackScore({ name, score, rounds_completed, date, badges = 0 }) {
    if (!supabase || !name?.trim()) return;
    await supabase.from("time_attack_lb").insert([{ name: name.trim(), score, rounds_completed, date, badges }]);
  },
  async loadFriendsLB(members) {
    if (!supabase || !members.length) return { five:[], ten:[], fifteen:[], twenty:[], ta:[] };
    const q = (tbl, col, eq) => supabase.from(tbl).select(col).in("name", members).order("score",{ascending:false}).limit(20);
    const [r5,r10,r15,r20,rta] = await Promise.all([
      supabase.from("leaderboard").select("name,score,date,badges").in("name",members).eq("rounds",5).order("score",{ascending:false}).limit(20),
      supabase.from("leaderboard").select("name,score,date,badges").in("name",members).eq("rounds",10).order("score",{ascending:false}).limit(20),
      supabase.from("leaderboard").select("name,score,date,badges").in("name",members).eq("rounds",15).order("score",{ascending:false}).limit(20),
      supabase.from("leaderboard").select("name,score,date,badges").in("name",members).eq("rounds",20).order("score",{ascending:false}).limit(20),
      supabase.from("time_attack_lb").select("name,score,rounds_completed,date,badges").in("name",members).order("score",{ascending:false}).limit(20),
    ]);
    return { five:r5.data||[], ten:r10.data||[], fifteen:r15.data||[], twenty:r20.data||[], ta:rta.data||[] };
  },
  async loadFriendGroup(code) {
    if (!supabase) return null;
    const { data } = await supabase.from("friend_groups").select("*").eq("code", code).maybeSingle();
    return data;
  },
  async createFriendGroup(code, creatorName) {
    if (!supabase) return;
    await supabase.from("friend_groups").insert([{ code, members: [creatorName] }]);
  },
  async joinFriendGroup(code, memberName) {
    if (!supabase) return null;
    const group = await db.loadFriendGroup(code);
    if (!group) return null;
    const members = [...new Set([...group.members, memberName])];
    await supabase.from("friend_groups").update({ members }).eq("code", code);
    return members;
  },
};

// ── STATS ─────────────────────────────────────────────────────────────────────
const STATS_KEY     = "geowatch:stats";
const PLAYDATES_KEY = "geowatch:playdates";
const emptyStats = () => ({ gamesPlayed:0, totalScore:0, correctAnswers:0, totalAnswers:0, bestScore:0, bestStreak:0, continentStats:{}, recentGames:[] });

const recordPlayDate = () => {
  const today = new Date().toISOString().slice(0, 10);
  const dates = new Set(ls.get(PLAYDATES_KEY) || []);
  dates.add(today);
  ls.set(PLAYDATES_KEY, [...dates]);
};

const calcDayStreak = (dates) => {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!set.has(key)) { d.setDate(d.getDate() - 1); if (!set.has(d.toISOString().slice(0, 10))) break; break; }
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

const saveStats = (roundScores, sequence, pool, maxStreak) => {
  const prev = ls.get(STATS_KEY) || emptyStats();
  const finalScore = roundScores.reduce((a, b) => a + b, 0);
  const correct    = roundScores.filter(s => s > 0).length;
  const continentStats = { ...prev.continentStats };
  roundScores.forEach((score, i) => {
    const cam = pool[sequence[i]];
    if (!cam) return;
    const cont = cam.continent || "Unknown";
    if (!continentStats[cont]) continentStats[cont] = { correct:0, total:0 };
    continentStats[cont].total++;
    if (score > 0) continentStats[cont].correct++;
  });
  ls.set(STATS_KEY, {
    gamesPlayed:    prev.gamesPlayed + 1,
    totalScore:     prev.totalScore + finalScore,
    correctAnswers: prev.correctAnswers + correct,
    totalAnswers:   prev.totalAnswers + roundScores.length,
    bestScore:      Math.max(prev.bestScore, finalScore),
    bestStreak:     Math.max(prev.bestStreak, maxStreak),
    continentStats,
    recentGames: [{ score:finalScore, date:new Date().toLocaleDateString(), rounds:roundScores.length, correct }, ...prev.recentGames].slice(0, 10),
  });
  recordPlayDate();
};

// ── FUN FACT (Gemini + Supabase cache) ───────────────────────────────────────
const fetchFunFact = async (city, country, lang = "en") => {
  const cached = await db.getFunFact(city, lang);
  if (cached) return cached;
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const prompt = lang === "de"
    ? `Antworte auf Deutsch. Gib mir einen kurzen, interessanten Fun Fact (2-3 Sätze) über die Stadt ${city} in ${country}, oder falls du keine gesicherten Infos hast, über ${country} allgemein. Antworte NUR mit einem JSON-Objekt ohne Markdown-Backticks: {"fact":"text","source":"Quellenname","url":"https://..."}`
    : `Respond in English. Give me a short, interesting fun fact (2-3 sentences) about the city ${city} in ${country}, or if you have no verified info, about ${country} in general. Reply ONLY with a JSON object, no markdown backticks: {"fact":"text","source":"source name","url":"https://..."}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    db.saveFunFact(city, parsed.fact, parsed.source, parsed.url, lang);
    return parsed;
  } catch (err) {
    console.error("Fun Fact Fehler:", err);
    return null;
  }
};

// ── SHARE CARD ────────────────────────────────────────────────────────────────
const rrect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
};

const generateShareCard = (totalScore, roundScores, maxStreak, gameRounds, lang) => {
  const c = document.createElement("canvas");
  c.width = 1080; c.height = 1080;
  const ctx = c.getContext("2d");

  // Background
  ctx.fillStyle = "#07080d";
  ctx.fillRect(0, 0, 1080, 1080);

  // Scan lines
  ctx.fillStyle = "rgba(0,255,180,0.012)";
  for (let y = 0; y < 1080; y += 4) ctx.fillRect(0, y + 2, 1080, 2);

  // Outer border
  ctx.strokeStyle = "rgba(0,255,179,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, 992, 992);

  // Corner accents
  const corner = (x, y, dx, dy) => {
    ctx.strokeStyle = "#00ffb3"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y + dy*48); ctx.lineTo(x, y); ctx.lineTo(x + dx*48, y); ctx.stroke();
  };
  corner(44,44,1,1); corner(1036,44,-1,1); corner(44,1036,1,-1); corner(1036,1036,-1,-1);

  ctx.textAlign = "center";

  // GEOWATCH logo
  ctx.shadowColor = "rgba(0,255,179,0.6)"; ctx.shadowBlur = 30;
  ctx.font = "900 80px 'Courier New', Courier, monospace";
  ctx.fillStyle = "#00ffb3";
  ctx.fillText("GEOWATCH", 540, 168);
  ctx.shadowBlur = 0;

  // Tagline
  ctx.font = "400 21px 'Courier New', Courier, monospace";
  ctx.fillStyle = "#2a3344";
  ctx.fillText("GLOBAL SURVEILLANCE GAME", 540, 208);

  // Divider
  ctx.strokeStyle = "rgba(0,255,179,0.12)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 236); ctx.lineTo(980, 236); ctx.stroke();

  // Score
  ctx.shadowColor = "rgba(0,255,179,0.5)"; ctx.shadowBlur = 55;
  ctx.font = "900 176px 'Courier New', Courier, monospace";
  ctx.fillStyle = "#00ffb3";
  ctx.fillText(totalScore.toLocaleString(), 540, 454);
  ctx.shadowBlur = 0;

  ctx.font = "400 25px 'Courier New', Courier, monospace";
  ctx.fillStyle = "#3a4a5a";
  ctx.fillText(lang === "de" ? "PUNKTE" : "POINTS", 540, 493);

  // Divider
  ctx.strokeStyle = "rgba(0,255,179,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 520); ctx.lineTo(980, 520); ctx.stroke();

  // Round result grid
  const n = roundScores.length;
  const cols = Math.min(n, 5);
  const rows = Math.ceil(n / cols);
  const box = 82; const gap = 14;
  const gridW = cols * box + (cols - 1) * gap;
  const gx = 540 - gridW / 2;
  const gy = 548;

  for (let i = 0; i < n; i++) {
    const col = i % cols; const row = Math.floor(i / cols);
    const x = gx + col * (box + gap); const y = gy + row * (box + gap);
    const ok = roundScores[i] > 0;
    ctx.fillStyle = ok ? "rgba(0,255,179,0.12)" : "rgba(255,68,85,0.12)";
    rrect(ctx, x, y, box, box, 10); ctx.fill();
    ctx.strokeStyle = ok ? "rgba(0,255,179,0.55)" : "rgba(255,68,85,0.55)";
    ctx.lineWidth = 2;
    rrect(ctx, x, y, box, box, 10); ctx.stroke();
    ctx.font = "bold 42px monospace";
    ctx.fillStyle = ok ? "#00ffb3" : "#ff4455";
    ctx.fillText(ok ? "✓" : "✗", x + box / 2, y + box / 2 + 15);
  }

  const afterGrid = gy + rows * (box + gap) + 24;

  // Streak
  if (maxStreak >= 2) {
    ctx.font = "700 32px 'Courier New', Courier, monospace";
    ctx.fillStyle = "#ffaa00";
    ctx.fillText(`🔥 ${maxStreak}× STREAK MAX`, 540, afterGrid + 44);
  }

  // Date / rounds info
  ctx.font = "400 23px 'Courier New', Courier, monospace";
  ctx.fillStyle = "#3a4a5a";
  const dateStr = new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-GB");
  ctx.fillText(`${gameRounds} ${lang === "de" ? "Runden" : "Rounds"} · ${dateStr}`, 540, maxStreak >= 2 ? afterGrid + 94 : afterGrid + 44);

  // Bottom divider + URL
  ctx.strokeStyle = "rgba(0,255,179,0.1)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 968); ctx.lineTo(980, 968); ctx.stroke();
  ctx.font = "400 24px 'Courier New', Courier, monospace";
  ctx.fillStyle = "rgba(0,255,179,0.3)";
  ctx.fillText("geowatchgame.com", 540, 1008);

  return c;
};

// ── WINDY API via Edge Function ───────────────────────────────────────────────
const EDGE_URL = "https://muaquiygkhdqvkkglgau.supabase.co/functions/v1/windy-proxy";
const ENV_WINDY_KEY = import.meta.env.VITE_WINDY_API_KEY || null;

const callProxy = async (body) => {
  const resp = await fetch(EDGE_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}`, "apikey": SUPABASE_KEY },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
  if (data?.error) throw new Error(data.error);
  return data;
};

const mapCam = (w) => ({
  id:          String(w.webcamId),
  city:        w.location?.city,
  country:     w.location?.country || w.location?.country_code,
  countryCode: w.location?.country_code,
  continent:   getContinent(w.location?.country_code),
  flag:        flag(w.location?.country_code),
  lat:         w.location?.latitude  ?? null,
  lon:         w.location?.longitude ?? null,
  imageUrl:    w.images?.day?.preview || w.images?.daylight?.preview || w.images?.current?.preview || null,
});

const LOCATION_TEXT_PATTERNS = /strada|street|rue\s|via\s|str\.|calle\s|foto-webcam\.eu|feratel|\d{1,3}\.\d+[°,]\s*\d|nz\s*transport|transport\s*agency|nzta|cctv|新闻|waka\s*kotahi/i;
const STALE_MS = 30 * 24 * 60 * 60 * 1000;

const fetchBatch = async (apiKey, offset) => {
  const now  = Date.now();
  const data = await callProxy({ apiKey, offset, limit: 50 });
  return (data?.webcams || [])
    .filter(w => w.location?.city && w.location?.country_code &&
                 w.location.city.toLowerCase() !== "unknown" &&
                 w.location.city.trim() !== "")
    .filter(w => w.images?.day?.preview || w.images?.current?.preview)
    .filter(w => !w.title || !LOCATION_TEXT_PATTERNS.test(w.title))
    .filter(w => !w.title || !/(club|webcam|hotel|resort|camping)/i.test(w.title))
    .filter(w => !w.lastUpdatedOn || (now - new Date(w.lastUpdatedOn).getTime()) < STALE_MS)
    .map(mapCam)
    .filter(c => c.imageUrl);
};

const loadCams = async (apiKey, onProgress) => {
  const base    = Math.floor(Math.random() * 300);
  const offsets = Array.from({ length: 15 }, (_, i) => base + i * 50);
  let firstErr  = null;
  const results = await Promise.allSettled(
    offsets.map(async (off, i) => { const batch = await fetchBatch(apiKey, off); onProgress(i + 1, offsets.length); return batch; })
  );
  const valid = results.filter(r => { if (r.status === "rejected" && !firstErr) firstErr = r.reason; return r.status === "fulfilled"; });
  const all   = valid.flatMap(r => r.value);
  if (all.length === 0 && firstErr) throw firstErr;
  const seen = new Set();
  return all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
};

const refreshImageUrl = async (apiKey, camId) => {
  try {
    const data = await callProxy({ apiKey, webcamId: camId });
    const cam  = data?.webcams?.[0] || data;
    return cam?.images?.current?.preview || cam?.images?.current?.thumbnail || null;
  } catch { return null; }
};

const randOrigin = () => `${20 + Math.floor(Math.random() * 60)}% ${20 + Math.floor(Math.random() * 60)}%`;

// ══════════════════════════════════════════════════════════════════════════════
export default function GeoWatch() {
  const [screen,        setScreen]       = useState("boot");
  const [lang,          setLang]         = useState("en");
  const [apiInput,      setApiInput]     = useState("");
  const [apiError,      setApiError]     = useState("");
  const [loadProg,      setLoadProg]     = useState([0, 15]);
  const [camLoading,    setCamLoading]   = useState(false);
  const [pool,          setPool]         = useState([]);
  const [username,      setUsername]     = useState("");
  const [rounds,        setRounds]       = useState(5);
  const [gameRounds,    setGameRounds]   = useState(5);
  const [sequence,      setSequence]     = useState([]);
  const [roundIdx,      setRoundIdx]     = useState(0);
  const [options,       setOptions]      = useState([]);
  const [timeLeft,      setTimeLeft]     = useState(ROUND_TIME);
  const [selected,      setSelected]     = useState(null);
  const [roundScores,   setRoundScores]  = useState([]);
  const [camImgUrl,     setCamImgUrl]    = useState(null);
  const [imgLoading,    setImgLoading]   = useState(true);
  const [imgUnusable,   setImgUnusable]  = useState(false);
  const [funFact,       setFunFact]      = useState(null);
  const [funFactLoad,   setFunFactLoad]  = useState(false);
  const [funFactError,  setFunFactError] = useState(null);
  const [leaderboard,   setLeaderboard]  = useState({ five: [], ten: [], fifteen: [], twenty: [] });
  const [lbLoading,     setLbLoading]    = useState(false);
  const [duelCode,      setDuelCode]     = useState("");
  const [joinInput,     setJoinInput]    = useState("");
  const [duelMeta,      setDuelMeta]     = useState(null);
  const [isDuel,        setIsDuel]       = useState(false);
  const [duelResult,    setDuelResult]   = useState(null);
  const [joinError,     setJoinError]    = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [showApiBtn,    setShowApiBtn]   = useState(false);
  const [faqOpen,       setFaqOpen]      = useState(new Set());
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [dailyResult,   setDailyResult]  = useState(null);
  const [dailyLB,       setDailyLB]      = useState([]);
  const [dailyCount,    setDailyCount]   = useState(0);
  const [countdown,     setCountdown]    = useState("");
  // ── Feature 1: region filter
  const [region,        setRegion]       = useState("all");
  const [regionWarning, setRegionWarning] = useState("");
  // ── Feature 2: streak
  const [streak,        setStreak]       = useState(0);
  const [maxStreak,     setMaxStreak]    = useState(0);
  const [newRecord,     setNewRecord]    = useState(false);
  // ── Feature 3: zoom mode
  const [zoomMode,      setZoomMode]     = useState(false);
  const [zoomOrigin,    setZoomOrigin]   = useState("50% 50%");
  // ── Feature 4: hints
  const [hintContUsed,  setHintContUsed] = useState(false);
  const [hintClimUsed,  setHintClimUsed] = useState(false);
  const [hintClimText,  setHintClimText] = useState("");
  const [hintClimLoad,  setHintClimLoad] = useState(false);
  const [hintPenalty,   setHintPenalty]  = useState(0);
  const timerRef   = useRef(null);
  // ── Time Attack
  const [isTimeAttack,  setIsTimeAttack] = useState(false);
  const [taLeft,        setTaLeft]       = useState(180);
  const [taRounds,      setTaRounds]     = useState(0);
  const taTimerRef = useRef(null);
  // ── Photo Compare
  const [isPhotoCompare, setIsPhotoCompare] = useState(false);
  const [compareLeft,    setCompareLeft]    = useState(null);
  const [compareRight,   setCompareRight]   = useState(null);
  const [compareTarget,  setCompareTarget]  = useState("");
  const [compareCorrect, setCompareCorrect] = useState(null); // "left"|"right"
  const [compareSelected,setCompareSelected]= useState(null);
  const [compareScores,  setCompareScores]  = useState([]);
  const [compareRound,   setCompareRound]   = useState(0);
  const COMPARE_ROUNDS = 5;
  // ── Friends Leaderboard
  const [friendGroup,    setFriendGroup]   = useState(() => ls.get("geowatch:friendgroup") || null);
  const [friendJoinInput,setFriendJoinInput]= useState("");
  const [friendError,    setFriendError]   = useState("");
  const [friendsLBData,  setFriendsLBData] = useState({ five:[], ten:[], fifteen:[], twenty:[], ta:[] });
  const [friendsLBLoad,  setFriendsLBLoad] = useState(false);
  // ── Time Attack Leaderboard
  const [taLBData,       setTaLBData]      = useState([]);

  const t          = T[lang];
  const currentCam = sequence.length && pool.length ? pool[sequence[roundIdx]] : null;
  const totalScore = roundScores.reduce((a, b) => a + b, 0);
  const roundCount = Math.min(gameRounds, pool.length);

  // ── BOOT ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!supabase) { setScreen("setup"); return; }
      const key   = ENV_WINDY_KEY || ls.get("geowatch:windykey");
      const cache = ls.get("geowatch:camcache");
      if (cache && Date.now() - cache.fetchedAt < CACHE_TTL && cache.cams?.length > 10) {
        setPool(shuffle(cache.cams));
        setScreen(key ? "home" : "setup");
        return;
      }
      if (!key) { setScreen("setup"); return; }
      setScreen("home");
      setCamLoading(true);
      setLoadProg([0, 15]);
      setApiError("");
      try {
        const cams = await loadCams(key, (d, total) => setLoadProg([d, total]));
        if (cams.length < 5) throw new Error(T.en.tooFewCameras);
        const s = shuffle(cams);
        setPool(s);
        ls.set("geowatch:camcache", { cams: s, fetchedAt: Date.now() });
      } catch (err) {
        setApiError(err.message || T.en.unknownError);
        setScreen("setup");
      } finally {
        setCamLoading(false);
      }
    })();
  }, []);

  // ── TIME ATTACK GLOBAL TIMER ─────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "game" || !isTimeAttack || selected !== null) return;
    if (taLeft <= 0) return;
    taTimerRef.current = setInterval(() => {
      setTaLeft(v => {
        if (v <= 1) { clearInterval(taTimerRef.current); endTimeAttack(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(taTimerRef.current);
  }, [screen, isTimeAttack, roundIdx, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SHIFT+ALT+A ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "home") return;
    const handler = (e) => { if (e.shiftKey && e.altKey && e.key === "A") setShowApiBtn(v => !v); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen]);

  // ── NEW STREAK RECORD: auto-clear after 3s ────────────────────────────────
  useEffect(() => {
    if (!newRecord) return;
    const id = setTimeout(() => setNewRecord(false), 3000);
    return () => clearTimeout(id);
  }, [newRecord]);

  // ── UNUSABLE IMAGE: auto-skip after 2s ───────────────────────────────────
  useEffect(() => {
    if (!imgUnusable) return;
    stopTimer();
    const id = setTimeout(() => nextRound(), 2000);
    return () => clearTimeout(id);
  }, [imgUnusable]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── COUNTDOWN bis Mitternacht UTC ────────────────────────────────────────
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${h}h ${m}m`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);

  // ── DAILY PLAYER COUNT ────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "home") return;
    const today = new Date().toISOString().slice(0, 10);
    db.loadDailyLB(today).then(lb => setDailyCount(lb.length));
  }, [screen]);

  // ── CAM-BILD laden/refreshen ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentCam) return;
    setImgLoading(true);
    setCamImgUrl(currentCam.imageUrl);
    setFunFact(null);
    setFunFactLoad(false);
    setFunFactError(null);
    setZoomOrigin(randOrigin());
    setHintContUsed(false);
    setHintClimUsed(false);
    setHintClimText("");
    setHintClimLoad(false);
    setHintPenalty(0);
    setImgUnusable(false);
  }, [currentCam?.id]);

  const handleImgError = useCallback(async () => {
    const apiKey = ENV_WINDY_KEY || ls.get("geowatch:windykey");
    if (!currentCam || !apiKey) { setImgLoading(false); return; }
    const fresh = await refreshImageUrl(apiKey, currentCam.id);
    setCamImgUrl(fresh);
    setImgLoading(false);
  }, [currentCam]);

  // ── AUTO-REFRESH snapshot every 30s ──────────────────────────────────────
  useEffect(() => {
    if (screen !== "game" || !currentCam) return;
    const apiKey = ENV_WINDY_KEY || ls.get("geowatch:windykey");
    if (!apiKey) return;
    const id = setInterval(async () => {
      const fresh = await refreshImageUrl(apiKey, currentCam.id);
      if (fresh) setCamImgUrl(fresh);
    }, 30_000);
    return () => clearInterval(id);
  }, [screen, currentCam?.id]);

  // ── Feature 4: climate hint via Claude ───────────────────────────────────
  const fetchClimateHint = useCallback(async () => {
    if (!currentCam || hintClimText) return;
    setHintClimLoad(true);
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key) { setHintClimLoad(false); return; }
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 80, messages: [{ role: "user", content: `For ${currentCam.city}, ${currentCam.country}: Describe only the climate zone and typical weather in one sentence. Do NOT mention any city name, country name, or region name. Only describe temperature, precipitation, and seasons.` }] }),
      });
      const data = await resp.json();
      const text = data?.content?.[0]?.text?.trim() || "";
      if (text) setHintClimText(text);
    } catch { /* silent */ }
    setHintClimLoad(false);
  }, [currentCam, hintClimText]);

  // ── FETCH CAMS ───────────────────────────────────────────────────────────
  const fetchAndCache = useCallback(async (key) => {
    setScreen("loading"); setLoadProg([0, 15]); setApiError("");
    try {
      const cams = await loadCams(key, (d, total) => setLoadProg([d, total]));
      if (cams.length < 5) throw new Error(t.tooFewCameras);
      const s = shuffle(cams);
      setPool(s);
      ls.set("geowatch:camcache", { cams: s, fetchedAt: Date.now() });
      setScreen("home");
    } catch (err) {
      setApiError(err.message || t.unknownError);
      setScreen("setup");
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

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
    Promise.all([db.loadLB(), db.loadTimeAttackLB()]).then(([lb, ta]) => {
      setLeaderboard(lb);
      setTaLBData(ta);
      setLbLoading(false);
    });
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

  // ── TIME ATTACK ──────────────────────────────────────────────────────────
  const endTimeAttack = useCallback(async () => {
    clearInterval(taTimerRef.current);
    const finalScore = roundScores.reduce((a, b) => a + b, 0);
    saveStats(roundScores, sequence, pool, maxStreak);
    const isPerfect = roundScores.length > 0 && roundScores.every(s => s > 0);
    await db.addTimeAttackScore({ name: username, score: finalScore, rounds_completed: roundScores.length, date: new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-GB"), badges: isPerfect ? 1 : 0 });
    setIsTimeAttack(false);
    setScreen("gameover");
  }, [roundScores, sequence, pool, maxStreak, username, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTimeAttack = useCallback(() => {
    if (!pool.length) return;
    const shuffled = shuffle([...pool]);
    setIsTimeAttack(true);
    setTaLeft(180);
    setTaRounds(0);
    setGameRounds(9999);
    setSequence(shuffled.map((_, i) => i));
    setRoundIdx(0); setRoundScores([]);
    setOptions(getOptions(shuffled[0], shuffled));
    setTimeLeft(20); setSelected(null);
    setIsDuel(false); setDuelMeta(null);
    setIsDailyChallenge(false);
    setStreak(0); setMaxStreak(0); setNewRecord(false);
    setScreen("game");
  }, [pool]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── PHOTO COMPARE ────────────────────────────────────────────────────────
  const startPhotoCompare = useCallback(() => {
    if (pool.length < 10) return;
    const conts = ["EU","NA","SA","AS","AF","OC","ME"];
    const target = conts[Math.floor(Math.random() * conts.length)];
    const inCont    = pool.filter(c => getContinent(c.countryCode) === target && c.imageUrl);
    const notInCont = pool.filter(c => getContinent(c.countryCode) !== target && c.imageUrl);
    if (inCont.length < 1 || notInCont.length < 1) { startPhotoCompare(); return; }
    const correctCam = inCont[Math.floor(Math.random() * inCont.length)];
    const wrongCam   = notInCont[Math.floor(Math.random() * notInCont.length)];
    const isLeft = Math.random() < 0.5;
    setCompareLeft(isLeft ? correctCam : wrongCam);
    setCompareRight(isLeft ? wrongCam : correctCam);
    setCompareTarget(target);
    setCompareCorrect(isLeft ? "left" : "right");
    setCompareSelected(null);
    setCompareScores([]);
    setCompareRound(0);
    setScreen("compare");
  }, [pool]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextCompareRound = useCallback(() => {
    const nextRoundNum = compareRound + 1;
    if (nextRoundNum >= COMPARE_ROUNDS) { setScreen("compare-over"); return; }
    const conts = ["EU","NA","SA","AS","AF","OC","ME"];
    const target = conts[Math.floor(Math.random() * conts.length)];
    const inCont    = pool.filter(c => getContinent(c.countryCode) === target && c.imageUrl);
    const notInCont = pool.filter(c => getContinent(c.countryCode) !== target && c.imageUrl);
    if (inCont.length < 1 || notInCont.length < 1) { nextCompareRound(); return; }
    const correctCam = inCont[Math.floor(Math.random() * inCont.length)];
    const wrongCam   = notInCont[Math.floor(Math.random() * notInCont.length)];
    const isLeft = Math.random() < 0.5;
    setCompareLeft(isLeft ? correctCam : wrongCam);
    setCompareRight(isLeft ? wrongCam : correctCam);
    setCompareTarget(target);
    setCompareCorrect(isLeft ? "left" : "right");
    setCompareSelected(null);
    setCompareRound(nextRoundNum);
  }, [pool, compareRound]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompareAnswer = useCallback((side) => {
    if (compareSelected) return;
    setCompareSelected(side);
    const isCorrect = side === compareCorrect;
    const pts = isCorrect ? 500 : 0;
    setCompareScores(prev => [...prev, pts]);
  }, [compareSelected, compareCorrect]);

  // ── GAME START ───────────────────────────────────────────────────────────
  const startGame = useCallback((seq = null, meta = null, p = null) => {
    const rawPool = p ?? pool;
    let ap = rawPool;
    if (region !== "all") {
      const filtered = rawPool.filter(c => matchRegion(c.continent, region));
      if (filtered.length < 5) {
        setRegionWarning(t.regionTooFew);
        ap = rawPool;
      } else {
        setRegionWarning("");
        ap = filtered;
      }
    }
    const r = meta?.rounds ?? rounds;
    const s = seq ?? buildBalancedSeq(ap, r, "ALL");
    setGameRounds(r);
    setSequence(s); setRoundIdx(0); setRoundScores([]);
    setOptions(getOptions(ap[s[0]], ap));
    setTimeLeft(ROUND_TIME); setSelected(null);
    setIsDuel(!!meta); setDuelMeta(meta);
    setIsDailyChallenge(false);
    setStreak(0); setMaxStreak(0); setNewRecord(false);
    setScreen("game");
  }, [pool, rounds, region, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDailyChallenge = useCallback(() => {
    if (!pool.length) return;
    const seq = getDailySequence(pool);
    setIsDailyChallenge(true);
    setGameRounds(5);
    setSequence(seq); setRoundIdx(0); setRoundScores([]);
    setOptions(getOptions(pool[seq[0]], pool));
    setTimeLeft(ROUND_TIME); setSelected(null);
    setIsDuel(false); setDuelMeta(null);
    setStreak(0); setMaxStreak(0); setNewRecord(false);
    setScreen("game");
  }, [pool]);

  // ── ANSWER ───────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((city) => {
    stopTimer();
    const isCorrect  = city === camLabel(currentCam);
    const newStreak  = isCorrect ? streak + 1 : 0;
    const bonus      = isCorrect ? calcStreakBonus(newStreak) : 0;
    const base       = isCorrect ? calcScore(timeLeft) : 0;
    const earned     = Math.max(0, base + bonus - hintPenalty);
    setSelected(city ?? "__timeout__");
    setRoundScores(prev => [...prev, earned]);
    setStreak(newStreak);
    if (isCorrect && newStreak >= 2 && newStreak > maxStreak) {
      setMaxStreak(newStreak);
      setNewRecord(true);
    }
    if (isCorrect) {
      setFunFactLoad(true);
      fetchFunFact(currentCam.city, currentCam.country, lang)
        .then(fact => { if (fact) setFunFact(fact); setFunFactLoad(false); })
        .catch(() => setFunFactLoad(false));
    }
  }, [currentCam, timeLeft, stopTimer, streak, maxStreak, hintPenalty, lang]);

  // ── NEXT ROUND ───────────────────────────────────────────────────────────
  const nextRound = useCallback(async () => {
    const isLast     = roundIdx + 1 >= roundCount;
    const finalScore = roundScores.reduce((a, b) => a + b, 0);
    if (isLast) {
      if (isDailyChallenge) {
        const today = new Date().toISOString().slice(0, 10);
        try {
          saveStats(roundScores, sequence, pool, maxStreak);
          await db.addDailyScore({ name: username, score: finalScore, date: today });
          ls.set("geowatch:daily:" + today, { played: true, score: finalScore });
          const lb = await db.loadDailyLB(today);
          console.log("Daily LB after save:", lb);
          setDailyLB(lb);
          const myIdx = lb.findIndex(e => e.name === username.trim() && e.score === finalScore);
          setDailyResult({ score: finalScore, rank: myIdx >= 0 ? myIdx + 1 : lb.length, total: lb.length });
        } catch (err) {
          console.error("Daily Challenge save/load error:", err);
          setDailyResult({ score: finalScore, rank: 1, total: 1 });
        }
        setIsDailyChallenge(false);
        setScreen("daily-result");
        return;
      }
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
      saveStats(roundScores, sequence, pool, maxStreak);
      await db.addScore({ name: username, score: finalScore, date: new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-GB"), rounds: gameRounds });
      setScreen("gameover");
    } else {
      const next = roundIdx + 1;
      // In time attack: cycle through shuffled pool indefinitely
      const poolIdx = isTimeAttack ? (next % pool.length) : sequence[next];
      setRoundIdx(next);
      setOptions(getOptions(pool[poolIdx], pool));
      setTimeLeft(isTimeAttack ? 20 : ROUND_TIME); setSelected(null);
      if (isTimeAttack) setTaRounds(n => n + 1);
    }
  }, [roundIdx, roundCount, roundScores, isDailyChallenge, isDuel, duelMeta, username, duelCode, sequence, pool, lang, maxStreak, isTimeAttack]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── DUEL ─────────────────────────────────────────────────────────────────
  const createDuel = useCallback(async () => {
    const code = genCode();
    const seq  = buildBalancedSeq(pool, rounds, "ALL");
    const data = { code, sequence: seq, rounds, challenger_name: username, challenger_score: 0, challenger_done: false, status: "pending", created_at: new Date().toISOString() };
    await db.saveDuel(code, data);
    setDuelCode(code); setDuelMeta(data);
    startGame(seq, { ...data, challenger_done: false });
  }, [username, pool, rounds, startGame]);

  const joinDuel = useCallback(async () => {
    setJoinError("");
    const data = await db.loadDuel(joinInput.toUpperCase());
    if (!data)                  return setJoinError(t.codeNotFound);
    if (data.status === "done") return setJoinError(t.duelEnded);
    if (!data.challenger_done)  return setJoinError(t.challengerPlaying);
    startGame(data.sequence, { ...data, code: joinInput.toUpperCase() });
  }, [joinInput, pool, startGame, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SHARE ─────────────────────────────────────────────────────────────────
  const shareResult = useCallback(() => {
    const canvas = generateShareCard(totalScore, roundScores, maxStreak, gameRounds, lang);
    const shareText = lang === "de"
      ? `Ich habe ${totalScore} Punkte in GeoWatch erreicht! Kannst du das toppen?`
      : `I scored ${totalScore} points in GeoWatch! Can you beat that?`;
    const shareUrl = "https://geowatchgame.lovable.app";
    const download = () => {
      const a = document.createElement("a");
      a.download = "geowatch-result.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "geowatch-result.png", { type: "image/png" });
        const withFile = { files: [file], title: "GeoWatch", text: shareText, url: shareUrl };
        try {
          if (navigator.canShare?.(withFile)) { await navigator.share(withFile); return; }
          await navigator.share({ title: "GeoWatch", text: shareText, url: shareUrl });
        } catch { download(); }
      });
    } else {
      download();
    }
  }, [totalScore, roundScores, maxStreak, gameRounds, lang]);

  // ── HINT HANDLERS ────────────────────────────────────────────────────────
  const useContHint = useCallback(() => {
    if (hintContUsed) return;
    setHintContUsed(true);
    setHintPenalty(prev => prev + 150);
  }, [hintContUsed]);

  const useClimHint = useCallback(() => {
    if (hintClimUsed) return;
    setHintClimUsed(true);
    setHintPenalty(prev => prev + 200);
    fetchClimateHint();
  }, [hintClimUsed, fetchClimateHint]);

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app:     { minHeight:"100vh", background:"#07080d", color:"#c8d0d8", fontFamily:"'Inter',system-ui,sans-serif", fontSize:16, lineHeight:1.6, display:"flex", flexDirection:"column", alignItems:"center" },
    scan:    { position:"fixed", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,0.012) 2px,rgba(0,255,180,0.012) 4px)", pointerEvents:"none", zIndex:9999 },
    hdr:     { width:"100%", maxWidth:900, padding:"20px 24px 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24 },
    logo:    { fontSize:24, fontWeight:900, letterSpacing:"0.15em", color:"#00ffb3", textShadow:"0 0 20px rgba(0,255,179,0.6)", fontFamily:"'Courier New',Courier,monospace" },
    logoBtn: { fontSize:24, fontWeight:900, letterSpacing:"0.15em", color:"#00ffb3", textShadow:"0 0 20px rgba(0,255,179,0.6)", cursor:"pointer", fontFamily:"'Courier New',Courier,monospace" },
    sub:     { fontSize:13, color:"#445566", letterSpacing:"0.18em", fontFamily:"'Courier New',Courier,monospace" },
    card:    { width:"100%", maxWidth:900, padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 },
    inp:     { background:"rgba(0,255,179,0.05)", border:"1px solid rgba(0,255,179,0.3)", borderRadius:4, color:"#c8d0d8", padding:"13px 16px", fontSize:16, fontFamily:"'Inter',system-ui,sans-serif", outline:"none", width:"100%", boxSizing:"border-box" },
    btn:     (v="p") => ({ padding:"13px 24px", borderRadius:4, border:v==="p"?"none":"1px solid rgba(0,255,179,0.4)", background:v==="p"?"linear-gradient(135deg,#00ffb3,#00c8ff)":"transparent", color:v==="p"?"#07080d":"#00ffb3", fontFamily:"'Courier New',Courier,monospace", fontWeight:900, fontSize:14, letterSpacing:"0.15em", cursor:"pointer" }),
    div:     { height:1, background:"rgba(0,255,179,0.1)" },
    stitle:  { fontSize:13, letterSpacing:"0.15em", color:"#556677", textTransform:"uppercase" },
    pill:    { display:"inline-block", padding:"4px 12px", borderRadius:20, background:"rgba(0,255,179,0.1)", border:"1px solid rgba(0,255,179,0.3)", fontSize:14, color:"#00ffb3", fontFamily:"'Courier New',Courier,monospace" },
    g2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
    score:   { fontSize:38, fontWeight:900, color:"#00ffb3", textShadow:"0 0 30px rgba(0,255,179,0.5)", textAlign:"center", fontFamily:"'Courier New',Courier,monospace" },
    tbBar:   (p) => ({ height:4, background:`linear-gradient(90deg,${p>.5?"#00ffb3":p>.25?"#ffcc00":"#ff4455"} ${p*100}%,#1a1f2e ${p*100}%)`, borderRadius:2, transition:"background 0.3s" }),
    optBtn:  (st) => ({ padding:"15px 20px", borderRadius:4, border:`1px solid ${st==="c"?"#00ffb3":st==="w"?"#ff4455":"rgba(255,255,255,0.1)"}`, background:st==="c"?"rgba(0,255,179,0.15)":st==="w"?"rgba(255,68,85,0.15)":"rgba(255,255,255,0.03)", color:st==="c"?"#00ffb3":st==="w"?"#ff4455":"#c8d0d8", cursor:selected?"default":"pointer", fontSize:17, fontFamily:"'Inter',system-ui,sans-serif", fontWeight:600, textAlign:"left", transition:"all 0.15s" }),
    lbRow:   (i) => ({ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", background:i===0?"rgba(0,255,179,0.08)":"rgba(255,255,255,0.02)", borderRadius:4, border:i===0?"1px solid rgba(0,255,179,0.3)":"1px solid rgba(255,255,255,0.05)" }),
    code:    { fontSize:34, fontWeight:900, letterSpacing:"0.4em", color:"#00ffb3", textShadow:"0 0 30px rgba(0,255,179,0.6)", textAlign:"center", padding:"18px 0", fontFamily:"'Courier New',Courier,monospace" },
    infoBox: { background:"rgba(0,255,179,0.04)", border:"1px solid rgba(0,255,179,0.15)", borderRadius:4, padding:"16px 18px", fontSize:15, color:"#7788aa", lineHeight:1.9 },
    errBox:  { background:"rgba(255,68,85,0.08)", border:"1px solid rgba(255,68,85,0.3)", borderRadius:4, padding:"13px 16px", fontSize:15, color:"#ff8899", lineHeight:1.8 },
    warnBox: { background:"rgba(255,170,0,0.08)", border:"1px solid rgba(255,170,0,0.3)", borderRadius:4, padding:"11px 14px", fontSize:14, color:"#ffcc66" },
    rndBtn:  (sel) => ({ padding:"13px", borderRadius:4, border:`1px solid ${sel?"#00ffb3":"rgba(255,255,255,0.1)"}`, background:sel?"rgba(0,255,179,0.12)":"rgba(255,255,255,0.02)", color:sel?"#00ffb3":"#6677aa", fontFamily:"'Courier New',Courier,monospace", fontWeight:900, fontSize:14, letterSpacing:"0.1em", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }),
    rgnBtn:  (sel) => ({ padding:"8px 13px", borderRadius:4, border:`1px solid ${sel?"#00ffb3":"rgba(255,255,255,0.1)"}`, background:sel?"rgba(0,255,179,0.12)":"rgba(255,255,255,0.02)", color:sel?"#00ffb3":"#6677aa", fontFamily:"'Courier New',Courier,monospace", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.15s" }),
    langBtn: (active) => ({ padding:"5px 11px", borderRadius:3, border:`1px solid ${active?"rgba(0,255,179,0.6)":"rgba(0,255,179,0.2)"}`, background:active?"rgba(0,255,179,0.15)":"transparent", color:active?"#00ffb3":"#445566", fontFamily:"'Courier New',Courier,monospace", fontWeight:900, fontSize:13, letterSpacing:"0.1em", cursor:"pointer" }),
    toggleBtn: (on) => ({ padding:"6px 16px", borderRadius:20, border:`1px solid ${on?"rgba(0,255,179,0.6)":"rgba(255,255,255,0.2)"}`, background:on?"rgba(0,255,179,0.15)":"rgba(255,255,255,0.04)", color:on?"#00ffb3":"#6677aa", fontFamily:"'Courier New',Courier,monospace", fontWeight:900, fontSize:13, letterSpacing:"0.1em", cursor:"pointer" }),
    hintBtn: { padding:"10px 14px", borderRadius:4, border:"1px solid rgba(255,204,0,0.3)", background:"rgba(255,204,0,0.05)", color:"#ffcc66", fontFamily:"'Inter',system-ui,sans-serif", fontSize:15, fontWeight:600, cursor:"pointer", flex:1 },
    hintBox: { padding:"12px 16px", borderRadius:4, border:"1px solid rgba(255,204,0,0.2)", background:"rgba(255,204,0,0.05)", fontSize:15, color:"#ffe08a", lineHeight:1.7 },
  };

  const optSt = (city) => !selected ? "n" : city === camLabel(currentCam) ? "c" : city === selected ? "w" : "n";

  const LangSwitch = () => (
    <div style={{ display:"flex", gap:4 }}>
      <button style={S.langBtn(lang==="en")} onClick={() => setLang("en")}>EN</button>
      <button style={S.langBtn(lang==="de")} onClick={() => setLang("de")}>DE</button>
    </div>
  );

  const REGIONS = [
    { key:"all",        label: t.regionAll },
    { key:"europe",     label: t.regionEurope },
    { key:"americas",   label: t.regionAmericas },
    { key:"asia",       label: t.regionAsia },
    { key:"africa",     label: t.regionAfrica },
    { key:"oceania",    label: t.regionOceania },
    { key:"middleeast", label: t.regionMiddleEast },
  ];

  // ── SCREENS ──────────────────────────────────────────────────────────────

  if (screen === "boot") return (
    <div style={{ ...S.app, justifyContent:"center" }}>
      <div style={S.scan} />
      <div style={S.logo}>GEOWATCH</div>
      <div style={{ fontSize:11, color:"#334455", marginTop:8 }}>{t.initializing}</div>
    </div>
  );

  if (screen === "setup") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={pool.length > 0 ? S.logoBtn : S.logo} onClick={() => pool.length > 0 && setScreen("home")}>GEOWATCH</div>
          <LangSwitch />
        </div>
      </div>
      <div style={S.card}>
        <div style={{ textAlign:"center", padding:"12px 0 4px" }}>
          <div style={{ fontSize:13, color:"#6677aa", lineHeight:1.8 }}>
            {lang === "en"
              ? <>Uses the <strong style={{color:"#00ffb3"}}>Windy Webcams API</strong> — over <strong style={{color:"#00ffb3"}}>40,000 cameras</strong> worldwide.</>
              : <>Nutzt die <strong style={{color:"#00ffb3"}}>Windy Webcams API</strong> — über <strong style={{color:"#00ffb3"}}>40.000 Kameras</strong> weltweit.</>
            }
          </div>
        </div>
        <div style={S.div} />
        {!supabase && <div style={S.errBox}><strong style={{color:"#ffaa88"}}>{t.supabaseError}</strong><br/>{t.supabaseErrorDesc}</div>}
        <div style={S.stitle}>{t.step1}</div>
        <div style={S.infoBox}>
          {lang === "en" ? (
            <>1. Open <a href="https://api.windy.com/keys" target="_blank" rel="noreferrer" style={{color:"#00ffb3"}}>api.windy.com/keys</a> and register<br/>2. <em>"Add new key"</em> → Type: <strong>Webcams</strong><br/>3. Copy the key — it takes ~1–2 min to activate</>
          ) : (
            <>1. Öffne <a href="https://api.windy.com/keys" target="_blank" rel="noreferrer" style={{color:"#00ffb3"}}>api.windy.com/keys</a> und registriere dich<br/>2. <em>"Add new key"</em> → Typ: <strong>Webcams</strong><br/>3. Key kopieren — er braucht ca. 1–2 Min. bis er aktiv ist</>
          )}
        </div>
        <div style={S.stitle}>{t.step2}</div>
        <input style={S.inp} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={apiInput} onChange={e => setApiInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submitKey()} />
        {apiError && <div style={S.errBox}><strong style={{color:"#ffaa88"}}>{t.errorLabel}</strong><br/>{apiError}</div>}
        <button style={{ ...S.btn("p"), opacity:(apiInput.trim()&&supabase)?1:0.4, padding:"14px" }}
          disabled={!apiInput.trim()||!supabase} onClick={submitKey}>{t.loadCameras}</button>
        {pool.length > 0 && <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.useCache(pool.length)}</button>}
      </div>
    </div>
  );

  if (screen === "loading") return (
    <div style={{ ...S.app, justifyContent:"center" }}>
      <div style={S.scan} />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:24 }}>
        <div style={S.logo}>GEOWATCH</div>
        <div style={{ fontSize:12, color:"#445566", letterSpacing:"0.2em" }}>{t.loadingCameras}</div>
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
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.logo}>GEOWATCH</div>
            <LangSwitch />
          </div>
          <div style={S.sub}>GLOBAL SURVEILLANCE GAME</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.btn("g")} onClick={() => setScreen("faq")}>FAQ</button>
          <button style={S.btn("g")} onClick={() => setScreen("stats")}>{t.stats}</button>
          <button style={S.btn("g")} onClick={() => setScreen("friends-lb")}>{t.friendsLB}</button>
          <button style={S.btn("g")} onClick={() => setScreen("leaderboard")}>{t.leaderboard}</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ textAlign:"center", padding:"12px 0 4px" }}>
          <div style={{ fontSize:13, color:"#6677aa", lineHeight:1.7 }}>{t.tagline}</div>
          <div style={{ marginTop:10, display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            <span style={S.pill}>{camLoading ? "⟳ LOADING CAMERAS..." : t.camerasLoaded(pool.length)}</span>
          </div>
          {camLoading && (
            <div style={{ width:"100%", height:3, background:"#1a1f2e", borderRadius:2, overflow:"hidden", marginTop:6 }}>
              <div style={{ height:"100%", width:`${(loadProg[0]/loadProg[1])*100}%`, background:"linear-gradient(90deg,#00ffb3,#00c8ff)", borderRadius:2, transition:"width 0.4s" }} />
            </div>
          )}
        </div>
        <div style={S.div} />
        <div style={S.stitle}>{t.scoring}</div>
        <div style={{ background:"rgba(0,255,179,0.04)", border:"1px solid rgba(0,255,179,0.12)", borderRadius:4, padding:"14px 16px", fontSize:13, lineHeight:2.1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"0 16px" }}>
            <span style={{ color:"#00ffb3", fontWeight:700 }}>500</span><span style={{ color:"#6677aa" }}>{t.basePoints}</span>
            <span style={{ color:"#00ffb3", fontWeight:700 }}>+ 0–500</span><span style={{ color:"#6677aa" }}>{t.speedBonus}</span>
            <span style={{ color:"#00ffb3", fontWeight:700 }}>= 1,000</span><span style={{ color:"#6677aa" }}>{t.maxPoints}</span>
            <span style={{ color:"#ff4455", fontWeight:700 }}>0</span><span style={{ color:"#6677aa" }}>{t.zeroPoints}</span>
          </div>
        </div>
        <div style={S.div} />
        <div style={S.stitle}>{t.selectRounds}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
          <button style={S.rndBtn(rounds===5)}  onClick={() => setRounds(5)}>{t.fiveRounds}<br/><span style={{ fontSize:10, opacity:0.6 }}>{t.max5k}</span></button>
          <button style={S.rndBtn(rounds===10)} onClick={() => setRounds(10)}>{t.tenRounds}<br/><span style={{ fontSize:10, opacity:0.6 }}>{t.max10k}</span></button>
          <button style={S.rndBtn(rounds===15)} onClick={() => setRounds(15)}>{t.fifteenRounds}<br/><span style={{ fontSize:10, opacity:0.6 }}>{t.max15k}</span></button>
          <button style={S.rndBtn(rounds===20)} onClick={() => setRounds(20)}>{t.twentyRounds}<br/><span style={{ fontSize:10, opacity:0.6 }}>{t.max20k}</span></button>
        </div>

        {/* ── Feature 1: REGION FILTER ── */}
        <div style={S.div} />
        <div style={S.stitle}>{t.region}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {REGIONS.map(r => (
            <button key={r.key} style={S.rgnBtn(region===r.key)} onClick={() => { setRegion(r.key); setRegionWarning(""); }}>{r.label}</button>
          ))}
        </div>
        {regionWarning && <div style={S.warnBox}>⚠ {regionWarning}</div>}

        {/* ── Feature 3: ZOOM MODE ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, color:"#6677aa", letterSpacing:"0.05em" }}>🔍 {t.zoomModeLabel}</span>
          <button style={S.toggleBtn(zoomMode)} onClick={() => setZoomMode(v => !v)}>{zoomMode ? "ON" : "OFF"}</button>
        </div>

        <div style={S.div} />
        {/* ── DAILY CHALLENGE ── */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const played = ls.get("geowatch:daily:" + today);
          const dateLabel = new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", { day:"numeric", month:"long", year:"numeric" });
          return (
            <div style={{ border:"1px solid rgba(255,204,0,0.35)", borderRadius:6, padding:"14px 16px", background:"rgba(255,204,0,0.04)" }}>
              <div style={{ fontSize:11, color:"#ffcc00", letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace", marginBottom:4 }}>🌍 {t.dailyChallenge}</div>
              <div style={{ fontSize:12, color:"#6677aa", marginBottom:10 }}>{dateLabel} · {t.dailySubtitle(dailyCount)}</div>
              {played ? (
                <div style={{ fontSize:13, color:"#ffcc00" }}>✓ {t.alreadyPlayed} · {t.yourScore}: {played.score.toLocaleString()}</div>
              ) : (
                <button
                  style={{ ...S.btn("p"), width:"100%", background:"linear-gradient(135deg,#ffcc00,#ff9900)", color:"#07080d", opacity:camLoading?0.4:1 }}
                  disabled={camLoading}
                  onClick={() => { if (!username.trim()) { setUsernameError(true); } else { startDailyChallenge(); } }}>
                  {t.startDailyBtn}
                </button>
              )}
            </div>
          );
        })()}
        <div style={S.div} />
        <div style={S.stitle}>{t.operativeId}</div>
        <input style={S.inp} placeholder={t.usernamePlaceholder}
          value={username}
          onChange={e => { setUsername(e.target.value); setUsernameError(false); }}
          onKeyDown={e => { if (e.key === "Enter") { if (!username.trim()) { setUsernameError(true); } else { startGame(); } } }} />
        {usernameError && <div style={{ fontSize:12, color:"#ff8899" }}>{t.usernameRequired}</div>}
        <button style={{ ...S.btn("p"), opacity:(!camLoading)?1:0.4, padding:"14px", fontSize:15 }}
          disabled={camLoading}
          onClick={() => { if (!username.trim()) { setUsernameError(true); } else { startGame(); } }}>{t.startMission(rounds)}</button>
        {/* ── EXTRA MODES ── */}
        <div style={S.g2}>
          <div style={{ border:"1px solid rgba(0,200,255,0.35)", borderRadius:6, padding:"14px 16px", background:"rgba(0,200,255,0.04)", cursor:"pointer" }}
               onClick={() => { if (!username.trim()) { setUsernameError(true); } else { startTimeAttack(); } }}>
            <div style={{ fontSize:11, color:"#00c8ff", letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace", marginBottom:2 }}>{t.timeAttack}</div>
            <div style={{ fontSize:11, color:"#445566" }}>{t.timeAttackSub}</div>
          </div>
          <div style={{ border:"1px solid rgba(180,100,255,0.35)", borderRadius:6, padding:"14px 16px", background:"rgba(180,100,255,0.04)", cursor:"pointer" }}
               onClick={() => { if (!username.trim()) { setUsernameError(true); } else { startPhotoCompare(); } }}>
            <div style={{ fontSize:11, color:"#b464ff", letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace", marginBottom:2 }}>{t.photoCompare}</div>
            <div style={{ fontSize:11, color:"#445566" }}>{t.photoCompareSub}</div>
          </div>
        </div>
        <div style={S.div} />
        <div style={S.stitle}>{t.duels}</div>
        <div style={S.g2}>
          <button style={{ ...S.btn("g"), opacity:!camLoading?1:0.4 }} disabled={camLoading}
            onClick={() => { if (!username.trim()) { setUsernameError(true); } else { createDuel(); } }}>{t.createDuel}</button>
          <button style={S.btn("g")} onClick={() => setScreen("join-duel")}>{t.joinDuelBtn}</button>
        </div>
        {showApiBtn && <button style={{ ...S.btn("g"), fontSize:11, opacity:0.5 }} onClick={() => setScreen("setup")}>{t.reloadCameras}</button>}
      </div>
    </div>
  );

  if (screen === "join-duel") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
          <LangSwitch />
        </div>
        <button style={S.btn("g")} onClick={() => { setJoinError(""); setScreen("home"); }}>{t.back}</button>
      </div>
      <div style={S.card}>
        <div style={S.stitle}>{t.joinDuelTitle}</div>
        <div style={S.stitle}>{t.yourName}</div>
        <input style={S.inp} placeholder="Username..." value={username} onChange={e => setUsername(e.target.value)} />
        <div style={S.stitle}>{t.duelCode}</div>
        <input style={{ ...S.inp, fontSize:24, letterSpacing:"0.3em", textTransform:"uppercase", fontFamily:"'Courier New',Courier,monospace" }}
          placeholder="XXXXXX" value={joinInput} onChange={e => setJoinInput(e.target.value.toUpperCase())} maxLength={6} />
        {joinError && <div style={S.errBox}>⚠ {joinError}</div>}
        <button style={{ ...S.btn("p"), opacity:(username.trim()&&joinInput.length===6)?1:0.4 }}
          disabled={!username.trim()||joinInput.length!==6} onClick={joinDuel}>{t.accept}</button>
      </div>
    </div>
  );

  if (screen === "game" && currentCam) {
    const pct = timeLeft / ROUND_TIME;
    const ans = selected !== null;
    const isCorrect = selected === camLabel(currentCam);
    const earnedBase = isCorrect ? calcScore(timeLeft + 1) : 0;
    const earnedBonus = isCorrect ? calcStreakBonus(streak) : 0;
    return (
      <div style={S.app}>
        <style>{`
          @keyframes gw-spin   { to { transform: rotate(360deg); } }
          @keyframes gw-zoom   { from { transform: scale(3); } to { transform: scale(1); } }
          @keyframes gw-record { 0%{opacity:0;transform:translateY(-4px)} 15%{opacity:1;transform:translateY(0)} 75%{opacity:1} 100%{opacity:0} }
        `}</style>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
              <LangSwitch />
              {isDuel  && <span style={S.pill}>{t.duelBadge}</span>}
              {zoomMode && <span style={{ ...S.pill, borderColor:"rgba(0,200,255,0.4)", color:"#00c8ff" }}>{t.zoomHint}</span>}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#445566", fontFamily:"'Courier New',Courier,monospace" }}>{t.roundLabel}</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#00ffb3", fontFamily:"'Courier New',Courier,monospace" }}>{roundIdx+1} / {roundCount}</div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, color:"#445566" }}>{t.scoreLabel}: <span style={{ color:"#c8d0d8", fontWeight:700 }}>{totalScore}</span></div>
              {isTimeAttack && (
                <div style={{ fontSize:11, color:"#00c8ff", fontFamily:"'Courier New',Courier,monospace", letterSpacing:"0.1em", marginTop:2 }}>
                  ⏱ {t.globalTimer}: <span style={{ fontWeight:900, color: taLeft > 60 ? "#00c8ff" : taLeft > 30 ? "#ffcc00" : "#ff4455" }}>{taLeft}s</span>
                </div>
              )}
              {streak >= 2 && (
                <div style={{ fontSize:12, color: streak >= 5 ? "#ff6644" : "#ffaa00", fontFamily:"'Courier New',Courier,monospace", letterSpacing:"0.1em", marginTop:2 }}>
                  {t.streakLabel(streak)}
                </div>
              )}
              {newRecord && (
                <div style={{ fontSize:10, color:"#ffcc00", fontFamily:"'Courier New',Courier,monospace", letterSpacing:"0.2em", marginTop:2, animation:"gw-record 3s ease-out forwards" }}>
                  ⭐ {t.newRecord}
                </div>
              )}
            </div>
            <div style={{ fontSize:18, fontWeight:900, color:pct>.5?"#00ffb3":pct>.25?"#ffcc00":"#ff4455", fontFamily:"'Courier New',Courier,monospace" }}>{timeLeft}s</div>
          </div>
          <div style={S.tbBar(pct)} />

          {/* ── SNAPSHOT VIEWER ── */}
          <div style={{ position:"relative", width:"100%", aspectRatio:"16/9", background:"#0a0c12", borderRadius:6, overflow:"hidden", border:"1px solid rgba(0,255,179,0.2)" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:60, background:"linear-gradient(to bottom, #07080d 0%, transparent 100%)", zIndex:15, pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:0, right:0, width:"55%", height:36, background:"#07080d", zIndex:15, pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"18%", background:"linear-gradient(to top, #07080d 60%, transparent 100%)", zIndex:15, pointerEvents:"none" }} />
            <div style={{ position:"absolute", top:10, left:12, fontSize:10, letterSpacing:"0.18em", color:"#00ffb3", zIndex:20, background:"rgba(7,8,13,0.8)", padding:"2px 8px", borderRadius:3, fontFamily:"'Courier New',Courier,monospace" }}>
              ● CAM | ID {currentCam.id.slice(-5)}
            </div>
            {imgUnusable && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(7,8,13,0.9)", zIndex:30, gap:8 }}>
                <div style={{ fontSize:12, color:"#ffcc66", letterSpacing:"0.2em", fontFamily:"'Courier New',Courier,monospace" }}>⟳ SKIPPING CAMERA...</div>
                <div style={{ fontSize:11, color:"#445566" }}>Image unreadable</div>
              </div>
            )}
            {camImgUrl ? (
              <img key={currentCam.id} src={camImgUrl} alt="Webcam Snapshot"
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transformOrigin: zoomMode ? zoomOrigin : undefined, animation: zoomMode ? "gw-zoom 30s linear forwards" : undefined }}
                onLoad={(e) => { setImgLoading(false); const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget; if (nw < 50 || nh < 50) setImgUnusable(true); }}
                onError={handleImgError} />
            ) : (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#334455", fontSize:11, letterSpacing:"0.2em" }}>
                {t.noImage}
              </div>
            )}
          </div>

          {/* ── Feature 4: HINT BUTTONS ── */}
          {!ans && (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ ...S.hintBtn, opacity: hintContUsed ? 0.4 : 1 }} disabled={hintContUsed} onClick={useContHint}>{t.hintContinent}</button>
                <button style={{ ...S.hintBtn, opacity: hintClimUsed ? 0.4 : 1 }} disabled={hintClimUsed} onClick={useClimHint}>{t.hintClimate}</button>
              </div>
              {hintContUsed && (
                <div style={S.hintBox}>
                  <span style={{ fontSize:11, color:"#ffcc66", letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace" }}>{t.hintContinentLabel}: </span>
                  {currentCam.continent}
                </div>
              )}
              {hintClimUsed && (
                <div style={S.hintBox}>
                  <span style={{ fontSize:11, color:"#ffcc66", letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace" }}>{t.hintClimateLabel}: </span>
                  {hintClimLoad ? <em style={{ color:"#6677aa" }}>{t.hintLoading}</em> : hintClimText}
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize:13, color:"#445566", letterSpacing:"0.1em" }}>{t.whereIsCamera}</div>
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
                <div style={{ fontSize:11, color:"#445566", marginBottom:4 }}>{t.locationRevealed}</div>
                <div style={{ fontSize:18, fontWeight:900, color:"#00ffb3" }}>{currentCam.flag} {currentCam.city}, {currentCam.country}</div>
                {isCorrect ? (
                  <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:2 }}>
                    <div style={{ fontSize:14, color:"#00ffb3" }}>{t.pointsEarned(earnedBase)}</div>
                    {earnedBonus > 0 && <div style={{ fontSize:13, color:"#ffaa00" }}>{t.streakBonus(earnedBonus)}</div>}
                    {hintPenalty > 0 && <div style={{ fontSize:13, color:"#ff8844" }}>{t.hintPenalty(hintPenalty)}</div>}
                  </div>
                ) : (
                  <div style={{ fontSize:14, color:"#ff4455", marginTop:6 }}>{t.noPoints}</div>
                )}
              </div>

              {currentCam.lat != null && currentCam.lon != null && (
                <iframe
                  title="location-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentCam.lon-0.5},${currentCam.lat-0.5},${currentCam.lon+0.5},${currentCam.lat+0.5}&layer=mapnik&marker=${currentCam.lat},${currentCam.lon}`}
                  style={{ width:"100%", height:200, borderRadius:6, border:"1px solid rgba(0,255,179,0.2)", display:"block" }}
                  loading="lazy"
                />
              )}

              {isCorrect && (
                funFactLoad ? (
                  <div style={{ padding:"12px 16px", background:"rgba(0,255,179,0.03)", borderRadius:4, border:"1px solid rgba(0,255,179,0.1)", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:14, height:14, border:"2px solid #00ffb3", borderTopColor:"transparent", borderRadius:"50%", animation:"gw-spin 0.8s linear infinite", flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"#445566", letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace" }}>{t.loadingFunFact}</span>
                  </div>
                ) : funFactError ? (
                  <div style={{ padding:"12px 16px", background:"rgba(255,68,85,0.08)", borderRadius:4, border:"1px solid rgba(255,68,85,0.3)", fontSize:12, color:"#ff8899", wordBreak:"break-all" }}>
                    <strong style={{ letterSpacing:"0.15em", fontFamily:"'Courier New',Courier,monospace" }}>{t.funFactError}</strong><br/>{funFactError}
                  </div>
                ) : funFact ? (
                  <div style={{ padding:"16px 20px", background:"rgba(0,255,179,0.06)", borderRadius:6, border:"1px solid rgba(0,255,179,0.25)" }}>
                    <div style={{ fontSize:11, color:"#00ffb3", letterSpacing:"0.2em", marginBottom:10, fontFamily:"'Courier New',Courier,monospace" }}>{t.funFact}</div>
                    <div style={{ fontSize:15, color:"#d0d8e0", lineHeight:1.8 }}>{funFact.fact}</div>
                    {funFact.source && (
                      <a href={funFact.url} target="_blank" rel="noreferrer" style={{ display:"block", fontSize:12, color:"#00ffb3", textDecoration:"none", marginTop:8 }}>↗ {funFact.source}</a>
                    )}
                  </div>
                ) : null
              )}
              <button style={S.btn("p")} onClick={nextRound}>{roundIdx+1<roundCount ? t.nextRound : t.results}</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "daily-result" && dailyResult) {
    const shareText = lang === "de"
      ? `Ich habe ${dailyResult.score} Punkte in der GeoWatch Daily Challenge erreicht! 🌍 Platz ${dailyResult.rank} von ${dailyResult.total} Spielern. geowatchgame.vercel.app`
      : `I scored ${dailyResult.score} points in the GeoWatch Daily Challenge! 🌍 Rank ${dailyResult.rank} of ${dailyResult.total} players. geowatchgame.vercel.app`;
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
            <LangSwitch />
          </div>
        </div>
        <div style={S.card}>
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div style={{ fontSize:11, color:"#ffcc00", letterSpacing:"0.2em", marginBottom:8, fontFamily:"'Courier New',Courier,monospace" }}>🌍 {t.dailyChallenge}</div>
            <div style={{ fontSize:11, color:"#445566", letterSpacing:"0.2em", marginBottom:10, fontFamily:"'Courier New',Courier,monospace" }}>{t.dailyComplete}</div>
            <div style={S.score}>{dailyResult.score.toLocaleString()}</div>
            <div style={{ fontSize:15, color:"#ffcc00", marginTop:8, fontWeight:700 }}>{t.dailyRank(dailyResult.rank, dailyResult.total)}</div>
            <div style={{ fontSize:12, color:"#445566", marginTop:6, fontFamily:"'Courier New',Courier,monospace" }}>⏱ {t.nextChallenge(countdown)}</div>
          </div>
          <div style={S.div} />
          <div style={S.stitle}>{t.todayTop}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {dailyLB.map((e, i) => (
              <div key={i} style={{ ...S.lbRow(i), border: e.name === username.trim() ? "1px solid rgba(255,204,0,0.5)" : undefined }}>
                <div style={{ fontSize:14, fontWeight:900, color:i===0?"#ffcc00":i===1?"#aaaacc":i===2?"#cc8866":"#445566", minWidth:24, fontFamily:"'Courier New',Courier,monospace" }}>{i===0?"◈":i===1?"◇":i===2?"◆":`${i+1}.`}</div>
                <div style={{ flex:1, fontSize:15, color: e.name === username.trim() ? "#ffcc00" : undefined }}>{e.name}</div>
                <div style={{ fontWeight:900, color:"#00ffb3", minWidth:60, textAlign:"right", fontFamily:"'Courier New',Courier,monospace" }}>{e.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={S.div} />
          <button style={{ ...S.btn("g"), borderColor:"rgba(0,200,255,0.5)", color:"#00c8ff" }} onClick={() => {
            if (navigator.share) { navigator.share({ title:"GeoWatch Daily", text: shareText }).catch(() => {}); }
            else { const a = document.createElement("a"); a.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`; a.target = "_blank"; a.click(); }
          }}>📤 {t.shareResult}</button>
          <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.mainMenu}</button>
        </div>
      </div>
    );
  }

  if (screen === "gameover") return (
    <div style={S.app}>
      <div style={S.scan} />
      <div style={S.hdr}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
          <LangSwitch />
        </div>
      </div>
      <div style={S.card}>
        <div style={{ textAlign:"center", padding:"12px 0" }}>
          <div style={{ fontSize:11, color:"#445566", letterSpacing:"0.2em", marginBottom:10, fontFamily:"'Courier New',Courier,monospace" }}>{t.missionComplete(gameRounds)}</div>
          <div style={S.score}>{totalScore}</div>
          <div style={{ fontSize:12, color:"#6677aa", marginTop:4 }}>{t.pointsMax(gameRounds * MAX_SCORE)}</div>
          {maxStreak >= 2 && <div style={{ fontSize:12, color:"#ffaa00", marginTop:6, fontFamily:"'Courier New',Courier,monospace" }}>{t.streakLabel(maxStreak)} MAX</div>}
        </div>
        <div style={S.div} />
        <div style={S.stitle}>{t.roundSummary}</div>
        {roundScores.map((s, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,0.02)", borderRadius:4, border:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize:13, color:"#6677aa" }}>{t.roundN(i+1)} · {pool[sequence[i]]?.city} {pool[sequence[i]]?.flag}</span>
            <span style={{ fontWeight:700, color:s>0?"#00ffb3":"#ff4455" }}>{s>0?`+${s}`:"0"}</span>
          </div>
        ))}
        <div style={S.div} />
        <div style={S.g2}>
          <button style={S.btn("p")} onClick={() => startGame()}>{t.playAgain}</button>
          <button style={{ ...S.btn("g"), borderColor:"rgba(0,200,255,0.5)", color:"#00c8ff" }} onClick={shareResult}>{t.shareResult}</button>
        </div>
        <div style={S.g2}>
          <button style={S.btn("g")} onClick={() => setScreen("leaderboard")}>{t.leaderboard}</button>
          <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.mainMenu}</button>
        </div>
      </div>
    </div>
  );

  if (screen === "leaderboard") {
    const lbRankColor = (i) => i===0?"#ffcc00":i===1?"#aaaacc":i===2?"#cc8866":"#445566";
    const lbRankLabel = (i) => i===0?"◈":i===1?"◇":i===2?"◆":`${i+1}.`;
    const LbCol = ({ entries }) => (
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {entries.length === 0
          ? <div style={{ color:"#445566", fontSize:12, padding:"8px 0" }}>{t.noEntries}</div>
          : entries.map((e, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:i===0?"rgba(0,255,179,0.08)":"rgba(255,255,255,0.02)", borderRadius:4, border:i===0?"1px solid rgba(0,255,179,0.3)":"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize:12, fontWeight:900, color:lbRankColor(i), minWidth:20, fontFamily:"'Courier New',Courier,monospace" }}>{lbRankLabel(i)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</div>
                <div style={{ fontSize:10, color:"#445566" }}>{e.date}</div>
              </div>
              <div style={{ fontWeight:900, color:"#00ffb3", fontSize:13, fontFamily:"'Courier New',Courier,monospace", flexShrink:0 }}>{e.score}</div>
            </div>
          ))
        }
      </div>
    );
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
            <LangSwitch />
          </div>
          <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.back}</button>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:18, fontWeight:900, letterSpacing:"0.2em", color:"#c8d0d8", fontFamily:"'Courier New',Courier,monospace" }}>{t.leaderboardTitle}</div>
          {lbLoading ? (
            <div style={{ textAlign:"center", color:"#445566", padding:40 }}>{t.loading}</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <div style={{ ...S.stitle, marginBottom:8 }}>{t.fiveRounds}</div>
                <LbCol entries={leaderboard.five} />
              </div>
              <div>
                <div style={{ ...S.stitle, marginBottom:8 }}>{t.tenRounds}</div>
                <LbCol entries={leaderboard.ten} />
              </div>
              <div>
                <div style={{ ...S.stitle, marginBottom:8 }}>{t.fifteenRounds}</div>
                <LbCol entries={leaderboard.fifteen} />
              </div>
              <div>
                <div style={{ ...S.stitle, marginBottom:8 }}>{t.twentyRounds}</div>
                <LbCol entries={leaderboard.twenty} />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <div style={{ ...S.stitle, marginBottom:8, color:"#00c8ff" }}>⏱ {t.timeAttackLabel}</div>
                <LbCol entries={taLBData} />
              </div>
            </div>
          )}
          {username.trim()
            ? <button style={{ ...S.btn("p"), marginTop:8 }} onClick={() => startGame()}>{t.play}</button>
            : <button style={{ ...S.btn("g"), marginTop:8 }} onClick={() => setScreen("home")}>{t.backToMenu}</button>
          }
          <div style={S.div} />
          <div style={S.stitle}>{t.badgeRanking}</div>
          <div style={{ background:"rgba(0,255,179,0.04)", border:"1px solid rgba(0,255,179,0.12)", borderRadius:4, padding:"12px 16px", fontSize:12, lineHeight:2.2 }}>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"0 14px" }}>
              <span>🏅</span><span style={{ color:"#6677aa" }}>1–9 {t.perfectRounds}</span>
              <span>⭐</span><span style={{ color:"#6677aa" }}>10–19 {t.perfectRounds}</span>
              <span>💎</span><span style={{ color:"#6677aa" }}>20–49 {t.perfectRounds}</span>
              <span>👑</span><span style={{ color:"#6677aa" }}>50+ {t.perfectRounds}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "stats") {
    const st = ls.get(STATS_KEY) || emptyStats();
    const accPct = st.totalAnswers > 0 ? Math.round(st.correctAnswers / st.totalAnswers * 100) : 0;
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
            <LangSwitch />
          </div>
          <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.back}</button>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:18, fontWeight:900, letterSpacing:"0.2em", color:"#c8d0d8", fontFamily:"'Courier New',Courier,monospace" }}>{t.statsTitle}</div>
          {st.gamesPlayed === 0 ? (
            <div style={{ textAlign:"center", color:"#445566", padding:40 }}>{t.noStats}</div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  [t.gamesPlayed,  st.gamesPlayed],
                  [t.totalScore,   st.totalScore.toLocaleString()],
                  [t.bestGame,     st.bestScore.toLocaleString()],
                  [t.accuracy,     `${accPct}%`],
                  [t.bestStreak,   `🔥 ${st.bestStreak}x`],
                  [t.correct,      `${st.correctAnswers} / ${st.totalAnswers}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ background:"rgba(0,255,179,0.04)", border:"1px solid rgba(0,255,179,0.12)", borderRadius:4, padding:"12px 14px" }}>
                    <div style={{ fontSize:10, color:"#445566", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#00ffb3", fontFamily:"'Courier New',Courier,monospace" }}>{val}</div>
                  </div>
                ))}
              </div>

              {Object.keys(st.continentStats).length > 0 && (
                <>
                  <div style={S.div} />
                  <div style={S.stitle}>{t.byContinent}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {(() => {
                      // Alle bekannten englischen Vollnamen → Code-Map
                      const nameToCode = {};
                      Object.entries(CONTINENT_NAMES.en).forEach(([code, name]) => { nameToCode[name] = code; });
                      // Auch deutsche Namen mappen
                      Object.entries(CONTINENT_NAMES.de).forEach(([code, name]) => { nameToCode[name] = code; });
                      // Alte Einträge (voller Name) + neue (Code) zusammenführen
                      const merged = {};
                      Object.entries(st.continentStats).forEach(([cont, data]) => {
                        const code = nameToCode[cont] || cont;
                        if (!merged[code]) merged[code] = { correct:0, total:0 };
                        merged[code].correct += data.correct;
                        merged[code].total   += data.total;
                      });
                      return Object.entries(merged)
                        .sort((a,b) => b[1].total - a[1].total)
                        .map(([cont, data]) => {
                          const pct = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
                          return (
                            <div key={cont}>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, marginBottom:4 }}>
                                <span style={{ color:"#c8d0d8" }}>{contName(cont, lang)}</span>
                                <span style={{ color:"#6677aa" }}>{pct}%&nbsp;({data.correct}/{data.total})</span>
                              </div>
                              <div style={{ height:5, background:"#1a1f2e", borderRadius:3, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#00ffb3,#00c8ff)", borderRadius:3, transition:"width 0.4s" }} />
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </>
              )}

              <div style={S.div} />
              <div style={S.stitle}>{t.recentGames}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {st.recentGames.map((g, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,0.02)", borderRadius:4, border:"1px solid rgba(255,255,255,0.05)", fontSize:13 }}>
                    <span style={{ color:"#6677aa" }}>{g.date}</span>
                    <span style={{ color:"#6677aa" }}>{g.correct}/{g.rounds} {t.correct}</span>
                    <span style={{ fontWeight:900, color:"#00ffb3", fontFamily:"'Courier New',Courier,monospace" }}>{g.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={S.div} />
              {/* ── STREAK CALENDAR ── */}
              {(() => {
                const dates   = ls.get(PLAYDATES_KEY) || [];
                const dateSet = new Set(dates);
                const today   = new Date();
                const days    = 112; // 16 weeks
                const cells   = [];
                for (let i = days - 1; i >= 0; i--) {
                  const d = new Date(today);
                  d.setDate(today.getDate() - i);
                  cells.push(d.toISOString().slice(0, 10));
                }
                const dayStreak = calcDayStreak(dates);
                const awards = [
                  { key:"d3",  label:"3 Days",  labelDe:"3 Tage",  days:3,  icon:"🔥" },
                  { key:"w1",  label:"Weekly",  labelDe:"Woche",   days:7,  icon:"⭐" },
                  { key:"m1",  label:"Monthly", labelDe:"Monat",   days:30, icon:"💎" },
                ];
                return (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={S.stitle}>{lang==="de"?"SPIELKALENDER":"PLAY CALENDAR"}</div>
                      <span style={{ fontSize:12, color:"#00ffb3", fontFamily:"'Courier New',Courier,monospace" }}>🔥 {dayStreak} {lang==="de"?"Tage":"day"} streak</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(16, 1fr)", gap:3 }}>
                      {cells.map(d => (
                        <div key={d} title={d} style={{ aspectRatio:"1", borderRadius:2, background: dateSet.has(d) ? "linear-gradient(135deg,#00ffb3,#00c8ff)" : "rgba(255,255,255,0.05)" }} />
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:4 }}>
                      {awards.map(a => {
                        const earned = dayStreak >= a.days;
                        return (
                          <div key={a.key} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:4, border:`1px solid ${earned?"rgba(0,255,179,0.4)":"rgba(255,255,255,0.06)"}`, background:earned?"rgba(0,255,179,0.07)":"transparent", opacity:earned?1:0.4 }}>
                            <span>{a.icon}</span>
                            <span style={{ fontSize:11, color:earned?"#00ffb3":"#445566" }}>{lang==="de"?a.labelDe:a.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
              <div style={S.div} />
              <button style={{ ...S.btn("g"), fontSize:12, opacity:0.6 }} onClick={() => { ls.set(STATS_KEY, emptyStats()); setScreen("home"); }}>{t.resetStats}</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (screen === "faq") {
    const items = FAQ_DATA[lang] || FAQ_DATA.en;
    const toggle = (i) => setFaqOpen(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
            <LangSwitch />
          </div>
          <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.back}</button>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:18, fontWeight:900, letterSpacing:"0.2em", color:"#c8d0d8", fontFamily:"'Courier New',Courier,monospace" }}>FAQ</div>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {items.map(({ q, a }, i) => (
              <div key={i} style={{ borderBottom:"1px solid rgba(0,255,179,0.08)" }}>
                <button
                  onClick={() => toggle(i)}
                  style={{ width:"100%", background:"none", border:"none", padding:"16px 4px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, cursor:"pointer", textAlign:"left" }}
                >
                  <span style={{ fontSize:14, fontWeight:700, color:"#00ffb3", lineHeight:1.5, flex:1 }}>{q}</span>
                  <span style={{ fontSize:18, color:"#00ffb3", fontWeight:900, flexShrink:0, marginTop:1, fontFamily:"'Courier New',Courier,monospace", opacity:0.7 }}>{faqOpen.has(i) ? "−" : "+"}</span>
                </button>
                <div style={{ overflow:"hidden", maxHeight: faqOpen.has(i) ? "600px" : "0", transition:"max-height 0.3s ease" }}>
                  <div style={{ padding:"0 4px 16px", fontSize:14, color:"#8899aa", lineHeight:1.8 }}>{a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "duel-result" && duelResult) {
    const isCh = duelResult.role === "challenger";
    return (
      <div style={S.app}>
        <div style={S.scan} />
        <div style={S.hdr}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.logoBtn} onClick={() => setScreen("home")}>GEOWATCH</div>
            <LangSwitch />
          </div>
        </div>
        <div style={S.card}>
          {isCh ? (
            <>
              <div style={{ textAlign:"center", padding:"12px 0" }}>
                <div style={{ fontSize:11, color:"#445566", marginBottom:10, fontFamily:"'Courier New',Courier,monospace" }}>{t.yourScore}</div>
                <div style={S.score}>{duelResult.myScore}</div>
              </div>
              <div style={{ padding:"16px", background:"rgba(0,255,179,0.05)", borderRadius:4, border:"1px solid rgba(0,255,179,0.2)" }}>
                <div style={{ fontSize:11, color:"#445566", marginBottom:6, fontFamily:"'Courier New',Courier,monospace" }}>{t.codeForOpponent}</div>
                <div style={S.code}>{duelResult.duelCode}</div>
                <div style={{ fontSize:12, color:"#6677aa", textAlign:"center" }}>{t.opponentInstruction}</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:11, color:"#445566", textAlign:"center", padding:"10px 0", fontFamily:"'Courier New',Courier,monospace" }}>{t.result}</div>
              <div style={S.g2}>
                {[
                  { label: t.you(username),        score:duelResult.myScore,       win:duelResult.myScore>=duelResult.opponentScore, color:"#00ffb3" },
                  { label: duelResult.opponentName, score:duelResult.opponentScore, win:duelResult.opponentScore>duelResult.myScore,  color:"#ff4455" },
                ].map(p => (
                  <div key={p.label} style={{ padding:16, background:p.win?"rgba(0,255,179,0.08)":"rgba(255,255,255,0.02)", borderRadius:4, border:`1px solid ${p.win?"rgba(0,255,179,0.3)":"rgba(255,255,255,0.1)"}`, textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"#445566", marginBottom:4 }}>{p.label}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:p.color, fontFamily:"'Courier New',Courier,monospace" }}>{p.score}</div>
                    {p.win && <div style={{ fontSize:11, color:p.color, marginTop:4, fontFamily:"'Courier New',Courier,monospace" }}>{t.winner}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={S.div} />
          <div style={S.g2}>
            <button style={S.btn("p")} onClick={() => startGame()}>{t.playSolo}</button>
            <button style={S.btn("g")} onClick={() => setScreen("home")}>{t.menu}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PHOTO COMPARE SCREEN ──────────────────────────────────────────────────
  if (screen === "compare") {
    const taPct = timeLeft / 20;
    const totalCmpScore = compareScores.reduce((a,b)=>a+b,0);
    return (
      <div style={S.app}>
        <div style={S.scan}/>
        <div style={S.hdr}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={S.logoBtn} onClick={()=>setScreen("home")}>GEOWATCH</div>
            <LangSwitch/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#b464ff",fontFamily:"'Courier New',Courier,monospace"}}>{compareRound+1} / {COMPARE_ROUNDS}</div>
        </div>
        <div style={S.card}>
          <div style={{fontSize:11,color:"#b464ff",letterSpacing:"0.15em",fontFamily:"'Courier New',Courier,monospace",marginBottom:6}}>🖼 {t.photoCompareQ(contName(compareTarget))}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {["left","right"].map(side=>{
              const cam = side==="left"?compareLeft:compareRight;
              const isSelected = compareSelected===side;
              const isCorrect  = compareCorrect===side;
              const showResult = !!compareSelected;
              return (
                <div key={side} style={{position:"relative",cursor:compareSelected?"default":"pointer",borderRadius:6,overflow:"hidden",border:`2px solid ${showResult?(isCorrect?"#00ffb3":"#ff4455"):"rgba(180,100,255,0.4)"}`,transition:"border 0.3s"}}
                     onClick={()=>handleCompareAnswer(side)}>
                  {cam?.imageUrl && <img src={cam.imageUrl} alt="" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",display:"block"}}/>}
                  {showResult && (
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:isCorrect?"rgba(0,255,179,0.25)":"rgba(255,68,85,0.25)",fontSize:28}}>
                      {isCorrect?"✓":"✗"}
                    </div>
                  )}
                  {isSelected && !isCorrect && <div style={{position:"absolute",bottom:4,left:0,right:0,textAlign:"center",fontSize:10,color:"#ff4455",fontFamily:"monospace"}}>{contName(getContinent(cam?.countryCode))}</div>}
                  {showResult && isCorrect && <div style={{position:"absolute",bottom:4,left:0,right:0,textAlign:"center",fontSize:10,color:"#00ffb3",fontFamily:"monospace"}}>{cam?.city}, {cam?.country}</div>}
                </div>
              );
            })}
          </div>
          {compareSelected && (
            <div style={{textAlign:"center",marginTop:10}}>
              <div style={{fontSize:16,fontWeight:900,color:compareSelected===compareCorrect?"#00ffb3":"#ff4455",fontFamily:"monospace"}}>
                {compareSelected===compareCorrect?"+500 pts":"0 pts"}
              </div>
              <div style={{fontSize:11,color:"#445566",marginTop:2}}>{t.scoreLabel}: {totalCmpScore}</div>
              {compareRound+1 < COMPARE_ROUNDS
                ? <button style={{...S.btn("p"),marginTop:10}} onClick={nextCompareRound}>{t.nextRound}</button>
                : <button style={{...S.btn("p"),marginTop:10}} onClick={()=>setScreen("compare-over")}>{t.results}</button>
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "compare-over") {
    const total = compareScores.reduce((a,b)=>a+b,0);
    const correct = compareScores.filter(s=>s>0).length;
    return (
      <div style={S.app}>
        <div style={S.scan}/>
        <div style={S.hdr}>
          <div style={S.logoBtn} onClick={()=>setScreen("home")}>GEOWATCH</div>
          <LangSwitch/>
        </div>
        <div style={S.card}>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:"0.2em",color:"#b464ff",fontFamily:"'Courier New',Courier,monospace",marginBottom:8}}>🖼 {t.photoCompare}</div>
          <div style={{fontSize:36,fontWeight:900,color:"#00ffb3",fontFamily:"monospace",textAlign:"center",margin:"16px 0"}}>{total.toLocaleString()}</div>
          <div style={{textAlign:"center",fontSize:13,color:"#6677aa",marginBottom:16}}>{correct} / {COMPARE_ROUNDS} {t.correct}</div>
          <div style={S.g2}>
            <button style={S.btn("p")} onClick={startPhotoCompare}>{t.playAgain}</button>
            <button style={S.btn("g")} onClick={()=>setScreen("home")}>{t.mainMenu}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── FRIENDS LEADERBOARD SCREEN ────────────────────────────────────────────
  if (screen === "friends-lb") {
    return (
      <div style={S.app}>
        <div style={S.scan}/>
        <div style={S.hdr}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={S.logoBtn} onClick={()=>setScreen("home")}>GEOWATCH</div>
            <LangSwitch/>
          </div>
          <button style={S.btn("g")} onClick={()=>setScreen("home")}>{t.back}</button>
        </div>
        <div style={S.card}>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:"0.2em",color:"#c8d0d8",fontFamily:"'Courier New',Courier,monospace"}}>{t.friendsTitle}</div>

          {!friendGroup ? (
            <>
              <div style={{fontSize:13,color:"#6677aa",margin:"12px 0"}}>
                {lang==="de"?"Erstelle eine Gruppe und teile den Code mit Freunden, oder trete einer bestehenden Gruppe bei.":"Create a group and share the code with friends, or join an existing group."}
              </div>
              <button style={{...S.btn("p"),marginBottom:8}} onClick={async()=>{
                if(!username.trim()){setFriendError(lang==="de"?"Bitte zuerst Benutzernamen eingeben":"Please enter a username first");return;}
                const code=genCode();
                await db.createFriendGroup(code, username.trim());
                const g={code,members:[username.trim()]};
                setFriendGroup(g); ls.set("geowatch:friendgroup",g);
              }}>{t.createGroup}</button>
              <div style={{fontSize:11,color:"#445566",textAlign:"center",margin:"4px 0"}}>{lang==="de"?"— oder —":"— or —"}</div>
              <input style={{...S.inp,marginBottom:8}} placeholder={t.groupCode} value={friendJoinInput} onChange={e=>setFriendJoinInput(e.target.value.toUpperCase())}/>
              <button style={S.btn("g")} onClick={async()=>{
                if(!username.trim()){setFriendError(lang==="de"?"Bitte zuerst Benutzernamen eingeben":"Please enter a username first");return;}
                const members=await db.joinFriendGroup(friendJoinInput.trim(),username.trim());
                if(!members){setFriendError(t.groupNotFound);return;}
                const g={code:friendJoinInput.trim(),members};
                setFriendGroup(g); ls.set("geowatch:friendgroup",g);
              }}>{t.joinGroup}</button>
              {friendError&&<div style={{fontSize:12,color:"#ff8899",marginTop:6}}>{friendError}</div>}
            </>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0",padding:"10px 14px",background:"rgba(0,255,179,0.06)",borderRadius:4,border:"1px solid rgba(0,255,179,0.2)"}}>
                <div>
                  <div style={{fontSize:10,color:"#445566",letterSpacing:"0.15em"}}>{t.groupCode}</div>
                  <div style={{fontSize:20,fontWeight:900,color:"#00ffb3",fontFamily:"monospace",letterSpacing:"0.2em"}}>{friendGroup.code}</div>
                  <div style={{fontSize:11,color:"#445566"}}>{friendGroup.members?.length||1} {t.members}: {(friendGroup.members||[]).join(", ")}</div>
                </div>
              </div>
              <button style={{...S.btn("g"),marginBottom:4}} onClick={()=>{navigator.clipboard?.writeText(t.inviteText(friendGroup.code));}}>
                {t.copyCode}
              </button>
              <button style={{...S.btn("g"),fontSize:11,opacity:0.5,marginBottom:12}} onClick={()=>{setFriendGroup(null);ls.set("geowatch:friendgroup",null);}}>
                {lang==="de"?"Gruppe verlassen":"Leave Group"}
              </button>
              {friendsLBLoad ? (
                <div style={{textAlign:"center",color:"#445566",padding:20}}>{t.loading}</div>
              ) : (
                <>
                  <button style={{...S.btn("p"),marginBottom:12}} onClick={async()=>{
                    setFriendsLBLoad(true);
                    const d=await db.loadFriendsLB(friendGroup.members||[username]);
                    setFriendsLBData(d); setFriendsLBLoad(false);
                  }}>{lang==="de"?"🔄 LADEN":"🔄 LOAD"}</button>
                  {["five","ten","fifteen","twenty"].map((key,i)=>{
                    const labels=[t.fiveRounds,t.tenRounds,t.fifteenRounds,t.twentyRounds];
                    return friendsLBData[key]?.length>0&&(
                      <div key={key} style={{marginBottom:12}}>
                        <div style={{...S.stitle,marginBottom:6}}>{labels[i]}</div>
                        <LbCol entries={friendsLBData[key]}/>
                      </div>
                    );
                  })}
                  {friendsLBData.ta?.length>0&&(
                    <div>
                      <div style={{...S.stitle,marginBottom:6}}>{t.timeAttackLabel}</div>
                      <LbCol entries={friendsLBData.ta}/>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return <div style={{ color:"#00ffb3", padding:40 }}>{t.loading}</div>;
}