/**
 * BukkuTangkis — Matchmaking Engine
 *
 * Two matchmaking modes:
 *
 * 1. CLASSIC (random)  — Fisher-Yates shuffle, random team pairs
 * 2. SMART  (AI-balanced) — Pairs high win-rate players with low win-rate
 *    players so every 2v2 match is mathematically balanced.
 *
 * Fair rotation (both modes):
 *   Players with the fewest total_matches always get priority.
 *   Ties are broken randomly to prevent stale ordering.
 */

// ── helpers ──────────────────────────────────────────

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Classic (original) ───────────────────────────────

/**
 * Generate random 2-player teams (session-start helper).
 */
export function generateTeams(players) {
  const shuffled = shuffle(players)
  const teams = []
  for (let i = 0; i < shuffled.length; i += 2) {
    teams.push([shuffled[i], shuffled[i + 1]])
  }
  return teams
}

/**
 * Select next match from pre-formed teams (classic mode).
 */
export function selectNextMatch(teams, teamStats = {}) {
  if (teams.length < 2) return null

  const indexed = teams.map((team, idx) => ({
    index: idx,
    players: team,
    matchesPlayed: teamStats[idx]?.matchesPlayed ?? 0,
    lastPlayedOrder: teamStats[idx]?.lastPlayedOrder ?? 0,
  }))

  indexed.sort((a, b) => {
    if (a.matchesPlayed !== b.matchesPlayed)
      return a.matchesPlayed - b.matchesPlayed
    return a.lastPlayedOrder - b.lastPlayedOrder
  })

  const teamA = indexed[0]
  const teamB = indexed[1]
  const remaining = indexed.slice(2)
  const isOdd = teams.length % 2 !== 0

  return {
    teamA: { index: teamA.index, players: teamA.players },
    teamB: { index: teamB.index, players: teamB.players },
    waitingTeam:
      isOdd && remaining.length > 0
        ? { index: remaining[0].index, players: remaining[0].players }
        : null,
    queue: (isOdd ? remaining.slice(1) : remaining).map((t) => ({
      index: t.index,
      players: t.players,
    })),
  }
}

// ── Smart (AI-balanced) ──────────────────────────────

/**
 * AI Smart Matchmaking
 *
 * 1. Fair rotation — pick the 4 players with the fewest matches.
 *    Ties in match-count are shuffled so ordering stays fresh.
 *
 * 2. Win-rate balancing — among the 4 selected players, sort by
 *    win rate descending then pair:
 *      Team A = best  (#1) + worst (#4)
 *      Team B = second (#2) + third (#3)
 *    This ensures both teams have near-equal aggregate win rates.
 *
 * @param {string[]}  players      — every player name in the field
 * @param {Object}    playerStats  — { name: { total_matches, total_wins } }
 * @returns {{ teamA, teamB, remaining[] }} | null
 */
export function smartSelectMatch(players, playerStats = {}) {
  if (players.length < 4) return null

  // Build enriched data per player
  const data = players.map((name) => {
    const s = playerStats[name] || { total_matches: 0, total_wins: 0 }
    return {
      name,
      matches: s.total_matches,
      wins: s.total_wins,
      winRate: s.total_matches > 0 ? s.total_wins / s.total_matches : 0.5,
    }
  })

  // ── Step 1: Fair rotation ──
  // Group by match count → shuffle within each group → flatten
  const buckets = {}
  data.forEach((p) => {
    const key = p.matches
    if (!buckets[key]) buckets[key] = []
    buckets[key].push(p)
  })

  const fairQueue = Object.keys(buckets)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((key) => shuffle(buckets[key]))

  // Pick first 4
  const selected = fairQueue.slice(0, 4)
  const remaining = fairQueue.slice(4)

  // ── Step 2: Win-rate balancing ──
  // Sort the 4 selected by win rate DESC
  selected.sort((a, b) => b.winRate - a.winRate)

  // Pair: Best(0) + Worst(3)  vs  Second(1) + Third(2)
  const teamA = {
    players: [selected[0].name, selected[3].name],
    avgWinRate: (selected[0].winRate + selected[3].winRate) / 2,
  }
  const teamB = {
    players: [selected[1].name, selected[2].name],
    avgWinRate: (selected[1].winRate + selected[2].winRate) / 2,
  }

  return {
    teamA,
    teamB,
    remaining: remaining.map((p) => ({
      name: p.name,
      matches: p.matches,
      winRate: p.winRate,
    })),
  }
}

// ── Shared ────────────────────────────────────────────

/**
 * Determine winner — no hardcoded score limit.
 */
export function determineWinner(scoreA, scoreB) {
  const a = Number(scoreA)
  const b = Number(scoreB)
  if (Number.isNaN(a) || Number.isNaN(b) || a === b) return null
  return a > b ? 'teamA' : 'teamB'
}

/**
 * Derive teamStats from playerStats (for classic mode recovery).
 */
export function deriveTeamStats(teams, playerStats = {}) {
  const stats = {}
  teams.forEach((team, idx) => {
    const p = playerStats[team[0]] || { total_matches: 0 }
    stats[idx] = {
      matchesPlayed: p.total_matches,
      lastPlayedOrder: p.total_matches,
    }
  })
  return stats
}
