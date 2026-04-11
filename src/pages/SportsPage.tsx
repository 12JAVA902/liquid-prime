import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const transfers = [
  { player: "Kylian Mbappé", from: "PSG", to: "Real Madrid", fee: "Free" },
  { player: "Julian Alvarez", from: "Man City", to: "Atletico Madrid", fee: "€75M" },
  { player: "Joao Felix", from: "Chelsea", to: "Chelsea", fee: "€50M" },
  { player: "Dani Olmo", from: "RB Leipzig", to: "Barcelona", fee: "€55M" },
  { player: "Joshua Zirkzee", from: "Bologna", to: "Man United", fee: "€42M" },
  { player: "Pedro Neto", from: "Wolves", to: "Chelsea", fee: "€60M" },
  { player: "Leny Yoro", from: "Lille", to: "Man United", fee: "€62M" },
  { player: "Savinho", from: "Troyes", to: "Man City", fee: "€40M" },
];

type Tab = "epl" | "laliga" | "transfers";

const SportsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("epl");

  const renderTable = (data: typeof eplTable) => (
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
            <motion.tr
              key={row.team}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`border-t border-border/20 ${i < 4 ? "text-foreground" : "text-foreground/70"}`}
            >
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
    <div className="min-h-screen bg-background">
      <div className="liquid-glass-elevated safe-area-top">
        <div className="flex items-center gap-3 px-5 py-4 relative z-10">
          <button onClick={() => navigate(-1)} className="depth-press"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-headline text-foreground text-base">Sports Hub</span>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3">
        {([["epl", "EPL"], ["laliga", "La Liga"], ["transfers", "Transfers"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`depth-press px-4 py-2 rounded-xl text-sm font-medium ${tab === key ? "bg-primary text-primary-foreground" : "liquid-glass text-foreground relative z-10"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {tab === "epl" && <div className="liquid-glass rounded-2xl p-3 relative z-10">{renderTable(eplTable)}</div>}
            {tab === "laliga" && <div className="liquid-glass rounded-2xl p-3 relative z-10">{renderTable(laligaTable)}</div>}
            {tab === "transfers" && (
              <div className="space-y-2">
                {transfers.map((t, i) => (
                  <motion.div
                    key={t.player}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="liquid-glass rounded-2xl p-4 relative z-10"
                  >
                    <p className="text-sm font-semibold text-foreground">{t.player}</p>
                    <div className="flex items-center gap-2 mt-1 text-caption text-muted-foreground">
                      <span>{t.from}</span>
                      <ArrowUpDown className="w-3 h-3" />
                      <span>{t.to}</span>
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
