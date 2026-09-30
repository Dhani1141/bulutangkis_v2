/**
 * AI Helpers — LLM integration for the AI Commentator.
 *
 * Uses the Gemini REST API (generativelanguage.googleapis.com).
 * The API key is loaded from the VITE_AI_API_KEY env variable.
 */

const API_KEY = import.meta.env.VITE_AI_API_KEY
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

/**
 * Fetch AI commentary for a leaderboard.
 *
 * @param {{ name: string, totalMatches: number, totalWins: number, winRate: number }[]} players
 *    Sorted from highest to lowest win rate.
 * @param {string} fieldLabel — e.g. "Field 1"
 * @returns {Promise<string>} The commentary text.
 */
export async function getAICommentary(players, fieldLabel = 'the session') {
  if (!API_KEY) {
    return '⚙️ AI API key not configured. Add VITE_AI_API_KEY to your .env.local file.'
  }

  const statsBlock = players
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.totalMatches} match${p.totalMatches !== 1 ? 'es' : ''}, ` +
        `${p.totalWins} win${p.totalWins !== 1 ? 's' : ''}, ` +
        `${p.winRate.toFixed(1)}% win rate`,
    )
    .join('\n')

  const prompt = `You are a humorous, witty, and slightly roasting sports commentator wrapping up a casual badminton session for ${fieldLabel}.

Here are the final player standings:

${statsBlock}

Instructions:
- Summarise the session in a fun, entertaining way (150-200 words max).
- Praise the top performers with flair.
- Gently roast the bottom performers — be funny, never mean.
- Mention any interesting stats (perfect win rate, someone who never won, close rivalries).
- Use a lively commentator voice with energy and personality.
- Do NOT use markdown formatting, bullet lists, or headers — write flowing prose as if you are speaking live on a mic.
- End with a catchy sign-off line.`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 400,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('AI API error:', res.status, err)
      
      let parsedErr = err
      try {
        parsedErr = JSON.parse(err).error.message
      } catch (e) {}

      return `AI Error (HTTP ${res.status}): ${parsedErr}`
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    return text || 'The commentator is mysteriously speechless. Somebody hand them a shuttlecock.'
  } catch (err) {
    console.error('AI Commentary fetch error:', err)
    return 'The commentator had technical difficulties — blame the WiFi, not the shuttle!'
  }
}
