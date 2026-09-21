import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not configured');
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Chat Endpoint powered by Gemini (gemini-3.7-flash)
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, history, context } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Fadlan fariin soo dir.' });
      }

      const client = getGenAI();
      if (!client) {
        // Fallback intelligent response if GEMINI_API_KEY is not yet populated
        return res.json({
          reply: `Ku soo dhawoow Xaaji Salaad School AI Assistant! Waxaan ahay caawiyahaaga casriga ah ee iskuulka.\n\nWaxaad weydiisay: "${message}"\n\nNidaamka iskuulka waxaad kaga shaqeyn kartaa diiwaangelinta ardayda, kaalmaha imtixaanka (Class Ranking), wada-xiriirka waalidiinta iyo macallimiinta (WhatsApp & Messages), xisaabinta dhibcaha, iyo lacagaha. Haddii aad u baahan tahay jawaab toos ah oo AI ah, fadlan hubi in GEMINI_API_KEY la galiyay Settings-ka.`
        });
      }

      const schoolNameFromCtx = context?.schoolName || 'Xaaji Salaad School';
      const systemInstruction = `You are "Xaaji Salaad School AI Assistant" (Caawiyaha Casriga ah ee Caalamiga ah), an exceptionally intelligent, versatile, and helpful AI assistant.

CRITICAL BEHAVIORAL DIRECTIVES:
1. ANSWER ANY AND ALL QUESTIONS: You MUST answer any question the user asks on ANY topic whatsoever. This includes but is not limited to:
   - General knowledge, world history, geography, politics, culture, and current phenomena.
   - STEM, mathematics, physics, biology, chemistry, astronomy, earth science, and medicine.
   - Technology, computer programming, coding (Python, JavaScript, TypeScript, C++, etc.), algorithms, and web development.
   - Languages, grammar, literature, Somali poetry/gabayo, English, Arabic, translation, essay writing, and letter formulation.
   - Philosophy, psychology, daily life advice, business, finance, motivation, problem solving, and creativity.
   - Education, Somali national curriculum, teaching strategies, lesson planning, and student guidance.
   - School data & administration for ${schoolNameFromCtx} when provided in context.

2. NEVER REFUSE A QUESTION just because it is not about the school or system. Even if the question is completely unrelated to school or education, answer it thoroughly, expertly, and politely!

3. LANGUAGE & TONE:
   - Always respond in the language the user speaks (primarily fluent, natural Somali or English).
   - Be clear, polite, inspiring, well-structured (with markdown formatting, bold headings, bullet points, code blocks where applicable), and highly informative.

4. If the user explicitly asks about their school statistics, student ranks, or portal features, use the provided context accurately: ${JSON.stringify(context || {})}.`;

      // Build conversation contents
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        history.forEach((h: { role: string; text: string }) => {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          temperature: 0.7,
        }
      });

      const replyText = response.text || "Waan ka xumahay, ma awoodin inaan jawaab helo xilligan.";
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error('Gemini API error:', err);
      return res.status(500).json({ 
        error: 'Cilad ayaa dhacday intii lala xiriirayey AI: ' + (err?.message || 'Unknown error') 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Xaaji Salaad School Management server running on http://localhost:${PORT}`);
  });
}

startServer();
