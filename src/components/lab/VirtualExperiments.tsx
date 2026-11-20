import React, { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { toBin8, toHex8 } from '../../engine/sim8085';

// 1. 8237 DMA Bus Handover Experiment
export const Dma8237Experiment: React.FC = () => {
  const [stage, setStage] = useState<number>(0);
  const stages = [
    { name: 'Idle (CPU Owns Bus)', dreq: 0, hold: 0, hlda: 0, dack: 0, note: '8085 is actively executing instructions on Address, Data, and Control buses.' },
    { name: '1. Peripheral Asserts DREQ', dreq: 1, hold: 0, hlda: 0, dack: 0, note: 'High-speed I/O device (e.g., Disk/ADC) raises DREQ to request direct memory block transfer.' },
    { name: '2. 8237 Asserts HOLD to 8085', dreq: 1, hold: 1, hlda: 0, dack: 0, note: '8237 DMA pulls Pin 39 (HOLD) HIGH asking the 8085 to relinquish bus ownership.' },
    { name: '3. 8085 Tri-States & Raises HLDA', dreq: 1, hold: 1, hlda: 1, dack: 0, note: '8085 finishes current cycle, floats A15–A8, AD7–AD0, RD\', WR\', IO/M\', and replies with Pin 38 (HLDA = 1).' },
    { name: '4. Direct RAM ↔ I/O Transfer (DACK)', dreq: 1, hold: 1, hlda: 1, dack: 1, note: '8237 asserts DACK and transfers bytes directly between RAM and Peripheral with ZERO CPU instruction overhead!' },
  ];
  const cur = stages[stage];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">8237 DMA Controller Handshake Simulator</h4>
          <p className="text-xs text-slate-500">Step through DREQ → HOLD → HLDA → DACK bus arbitration between 8085, 8237, and RAM.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setStage((s) => (s + 1) % stages.length)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer">
            <Play className="w-3.5 h-3.5" /> Step ({stage + 1}/{stages.length})
          </button>
          <button type="button" onClick={() => setStage(0)} className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer" aria-label="Reset DMA">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <svg viewBox="0 0 640 165" className="w-full h-auto rounded-xl bg-slate-950 border border-slate-800 p-2">
        <rect x="20" y="34" width="145" height="90" rx="10" fill={cur.hlda ? '#1e293b' : '#172554'} stroke={cur.hlda ? '#64748b' : '#38bdf8'} strokeWidth="2" />
        <text x="92" y="72" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">8085 CPU</text>
        <text x="92" y="94" textAnchor="middle" fill={cur.hlda ? '#fbbf24' : '#7dd3fc'} fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          {cur.hlda ? 'BUS TRI-STATED' : 'BUS MASTER'}
        </text>

        {/* HOLD & HLDA lines */}
        <line x1="165" y1="62" x2="245" y2="62" stroke={cur.hold ? '#f59e0b' : '#334155'} strokeWidth="2.5" className={cur.hold ? 'animate-signal-flow' : ''} />
        <text x="205" y="54" textAnchor="middle" fill={cur.hold ? '#fcd34d' : '#64748b'} fontSize="9.5" fontFamily="IBM Plex Mono, monospace">HOLD={cur.hold}</text>

        <line x1="165" y1="96" x2="245" y2="96" stroke={cur.hlda ? '#34d399' : '#334155'} strokeWidth="2.5" className={cur.hlda ? 'animate-signal-flow' : ''} />
        <text x="205" y="114" textAnchor="middle" fill={cur.hlda ? '#6ee7b7' : '#64748b'} fontSize="9.5" fontFamily="IBM Plex Mono, monospace">HLDA={cur.hlda}</text>

        <rect x="245" y="34" width="150" height="90" rx="10" fill={cur.hlda ? '#312e81' : '#0f172a'} stroke={cur.hold ? '#a78bfa' : '#334155'} strokeWidth="2" />
        <text x="320" y="72" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">8237 DMA</text>
        <text x="320" y="94" textAnchor="middle" fill="#c4b5fd" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          {cur.dack ? 'TRANSFERRING!' : '4-CH CONTROLLER'}
        </text>

        {/* DREQ & DACK lines */}
        <line x1="395" y1="62" x2="475" y2="62" stroke={cur.dreq ? '#38bdf8' : '#334155'} strokeWidth="2.5" className={cur.dreq ? 'animate-signal-flow' : ''} />
        <text x="435" y="54" textAnchor="middle" fill={cur.dreq ? '#7dd3fc' : '#64748b'} fontSize="9.5" fontFamily="IBM Plex Mono, monospace">DREQ={cur.dreq}</text>

        <line x1="395" y1="96" x2="475" y2="96" stroke={cur.dack ? '#34d399' : '#334155'} strokeWidth="2.5" className={cur.dack ? 'animate-signal-flow' : ''} />
        <text x="435" y="114" textAnchor="middle" fill={cur.dack ? '#6ee7b7' : '#64748b'} fontSize="9.5" fontFamily="IBM Plex Mono, monospace">DACK={cur.dack}</text>

        <rect x="475" y="34" width="145" height="90" rx="10" fill={cur.dack ? '#064e3b' : '#0f172a'} stroke={cur.dreq ? '#34d399' : '#334155'} strokeWidth="2" />
        <text x="547" y="72" textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="700">I/O ↔ RAM</text>
        <text x="547" y="94" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          {cur.dack ? 'DIRECT DATA FLOW' : 'WAITING'}
        </text>
      </svg>

      <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3.5 text-xs">
        <div className="font-semibold text-blue-700 dark:text-cyan-300">{cur.name}</div>
        <p className="text-slate-700 dark:text-slate-200 mt-0.5">{cur.note}</p>
      </div>
    </div>
  );
};

// 2. 8253/8254 Timer Modes Waveform Simulator
export const Timer8253Experiment: React.FC = () => {
  const [mode, setMode] = useState<0 | 2 | 3>(3);
  const [countN, setCountN] = useState<number>(4);
  const [tick, setTick] = useState<number>(0);

  const half = Math.ceil(countN / 2);
  const getOut = (t: number) => {
    if (mode === 0) return t >= countN ? 1 : 0; // Interrupt on Terminal Count
    if (mode === 2) return t % countN === countN - 1 ? 0 : 1; // Rate Generator (1-clock LOW pulse every N)
    return t % countN < half ? 1 : 0; // Mode 3 Square Wave Generator
  };

  const totalTicks = 12;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">8253 / 8254 Programmable Interval Timer</h4>
          <p className="text-xs text-slate-500">Compare Mode 0 (Terminal Count), Mode 2 (Rate Generator), and Mode 3 (Square Wave).</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([0, 2, 3] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setTick(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${mode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              Mode {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="inline-flex items-center gap-2 font-mono">
          <span>Count N = {countN}</span>
          <input type="range" min={2} max={8} value={countN} onChange={(e) => setCountN(Number(e.target.value))} className="accent-blue-600" />
        </label>
        <button type="button" onClick={() => setTick((t) => (t + 1) % totalTicks)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-mono cursor-pointer">
          <Zap className="w-3.5 h-3.5" /> Pulse CLK (t={tick})
        </button>
      </div>

      <svg viewBox="0 0 620 120" className="w-full h-auto rounded-xl bg-slate-950 border border-slate-800 p-2">
        <text x="14" y="42" fill="#94a3b8" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">CLK</text>
        <text x="14" y="92" fill="#38bdf8" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">OUT</text>
        {Array.from({ length: totalTicks }).map((_, i) => {
          const x = 60 + i * 44;
          const outVal = getOut(i);
          const nextOut = getOut(i + 1);
          const yOut = outVal ? 72 : 102;
          const yNext = nextOut ? 72 : 102;
          return (
            <g key={i}>
              {i === tick && <rect x={x} y="8" width="44" height="104" fill="rgba(56,189,248,0.16)" />}
              <path d={`M ${x} 46 L ${x} 24 L ${x + 22} 24 L ${x + 22} 46 L ${x + 44} 46`} fill="none" stroke="#64748b" strokeWidth="1.8" />
              <path d={`M ${x} ${yOut} L ${x + 44} ${yOut} L ${x + 44} ${yNext}`} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <text x={x + 22} y="16" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="IBM Plex Mono, monospace">{i}</text>
            </g>
          );
        })}
      </svg>

      <p className="text-xs text-slate-600 dark:text-slate-300">
        {mode === 0 && `Mode 0 (Interrupt on Terminal Count): OUT stays LOW while down-counting from N=${countN} to 0, then goes HIGH permanently until reloaded.`}
        {mode === 2 && `Mode 2 (Rate Generator): Auto-reloads N=${countN} and emits a 1-clock active-LOW strobe every ${countN} cycles (f_out = f_clk / ${countN}).`}
        {mode === 3 && `Mode 3 (Square Wave Generator): Outputs HIGH for ${half} clocks and LOW for ${countN - half} clocks continuously (f_out = f_clk / ${countN}).`}
      </p>
    </div>
  );
};

// 3. 8259A Programmable Interrupt Controller Priority Simulator
export const Pic8259Experiment: React.FC = () => {
  const [irr, setIrr] = useState<number>(0b00101000); // IR3 & IR5 pending
  const [imr, setImr] = useState<number>(0b00001000); // IR3 masked!

  const unmasked = irr & (~imr & 0xff);
  let winner: number | null = null;
  for (let i = 0; i < 8; i++) {
    if ((unmasked >> i) & 1) {
      winner = i;
      break;
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">8259A Interrupt Controller (IRR, IMR &amp; Priority Resolver)</h4>
          <p className="text-xs text-slate-500">Toggle incoming IR0–IR7 requests and IMR mask bits. Fully Nested Priority gives IR0 highest priority.</p>
        </div>
        <div className="font-mono text-xs text-blue-600 dark:text-cyan-400">
          {winner !== null ? `SERVICING: IR${winner} → INT to CPU` : 'NO UNMASKED INTERRUPT'}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-center text-xs">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const req = ((irr >> i) & 1) === 1;
          const masked = ((imr >> i) & 1) === 1;
          const active = winner === i;
          return (
            <div key={i} className={`rounded-xl border p-2 space-y-1.5 ${active ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}>
              <div className="font-bold text-slate-900 dark:text-white">IR{i}</div>
              <button
                type="button"
                onClick={() => setIrr((v) => v ^ (1 << i))}
                className={`w-full py-1 rounded text-[10px] cursor-pointer ${req ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
              >
                IRR={req ? 1 : 0}
              </button>
              <button
                type="button"
                onClick={() => setImr((v) => v ^ (1 << i))}
                className={`w-full py-1 rounded text-[10px] cursor-pointer ${masked ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
              >
                {masked ? 'MASKED' : 'OPEN'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="font-mono text-xs text-slate-600 dark:text-slate-300">
        IRR = {toHex8(irr)}H ({toBin8(irr)}) · IMR = {toHex8(imr)}H ({toBin8(imr)}) · Priority Winner: {winner !== null ? `IR${winner} (sets ISR bit ${winner})` : 'None'}
      </div>
    </div>
  );
};

// 4. 4x4 Matrix Keypad Row-Scan Interfacing Simulator
const KEY_MAP = [
  ['0', '1', '2', '3'],
  ['4', '5', '6', '7'],
  ['8', '9', 'A', 'B'],
  ['C', 'D', 'E', 'F'],
];

export const KeypadMatrixExperiment: React.FC = () => {
  const [pressed, setPressed] = useState<{ r: number; c: number; key: string } | null>({ r: 1, c: 2, key: '6' });

  const rowByte = pressed ? (~(1 << pressed.r)) & 0x0f : 0x0f;
  const colByte = pressed ? (~(1 << pressed.c)) & 0x0f : 0x0f;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">4×4 Matrix Keypad Interfacing (8 Pins for 16 Keys)</h4>
          <p className="text-xs text-slate-500">Press any key to observe Row Scanning (PC4–PC7 outputs 0) and Column Return (PC0–PC3 reads 0).</p>
        </div>
        <div className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
          {pressed ? `Key '${pressed.key}' at (Row ${pressed.r}, Col ${pressed.c})` : 'No Key Pressed'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-6 grid grid-cols-4 gap-2">
          {KEY_MAP.map((row, r) =>
            row.map((key, c) => {
              const active = pressed?.r === r && pressed?.c === c;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPressed({ r, c, key })}
                  className={`h-11 rounded-xl font-mono text-sm font-bold border transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {key}
                </button>
              );
            })
          )}
        </div>

        <div className="md:col-span-6 rounded-xl bg-slate-950 text-slate-100 p-4 border border-slate-800 font-mono text-xs space-y-2.5">
          <div className="text-cyan-300 font-semibold">Live 8255 Port C Scan Readout</div>
          <div>Row Drive (R3–R0): <span className="text-amber-300">{rowByte.toString(2).padStart(4, '0')}B</span> (Grounds Row {pressed?.r ?? '-'})</div>
          <div>Col Read  (C3–C0): <span className="text-emerald-300">{colByte.toString(2).padStart(4, '0')}B</span> (Detects 0 on Col {pressed?.c ?? '-'})</div>
          <div className="text-slate-400 pt-1 border-t border-slate-800">
            Scan Code Byte: <span className="text-white font-bold">{toHex8((rowByte << 4) | colByte)}H</span> → Lookup Table returns ASCII &apos;{pressed?.key ?? '-'}&apos; after 20 ms software debounce.
          </div>
        </div>
      </div>
    </div>
  );
};
