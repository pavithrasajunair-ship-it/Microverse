import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, AlertTriangle, RefreshCw, Upload, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { assemble8085, createInitialCpuState, step8085, toHex16, toHex8 } from '../../engine/sim8085';

type TutorMode =
  | 'Explain Simply'
  | 'Line-by-Line Assembly'
  | 'Debug My Code'
  | 'Generate Practice Quiz'
  | 'Interactive Viva';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'live' | 'offline';
  error?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Explain MOV A, B and ADD B in Intel 8085 step by step, including how flags change.',
  'Debug this 8085 loop: LXI B, 0005H / LOOP: DCX B / JNZ LOOP / HLT',
  'Derive the 20-bit physical address in 8086 for CS = 348AH and IP = 4214H, and explain why segmentation exists.',
  'Explain 8051 Internal RAM (00H–7FH), Register Banks, and why SP starts at 07H.',
  'Generate a 3-question university exam quiz on 8255 PPI Control Words and 8085 Timing Diagrams.',
];

// Clean Markdown Renderer for Circuit Mentor responses (headings, code fences, bold, inline code, lists)
const FormattedReply: React.FC<{ text: string }> = ({ text }) => {
  const blocks = text.split(/(```[\s\S]*?```)/g);

  const renderInline = (line: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 font-mono text-[12px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const inner = block.slice(3, -3).replace(/^[a-zA-Z0-9_-]*\n/, '');
          return (
            <pre
              key={bIdx}
              className="rounded-xl bg-slate-950 text-cyan-200 border border-slate-800 p-3.5 font-mono text-xs overflow-x-auto leading-relaxed"
            >
              {inner.trim()}
            </pre>
          );
        }

        const lines = block.split('\n');
        return (
          <div key={bIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed === '---') {
                return <hr key={lIdx} className="border-slate-200 dark:border-slate-800 my-2" />;
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold text-blue-700 dark:text-cyan-300 pt-1">
                    {renderInline(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-base font-bold text-slate-900 dark:text-white pt-1">
                    {renderInline(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex gap-2 pl-1">
                    <span className="text-blue-500 shrink-0">•</span>
                    <span>{renderInline(trimmed.slice(2))}</span>
                  </div>
                );
              }
              return <p key={lIdx}>{renderInline(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Extract optional follow-up suggestions from assistant response
function extractFollowUps(text: string): string[] {
  const marker = text.match(/###\s*Suggested Follow-Ups([\s\S]*)$/i);
  if (!marker) return [];
  return marker[1]
    .split('\n')
    .map((l) => l.replace(/^[-*\d.)\s]+/, '').trim())
    .filter((l) => l.length > 8 && l.length < 140)
    .slice(0, 3);
}

// Honest Offline Engineering Fallback (uses real sim8085 execution trace when assembly code is pasted)
function buildOfflineFallback(input: string, reason: string): string {
  const lower = input.toLowerCase();

  if (/\b(mvi|mov|lxi|add|sub|inr|dcr|sta|lda|hlt|xra|cmp|rlc|push|pop|call|ret)\b/i.test(input)) {
    const cleanLines = input
      .split(/\n|\//)
      .map((l) => l.replace(/debug this 8085.*:/i, '').trim())
      .filter((l) =>
        /^(org|mvi|mov|lxi|add|adi|sub|sui|inr|dcr|inx|dcx|sta|lda|ana|ora|xra|cmp|jmp|jz|jnz|jc|jnc|call|ret|push|pop|rlc|rrc|stc|cmc|cma|out|in|nop|hlt|[a-z0-9_]+:)/i.test(
          l
        )
      );

    if (cleanLines.length >= 1) {
      const hasDcxBug = /dcx\s+[bdh]/i.test(input) && /jnz|jz/i.test(input) && !/ora\s+[cel]/i.test(input);
      if (hasDcxBug) {
        return `### Offline 8085 Assembly Debugger\n*(Live AI unavailable: ${reason})*\n\n**Hardware Bug Detected:** On the Intel 8085, 16-bit \`DCX\` and \`INX\` instructions modify **zero flags**—they do NOT update the Zero flag (\`Z\`). Placing \`JNZ LOOP\` right after \`DCX B\` tests whatever stale value was previously in \`Z\`.\n\n### Corrected Program\n\`\`\`asm\nLXI B, 0005H\nLOOP: DCX B\nMOV A, B      ; Move high byte B into Accumulator\nORA C         ; A = B OR C (sets Z=1 ONLY when B=00H and C=00H)\nJNZ LOOP      ; Now reliably loops until BC = 0000H\nHLT\n\`\`\``;
      }

      const asm = assemble8085(cleanLines.join('\n'), 0x2000);
      if (asm.errors.length === 0 && asm.instructions.length > 0) {
        let st = createInitialCpuState(0x2000);
        const trace: string[] = [];
        for (let i = 0; i < 16 && !st.halted; i++) {
          const pcBefore = st.PC;
          st = step8085(st, asm);
          trace.push(`- \`${toHex16(pcBefore)}H\`: ${st.lastAction}`);
        }
        return `### Offline 8085 Cycle-Accurate Trace\n*(Live AI unavailable: ${reason})*\n\n${trace.join('\n')}\n\n### Resulting Register & Flag State\n\`\`\`text\nA=${toHex8(st.A)}H  B=${toHex8(st.B)}H  C=${toHex8(st.C)}H  D=${toHex8(st.D)}H  E=${toHex8(st.E)}H  HL=${toHex8(st.H)}${toHex8(st.L)}H\nPC=${toHex16(st.PC)}H  SP=${toHex16(st.SP)}H  Flags: S=${st.flags.S} Z=${st.flags.Z} AC=${st.flags.AC} P=${st.flags.P} CY=${st.flags.CY}\n\`\`\``;
      }
    }
  }

  if (lower.includes('flag') || lower.includes('parity') || lower.includes('auxiliary')) {
    return `### 8085 Flag Register Reference (Offline Mode)\n*(Live AI unavailable: ${reason})*\n\nBit positions: \`D7=S | D6=Z | D5=X | D4=AC | D3=X | D2=P | D1=X | D0=CY\`\n- **Sign (S):** Equals bit D7 of the ALU result (1 = negative in 2's complement).\n- **Zero (Z):** Set to 1 when result = \`00H\`.\n- **Auxiliary Carry (AC):** Set to 1 on nibble carry D3 → D4 (used by \`DAA\`).\n- **Parity (P):** Set to 1 when result has an **even** count of 1-bits.\n- **Carry (CY):** Set to 1 on carry out of D7 (ADD) or borrow (SUB/CMP).\n- **Critical Rule:** \`INR\`/\`DCR\` never alter \`CY\`; \`INX\`/\`DCX\` alter no flags.`;
  }

  if (lower.includes('8086') || lower.includes('segment') || lower.includes('physical')) {
    return `### 8086 Memory Segmentation (Offline Mode)\n*(Live AI unavailable: ${reason})*\n\nThe 8086 BIU forms a 20-bit Physical Address (1 MB space: \`00000H–FFFFFH\`) from two 16-bit registers:\n\`\`\`text\nPhysical Address = (Segment Register × 10H) + Offset\nExample: CS = 348AH, IP = 4214H\n  348A0H + 04214H = 38AB4H\n\`\`\`\nDefault pairs: \`CS:IP\`, \`DS:BX/SI\`, \`SS:SP/BP\`, \`ES:DI\`.`;
  }

  return `### Offline Reference Mode\nLive AI service could not be reached (${reason}).\n\n**Required Configuration for Live AI:** Ensure \`GEMINI_API_KEY\` is set in your server environment / AI Studio **Settings > Secrets** panel, then click **Retry**.\n\nWhile offline, you can still:\n- Paste any **8085 assembly code** here to run our real local assembler & step-by-step CPU trace.\n- Ask about **8085 Flags**, **8086 Segmentation**, or explore the interactive visualizers inside **Learning Modules** and **Virtual Lab**.`;
}

export const CircuitMentor: React.FC = () => {
  const [mode, setMode] = useState<TutorMode>('Explain Simply');
  const [aiStatus, setAiStatus] = useState<'checking' | 'live' | 'offline'>('checking');
  const [lastError, setLastError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '### Welcome to Circuit Mentor\nAsk any university-level question on **Intel 8085, 8086, 8051, or Peripheral Interfacing**, paste or upload an `.asm` program for line-by-line debugging, or switch modes above to generate custom quizzes and Viva questions.',
    },
  ]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkHealth = () => {
    setAiStatus('checking');
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setAiStatus(d.aiConfigured ? 'live' : 'offline'))
      .catch(() => setAiStatus('offline'));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textOverride?: string, isRetry = false) => {
    const content = (textOverride ?? input).trim();
    if (!content || loading) return;

    setLastError(null);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content };
    const nextHistory = isRetry ? messages : [...messages, userMsg];
    if (!isRetry) {
      setMessages(nextHistory);
      setInput('');
    }
    setLoading(true);
    setFollowUps([]);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          messages: nextHistory
            .filter((m) => !m.error && m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setAiStatus('live');
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: data.reply, source: 'live' },
        ]);
        setFollowUps(extractFollowUps(data.reply));
      } else {
        const errText = data.error || `Server error (${res.status})`;
        setLastError(errText);
        if (data.code === 'API_KEY_MISSING') setAiStatus('offline');
        const fallback = buildOfflineFallback(content, errText);
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: fallback, source: 'offline', error: true },
        ]);
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Network connection failed';
      setLastError(errText);
      setAiStatus('offline');
      const fallback = buildOfflineFallback(content, errText);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: fallback, source: 'offline', error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const codeText = String(reader.result ?? '').slice(0, 4000);
      setMode('Line-by-Line Assembly');
      setInput(`Explain and debug this uploaded assembly file (${file.name}) line by line:\n\`\`\`asm\n${codeText}\n\`\`\``);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Circuit Mentor
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Interactive engineering tutor with live Gemini reasoning, assembly debugging, `.asm` upload, and university quiz generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {aiStatus === 'live' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live AI Connected
            </span>
          )}
          {aiStatus === 'offline' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              Offline Reference Fallback Active
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setMessages([messages[0]]);
              setFollowUps([]);
              setLastError(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-[#0E1729] border border-slate-200 dark:border-slate-800">
        {(
          ['Explain Simply', 'Line-by-Line Assembly', 'Debug My Code', 'Generate Practice Quiz', 'Interactive Viva'] as TutorMode[]
        ).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {lastError && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-amber-800 dark:text-amber-200">
            <strong>Notice:</strong> {lastError}
          </div>
          {lastUserMessage && (
            <button
              type="button"
              onClick={() => sendMessage(lastUserMessage.content, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Live Request
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Chat Panel */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] flex flex-col h-[580px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3.5 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white text-sm whitespace-pre-wrap'
                      : 'bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.role === 'user' ? m.content : <FormattedReply text={m.content} />}
                  {m.source && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                      {m.source === 'live' ? 'Answered by Circuit Mentor (Live AI)' : 'Answered by Offline Engineering Fallback'}
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 text-xs font-mono text-blue-600 dark:text-cyan-400 pl-11">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Circuit Mentor is formulating a step-by-step engineering response...
              </div>
            )}

            {!loading && followUps.length > 0 && (
              <div className="pl-11 flex flex-wrap gap-2 pt-1">
                {followUps.map((fq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(fq)}
                    className="px-3 py-1.5 rounded-lg border border-blue-500/35 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-xs text-blue-700 dark:text-cyan-300 transition-colors cursor-pointer text-left"
                  >
                    ↳ {fq}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-2"
          >
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".asm,.txt,.s"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload .asm or .txt program"
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
              </button>
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Ask Circuit Mentor (${mode}) or paste 8085/8086/8051 assembly... (Enter to send)`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-45 text-white text-xs font-semibold cursor-pointer shrink-0 h-[42px]"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Right: Suggested Prompts & Capabilities */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Try Asking Circuit Mentor
            </div>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-900 dark:text-white">Upload or Paste Assembly Code</div>
            <p className="leading-relaxed">
              Click the upload icon next to the chat box to load any <span className="font-mono">.asm</span> or <span className="font-mono">.txt</span> program, or paste multi-line assembly directly for line-by-line register &amp; flag analysis.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
