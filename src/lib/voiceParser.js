/**
 * Voice-to-score parser.
 *
 * Converts speech strings like "thirty to twenty-one"
 * into { scoreA: 30, scoreB: 21 }.
 *
 * Handles both digit strings ("30 to 21") and English
 * number words up to 50.
 */

// ── word → number lookup ─────────────────────────────

const ONES = {
  zero: 0, one: 1, two: 2, three: 3, four: 4,
  five: 5, six: 6, seven: 7, eight: 8, nine: 9,
}

const TEENS = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
}

const TENS = {
  twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50,
}

/**
 * Extract the first number (word or digit) from a text fragment.
 * "twenty one" → 21,  "30" → 30,  "three" → 3
 */
function extractNumber(text) {
  const trimmed = text.trim()
  if (!trimmed) return null

  // Try direct digit match first
  const digitMatch = trimmed.match(/\d+/)
  if (digitMatch) return parseInt(digitMatch[0], 10)

  // Normalise: lowercase, strip hyphens
  const words = trimmed
    .toLowerCase()
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  let sum = 0
  let found = false

  for (const w of words) {
    if (ONES[w] !== undefined)  { sum += ONES[w];  found = true }
    else if (TEENS[w] !== undefined) { sum += TEENS[w]; found = true }
    else if (TENS[w] !== undefined)  { sum += TENS[w];  found = true }
    // ignore filler words ("to", "vs", etc.)
  }

  return found ? sum : null
}

/**
 * Parse a spoken score string into two numbers.
 *
 * Accepted patterns:
 *   "thirty to twenty-one"
 *   "30 to 21"
 *   "twenty five versus eighteen"
 *   "25 18"
 *
 * @param {string} transcript — raw speech recognition text
 * @returns {{ scoreA: number, scoreB: number } | null}
 */
export function parseScoreFromSpeech(transcript) {
  if (!transcript) return null

  const text = transcript.toLowerCase().trim()

  // Split on common spoken separators
  const separators = /\b(?:to|versus|vs\.?|against|v|lawan|banding)\b|[–—-]+/i
  const parts = text.split(separators)

  if (parts.length >= 2) {
    const scoreA = extractNumber(parts[0])
    const scoreB = extractNumber(parts[1])
    if (scoreA !== null && scoreB !== null) {
      return { scoreA, scoreB }
    }
  }

  // Fallback: extract all digit groups
  const allDigits = text.match(/\d+/g)
  if (allDigits && allDigits.length >= 2) {
    return {
      scoreA: parseInt(allDigits[0], 10),
      scoreB: parseInt(allDigits[1], 10),
    }
  }

  // Fallback: try to find two word-numbers in sequence
  const words = text.replace(/-/g, ' ').split(/\s+/)
  const numbers = []
  let i = 0

  while (i < words.length && numbers.length < 2) {
    // Try two-word compound first ("twenty one")
    if (i + 1 < words.length) {
      const compound = extractNumber(`${words[i]} ${words[i + 1]}`)
      const single = extractNumber(words[i])

      if (TENS[words[i]] && (ONES[words[i + 1]] !== undefined)) {
        numbers.push(compound)
        i += 2
        continue
      }
    }

    const n = extractNumber(words[i])
    if (n !== null && !['to', 'vs', 'versus', 'against', 'v', 'lawan', 'banding'].includes(words[i])) {
      numbers.push(n)
    }
    i++
  }

  if (numbers.length >= 2) {
    return { scoreA: numbers[0], scoreB: numbers[1] }
  }

  return null
}
