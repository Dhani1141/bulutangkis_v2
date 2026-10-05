import { doc, setDoc, getDoc, updateDoc, increment, deleteDoc, collection, getDocs, arrayUnion, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Create a new session document in Firestore.
 *
 * @param {string} sessionId — e.g. "Session-30-09-2026"
 * @param {number} fieldCount — 1 or 2
 * @param {string[]} allPlayers - Array of all player names
 */
export async function createSession(sessionId, fieldCount, allPlayers) {
  // Use sessionId as the collection, and 'data' as the document
  const sessionRef = doc(db, sessionId, 'data')

  const playerStats = {}
  allPlayers.forEach((player) => {
    playerStats[player] = { total_matches: 0, total_wins: 0 }
  })

  const sessionData = {
    createdAt: new Date().toISOString(),
    fieldCount,
    status: 'active',
    players: allPlayers,
    playerStats,
  }

  // Setup initial field statuses
  if (fieldCount >= 1) sessionData.field1 = { status: 'active' }
  if (fieldCount === 2) sessionData.field2 = { status: 'active' }

  await setDoc(sessionRef, sessionData)

  // Save to global history so we can load them next week
  const globalRef = doc(db, 'global', 'players')
  await setDoc(globalRef, {
    allPlayers: arrayUnion(...allPlayers)
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
  const batch = writeBatch(db)
  const updates = {}

  // +1 total_matches for all 4 players
  allPlayers.forEach((player) => {
    updates[`playerStats.${player}.total_matches`] = increment(1)
  })

  // +1 total_wins for the 2 winners only
  winnerPlayers.forEach((player) => {
    updates[`playerStats.${player}.total_wins`] = increment(1)
  })

  batch.update(sessionRef, updates)

  // -- GLOBAL STATS UPDATE --
  const dateStr = new Date().toLocaleDateString()
  
  // Update all players (match count + date) in the same batch
  allPlayers.forEach((player) => {
    const isWinner = winnerPlayers.includes(player)
    const playerRef = doc(db, 'global_players', player)
    
    batch.set(playerRef, {
      name: player,
      total_matches: increment(1),
      total_wins: isWinner ? increment(1) : increment(0),
      last_played_date: dateStr
    }, { merge: true })
  })

  await batch.commit()
}

/**
 * Fetch all-time global player stats
 */
export async function getGlobalPlayerStats() {
  const colRef = collection(db, 'global_players')
  const snapshot = await getDocs(colRef)
  const players = []
  snapshot.forEach(doc => {
    players.push({ id: doc.id, ...doc.data() })
  })
  return players
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
 * End the entire session globally.
 */
export async function endSessionGlobal(sessionId) {
  const sessionRef = doc(db, sessionId, 'data')
  await updateDoc(sessionRef, { status: 'ended' })
}

/**
 * Delete a session completely (Reset/Testing feature).
 * Deletes all documents in the Session-DD-MM-YYYY collection,
 * and resets all stats in the global_players collection to 0.
 */
export async function deleteSession(sessionId) {
  const promises = []
  
  // 1. Delete session docs
  const sessionColRef = collection(db, sessionId)
  const sessionSnap = await getDocs(sessionColRef)
  sessionSnap.forEach((document) => {
    promises.push(deleteDoc(doc(db, sessionId, document.id)))
  })

  // 2. Reset global_players stats to 0 instead of deleting them
  const globalColRef = collection(db, 'global_players')
  const globalSnap = await getDocs(globalColRef)
  globalSnap.forEach((document) => {
    promises.push(updateDoc(doc(db, 'global_players', document.id), {
      total_matches: 0,
      total_wins: 0
    }))
  })
  
  await Promise.all(promises)
}
