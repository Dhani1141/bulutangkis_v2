import { doc, setDoc, getDoc, updateDoc, increment, deleteDoc, collection, getDocs, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Create a new session document in Firestore.
 *
 * @param {string} sessionId — e.g. "Session-30-09-2026"
 * @param {number} fieldCount — 1 or 2
 * @param {Object} fields — { field1: { players }, field2?: { players } }
 */
export async function createSession(sessionId, fieldCount, fields) {
  // Use sessionId as the collection, and 'data' as the document
  const sessionRef = doc(db, sessionId, 'data')

  const sessionData = {
    createdAt: new Date().toISOString(),
    fieldCount,
    status: 'active',
  }

  const allPlayersThisSession = new Set()

  for (const [fieldKey, fieldData] of Object.entries(fields)) {
    const playerStats = {}
    fieldData.players.forEach((player) => {
      playerStats[player] = { total_matches: 0, total_wins: 0 }
      allPlayersThisSession.add(player)
    })

    sessionData[fieldKey] = {
      status: 'active',
      players: fieldData.players,
      playerStats,
    }
  }

  await setDoc(sessionRef, sessionData)

  // Save to global history so we can load them next week
  const globalRef = doc(db, 'global', 'players')
  await setDoc(globalRef, {
    allPlayers: arrayUnion(...Array.from(allPlayersThisSession))
  }, { merge: true })

  return sessionData
}

/**
 * Fetch all historical players
 */
export async function getHistoricalPlayers() {
  const globalRef = doc(db, 'global', 'players')
  const snap = await getDoc(globalRef)
  if (snap.exists()) {
    return snap.data().allPlayers || []
  }
  return []
}

/**
 * Fetch session data from Firestore.
 */
export async function getSession(sessionId) {
  const sessionRef = doc(db, sessionId, 'data')
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
  const sessionRef = doc(db, sessionId, 'data')
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
  const sessionRef = doc(db, sessionId, 'data')
  await updateDoc(sessionRef, {
    [`${fieldKey}.status`]: 'ended',
  })
}

/**
 * Delete a session completely (Reset/Testing feature).
 * Deletes all documents in the Session-DD-MM-YYYY collection.
 */
export async function deleteSession(sessionId) {
  const colRef = collection(db, sessionId)
  const snapshot = await getDocs(colRef)
  
  const deletePromises = []
  snapshot.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, sessionId, document.id)))
  })
  
  await Promise.all(deletePromises)
}
