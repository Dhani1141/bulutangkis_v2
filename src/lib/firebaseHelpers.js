import { doc, setDoc, getDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Create a new session document in Firestore.
 *
 * @param {string} sessionId — e.g. "Session-30-09-2026"
 * @param {number} fieldCount — 1 or 2
 * @param {Object} fields — { field1: { players, teams }, field2?: { players, teams } }
 */
export async function createSession(sessionId, fieldCount, fields) {
  const sessionRef = doc(db, 'sessions', sessionId)

  const sessionData = {
    createdAt: new Date().toISOString(),
    fieldCount,
    status: 'active',
  }

  for (const [fieldKey, fieldData] of Object.entries(fields)) {
    const playerStats = {}
    fieldData.players.forEach((player) => {
      playerStats[player] = { total_matches: 0, total_wins: 0 }
    })

    sessionData[fieldKey] = {
      status: 'active',
      players: fieldData.players,
      teams: fieldData.teams,
      playerStats,
    }
  }

  await setDoc(sessionRef, sessionData)
  return sessionData
}

/**
 * Fetch session data from Firestore.
 */
export async function getSession(sessionId) {
  const sessionRef = doc(db, 'sessions', sessionId)
  const snap = await getDoc(sessionRef)
  return snap.exists() ? snap.data() : null
}

/**
 * Submit a match result — lightweight write.
 * Only increments total_matches (+1 for all 4 players)
 * and total_wins (+1 for the 2 winners). Actual scores are discarded.
 *
 * @param {string} sessionId
 * @param {string} fieldKey — "field1" or "field2"
 * @param {string[]} winnerPlayers — 2 player names
 * @param {string[]} allPlayers — 4 player names
 */
export async function submitMatchResult(
  sessionId,
  fieldKey,
  winnerPlayers,
  allPlayers,
) {
  const sessionRef = doc(db, 'sessions', sessionId)
  const updates = {}

  // +1 total_matches for all 4 players
  allPlayers.forEach((player) => {
    updates[`${fieldKey}.playerStats.${player}.total_matches`] = increment(1)
  })

  // +1 total_wins for the 2 winners only
  winnerPlayers.forEach((player) => {
    updates[`${fieldKey}.playerStats.${player}.total_wins`] = increment(1)
  })

  await updateDoc(sessionRef, updates)
}

/**
 * Mark a field session as ended.
 */
export async function endFieldSession(sessionId, fieldKey) {
  const sessionRef = doc(db, 'sessions', sessionId)
  await updateDoc(sessionRef, {
    [`${fieldKey}.status`]: 'ended',
  })
}

/**
 * Delete a session completely (Reset/Testing feature).
 */
export async function deleteSession(sessionId) {
  const sessionRef = doc(db, 'sessions', sessionId)
  await deleteDoc(sessionRef)
}
