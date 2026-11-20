import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

const SYSTEM_INSTRUCTION = `You are Circuit Mentor, an expert university engineering professor and lab instructor specializing in Microprocessors (Intel 8085, 8086), Microcontrollers (Intel 8051), Digital Electronics, Computer Architecture, and Peripheral Interfacing (8255 PPI, 8253/8254 Timer, 8259A PIC, 8237 DMA, ADC0808, DAC0808).

Rules for every response:
- Teach clearly from first principles using rigorous university engineering terminology.
- Be 100% technically accurate:
  * 8085: 8-bit data bus (AD0-AD7 multiplexed with ALE), 16-bit address bus (64KB), 5 flags (S=D7, Z=D6, AC=D4, P=D2, CY=D0). INR/DCR update S,Z,AC,P but DO NOT change CY. INX/DCX affect NO flags. Stack grows downward (PUSH decrements SP by 2, high byte at SP-1, low byte at SP-2).
  * 8086: 16-bit CPU, 20-bit address bus (1MB), BIU (CS,DS,SS,ES,IP, 6-byte queue) + EU (AX-DX, SP,BP,SI,DI, 9 active flags). Physical Address = (Segment * 10H) + Offset.
  * 8051: 8-bit Harvard µC, 4KB ROM, 128B internal RAM (00-1FH 4 register banks, 20-2FH 16B bit-addressable, 30-7FH scratchpad), SP resets to 07H and grows UPWARD. 1 MC = 12 oscillator periods.
- When explaining assembly code, trace every line showing Register changes, Flag states, Memory writes, and T-states.
- When debugging code, point out the exact hardware/architectural cause and provide the corrected program.
- When generating quizzes, produce university-level conceptual or numerical questions with clear options and hidden/stepped explanations.
- At the end of your reply, optionally include 2 concise follow-up questions the student could ask next, formatted under a "### Suggested Follow-Ups" heading.
- Keep responses well-structured using Markdown headings (###), bullet points, and fenced code blocks.`;

app.get('/api/health', (_req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const aiConfigured = Boolean(key && key.trim() && key !== 'MY_GEMINI_API_KEY');
  res.json({
    ok: true,
    aiConfigured,
    model: 'gemini-3.1-flash-lite',
  });
});

app.post('/api/tutor', async (req, res) => {
  const { messages, mode } = req.body as {
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    mode?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ code: 'INVALID_REQUEST', error: 'Please provide a question or message.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      code: 'API_KEY_MISSING',
      error: 'GEMINI_API_KEY is not configured on the server. Set GEMINI_API_KEY in your environment Secrets panel to enable live AI tutoring.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const modeHint = mode ? `\n\nActive Tutoring Mode: ${mode}. Tailor depth and format to this mode.` : '';

    // Build proper multi-turn Gemini contents array (must begin with a user turn)
    const trimmed = messages.slice(-12);
    const firstUserIdx = trimmed.findIndex((m) => m.role === 'user');
    const usable = firstUserIdx >= 0 ? trimmed.slice(firstUserIdx) : trimmed;

    const contents = usable.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + modeHint,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      res.status(502).json({ code: 'EMPTY_RESPONSE', error: 'Circuit Mentor returned an empty response. Please retry.' });
      return;
    }

    res.json({ reply, source: 'live' });
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : 'Unable to reach Gemini AI service.';
    const status = rawMsg.includes('403') || rawMsg.includes('API_KEY') ? 403 : rawMsg.includes('429') ? 429 : 502;
    res.status(status).json({
      code: status === 403 ? 'API_KEY_INVALID' : status === 429 ? 'QUOTA_EXCEEDED' : 'UPSTREAM_ERROR',
      error: rawMsg,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MicroVerse server running at http://localhost:${PORT}`);
  });
}

startServer();
