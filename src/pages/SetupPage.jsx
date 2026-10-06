import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Play, Layers, Shuffle, Trash2, History, Trophy } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import JellyRadio from '../components/JellyRadio'
import { createSession, deleteSession, getGlobalPlayerStats } from '../lib/firebaseHelpers'

export default function SetupPage() {
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState('')
  const [fieldCount, setFieldCount] = useState(1)
  const [players, setPlayers] = useState([])
  const [globalStats, setGlobalStats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Auto-generate Session ID from current date & load global stats
  useEffect(() => {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    setSessionId(`Session-${dd}-${mm}-${yyyy}`)

    getGlobalPlayerStats()
      .then((data) => {
        // Sort by win rate / total matches
        data.sort((a, b) => {
           const wrA = a.total_matches ? a.total_wins / a.total_matches : 0
           const wrB = b.total_matches ? b.total_wins / b.total_matches : 0
           if (wrB !== wrA) return wrB - wrA
           return b.total_matches - a.total_matches
        })
        setGlobalStats(data)
      })
      .catch((err) => console.error('Failed to load global stats', err))
  }, [])

  const updatePlayer = (index, value) => {
    const updated = [...players]
    updated[index] = value
    setPlayers(updated)
  }

  const addHistoricalPlayer = (name) => {
    if (!players.includes(name)) {
      setPlayers([...players, name])
    }
  }

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleResetSession = async () => {
    if (!sessionId) return
    const confirmed = window.confirm(
      `Yakin ingin menghapus semua data untuk ${sessionId}? Tindakan ini tidak bisa dibatalkan.`
    )
    if (!confirmed) return

    setIsResetting(true)
    setError('')
    setSuccessMsg('')
    try {
      await deleteSession(sessionId)
      localStorage.removeItem('currentSessionId')
      localStorage.removeItem('fieldCount')
      setSuccessMsg(`Data ${sessionId} berhasil direset.`)
      setTimeout(() => setSuccessMsg(''), 4000)
      window.location.reload()
    } catch (err) {
      console.error('Failed to reset session:', err)
      setError(`Gagal menghapus data: ${err.message}`)
    } finally {
      setIsResetting(false)
    }
  }

  const validate = () => {
    const valid = players.filter((p) => p.trim() !== '')

    if (valid.length < 4) {
      setError('Minimal 4 pemain dibutuhkan.')
      return false
    }
    if (valid.length % 2 !== 0) {
      setError('Jumlah pemain harus genap untuk pasangan 2v2.')
      return false
    }

    const unique = new Set(valid.map((p) => p.trim().toLowerCase()))
    if (unique.size !== valid.length) {
      setError('Nama pemain harus unik (tidak boleh sama).')
      return false
    }

    if (fieldCount === 2 && valid.length < 8) {
      setError('Minimal 8 pemain dibutuhkan untuk 2 lapangan (4 per lapangan).')
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

      await createSession(sessionId, fieldCount, valid)
      localStorage.setItem('currentSessionId', sessionId)
      localStorage.setItem('fieldCount', String(fieldCount))
      navigate('/match')
    } catch (err) {
      console.error(err)
      setError(`Gagal membuat sesi: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const validCount = players.filter((p) => p.trim()).length
  
  // Filter out already selected players AND dummy test data using Regex
  const availableHistory = globalStats
    .map(stat => stat.name)
    .filter(name => {
      if (players.includes(name)) return false
      if (/^\d+$/.test(name)) return false // Ignore if it consists ONLY of numbers
      return true
    })

  return (
    <motion.div
      className="relative z-10 min-h-screen flex items-center justify-center pt-32 p-4 md:pt-6 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-2xl pb-12">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent mb-3 tracking-tight">
            BuluTangkis
          </h1>
          <p className="text-white/40 text-lg">
            Pengatur Pertandingan &amp; Pencatat Skor Bulu Tangkis
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
            className="liquid-pill flex items-center gap-2 px-5 py-2.5 rounded-full text-red-400 hover:text-red-300 transition-all text-sm font-semibold disabled:opacity-50"
          >
            {isResetting ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Reset Data
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
            Jumlah Lapangan
          </h2>
          <div className="flex w-full">
            <JellyRadio
              className="w-full flex"
              items={['1 Lapangan', '2 Lapangan']}
              defaultValue={fieldCount === 1 ? '1 Lapangan' : '2 Lapangan'} 
              onChange={(value) => {
                const selectedCourts = value === '1 Lapangan' ? 1 : 2;
                setFieldCount(selectedCourts);
              }}
              chipColor="rgba(255, 255, 255, 0.14)" 
              activeColor="#4f46e5" 
              textColor="#e4e4e7" 
              activeTextColor="#ffffff"
              size="xl"
              gap={12}
              radius={999}
              swell={0.2}
              barge={6}
              shrink={0.05}
              jelly={1}
              bounce={0.25}
              stagger={22}
              stiffness={580}
            />
          </div>
        </GlassCard>

        {/* ── Player List ── */}
        <GlassCard className="mb-5" transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Users size={20} className="text-accent-green" />
            Daftar Pemain
            <span className="ml-auto text-sm font-normal text-white/30">
              {validCount} pemain
            </span>
          </h2>

          {/* Single Input Field */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Ketik nama pemain lalu tekan Enter..."
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
              className="w-full glass-input"
            />
          </div>

          {/* Player Tags */}
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto mb-2 p-2">
            <AnimatePresence mode="popLayout">
              {players.map((player, index) => (
                player.trim() !== '' && (
                  <motion.div
                    key={`${player}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: -20, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="liquid-pill flex items-center gap-2 rounded-full px-4 py-1.5"
                  >
                    <span className="text-white/90 text-sm font-medium">{player}</span>
                    <button
                      onClick={() => removePlayer(index)}
                      className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Historical Players (Quick Add) */}
          {availableHistory.length > 0 && (
            <div className="pt-4 border-t border-white/10 mt-4">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 flex items-center gap-2">
                <History size={12} />
                Pemain Sebelumnya
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableHistory.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => addHistoricalPlayer(p)}
                    className="liquid-pill text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-full"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          className="glass-button-success w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          ) : (
            <>
              <Play size={20} />
              Mulai Sesi
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
