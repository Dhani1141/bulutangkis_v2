import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, Play, Layers, Shuffle, Trash2 } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { createSession, deleteSession } from '../lib/firebaseHelpers'
import { generateTeams } from '../lib/matchmaking'

export default function SetupPage() {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState('')
  const [fieldCount, setFieldCount] = useState(1)
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Auto-generate Session ID from current date
  useEffect(() => {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    setSessionId(`Session-${dd}-${mm}-${yyyy}`)
  }, [])

  const updatePlayer = (index, value) => {
    const updated = [...players]
    updated[index] = value
    setPlayers(updated)
  }

  const addPlayer = () => setPlayers([...players, ''])

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleResetSession = async () => {
    if (!sessionId) return
    const confirmed = window.confirm(
      `Are you sure you want to completely DELETE all dummy data for ${sessionId}? This action cannot be undone.`
    )
    if (!confirmed) return

    setIsResetting(true)
    setError('')
    setSuccessMsg('')
    try {
      await deleteSession(sessionId)
      localStorage.removeItem('currentSessionId')
      localStorage.removeItem('fieldCount')
      setSuccessMsg(`Successfully cleared dummy data for ${sessionId}.`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Failed to reset session:', err)
      setError('Failed to clear database data.')
    } finally {
      setIsResetting(false)
    }
  }

  const validate = () => {
    const valid = players.filter((p) => p.trim() !== '')

    if (valid.length < 4) {
      setError('Minimum 4 players required.')
      return false
    }
    if (valid.length % 2 !== 0) {
      setError('Total players must be an even number for 2v2 pairings.')
      return false
    }

    const unique = new Set(valid.map((p) => p.trim().toLowerCase()))
    if (unique.size !== valid.length) {
      setError('Player names must be unique.')
      return false
    }

    if (fieldCount === 2 && valid.length < 8) {
      setError('Minimum 8 players required for 2 courts (4 per court).')
      return false
    }

    setError('')
    return true
  }

  const handleStart = async () => {
    if (!validate()) return
    setIsLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const valid = players.filter((p) => p.trim() !== '').map((p) => p.trim())
      const fields = {}

      if (fieldCount === 1) {
        fields.field1 = { players: valid, teams: generateTeams(valid) }
      } else {
        // Split evenly — ensure each half is even
        const half = Math.floor(valid.length / 2)
        const adjusted = half % 2 !== 0 ? half + 1 : half
        const f1 = valid.slice(0, adjusted)
        const f2 = valid.slice(adjusted)

        fields.field1 = { players: f1, teams: generateTeams(f1) }
        fields.field2 = { players: f2, teams: generateTeams(f2) }
      }

      await createSession(sessionId, fieldCount, fields)
      localStorage.setItem('currentSessionId', sessionId)
      localStorage.setItem('fieldCount', String(fieldCount))
      navigate('/match')
    } catch (err) {
      console.error(err)
      setError(
        'Failed to create session. Check your Firebase configuration in src/firebase.js',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const validCount = players.filter((p) => p.trim()).length

  return (
    <motion.div
      className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-2xl pt-8 pb-12">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent mb-3 tracking-tight">
            BukkuTangkis
          </h1>
          <p className="text-white/40 text-lg">
            Badminton Matchmaker &amp; Score Tracker
          </p>
        </motion.div>

        {/* ── Reset Session Data (Testing) ── */}
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleResetSession}
            disabled={isResetting || !sessionId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all text-sm font-semibold disabled:opacity-50"
          >
            {isResetting ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Clear Dummy Data (Reset DB)
          </button>
        </motion.div>

        {/* ── Session ID ── */}
        <GlassCard className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <Layers size={18} className="text-accent-cyan" />
            <span className="text-sm font-medium text-white/50">
              Session ID
            </span>
          </div>
          <p className="text-xl font-bold text-white/90 ml-[30px]">
            {sessionId}
          </p>
        </GlassCard>

        {/* ── Court Count ── */}
        <GlassCard className="mb-5" transition={{ delay: 0.05 }}>
          <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Shuffle size={20} className="text-accent-purple" />
            Number of Courts
          </h2>
          <div className="flex gap-3">
            {[1, 2].map((count) => (
              <button
                key={count}
                onClick={() => setFieldCount(count)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 border ${
                  fieldCount === count
                    ? 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue shadow-lg shadow-accent-blue/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/50'
                }`}
              >
                {count} Court{count > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* ── Player List ── */}
        <GlassCard className="mb-5" transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Users size={20} className="text-accent-green" />
            Players
            <span className="ml-auto text-sm font-normal text-white/30">
              {validCount} player{validCount !== 1 ? 's' : ''}
            </span>
          </h2>

          {/* Single Input Field */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Type player name and press Enter..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const val = e.target.value.trim()
                  if (val && !players.includes(val)) {
                    setPlayers([...players, val])
                    e.target.value = ''
                  }
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-blue focus:bg-white/10 transition-all"
            />
          </div>

          {/* Player Tags */}
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
            {players.map((player, index) => (
              player.trim() !== '' && (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5"
                >
                  <span className="text-white/90 text-sm font-medium">{player}</span>
                  <button
                    onClick={() => removePlayer(index)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            ))}
          </div>
        </GlassCard>

        {/* ── Error & Success ── */}
        {error && (
          <motion.div
            className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        {successMsg && (
          <motion.div
            className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {successMsg}
          </motion.div>
        )}

        {/* ── Start Button ── */}
        <motion.button
          onClick={handleStart}
          disabled={isLoading}
          className="glass-button-success w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          ) : (
            <>
              <Play size={20} />
              Start Session
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
