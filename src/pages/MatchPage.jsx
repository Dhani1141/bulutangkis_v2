import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import FieldPanel from '../components/FieldPanel'
import GlassCard from '../components/GlassCard'
import { getSession, endSessionGlobal } from '../lib/firebaseHelpers'
import { smartSelectMatch } from '../lib/matchmaking'

export default function MatchPage() {
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  
  // Lifted State for Global Queue
  const [playerStats, setPlayerStats] = useState({})
  const [activeMatches, setActiveMatches] = useState({ field1: null, field2: null })
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
        setPlayerStats(data.playerStats || {})
      } catch (err) {
        console.error('Failed to load session:', err)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [navigate])

  const handleRequestMatch = useCallback((fieldKey) => {
    if (!sessionData) return null

    // Determine who is currently playing across all courts
    const playing = new Set()
    Object.values(activeMatches).forEach(match => {
      if (match) {
        match.teamA.players.forEach(p => playing.add(p))
        match.teamB.players.forEach(p => playing.add(p))
      }
    })

    // Filter available players
    const availablePlayers = sessionData.players.filter(p => !playing.has(p))
    
    // Sort strictly by total_matches (ASC)
    availablePlayers.sort((a, b) => {
      const matchesA = playerStats[a]?.total_matches || 0
      const matchesB = playerStats[b]?.total_matches || 0
      return matchesA - matchesB
    })

    if (availablePlayers.length < 4) return null

    // Pick top 4 priority players
    const top4 = availablePlayers.slice(0, 4)
    
    // Balance these 4 players using AI logic
    const balancedMatch = smartSelectMatch(top4, playerStats)
    
    if (balancedMatch) {
      setActiveMatches(prev => ({ ...prev, [fieldKey]: balancedMatch }))
      return balancedMatch
    }
    
    return null
  }, [sessionData, activeMatches, playerStats])

  const handleMatchEnd = useCallback((allPlayersInMatch, winnerPlayers) => {
    // Update local stats so they get pushed to bottom of queue
    setPlayerStats(prev => {
      const nextStats = { ...prev }
      allPlayersInMatch.forEach(p => {
        if (!nextStats[p]) nextStats[p] = { total_matches: 0, total_wins: 0 }
        nextStats[p].total_matches += 1
        if (winnerPlayers.includes(p)) {
          nextStats[p].total_wins += 1
        }
      })
      return nextStats
    })
  }, [])

  const handleClearCourt = useCallback((fieldKey) => {
    setActiveMatches(prev => ({ ...prev, [fieldKey]: null }))
  }, [])

  // ── Loading ──
  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </div>
    )
  }

  if (!sessionData) return null

  const sessionId = localStorage.getItem('currentSessionId')
  const fieldCount = sessionData.fieldCount

  // Calculate Global Queue for UI display
  const currentlyPlaying = new Set()
  Object.values(activeMatches).forEach(match => {
    if (match) {
      match.teamA.players.forEach(p => currentlyPlaying.add(p))
      match.teamB.players.forEach(p => currentlyPlaying.add(p))
    }
  })

  const globalQueueData = sessionData.players
    .filter(p => !currentlyPlaying.has(p))
    .map(name => {
      const s = playerStats[name] || { total_matches: 0, total_wins: 0 }
      return {
        name,
        matches: s.total_matches,
        wins: s.total_wins,
        winRate: s.total_matches > 0 ? s.total_wins / s.total_matches : 0.5
      }
    })
    .sort((a, b) => {
      if (a.matches !== b.matches) return a.matches - b.matches;
      return b.winRate - a.winRate; // secondary sort
    })

  const handleEndGlobalSession = async () => {
    // Validation
    const hasActiveMatches = Object.values(activeMatches).some(match => match !== null)
    
    if (hasActiveMatches) {
      alert("Sesi tidak bisa diakhiri: Masih ada pertandingan aktif yang belum disubmit. Harap submit atau batalkan terlebih dahulu.")
      return
    }

    try {
      await endSessionGlobal(sessionId)
      navigate('/leaderboard')
    } catch (err) {
      console.error('Failed to end global session:', err)
      alert('Gagal mengakhiri sesi. Silakan coba lagi.')
    }
  }

  return (
    <motion.div
      className="relative z-10 min-h-screen p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-6 relative">
        <h1 className="text-3xl font-black bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          BukkuTangkis
        </h1>
        <p className="text-white/30 text-sm mt-1">{sessionId}</p>
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleEndGlobalSession}
            className="glass-button-danger text-sm px-6 py-2"
          >
            Akhiri Sesi
          </button>
        </div>
      </div>

      {/* ── Global Waiting Room ── */}
      {globalQueueData.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <GlassCard className="!p-4 bg-accent-blue/5 border-accent-blue/20">
            <h3 className="text-sm font-semibold text-accent-blue flex items-center gap-2 mb-3">
              <Users size={16} />
              Ruang Tunggu Global
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {globalQueueData.map((p, idx) => (
                <motion.div
                  key={p.name}
                  className="glass rounded-lg p-3 flex flex-col gap-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 font-bold shrink-0">{idx + 1}.</span>
                    <span className="text-white/90 font-semibold truncate">{p.name}</span>
                  </div>
                  <div className="text-xs text-white/40 pl-5">
                    {p.matches} pertandingan
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Fields — split-screen if 2 courts ── */}
      <div
        className={`grid gap-6 ${
          fieldCount === 2 ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'
        }`}
      >
        {sessionData.field1 && (
          <FieldPanel
            fieldKey="field1"
            sessionId={sessionId}
            currentMatch={activeMatches.field1}
            onRequestMatch={() => handleRequestMatch('field1')}
            onMatchEnd={handleMatchEnd}
            onClearCourt={() => handleClearCourt('field1')}
          />
        )}
        {fieldCount === 2 && sessionData.field2 && (
          <FieldPanel
            fieldKey="field2"
            sessionId={sessionId}
            currentMatch={activeMatches.field2}
            onRequestMatch={() => handleRequestMatch('field2')}
            onMatchEnd={handleMatchEnd}
            onClearCourt={() => handleClearCourt('field2')}
          />
        )}
      </div>
    </motion.div>
  )
}
