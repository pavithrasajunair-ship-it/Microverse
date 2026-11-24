import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// --- security basics -------------------------------------------------------
app.disable('x-powered-by');
app.set('trust proxy', 1); // behind Vercel / one proxy: req.ip is the real visitor

// Production only: the Vite dev server needs inline scripts for hot reload.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    res.setHeader('Content-Security-Policy', CSP);
  }
  next();
});

// Small request bodies only: 12 turns of 6000 characters fit well inside this.
app.use(express.json({ limit: '256kb' }));

// --- abuse protection for the AI endpoint ----------------------------------
// Best-effort and per server instance (no database needed). Stops one visitor
// or script from draining the Gemini quota.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.TUTOR_RATE_MAX) || 20; // questions per 10 minutes per visitor
const MAX_PER_DAY = Number(process.env.TUTOR_DAILY_MAX) || 500; // questions per day for the whole site
const hits = new Map<string, number[]>();
let dayStart = Date.now();
let dayCount = 0;

function overLimit(ip: string): 'visitor' | 'site' | null {
  const now = Date.now();
  if (now - dayStart > 24 * 3600 * 1000) { dayStart = now; dayCount = 0; }
  if (dayCount >= MAX_PER_DAY) return 'site';
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  if (recent.length > MAX_PER_WINDOW) return 'visitor';
  dayCount++;
  return null;
}

const ALLOWED_MODES = new Set(['Explain Simply', 'Line-by-Line Assembly', 'Debug My Code', 'Generate Practice Quiz', 'Interactive Viva']);
const MAX_MESSAGE_CHARS = 6000;

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
  });
});

app.post('/api/tutor', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  // Browsers send Origin on POST: only accept calls from this site itself.
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) { res.status(403).json({ code: 'FORBIDDEN', error: 'Request not allowed.' }); return; }
    } catch {
      res.status(403).json({ code: 'FORBIDDEN', error: 'Request not allowed.' });
      return;
    }
  }

  const limited = overLimit(req.ip || 'unknown');
  if (limited) {
    res.status(429).json({
      code: 'QUOTA_EXCEEDED',
      error: limited === 'site' ? 'The tutor has reached its daily limit. Please try again tomorrow.' : 'Too many questions just now. Please wait a few minutes.',
    });
    return;
  }

  const body = (req.body ?? {}) as { messages?: unknown; mode?: unknown };
  const mode = typeof body.mode === 'string' && ALLOWED_MODES.has(body.mode) ? body.mode : undefined;
  const raw = Array.isArray(body.messages) ? body.messages : [];
  // Keep only well-formed turns, cap their length, and keep the last 12.
  const messages = raw
    .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
      !!m && typeof m === 'object' && ((m as any).role === 'user' || (m as any).role === 'assistant') && typeof (m as any).content === 'string' && (m as any).content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  if (messages.length === 0) {
    res.status(400).json({ code: 'INVALID_REQUEST', error: 'Please provide a question or message.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      code: 'API_KEY_MISSING',
      error: 'The live AI tutor is not set up yet.',
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
    // Log the detail on the server only; visitors get a short, safe message.
    console.error('Gemini request failed:', err instanceof Error ? err.message : err);
    const rawMsg = err instanceof Error ? err.message : '';
    const status = rawMsg.includes('403') || rawMsg.includes('API_KEY') ? 502 : rawMsg.includes('429') ? 429 : 502;
    res.status(status).json({
      code: status === 429 ? 'QUOTA_EXCEEDED' : 'UPSTREAM_ERROR',
      error: status === 429 ? 'The AI service is busy. Please try again in a minute.' : 'The AI tutor is unavailable right now. Please try again.',
    });
  }
});

// Bad JSON or an oversized body: answer with a short JSON error, never a stack trace.
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(err);
  const status = (err as { status?: number })?.status === 413 ? 413 : 400;
  res.status(status).json({ code: 'INVALID_REQUEST', error: status === 413 ? 'That message is too long.' : 'Invalid request.' });
});

async function startServer() {
  if (!IS_PROD) {
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
