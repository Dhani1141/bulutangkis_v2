/**
 * AI Helpers — LLM integration for the AI Commentator.
 *
 * Uses the Gemini REST API (generativelanguage.googleapis.com).
 * The API key is loaded from the VITE_AI_API_KEY env variable.
 */

export async function getAICommentary(players, fieldLabel = 'the session', onStatusUpdate = () => {}) {
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

  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Step 1: Ask the API which models are available for this key
      const modelsRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (!modelsRes.ok) {
        const err = await modelsRes.text();
        throw new Error(`Failed to list models: ${modelsRes.status} - ${err}`);
      }
      const modelsData = await modelsRes.json();
      const allModels = (modelsData.models || []).filter(m =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent') &&
        // Skip models known to be deprecated/blocked for new users
        !m.name.includes('gemini-2.5')
      );

      // Prefer gemini-3.8-flash (Google's recommended replacement), then any other
      const preferredOrder = ['gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-pro'];
      let supportedModel = null;
      for (const preferred of preferredOrder) {
        supportedModel = allModels.find(m => m.name.includes(preferred));
        if (supportedModel) break;
      }
      // If none of the preferred found, fall back to first available
      if (!supportedModel) supportedModel = allModels[0];
      
      if (!supportedModel) {
        throw new Error('No usable model found for this API key.');
      }

      // Step 2: Use the exact name the API returned
      const url = `https://generativelanguage.googleapis.com/v1beta/${supportedModel.name}:generateContent?key=${apiKey}`;

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
        if (response.status === 503 && attempt < maxRetries) {
          attempt++;
          onStatusUpdate('Server AI Google sedang penuh (503). Mencoba menyambung ulang...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      return text || 'Komentator tiba-tiba kehabisan kata-kata. Tolong ambilkan kok badminton.';
    } catch (err) {
      if (attempt < maxRetries && err.message.includes('503')) {
        attempt++;
        onStatusUpdate('Server AI Google sedang penuh (503). Mencoba menyambung ulang...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      console.error('AI Commentary fetch error:', err)
      if (err.message.includes('503')) {
         return 'Komentator sedang sibuk (Server Google penuh/503). Silakan coba lagi nanti.';
      }
      return `Komentator AI gagal dimuat: ${err.message.split('{')[0].trim()}`
    }
  }
}
