/**
 * AI Helpers — LLM integration for the AI Commentator.
 *
 * Uses the Gemini REST API (generativelanguage.googleapis.com).
 * The API key is loaded from the VITE_AI_API_KEY env variable.
 */

export async function getAICommentary(players, fieldLabel = 'the session') {
  const apiKey = import.meta.env.VITE_AI_API_KEY
  if (!apiKey) {
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    return text || 'The commentator is mysteriously speechless. Somebody hand them a shuttlecock.';
  } catch (err) {
    console.error('AI Commentary fetch error:', err)
    return `AI Error: ${err.message}`
  }
}
