import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { Trophy, Medal, Award, User, Target } from 'lucide-react'
import GlassCard from './GlassCard'

const RANK_CONFIG = [
  { Icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/30' },
  { Icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300/20', border: 'border-gray-300/20' },
  { Icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/20', border: 'border-amber-600/20' },
]

export default function LeaderboardPanel({ fieldKey, playerStats }) {
  const [players, setPlayers] = useState([])
  const [sorted, setSorted] = useState(false)

  useEffect(() => {
    // Build player list with win rates
    const list = Object.entries(playerStats || {}).map(([name, stats]) => ({
      name,
      totalMatches: stats.total_matches,
      totalWins: stats.total_wins,
      winRate:
        stats.total_matches > 0
          ? (stats.total_wins / stats.total_matches) * 100
          : 0,
    }))

    // Start unsorted (as-is order from Firebase)
    setPlayers(list)
    setSorted(false)

    // After count-up animation finishes (~2.5s), sort by win rate
    const timer = setTimeout(() => {
      setPlayers((prev) =>
        [...prev].sort((a, b) => {
          if (b.winRate !== a.winRate) return b.winRate - a.winRate
          if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins
          return a.name.localeCompare(b.name)
        }),
      )
      setSorted(true)
    }, 2800)

    return () => clearTimeout(timer)
  }, [playerStats])

  return (
    <div>
      <motion.h2
        className="text-2xl font-bold text-white/90 mb-6 flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Trophy size={24} className="text-accent-orange" />
        {fieldKey === 'field1' ? 'Field 1' : 'Field 2'}
      </motion.h2>

      <div className="space-y-3">
        {(!players || players.length === 0) ? (
          <div className="text-center p-6 text-white/30 italic text-sm glass rounded-2xl">
            Belum ada data pemain.
          </div>
        ) : (
          players.map((player, idx) => {
            const rank = sorted ? RANK_CONFIG[idx] : null
            const RankIcon = rank?.Icon || User

            return (
              <motion.div
                key={`${player?.name || 'unknown'}-${idx}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  layout: { type: 'spring', damping: 25, stiffness: 200 },
                  delay: idx * 0.1,
                }}
              >
                <div
                  className={`glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-500 ${
                    sorted && idx === 0
                      ? 'border-yellow-400/30 bg-yellow-400/5'
                      : ''
                  }`}
                >
                  {/* Rank badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                      rank ? rank.bg : 'bg-white/5'
                    }`}
                  >
                    {sorted ? (
                      <RankIcon
                        size={20}
                        className={rank ? rank.color : 'text-white/30'}
                      />
                    ) : (
                      <span className="text-white/30 text-sm font-medium">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Player name & stats */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white/90 truncate">
                      {player?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-white/30">
                      {player?.totalWins || 0} menang — {player?.totalMatches || 0} pertandingan
                    </p>
                  </div>

                  {/* Win Rate with count-up animation */}
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-accent-cyan tabular-nums">
                      <CountUp
                        end={player?.winRate || 0}
                        duration={2.2}
                        decimals={1}
                        suffix="%"
                        useEasing
                      />
                    </div>
                    <p className="text-[10px] text-white/30 flex items-center gap-1 justify-end mt-0.5">
                      <Target size={10} />
                      Win Rate
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
