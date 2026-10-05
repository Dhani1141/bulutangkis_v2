/**
 * AI Helpers — LLM integration for the AI Commentator.
 *
 * Uses the Gemini REST API (generativelanguage.googleapis.com).
 * The API key is loaded from the VITE_AI_API_KEY env variable.
 */

export async function getAICommentary(players, fieldLabel = 'seluruh sesi', onStatusUpdate = () => {}) {
  const apiKey = import.meta.env.VITE_AI_API_KEY
  if (!apiKey) {
    return '⚙️ API key AI belum dikonfigurasi. Tambahkan VITE_AI_API_KEY ke file .env.local Anda.'
  }

  const statsBlock = players
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.totalMatches} pertandingan, ` +
        `${p.totalWins} menang, ` +
        `win rate ${p.winRate.toFixed(1)}%`,
    )
    .join('\n')

  const prompt = `Kamu adalah komentator olahraga yang lucu, jenaka, dan sedikit suka meledek, yang sedang menutup sesi bulu tangkis santai untuk ${fieldLabel}.

Berikut klasemen akhir para pemain:

${statsBlock}

Instruksi:
- WAJIB menulis seluruh jawaban dalam Bahasa Indonesia yang santai dan gaul (boleh sedikit bahasa sehari-hari), JANGAN gunakan Bahasa Inggris.
- Rangkum sesi ini dengan cara yang seru dan menghibur (maksimal 150-200 kata).
- Puji pemain dengan performa terbaik secara heboh.
- Ledek pemain dengan performa terbawah secara halus — lucu, tapi jangan kasar.
- Sebutkan statistik menarik (win rate sempurna, pemain yang belum pernah menang, persaingan ketat).
- Gunakan gaya komentator yang energik dan penuh kepribadian.
- JANGAN gunakan format markdown, bullet list, atau judul — tulis dalam paragraf mengalir seperti sedang siaran langsung.
- Akhiri dengan kalimat penutup yang catchy.`

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
