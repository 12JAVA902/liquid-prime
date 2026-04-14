import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, ArrowUpDown, Timer, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidBackground from "@/components/LiquidBackground";

const eplTable = [
  { pos: 1, team: "Arsenal", p: 38, w: 28, d: 6, l: 4, gd: 62, pts: 90 },
  { pos: 2, team: "Liverpool", p: 38, w: 27, d: 7, l: 4, gd: 55, pts: 88 },
  { pos: 3, team: "Man City", p: 38, w: 26, d: 7, l: 5, gd: 58, pts: 85 },
  { pos: 4, team: "Chelsea", p: 38, w: 22, d: 8, l: 8, gd: 30, pts: 74 },
  { pos: 5, team: "Aston Villa", p: 38, w: 21, d: 7, l: 10, gd: 20, pts: 70 },
  { pos: 6, team: "Newcastle", p: 38, w: 20, d: 6, l: 12, gd: 22, pts: 66 },
  { pos: 7, team: "Brighton", p: 38, w: 18, d: 9, l: 11, gd: 14, pts: 63 },
  { pos: 8, team: "Man United", p: 38, w: 17, d: 6, l: 15, gd: 2, pts: 57 },
  { pos: 9, team: "Tottenham", p: 38, w: 17, d: 5, l: 16, gd: 8, pts: 56 },
  { pos: 10, team: "West Ham", p: 38, w: 16, d: 7, l: 15, gd: -2, pts: 55 },
];

const laligaTable = [
  { pos: 1, team: "Real Madrid", p: 38, w: 29, d: 4, l: 5, gd: 52, pts: 91 },
  { pos: 2, team: "Barcelona", p: 38, w: 27, d: 7, l: 4, gd: 56, pts: 88 },
  { pos: 3, team: "Atletico Madrid", p: 38, w: 24, d: 7, l: 7, gd: 35, pts: 79 },
  { pos: 4, team: "Athletic Bilbao", p: 38, w: 21, d: 8, l: 9, gd: 18, pts: 71 },
  { pos: 5, team: "Real Sociedad", p: 38, w: 19, d: 10, l: 9, gd: 16, pts: 67 },
  { pos: 6, team: "Villarreal", p: 38, w: 18, d: 9, l: 11, gd: 12, pts: 63 },
  { pos: 7, team: "Real Betis", p: 38, w: 17, d: 8, l: 13, gd: 5, pts: 59 },
  { pos: 8, team: "Sevilla", p: 38, w: 15, d: 9, l: 14, gd: -2, pts: 54 },
];

const uclTable = [
  { pos: 1, team: "Man City", p: 6, w: 5, d: 1, l: 0, gd: 12, pts: 16 },
  { pos: 2, team: "Real Madrid", p: 6, w: 5, d: 0, l: 1, gd: 10, pts: 15 },
  { pos: 3, team: "Bayern Munich", p: 6, w: 4, d: 1, l: 1, gd: 11, pts: 13 },
  { pos: 4, team: "Inter Milan", p: 6, w: 4, d: 1, l: 1, gd: 7, pts: 13 },
  { pos: 5, team: "Arsenal", p: 6, w: 4, d: 0, l: 2, gd: 5, pts: 12 },
  { pos: 6, team: "PSG", p: 6, w: 3, d: 2, l: 1, gd: 6, pts: 11 },
  { pos: 7, team: "Barcelona", p: 6, w: 3, d: 1, l: 2, gd: 4, pts: 10 },
  { pos: 8, team: "Dortmund", p: 6, w: 3, d: 1, l: 2, gd: 3, pts: 10 },
];

const nbaStandings = [
  { pos: 1, team: "Boston Celtics", w: 64, l: 18, pct: ".780", gb: "-" },
  { pos: 2, team: "OKC Thunder", w: 57, l: 25, pct: ".695", gb: "7" },
  { pos: 3, team: "Denver Nuggets", w: 57, l: 25, pct: ".695", gb: "7" },
  { pos: 4, team: "Minnesota Wolves", w: 56, l: 26, pct: ".683", gb: "8" },
  { pos: 5, team: "Cleveland Cavs", w: 48, l: 34, pct: ".585", gb: "16" },
  { pos: 6, team: "Dallas Mavericks", w: 50, l: 32, pct: ".610", gb: "14" },
  { pos: 7, team: "LA Clippers", w: 51, l: 31, pct: ".622", gb: "13" },
  { pos: 8, team: "Phoenix Suns", w: 49, l: 33, pct: ".598", gb: "15" },
];

const f1Standings = [
  { pos: 1, driver: "Max Verstappen", team: "Red Bull", pts: 575 },
  { pos: 2, driver: "Lando Norris", team: "McLaren", pts: 374 },
  { pos: 3, driver: "Charles Leclerc", team: "Ferrari", pts: 356 },
  { pos: 4, driver: "Oscar Piastri", team: "McLaren", pts: 292 },
  { pos: 5, driver: "Carlos Sainz", team: "Ferrari", pts: 290 },
  { pos: 6, driver: "Lewis Hamilton", team: "Mercedes", pts: 223 },
  { pos: 7, driver: "George Russell", team: "Mercedes", pts: 217 },
  { pos: 8, driver: "Sergio Perez", team: "Red Bull", pts: 152 },
];

const liveScores = [
  { home: "Arsenal", away: "Liverpool", scoreH: 2, scoreA: 1, time: "67'", league: "EPL", status: "LIVE" },
  { home: "Barcelona", away: "Real Madrid", scoreH: 1, scoreA: 1, time: "HT", league: "La Liga", status: "LIVE" },
  { home: "Bayern Munich", away: "PSG", scoreH: 3, scoreA: 0, time: "82'", league: "UCL", status: "LIVE" },
  { home: "Lakers", away: "Celtics", scoreH: 98, scoreA: 102, time: "Q3 4:20", league: "NBA", status: "LIVE" },
];

const transfers = [
  { player: "Kylian Mbappé", from: "PSG", to: "Real Madrid", fee: "Free" },
  { player: "Julian Alvarez", from: "Man City", to: "Atletico Madrid", fee: "€75M" },
  { player: "Dani Olmo", from: "RB Leipzig", to: "Barcelona", fee: "€55M" },
  { player: "Joshua Zirkzee", from: "Bologna", to: "Man United", fee: "€42M" },
  { player: "Pedro Neto", from: "Wolves", to: "Chelsea", fee: "€60M" },
  { player: "Leny Yoro", from: "Lille", to: "Man United", fee: "€62M" },
  { player: "Savinho", from: "Troyes", to: "Man City", fee: "€40M" },
  { player: "Joao Neves", from: "Benfica", to: "PSG", fee: "€70M" },
];

type Tab = "live" | "epl" | "laliga" | "ucl" | "nba" | "f1" | "transfers";

const SportsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("live");

  const tabs: { key: Tab; label: string }[] = [
    { key: "live", label: "🔴 Live" },
    { key: "epl", label: "EPL" },
    { key: "laliga", label: "La Liga" },
    { key: "ucl", label: "UCL" },
    { key: "nba", label: "NBA" },
    { key: "f1", label: "F1" },
    { key: "transfers", label: "Transfers" },
  ];

  const renderFootballTable = (data: typeof eplTable) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground text-caption">
            <th className="text-left p-2">#</th>
            <th className="text-left p-2">Team</th>
            <th className="p-2">P</th>
            <th className="p-2">W</th>
            <th className="p-2">D</th>
            <th className="p-2">L</th>
            <th className="p-2">GD</th>
            <th className="p-2 font-bold text-foreground">Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr key={row.team} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`border-t border-border/20 ${i < 4 ? "text-foreground" : "text-foreground/70"}`}>
              <td className="p-2 font-medium">{row.pos}</td>
              <td className="p-2 font-medium">{row.team}</td>
              <td className="p-2 text-center">{row.p}</td>
              <td className="p-2 text-center">{row.w}</td>
              <td className="p-2 text-center">{row.d}</td>
              <td className="p-2 text-center">{row.l}</td>
              <td className="p-2 text-center">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="p-2 text-center font-bold">{row.pts}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      <LiquidBackground />
      <div className="liquid-glass-elevated safe-area-top relative z-10">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-headline text-foreground text-base">Sports Hub</span>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none relative z-10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`depth-press px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground relative z-10"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {tab === "live" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">Live Matches</span>
                </div>
                {liveScores.map((match, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="liquid-glass-elevated rounded-2xl p-4 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-caption text-primary font-semibold">{match.league}</span>
                      <span className="flex items-center gap-1 text-caption text-destructive font-semibold">
                        <Timer className="w-3 h-3" />{match.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold text-foreground">{match.home}</p>
                      </div>
                      <div className="px-4 py-1.5 mx-3 rounded-xl bg-primary/20 min-w-[70px] text-center">
                        <span className="text-lg font-bold text-primary">{match.scoreH} - {match.scoreA}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-foreground">{match.away}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {tab === "epl" && <div className="liquid-glass rounded-2xl p-3 relative z-10">{renderFootballTable(eplTable)}</div>}
            {tab === "laliga" && <div className="liquid-glass rounded-2xl p-3 relative z-10">{renderFootballTable(laligaTable)}</div>}
            {tab === "ucl" && <div className="liquid-glass rounded-2xl p-3 relative z-10">{renderFootballTable(uclTable)}</div>}

            {tab === "nba" && (
              <div className="liquid-glass rounded-2xl p-3 relative z-10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-caption">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Team</th>
                      <th className="p-2">W</th>
                      <th className="p-2">L</th>
                      <th className="p-2">PCT</th>
                      <th className="p-2">GB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nbaStandings.map((row, i) => (
                      <motion.tr key={row.team} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-t border-border/20 text-foreground">
                        <td className="p-2 font-medium">{row.pos}</td>
                        <td className="p-2 font-medium">{row.team}</td>
                        <td className="p-2 text-center">{row.w}</td>
                        <td className="p-2 text-center">{row.l}</td>
                        <td className="p-2 text-center">{row.pct}</td>
                        <td className="p-2 text-center">{row.gb}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "f1" && (
              <div className="liquid-glass rounded-2xl p-3 relative z-10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-caption">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Driver</th>
                      <th className="text-left p-2">Team</th>
                      <th className="p-2 font-bold text-foreground">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f1Standings.map((row, i) => (
                      <motion.tr key={row.driver} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-t border-border/20 text-foreground">
                        <td className="p-2 font-medium">{row.pos}</td>
                        <td className="p-2 font-medium">{row.driver}</td>
                        <td className="p-2 text-muted-foreground">{row.team}</td>
                        <td className="p-2 text-center font-bold">{row.pts}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "transfers" && (
              <div className="space-y-2">
                {transfers.map((t, i) => (
                  <motion.div key={t.player} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="liquid-glass rounded-2xl p-4 relative z-10">
                    <p className="text-sm font-semibold text-foreground">{t.player}</p>
                    <div className="flex items-center gap-2 mt-1 text-caption text-muted-foreground">
                      <span>{t.from}</span><ArrowUpDown className="w-3 h-3" /><span>{t.to}</span>
                      <span className="ml-auto text-primary font-medium">{t.fee}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SportsPage;
