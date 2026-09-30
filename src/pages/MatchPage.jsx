import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import FieldPanel from '../components/FieldPanel'
import { getSession } from '../lib/firebaseHelpers'

export default function MatchPage() {
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [endedFields, setEndedFields] = useState(new Set())

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

        // Restore already-ended fields
        const ended = new Set()
        if (data.field1?.status === 'ended') ended.add('field1')
        if (data.field2?.status === 'ended') ended.add('field2')
        setEndedFields(ended)
      } catch (err) {
        console.error('Failed to load session:', err)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [navigate])

  const handleFieldEnded = useCallback(
    (fieldKey) => {
      setEndedFields((prev) => {
        const updated = new Set(prev)
        updated.add(fieldKey)

        const totalFields = sessionData?.fieldCount ?? 1
        if (updated.size >= totalFields) {
          // All fields ended → navigate to leaderboard
          setTimeout(() => navigate('/leaderboard'), 1500)
        }

        return updated
      })
    },
    [sessionData, navigate],
  )

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

  return (
    <motion.div
      className="relative z-10 min-h-screen p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          BukkuTangkis
        </h1>
        <p className="text-white/30 text-sm mt-1">{sessionId}</p>
      </div>

      {/* ── Fields — split-screen if 2 courts ── */}
      <div
        className={`grid gap-6 ${
          fieldCount === 2 ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'
        }`}
      >
        {sessionData.field1 && (
          <FieldPanel
            fieldKey="field1"
            fieldData={sessionData.field1}
            sessionId={sessionId}
            onFieldEnded={handleFieldEnded}
          />
        )}
        {fieldCount === 2 && sessionData.field2 && (
          <FieldPanel
            fieldKey="field2"
            fieldData={sessionData.field2}
            sessionId={sessionId}
            onFieldEnded={handleFieldEnded}
          />
        )}
      </div>
    </motion.div>
  )
}
