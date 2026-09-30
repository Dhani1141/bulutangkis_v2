import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Swords,
  Send,
  Trophy,
  Clock,
  Users,
  StopCircle,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles
} from 'lucide-react'
import GlassCard from './GlassCard'
import EndSessionModal from './EndSessionModal'
import {
  smartSelectMatch,
  determineWinner,
  deriveTeamStats,
} from '../lib/matchmaking'
import { submitMatchResult, endFieldSession } from '../lib/firebaseHelpers'
import { parseScoreFromSpeech } from '../lib/voiceParser'

/**
 * FieldPanel — manages one court's match lifecycle:
 *   generate match → play → submit score → rotate queue → repeat
 */
export default function FieldPanel({
  fieldKey,
  fieldStatus,
  sessionId,
  currentMatch,
  onRequestMatch,
  onMatchEnd,
  onClearCourt,
  onFieldEnded,
}) {
  // ── State ──
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [showEndModal, setShowEndModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState(null) // flash win/lose feedback
  const [matchHistory, setMatchHistory] = useState([]) // tracks previous matches

  // Voice recognition state
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')

  // ── Generate next match ──
  const handleGenerateMatch = useCallback(() => {
    onRequestMatch()
    setScoreA('')
    setScoreB('')
    setLastResult(null)
    setVoiceError('')
  }, [onRequestMatch])

  // ── Submit score ──
  const handleSubmitScore = useCallback(async () => {
    if (!currentMatch || scoreA === '' || scoreB === '') return

    const numA = parseInt(scoreA, 10)
    const numB = parseInt(scoreB, 10)
    if (Number.isNaN(numA) || Number.isNaN(numB) || numA < 0 || numB < 0) return
    if (numA === numB) return // no ties

    setIsSubmitting(true)

    try {
      const winner = determineWinner(numA, numB)
      const winnerPlayers =
        winner === 'teamA'
          ? currentMatch.teamA.players
          : currentMatch.teamB.players
      const allPlayers = [
        ...currentMatch.teamA.players,
        ...currentMatch.teamB.players,
      ]

      // Firebase write — lightweight (counters only)
      await submitMatchResult(sessionId, fieldKey, winnerPlayers, allPlayers)

      // Notify parent to update stats and move them to bottom of queue
      onMatchEnd(allPlayers, winnerPlayers)

      // Flash result feedback
      const resultData = {
        winner,
        winnerPlayers,
        scoreA: numA,
        scoreB: numB,
        teamA: currentMatch.teamA.players,
        teamB: currentMatch.teamB.players,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setLastResult(resultData)
      setMatchHistory((prev) => [resultData, ...prev])

      // Clear match after a brief flash
      setTimeout(() => {
        onClearCourt()
        setScoreA('')
        setScoreB('')
      }, 1200)
    } catch (err) {
      console.error('Failed to submit match:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentMatch, scoreA, scoreB, sessionId, fieldKey, onMatchEnd, onClearCourt])

  // ── Voice Input ──
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser.')
      return
    }

    setVoiceError('')
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US' // Can adjust to id-ID if needed, voiceParser handles some id-ID

    recognition.onstart = () => setIsListening(true)
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      console.log('Voice recognized:', transcript)
      const parsed = parseScoreFromSpeech(transcript)
      if (parsed) {
        setScoreA(parsed.scoreA.toString())
        setScoreB(parsed.scoreB.toString())
        setVoiceError('')
      } else {
        setVoiceError(`Could not parse score from: "${transcript}"`)
      }
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setVoiceError(`Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    try {
      recognition.start()
    } catch (err) {
      console.error(err)
      setIsListening(false)
    }
  }

  // ── End session ──
  const handleEndSession = () => {
    if (currentMatch) {
      setShowEndModal(true)
    } else {
      confirmEndSession()
    }
  }

  const confirmEndSession = async () => {
    try {
      await endFieldSession(sessionId, fieldKey)
      setFieldStatus('ended')
      setCurrentMatch(null)
      setShowEndModal(false)
      onFieldEnded(fieldKey)
    } catch (err) {
      console.error('Failed to end session:', err)
    }
  }

  // ── Score validation ──
  const scoresValid =
    scoreA !== '' &&
    scoreB !== '' &&
    !Number.isNaN(parseInt(scoreA, 10)) &&
    !Number.isNaN(parseInt(scoreB, 10)) &&
    parseInt(scoreA, 10) !== parseInt(scoreB, 10) &&
    parseInt(scoreA, 10) >= 0 &&
    parseInt(scoreB, 10) >= 0

  const isTied =
    scoreA !== '' &&
    scoreB !== '' &&
    parseInt(scoreA, 10) === parseInt(scoreB, 10)

  // ── Ended state ──
  if (fieldStatus === 'ended') {
    return (
      <GlassCard className="h-full flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <Trophy className="mx-auto mb-4 text-accent-orange" size={48} />
          </motion.div>
          <h3 className="text-2xl font-bold text-white/80">Session Ended</h3>
          <p className="text-white/40 mt-2">
            {fieldKey === 'field1' ? 'Field 1' : 'Field 2'} results are ready
          </p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Field Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white/90 flex items-center gap-2">
          <Swords size={24} className="text-accent-blue" />
          {fieldKey === 'field1' ? 'Field 1' : 'Field 2'}
        </h2>
        <button
          onClick={handleEndSession}
          className="glass-button-danger text-sm !py-2 !px-4"
        >
          <StopCircle size={16} />
          End Session
        </button>
      </div>

      {/* ── Current Match ── */}
      <GlassCard className="!p-5" animate={false}>
        <AnimatePresence mode="wait">
          {currentMatch ? (
            <motion.div
              key="match-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">
                  Current Match
                </h3>
                <div className="flex items-center gap-1 text-xs text-accent-purple bg-accent-purple/10 px-2 py-1 rounded-md border border-accent-purple/20">
                  <Sparkles size={12} />
                  <span>AI Balanced</span>
                </div>
              </div>

              {/* Teams Display */}
              <div className="flex items-center gap-3 md:gap-4 mb-6">
                {/* Team A */}
                <div className="flex-1 text-center">
                  <div
                    className={`glass rounded-xl p-4 transition-all duration-500 ${
                      lastResult?.winner === 'teamA'
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : lastResult?.winner === 'teamB'
                          ? 'border-red-500/30 bg-red-500/5'
                          : ''
                    }`}
                  >
                    <p className="text-xs text-accent-blue font-semibold mb-2 uppercase tracking-wide">
                      Team A
                    </p>
                    {currentMatch.teamA.players.map((p, i) => (
                      <p key={i} className="text-white font-semibold text-sm md:text-base">
                        {p}
                      </p>
                    ))}
                    {lastResult?.winner === 'teamA' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2"
                      >
                        <CheckCircle2
                          size={20}
                          className="mx-auto text-emerald-400"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <span className="text-xl md:text-2xl font-black text-white/20 shrink-0">
                  VS
                </span>

                {/* Team B */}
                <div className="flex-1 text-center">
                  <div
                    className={`glass rounded-xl p-4 transition-all duration-500 ${
                      lastResult?.winner === 'teamB'
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : lastResult?.winner === 'teamA'
                          ? 'border-red-500/30 bg-red-500/5'
                          : ''
                    }`}
                  >
                    <p className="text-xs text-accent-purple font-semibold mb-2 uppercase tracking-wide">
                      Team B
                    </p>
                    {currentMatch.teamB.players.map((p, i) => (
                      <p key={i} className="text-white font-semibold text-sm md:text-base">
                        {p}
                      </p>
                    ))}
                    {lastResult?.winner === 'teamB' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2"
                      >
                        <CheckCircle2
                          size={20}
                          className="mx-auto text-emerald-400"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Input */}
              {!lastResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-end gap-3 relative">
                    <div className="flex-1">
                      <label className="text-xs text-white/30 mb-1 block">
                        Team A Score
                      </label>
                      <input
                        type="number"
                        value={scoreA}
                        onChange={(e) => setScoreA(e.target.value)}
                        placeholder="0"
                        className="glass-input w-full text-center text-2xl font-bold"
                        min="0"
                      />
                    </div>
                    <span className="text-white/20 font-bold text-lg pb-3 shrink-0">
                      —
                    </span>
                    <div className="flex-1">
                      <label className="text-xs text-white/30 mb-1 block">
                        Team B Score
                      </label>
                      <input
                        type="number"
                        value={scoreB}
                        onChange={(e) => setScoreB(e.target.value)}
                        placeholder="0"
                        className="glass-input w-full text-center text-2xl font-bold"
                        min="0"
                      />
                    </div>

                    {/* Mic Button */}
                    <button
                      onClick={toggleListening}
                      title="Dictate score (e.g. 'thirty to twenty one')"
                      className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[120%] p-3 rounded-full transition-all duration-300 shadow-lg ${
                        isListening 
                          ? 'bg-accent-blue/30 text-accent-blue animate-pulse-slow border border-accent-blue/50' 
                          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                      {isListening && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-blue"></span>
                        </span>
                      )}
                    </button>
                  </div>

                  {voiceError && (
                    <p className="text-red-400 text-xs mt-2 text-center bg-red-400/10 py-1 px-2 rounded">
                      {voiceError}
                    </p>
                  )}

                  {isTied && (
                    <p className="text-amber-400 text-xs mt-2 text-center">
                      Scores cannot be equal — there must be a winner
                    </p>
                  )}

                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting || !scoresValid}
                    className="glass-button-primary w-full mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Match
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="match-idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              <Swords className="mx-auto mb-4 text-white/10" size={48} />
              <p className="text-white/30 mb-4">No active match</p>
              <button
                onClick={handleGenerateMatch}
                className="glass-button-primary"
              >
                <RotateCcw size={16} />
                Generate AI Match
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* ── Match History ── */}
      {matchHistory.length > 0 && (
        <GlassCard className="!p-4" animate={false}>
          <h3 className="text-sm font-semibold text-white/40 flex items-center gap-2 mb-3">
            <Clock size={16} />
            Match History
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {matchHistory.map((hist, idx) => (
              <div key={idx} className="glass rounded-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/30">{hist.time}</span>
                  <span className="text-xs font-medium text-accent-blue/80">Completed</span>
                </div>
                <div className="flex items-center justify-between">
                  {/* Team A */}
                  <div className={`flex-1 text-center ${hist.winner === 'teamA' ? 'text-emerald-400 font-bold' : 'text-white/50'}`}>
                    <p className="text-sm">{hist.teamA[0]}</p>
                    <p className="text-sm">{hist.teamA[1]}</p>
                  </div>
                  
                  {/* Scores */}
                  <div className="px-4 flex items-center gap-2 font-black text-lg">
                    <span className={hist.winner === 'teamA' ? 'text-emerald-400' : 'text-white/40'}>{hist.scoreA}</span>
                    <span className="text-white/20">-</span>
                    <span className={hist.winner === 'teamB' ? 'text-emerald-400' : 'text-white/40'}>{hist.scoreB}</span>
                  </div>

                  {/* Team B */}
                  <div className={`flex-1 text-center ${hist.winner === 'teamB' ? 'text-emerald-400 font-bold' : 'text-white/50'}`}>
                    <p className="text-sm">{hist.teamB[0]}</p>
                    <p className="text-sm">{hist.teamB[1]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── End Session Modal ── */}
      <EndSessionModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onWait={() => setShowEndModal(false)}
        onCancelMatch={confirmEndSession}
      />
    </div>
  )
}

