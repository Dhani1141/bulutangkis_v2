import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Sparkles } from 'lucide-react'
import LeaderboardPanel from '../components/LeaderboardPanel'
import GlassCard from '../components/GlassCard'
import { getSession } from '../lib/firebaseHelpers'
import { getAICommentary } from '../lib/aiHelpers'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiCommentary, setAiCommentary] = useState('')
  const [isLoadingAi, setIsLoadingAi] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      const sessionId = localStorage.getItem('currentSessionId')
      if (!sessionId) {
        navigate('/')
        return
      }

      try {
        const data = await getSession(sessionId)
        if (!data) {
          navigate('/')
          return
        }
        setSessionData(data)
      } catch (err) {
        console.error('Failed to load session:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [navigate])

      useEffect(() => {
    if (!sessionData || !sessionData.playerStats) return

    const fetchCommentary = async () => {
      setIsLoadingAi(true)
      
      const allStats = sessionData.playerStats

      const playersList = Object.entries(allStats).map(([name, stats]) => ({
        name,
        totalMatches: stats.total_matches,
        totalWins: stats.total_wins,
        winRate: stats.total_matches > 0 ? (stats.total_wins / stats.total_matches) * 100 : 0
      }))

      // Sort highest win rate first
      playersList.sort((a, b) => b.winRate - a.winRate)

      const commentary = await getAICommentary(playersList, "the entire session")
      setAiCommentary(commentary)
      setIsLoadingAi(false)
    }

    fetchCommentary()
  }, [sessionData])

  // ── Loading ──
  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    )
  }

  if (!sessionData) return null

  const sessionId = localStorage.getItem('currentSessionId')

  return (
    <motion.div
      className="relative z-10 min-h-screen p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
        >
          <BarChart3 size={48} className="mx-auto mb-4 text-accent-cyan" />
        </motion.div>
        <motion.h1
          className="text-4xl md:text-5xl font-black bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Leaderboard
        </motion.h1>
        <motion.p
          className="text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {sessionId}
        </motion.p>
      </div>

      {/* ── Leaderboards ── */}
      <div className="max-w-2xl mx-auto mb-8">
        <LeaderboardPanel
          fieldKey="Session"
          playerStats={sessionData.playerStats}
        />
      </div>

      {/* ── AI Insights Card ── */}
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.0 }} // after the leaderboard numbers finish counting up
      >
        <GlassCard className="!p-6 border-accent-purple/30 bg-accent-purple/5">
          <h2 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-accent-purple" />
            AI Insights
          </h2>
          {isLoadingAi ? (
            <div className="flex items-center gap-3 text-white/40">
              <div className="w-4 h-4 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
              <p className="text-sm animate-pulse">The commentator is clearing their throat...</p>
            </div>
          ) : (
            <p className="text-white/80 leading-relaxed italic border-l-2 border-accent-purple/50 pl-4">
              "{aiCommentary}"
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* ── New Session button (fades in after animations) ── */}
      <motion.div
        className="flex justify-center mt-12 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
      >
        <button
          onClick={() => {
            localStorage.removeItem('currentSessionId')
            localStorage.removeItem('fieldCount')
            navigate('/')
          }}
          className="glass-button text-white/50 hover:text-white"
        >
          <ArrowLeft size={18} />
          New Session
        </button>
      </motion.div>
    </motion.div>
  )
}
