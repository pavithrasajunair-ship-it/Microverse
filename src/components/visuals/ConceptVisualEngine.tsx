import React, { useState } from 'react';
import { VisualWidgetType } from '../../types';
import { Architecture8085Explorer } from './Architecture8085Explorer';
import { Pinout8085Explorer } from './Pinout8085Explorer';
import { InstructionVisualizer } from './InstructionVisualizer';
import { Dma8237Experiment, KeypadMatrixExperiment, Pic8259Experiment, Timer8253Experiment } from '../lab/VirtualExperiments';
import { toBin8, toHex8, toHex16, calcParity } from '../../engine/sim8085';

// Interactive Timing Diagram SVG Generator covering all 5 Basic Machine Cycles + Complete Instructions
interface TimingCycleSpec {
  name: string;
  kind: 'OF' | 'MR' | 'MW' | 'IOR' | 'IOW';
  tStates: number;
  ioM: 0 | 1;
  s1: 0 | 1;
  s0: 0 | 1;
  rd: 0 | 1;
  wr: 0 | 1;
  highAddr: string;
  lowAddr: string;
  dataByte: string;
}

interface TimingSpec {
  id: string;
  group: 'Machine Cycle' | 'Full Instruction';
  label: string;
  bytes: string;
  summary: string;
  cycles: TimingCycleSpec[];
}

export const TIMING_SPECS: TimingSpec[] = [
  // 5 Fundamental Machine Cycles
  {
    id: 'mc-of',
    group: 'Machine Cycle',
    label: 'Opcode Fetch (4T)',
    bytes: '4F / 3E / 78',
    summary: 'Fetches the 8-bit instruction opcode from memory pointed to by PC (T1–T3) and decodes it internally (T4).',
    cycles: [
      { name: 'Opcode Fetch (4T)', kind: 'OF', tStates: 4, ioM: 0, s1: 1, s0: 1, rd: 0, wr: 1, highAddr: '20H', lowAddr: '00H', dataByte: 'Opcode' },
    ],
  },
  {
    id: 'mc-mr',
    group: 'Machine Cycle',
    label: 'Memory Read (3T)',
    bytes: 'Operand / Data',
    summary: 'Reads 1 byte of operand or data from external memory. Identical to T1–T3 of Opcode Fetch except S1=1, S0=0 and no T4 decode.',
    cycles: [
      { name: 'Memory Read (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '25H', lowAddr: '00H', dataByte: 'Data In' },
    ],
  },
  {
    id: 'mc-mw',
    group: 'Machine Cycle',
    label: 'Memory Write (3T)',
    bytes: 'Data Out',
    summary: 'Writes 1 byte from CPU register onto memory. WR\' drops LOW in T2–T3 while CPU drives data onto AD7–AD0.',
    cycles: [
      { name: 'Memory Write (3T)', kind: 'MW', tStates: 3, ioM: 0, s1: 0, s0: 1, rd: 1, wr: 0, highAddr: '25H', lowAddr: '00H', dataByte: 'Data Out' },
    ],
  },
  {
    id: 'mc-ior',
    group: 'Machine Cycle',
    label: 'I/O Read (3T)',
    bytes: 'IN Port',
    summary: 'Reads 1 byte from an 8-bit input port. IO/M\' goes HIGH (1) and the 8-bit port address is duplicated on both A15–A8 and AD7–AD0.',
    cycles: [
      { name: 'I/O Read (3T)', kind: 'IOR', tStates: 3, ioM: 1, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '02H', lowAddr: '02H', dataByte: 'Port In' },
    ],
  },
  {
    id: 'mc-iow',
    group: 'Machine Cycle',
    label: 'I/O Write (3T)',
    bytes: 'OUT Port',
    summary: 'Writes Accumulator to an 8-bit output port. IO/M\' = 1, S1 = 0, S0 = 1, WR\' goes LOW in T2–T3.',
    cycles: [
      { name: 'I/O Write (3T)', kind: 'IOW', tStates: 3, ioM: 1, s1: 0, s0: 1, rd: 1, wr: 0, highAddr: '01H', lowAddr: '01H', dataByte: '[A] Out' },
    ],
  },
  // Full Instructions
  {
    id: 'mvi',
    group: 'Full Instruction',
    label: 'MVI A, 32H (7T)',
    bytes: '3EH, 32H',
    summary: '2-byte immediate load: 1 Opcode Fetch (4T) + 1 Memory Read (3T) = 7 T-states.',
    cycles: [
      { name: 'M1: Opcode Fetch (4T)', kind: 'OF', tStates: 4, ioM: 0, s1: 1, s0: 1, rd: 0, wr: 1, highAddr: '20H', lowAddr: '00H', dataByte: '3EH' },
      { name: 'M2: Memory Read (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '01H', dataByte: '32H' },
    ],
  },
  {
    id: 'lda',
    group: 'Full Instruction',
    label: 'LDA 2500H (13T)',
    bytes: '3AH, 00H, 25H',
    summary: '3-byte direct memory read: OF (4T) + Read Low Addr (3T) + Read High Addr (3T) + Read Data at 2500H (3T) = 13T.',
    cycles: [
      { name: 'M1: Opcode Fetch (4T)', kind: 'OF', tStates: 4, ioM: 0, s1: 1, s0: 1, rd: 0, wr: 1, highAddr: '20H', lowAddr: '00H', dataByte: '3AH' },
      { name: 'M2: Read Low Addr (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '01H', dataByte: '00H' },
      { name: 'M3: Read High Addr (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '02H', dataByte: '25H' },
      { name: 'M4: Memory Read (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '25H', lowAddr: '00H', dataByte: 'M[2500]' },
    ],
  },
  {
    id: 'sta',
    group: 'Full Instruction',
    label: 'STA 2500H (13T)',
    bytes: '32H, 00H, 25H',
    summary: '3-byte direct memory write: OF (4T) + Read Low Addr (3T) + Read High Addr (3T) + Memory Write [A] to 2500H (3T) = 13T.',
    cycles: [
      { name: 'M1: Opcode Fetch (4T)', kind: 'OF', tStates: 4, ioM: 0, s1: 1, s0: 1, rd: 0, wr: 1, highAddr: '20H', lowAddr: '00H', dataByte: '32H' },
      { name: 'M2: Read Low Addr (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '01H', dataByte: '00H' },
      { name: 'M3: Read High Addr (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '02H', dataByte: '25H' },
      { name: 'M4: Memory Write (3T)', kind: 'MW', tStates: 3, ioM: 0, s1: 0, s0: 1, rd: 1, wr: 0, highAddr: '25H', lowAddr: '00H', dataByte: '[A]' },
    ],
  },
  {
    id: 'out',
    group: 'Full Instruction',
    label: 'OUT 01H (10T)',
    bytes: 'D3H, 01H',
    summary: '2-byte I/O output: OF (4T) + Read Port Address (3T) + I/O Write with IO/M\'=1 (3T) = 10 T-states.',
    cycles: [
      { name: 'M1: Opcode Fetch (4T)', kind: 'OF', tStates: 4, ioM: 0, s1: 1, s0: 1, rd: 0, wr: 1, highAddr: '20H', lowAddr: '00H', dataByte: 'D3H' },
      { name: 'M2: Read Port Addr (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '01H', dataByte: '01H' },
      { name: 'M3: I/O Write (3T)', kind: 'IOW', tStates: 3, ioM: 1, s1: 0, s0: 1, rd: 1, wr: 0, highAddr: '01H', lowAddr: '01H', dataByte: '[A]' },
    ],
  },
  {
    id: 'in',
    group: 'Full Instruction',
    label: 'IN 02H (10T)',
    bytes: 'DBH, 02H',
    summary: '2-byte I/O input: OF (4T) + Read Port Address (3T) + I/O Read with IO/M\'=1 (3T) = 10 T-states.',
    cycles: [
      { name: 'M1: Opcode Fetch (4T)', kind: 'OF', tStates: 4, ioM: 0, s1: 1, s0: 1, rd: 0, wr: 1, highAddr: '20H', lowAddr: '00H', dataByte: 'DBH' },
      { name: 'M2: Read Port Addr (3T)', kind: 'MR', tStates: 3, ioM: 0, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '20H', lowAddr: '01H', dataByte: '02H' },
      { name: 'M3: I/O Read (3T)', kind: 'IOR', tStates: 3, ioM: 1, s1: 1, s0: 0, rd: 0, wr: 1, highAddr: '02H', lowAddr: '02H', dataByte: 'Port[02]' },
    ],
  },
];

export const TimingDiagramInteractive: React.FC = () => {
  const [specId, setSpecId] = useState<string>('mvi');
  const [selectedT, setSelectedT] = useState<number>(0);
  const [clockMHz, setClockMHz] = useState<number>(3);
  const spec = TIMING_SPECS.find((s) => s.id === specId) ?? TIMING_SPECS[0];

  const tList: Array<{ tIndex: number; localT: number; cycleIdx: number; cycle: TimingCycleSpec }> = [];
  let idx = 0;
  spec.cycles.forEach((c, cIdx) => {
    for (let lt = 1; lt <= c.tStates; lt++) {
      tList.push({ tIndex: idx++, localT: lt, cycleIdx: cIdx, cycle: c });
    }
  });
  const clampedT = Math.min(selectedT, tList.length - 1);
  const activeSlot = tList[clampedT];
  const colW = 58;
  const startX = 104;
  const totalW = startX + tList.length * colW + 24;

  const describeTState = (slot: typeof activeSlot) => {
    const c = slot.cycle;
    const isIO = c.ioM === 1;
    if (slot.localT === 1) {
      return `T1 (Address & Status): A15–A8 outputs ${c.highAddr}, AD7–AD0 outputs ${c.lowAddr}. ALE pulses HIGH so external 74LS373 latches ${c.lowAddr}. IO/M'=${c.ioM} (${isIO ? 'I/O space' : 'Memory space'}), S1=${c.s1}, S0=${c.s0}.`;
    }
    if (slot.localT === 2) {
      return c.rd === 0
        ? `T2 (Read Strobe): ALE is LOW (address held in latch). RD' drops LOW; ${isIO ? 'input port' : 'memory chip'} drives ${c.dataByte} onto AD7–AD0. CPU samples READY pin.`
        : `T2 (Write Strobe): ALE is LOW. CPU places ${c.dataByte} onto AD7–AD0 and drops WR' LOW so ${isIO ? 'output port' : 'RAM'} begins latching the byte.`;
    }
    if (slot.localT === 3) {
      return c.rd === 0
        ? `T3 (Data Capture): CPU latches ${c.dataByte} from AD7–AD0 into ${c.kind === 'OF' ? 'Instruction Register (IR)' : 'internal register'}, then raises RD' back HIGH.`
        : `T3 (Write Complete): Rising edge of WR' latches ${c.dataByte} into ${isIO ? 'output port' : 'RAM'} and completes the write transfer.`;
    }
    return `T4 (Internal Opcode Decode): External data bus floats to High-Z. Instruction Decoder interprets ${c.dataByte} and schedules the next machine cycle while PC increments.`;
  };

  return (
    <div className="space-y-4">
      {/* Selector Groups: Basic Machine Cycles + Full Instructions */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            5 Fundamental Machine Cycles
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Clock:</span>
            {[2, 3, 5].map((mhz) => (
              <button
                key={mhz}
                type="button"
                onClick={() => setClockMHz(mhz)}
                className={`px-2 py-0.5 rounded font-mono cursor-pointer ${
                  clockMHz === mhz ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {mhz} MHz
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TIMING_SPECS.filter((s) => s.group === 'Machine Cycle').map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSpecId(s.id);
                setSelectedT(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                specId === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Complete Multi-Cycle Instructions</div>
          <div className="flex flex-wrap gap-1.5">
            {TIMING_SPECS.filter((s) => s.group === 'Full Instruction').map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSpecId(s.id);
                  setSelectedT(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  specId === s.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-600 dark:text-slate-300">{spec.summary}</span>
          <span className="font-mono text-blue-600 dark:text-cyan-400 tabular-nums shrink-0">
            Bytes: {spec.bytes} · {tList.length}T = {(tList.length / clockMHz).toFixed(2)} µs @ {clockMHz} MHz
          </span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${totalW} 360`} className="w-full min-w-[540px] h-auto select-none">
          {/* Machine Cycle Header Brackets */}
          {(() => {
            let offset = 0;
            return spec.cycles.map((c, ci) => {
              const x = startX + offset * colW;
              const w = c.tStates * colW;
              offset += c.tStates;
              return (
                <g key={ci}>
                  <rect x={x + 2} y="4" width={w - 4} height="18" rx="4" fill="#1e293b" stroke="#334155" />
                  <text x={x + w / 2} y="16" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
                    {c.name}
                  </text>
                </g>
              );
            });
          })()}

          {/* Signal Row Labels */}
          {[
            { label: 'CLK', y: 58 },
            { label: 'ALE', y: 98 },
            { label: "IO/M'", y: 138 },
            { label: 'S1, S0', y: 178 },
            { label: 'A15–A8', y: 218 },
            { label: 'AD7–AD0', y: 260 },
            { label: "RD'", y: 302 },
            { label: "WR'", y: 340 },
          ].map((row) => (
            <text key={row.label} x="12" y={row.y + 4} fill="#94a3b8" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
              {row.label}
            </text>
          ))}

          {/* T-State Columns */}
          {tList.map((slot, i) => {
            const x = startX + i * colW;
            const isSel = i === clampedT;
            const aleHigh = slot.localT === 1;
            const ioHigh = slot.cycle.ioM === 1;
            const rdLow = slot.cycle.rd === 0 && (slot.localT === 2 || slot.localT === 3);
            const wrLow = slot.cycle.wr === 0 && (slot.localT === 2 || slot.localT === 3);

            return (
              <g key={i} onClick={() => setSelectedT(i)} className="cursor-pointer">
                <rect
                  x={x}
                  y={24}
                  width={colW}
                  height={330}
                  fill={isSel ? 'rgba(56, 189, 248, 0.14)' : 'transparent'}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text x={x + colW / 2} y="37" textAnchor="middle" fill={isSel ? '#38bdf8' : '#64748b'} fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="700">
                  T{slot.localT}
                </text>

                {/* CLK square wave */}
                <path
                  d={`M ${x} 66 L ${x} 48 L ${x + colW / 2} 48 L ${x + colW / 2} 66 L ${x + colW} 66`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* ALE pulse */}
                <path
                  d={
                    aleHigh
                      ? `M ${x} 106 L ${x + 6} 88 L ${x + colW - 8} 88 L ${x + colW} 106`
                      : `M ${x} 106 L ${x + colW} 106`
                  }
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />

                {/* IO/M' level */}
                <path
                  d={ioHigh ? `M ${x} 128 L ${x + colW} 128` : `M ${x} 146 L ${x + colW} 146`}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2"
                />
                {slot.localT === 1 && (
                  <text x={x + colW / 2} y={ioHigh ? 142 : 138} textAnchor="middle" fill="#c4b5fd" fontSize="8.5" fontFamily="IBM Plex Mono, monospace">
                    {ioHigh ? '1(I/O)' : '0(MEM)'}
                  </text>
                )}

                {/* S1, S0 status box */}
                <rect x={x + 2} y="166" width={colW - 4} height="20" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                <text x={x + colW / 2} y="179" textAnchor="middle" fill="#e2e8f0" fontSize="8.5" fontFamily="IBM Plex Mono, monospace">
                  {slot.cycle.s1},{slot.cycle.s0}
                </text>

                {/* A15-A8 bus envelope */}
                <rect x={x + 2} y="206" width={colW - 4} height="22" rx="3" fill="#172554" stroke="#60a5fa" strokeWidth="1" />
                <text x={x + colW / 2} y="220" textAnchor="middle" fill="#e0f2fe" fontSize="9" fontFamily="IBM Plex Mono, monospace">
                  {slot.localT === 4 ? 'Unsp' : slot.cycle.highAddr}
                </text>

                {/* AD7-AD0 bus envelope */}
                <rect
                  x={x + 2}
                  y="248"
                  width={colW - 4}
                  height="22"
                  rx="3"
                  fill={slot.localT === 1 ? '#312e81' : slot.localT === 4 ? '#0f172a' : '#064e3b'}
                  stroke={slot.localT === 1 ? '#a78bfa' : slot.localT === 4 ? '#475569' : '#10b981'}
                  strokeWidth="1"
                />
                <text x={x + colW / 2} y="262" textAnchor="middle" fill="#f8fafc" fontSize="8.5" fontFamily="IBM Plex Mono, monospace">
                  {slot.localT === 1 ? slot.cycle.lowAddr : slot.localT === 4 ? 'Hi-Z' : slot.cycle.dataByte}
                </text>

                {/* RD' active low */}
                <path
                  d={rdLow ? `M ${x} 310 L ${x + colW} 310` : `M ${x} 292 L ${x + colW} 292`}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />

                {/* WR' active low */}
                <path
                  d={wrLow ? `M ${x} 348 L ${x + colW} 348` : `M ${x} 330 L ${x + colW} 330`}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active T-state Scrubber Readout */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-mono text-blue-600 dark:text-cyan-400">
            {activeSlot.cycle.name} · T{activeSlot.localT} (Slot {clampedT + 1} / {tList.length})
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {describeTState(activeSlot)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={clampedT === 0}
            onClick={() => setSelectedT((t) => Math.max(0, t - 1))}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs disabled:opacity-40 cursor-pointer"
          >
            Prev T
          </button>
          <button
            type="button"
            disabled={clampedT >= tList.length - 1}
            onClick={() => setSelectedT((t) => Math.min(tList.length - 1, t + 1))}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-40 cursor-pointer"
          >
            Next T
          </button>
        </div>
      </div>
    </div>
  );
};

// Interactive Microprocessor vs Microcontroller Die Architecture Switcher
const UpVsUcVisual: React.FC = () => {
  const [mode, setMode] = useState<'up' | 'uc'>('up');
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">Silicon Integration Comparison: µP System vs Single-Chip µC</span>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setMode('up')} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${mode === 'up' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            Microprocessor (8085 / 8086)
          </button>
          <button type="button" onClick={() => setMode('uc')} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${mode === 'uc' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            Microcontroller (8051 / Cortex-M)
          </button>
        </div>
      </div>

      <svg viewBox="0 0 640 195" className="w-full h-auto">
        {mode === 'up' ? (
          <g>
            <rect x="20" y="34" width="175" height="118" rx="12" fill="#172554" stroke="#38bdf8" strokeWidth="2.2" />
            <text x="107" y="64" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="IBM Plex Mono, monospace">SEPARATE CPU IC</text>
            <text x="107" y="92" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">ALU + CU + Regs</text>
            <text x="107" y="114" textAnchor="middle" fill="#93c5fd" fontSize="10">No On-Chip RAM / ROM</text>
            <text x="107" y="132" textAnchor="middle" fill="#93c5fd" fontSize="10">No Timers or GPIO</text>

            {/* External System Bus */}
            <line x1="195" y1="93" x2="295" y2="93" stroke="#f59e0b" strokeWidth="5" className="animate-signal-flow" />
            <text x="245" y="79" textAnchor="middle" fill="#fcd34d" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">EXT BUS</text>
            <text x="245" y="114" textAnchor="middle" fill="#94a3b8" fontSize="8.5">Addr/Data/Ctrl</text>

            <rect x="295" y="16" width="150" height="44" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <text x="370" y="42" textAnchor="middle" fill="#e2e8f0" fontSize="11.5" fontWeight="600">External EPROM</text>
            <rect x="295" y="71" width="150" height="44" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <text x="370" y="97" textAnchor="middle" fill="#e2e8f0" fontSize="11.5" fontWeight="600">External SRAM</text>
            <rect x="295" y="126" width="150" height="44" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <text x="370" y="152" textAnchor="middle" fill="#e2e8f0" fontSize="11.5" fontWeight="600">8255 PPI + 8254</text>

            <rect x="468" y="34" width="152" height="118" rx="10" fill="#0f172a" stroke="#334155" />
            <text x="544" y="64" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">PCB Footprint</text>
            <text x="544" y="88" textAnchor="middle" fill="#cbd5e1" fontSize="10">High chip count</text>
            <text x="544" y="106" textAnchor="middle" fill="#cbd5e1" fontSize="10">High power draw</text>
            <text x="544" y="124" textAnchor="middle" fill="#cbd5e1" fontSize="10">Flexible RAM scale</text>
          </g>
        ) : (
          <g>
            <rect x="20" y="14" width="430" height="166" rx="14" fill="#064e3b" fillOpacity="0.35" stroke="#34d399" strokeWidth="2.4" />
            <text x="235" y="34" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="700">
              SINGLE SILICON IC DIE (SYSTEM-ON-CHIP)
            </text>

            <rect x="40" y="48" width="135" height="114" rx="10" fill="#172554" stroke="#38bdf8" strokeWidth="1.8" />
            <text x="107" y="96" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">CPU Core</text>
            <text x="107" y="116" textAnchor="middle" fill="#7dd3fc" fontSize="10">ALU + CU + Regs</text>

            <line x1="175" y1="105" x2="220" y2="105" stroke="#34d399" strokeWidth="4" className="animate-signal-flow" />

            <rect x="220" y="48" width="100" height="50" rx="8" fill="#0f172a" stroke="#34d399" />
            <text x="270" y="77" textAnchor="middle" fill="#ecfdf5" fontSize="11" fontWeight="600">ROM / Flash</text>
            <rect x="330" y="48" width="100" height="50" rx="8" fill="#0f172a" stroke="#34d399" />
            <text x="380" y="77" textAnchor="middle" fill="#ecfdf5" fontSize="11" fontWeight="600">Internal RAM</text>

            <rect x="220" y="112" width="100" height="50" rx="8" fill="#0f172a" stroke="#22d3ee" />
            <text x="270" y="141" textAnchor="middle" fill="#ecfeff" fontSize="11" fontWeight="600">Timers + UART</text>
            <rect x="330" y="112" width="100" height="50" rx="8" fill="#0f172a" stroke="#22d3ee" />
            <text x="380" y="141" textAnchor="middle" fill="#ecfeff" fontSize="11" fontWeight="600">GPIO (P0–P3)</text>

            <rect x="468" y="34" width="152" height="118" rx="10" fill="#0f172a" stroke="#334155" />
            <text x="544" y="64" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="700">Embedded Ideal</text>
            <text x="544" y="88" textAnchor="middle" fill="#cbd5e1" fontSize="10">Single IC, low cost</text>
            <text x="544" y="106" textAnchor="middle" fill="#cbd5e1" fontSize="10">Low power (mW)</text>
            <text x="544" y="124" textAnchor="middle" fill="#cbd5e1" fontSize="10">Bit-level I/O ops</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// Interactive RISC vs CISC Execution Pipeline Visual
const RiscCiscVisual: React.FC = () => {
  const [arch, setArch] = useState<'cisc' | 'risc'>('risc');
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">RISC vs CISC Execution Model: Computing M[2000] × M[2004]</span>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setArch('cisc')} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${arch === 'cisc' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            CISC (8085 / 8086 / x86)
          </button>
          <button type="button" onClick={() => setArch('risc')} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${arch === 'risc' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            RISC (ARM / RISC-V)
          </button>
        </div>
      </div>

      {arch === 'cisc' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 rounded-xl border border-violet-500/40 bg-violet-950/40 p-3.5 font-mono text-xs">
            <div className="text-violet-300 font-semibold">1 Complex Instruction</div>
            <div className="mt-2 text-white">MULT [2000H], [2004H]</div>
            <div className="mt-2 text-slate-400">Variable byte length · Microprogrammed ROM expands into internal micro-ops</div>
          </div>
          <div className="md:col-span-8 grid grid-cols-4 gap-2 text-center font-mono text-xs">
            {['Fetch (2T)', 'Mem Rd 1 (3T)', 'Mem Rd 2 (3T)', 'Microcode MUL (8T)'].map((st) => (
              <div key={st} className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-slate-200">
                {st}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2 font-mono text-xs">
          <div className="text-cyan-300">4 Fixed-Width Load/Store Instructions Overlapped in 4-Stage Pipeline (IF · ID · EX · WB):</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { op: 'LOAD R1, [2000H]', st: 'Cycles 1–4' },
              { op: 'LOAD R2, [2004H]', st: 'Cycles 2–5' },
              { op: 'MUL  R3, R1, R2', st: 'Cycles 3–6' },
              { op: 'STORE [2000H], R3', st: 'Cycles 4–7' },
            ].map((inst) => (
              <div key={inst.op} className="rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-3">
                <div className="text-white font-semibold">{inst.op}</div>
                <div className="text-cyan-300 mt-1">{inst.st} · 1 CPI steady-state</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive 8085 Interrupt Priority & SIM Masking Simulator
const Interrupts8085Visual: React.FC = () => {
  const [eiEnabled, setEiEnabled] = useState(true);
  const [pending, setPending] = useState({ trap: false, r75: true, r65: false, r55: true, intr: false });
  const [mask, setMask] = useState({ m75: false, m65: false, m55: false });

  const winner =
    pending.trap
      ? { name: 'TRAP', vector: '0024H', reason: 'Non-maskable highest priority! Fires even if DI was executed.' }
      : eiEnabled && pending.r75 && !mask.m75
        ? { name: 'RST 7.5', vector: '003CH', reason: 'Unmasked rising-edge latched interrupt won Priority 2.' }
        : eiEnabled && pending.r65 && !mask.m65
          ? { name: 'RST 6.5', vector: '0034H', reason: 'Unmasked level-triggered interrupt won Priority 3.' }
          : eiEnabled && pending.r55 && !mask.m55
            ? { name: 'RST 5.5', vector: '002CH', reason: 'Unmasked level-triggered interrupt won Priority 4.' }
            : eiEnabled && pending.intr
              ? { name: 'INTR', vector: 'External (via INTA\')', reason: 'Lowest priority; external 8259A places RST/CALL opcode on data bus.' }
              : { name: 'NONE', vector: 'Normal PC Flow', reason: eiEnabled ? 'No active unmasked interrupt.' : 'Global INTE=0 (DI active) — only TRAP can interrupt!' };

  // SIM Byte: D7=SOD, D6=SDE, D5=X, D4=R7.5, D3=MSE(1), D2=M7.5, D1=M6.5, D0=M5.5
  const simByte = 0x08 | (mask.m75 ? 4 : 0) | (mask.m65 ? 2 : 0) | (mask.m55 ? 1 : 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Interactive 8085 Interrupt Priority &amp; SIM Mask Simulator</h4>
          <p className="text-xs text-slate-500">Toggle EI/DI, assert hardware interrupt pins, and mask individual RST lines via SIM.</p>
        </div>
        <button
          type="button"
          onClick={() => setEiEnabled((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
            eiEnabled ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          Global INTE: {eiEnabled ? '1 (EI Enabled)' : '0 (DI Disabled)'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono">
        {[
          { k: 'trap' as const, label: 'TRAP', vec: '0024H', trig: 'Edge+Level', maskKey: null },
          { k: 'r75' as const, label: 'RST 7.5', vec: '003CH', trig: 'Edge', maskKey: 'm75' as const },
          { k: 'r65' as const, label: 'RST 6.5', vec: '0034H', trig: 'Level', maskKey: 'm65' as const },
          { k: 'r55' as const, label: 'RST 5.5', vec: '002CH', trig: 'Level', maskKey: 'm55' as const },
          { k: 'intr' as const, label: 'INTR', vec: 'Ext', trig: 'Level', maskKey: null },
        ].map((item) => {
          const isAsserted = pending[item.k];
          const isMasked = item.maskKey ? mask[item.maskKey] : false;
          return (
            <div key={item.k} className={`rounded-xl border p-3 space-y-2 ${winner.name === item.label ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{item.label}</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400">{item.vec}</span>
              </div>
              <div className="text-[10px] text-slate-500">{item.trig}</div>
              <button
                type="button"
                onClick={() => setPending((p) => ({ ...p, [item.k]: !p[item.k] }))}
                className={`w-full py-1 rounded text-[11px] font-semibold cursor-pointer ${isAsserted ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                {isAsserted ? 'Pin HIGH' : 'Pin LOW'}
              </button>
              {item.maskKey ? (
                <button
                  type="button"
                  onClick={() => setMask((m) => ({ ...m, [item.maskKey!]: !m[item.maskKey!] }))}
                  className={`w-full py-1 rounded text-[10px] cursor-pointer ${isMasked ? 'bg-rose-600/20 text-rose-500 border border-rose-500/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                >
                  {isMasked ? 'Masked (1)' : 'Unmasked (0)'}
                </button>
              ) : (
                <div className="text-[10px] text-center text-slate-400 py-1">
                  {item.k === 'trap' ? 'Non-Maskable' : 'Global EI Only'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-950 text-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono text-emerald-400">
            Active Vector: {winner.name} → {winner.vector}
          </div>
          <p className="text-xs text-slate-300 mt-1">{winner.reason}</p>
        </div>
        <div className="font-mono text-xs text-cyan-300 shrink-0 tabular-nums">
          MVI A, {toHex8(simByte)}H ; SIM ({toBin8(simByte)}B)
        </div>
      </div>
    </div>
  );
};

// Interactive 8051 Port 3 Alternate Functions & Mode 1 Timer Delay Calculator
const PortsTimers8051Visual: React.FC = () => {
  const [delayMs, setDelayMs] = useState<number>(10);
  const mcUs = 1.085069; // 12 / 11.0592 MHz
  const countsNeeded = Math.min(65535, Math.max(1, Math.round((delayMs * 1000) / mcUs)));
  const preload = (65536 - countsNeeded) & 0xffff;
  const th = (preload >> 8) & 0xff;
  const tl = preload & 0xff;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">8051 Timer 0 (Mode 1 · 16-Bit) Preload Calculator @ 11.0592 MHz</h4>
          <p className="text-xs text-slate-500">1 Machine Cycle = 12 / 11.0592 MHz = 1.085 µs · Max single-shot Mode 1 delay = 71.1 ms</p>
        </div>
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
          Desired Delay: {delayMs} ms
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={70}
        value={delayMs}
        onChange={(e) => setDelayMs(Number(e.target.value))}
        className="w-full accent-emerald-600 cursor-pointer"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
          <div className="text-slate-400">Counts Required (N)</div>
          <div className="text-lg font-bold text-cyan-300 mt-1 tabular-nums">{countsNeeded.toLocaleString()} ticks</div>
        </div>
        <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
          <div className="text-slate-400">65536 − N (Hex Preload)</div>
          <div className="text-lg font-bold text-emerald-300 mt-1 tabular-nums">{toHex16(preload)}H</div>
        </div>
        <div className="rounded-xl bg-slate-950 text-cyan-300 p-3.5 border border-slate-800 leading-relaxed">
          MOV TMOD, #01H<br />
          MOV TH0, #{toHex8(th)}H · MOV TL0, #{toHex8(tl)}H<br />
          SETB TR0
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {[
          { pin: 'P3.0 / P3.1', fn: 'RXD / TXD (UART)' },
          { pin: 'P3.2 / P3.3', fn: "INT0' / INT1' (Ext Int)" },
          { pin: 'P3.4 / P3.5', fn: 'T0 / T1 (Counter In)' },
          { pin: 'P3.6 / P3.7', fn: "WR' / RD' (Ext RAM)" },
        ].map((p) => (
          <div key={p.pin} className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5">
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{p.pin}</div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5">{p.fn}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Interactive ADC0808 & 7-Segment Polarity Visual for Module 5 Topic 3
const AdcSevenSegVisual: React.FC = () => {
  const [vin, setVin] = useState<number>(2.5);
  const [tab, setTab] = useState<'adc' | 'keypad'>('adc');
  const digitalCode = Math.min(255, Math.round((vin / 5) * 255));
  const vReconstructed = (digitalCode / 255) * 5;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setTab('adc')} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${tab === 'adc' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          ADC0808 &amp; DAC0808 Quantizer
        </button>
        <button type="button" onClick={() => setTab('keypad')} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${tab === 'keypad' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          4×4 Matrix Keypad Scanner
        </button>
      </div>

      {tab === 'adc' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">8-Bit ADC0808 Analog-to-Digital Conversion (Vref = 5.00 V)</h4>
              <p className="text-xs text-slate-500">Step size (1 LSB) = 5.00 V / 255 = 19.61 mV (or Vref / 256 = 19.53 mV)</p>
            </div>
            <span className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400 tabular-nums">
              Vin = {vin.toFixed(2)} V
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.05}
            value={vin}
            onChange={(e) => setVin(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
              <div className="text-slate-400">Digital Output (D7–D0)</div>
              <div className="text-lg font-bold text-cyan-300 mt-1 tabular-nums">{toHex8(digitalCode)}H ({digitalCode})</div>
            </div>
            <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
              <div className="text-slate-400">8-Bit Binary Code</div>
              <div className="text-lg font-bold text-emerald-300 mt-1 tabular-nums">{toBin8(digitalCode)}B</div>
            </div>
            <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
              <div className="text-slate-400">DAC0808 Reconstructed Vout</div>
              <div className="text-lg font-bold text-amber-300 mt-1 tabular-nums">{vReconstructed.toFixed(3)} V</div>
            </div>
          </div>
        </div>
      ) : (
        <KeypadMatrixExperiment />
      )}
    </div>
  );
};

// Interactive 8086 20-bit Physical Address Calculator
const Segment8086Visual: React.FC = () => {
  const [segHex, setSegHex] = useState('2400');
  const [offHex, setOffHex] = useState('1234');
  const [pair, setPair] = useState<'CS:IP' | 'DS:BX' | 'SS:SP' | 'ES:DI'>('CS:IP');

  const seg = parseInt(segHex || '0', 16) & 0xffff;
  const off = parseInt(offHex || '0', 16) & 0xffff;
  const shifted = (seg << 4) & 0xfffff;
  const phys = (shifted + off) & 0xfffff;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-5">
      <div className="flex flex-wrap gap-2">
        {(['CS:IP', 'DS:BX', 'SS:SP', 'ES:DI'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPair(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${
              pair === p ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 dark:text-slate-400">16-bit Segment ({pair.split(':')[0]})</label>
          <input
            value={segHex}
            maxLength={4}
            onChange={(e) => setSegHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
            className="w-full px-3 py-2 rounded-lg font-mono text-base bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <div className="text-xs font-mono text-violet-600 dark:text-violet-400">
            × 10H (Shift Left 4) = {shifted.toString(16).toUpperCase().padStart(5, '0')}H
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 dark:text-slate-400">16-bit Offset ({pair.split(':')[1]})</label>
          <input
            value={offHex}
            maxLength={4}
            onChange={(e) => setOffHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
            className="w-full px-3 py-2 rounded-lg font-mono text-base bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <div className="text-xs font-mono text-slate-500">Zero-extended: 0{toHex16(off)}H</div>
        </div>

        <div className="rounded-xl bg-slate-950 text-white p-4 border border-violet-500/40">
          <div className="text-xs text-slate-400">20-Bit Physical Address (A19–A0)</div>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-1 tabular-nums">
            {phys.toString(16).toUpperCase().padStart(5, '0')}H
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Decimal: {phys.toLocaleString()} / 1,048,575
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive 8086 BIU 6-Byte Prefetch Queue Simulator
const Pipeline8086Visual: React.FC = () => {
  const [queue, setQueue] = useState<string[]>(['B8H', '05H', '00H', '05H']);
  const [log, setLog] = useState('BIU has prefetched 4 bytes ahead into the 6-byte FIFO queue.');
  const sampleStream = ['01H', 'C3H', '40H', '89H', 'D8H', 'E2H', '90H', 'F4H'];
  const [cursor, setCursor] = useState(0);

  const fetchByte = () => {
    if (queue.length >= 6) {
      setLog('Queue FULL (6/6 bytes). BIU pauses prefetch until at least 2 slots open.');
      return;
    }
    const b = sampleStream[cursor % sampleStream.length];
    setCursor((c) => c + 1);
    setQueue((q) => [...q, b]);
    setLog(`BIU fetched opcode byte ${b} into queue without stalling the EU.`);
  };

  const executeByte = () => {
    if (queue.length === 0) {
      setLog('Queue empty! EU waits for BIU to fetch next byte from memory.');
      return;
    }
    const [head, ...rest] = queue;
    setQueue(rest);
    setLog(`EU popped and decoded ${head} directly from queue in zero external bus cycles.`);
  };

  const flushJump = () => {
    setQueue([]);
    setLog('JMP executed! Sequential prefetch is invalid → 6-byte queue FLUSHED. BIU reloads from new CS:IP.');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">8086 BIU ↔ 6-Byte FIFO Queue ↔ EU Simulator</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={fetchByte} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium cursor-pointer">
            BIU Prefetch (+1B)
          </button>
          <button type="button" onClick={executeByte} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium cursor-pointer">
            EU Consume (-1B)
          </button>
          <button type="button" onClick={flushJump} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-medium cursor-pointer">
            Execute JMP (Flush)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-3 rounded-xl border border-blue-500/40 bg-blue-950/40 p-3 text-center">
          <div className="text-xs font-mono text-cyan-300">BIU</div>
          <div className="text-xs text-slate-300 mt-1">20-bit Bus Interface</div>
        </div>
        <div className="md:col-span-6 grid grid-cols-6 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <div
              key={slot}
              className={`h-14 rounded-lg border flex flex-col items-center justify-center font-mono text-xs ${
                queue[slot]
                  ? 'bg-violet-600/30 border-violet-400 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              <span>{queue[slot] ?? '--'}</span>
              <span className="text-[10px] opacity-60">Q{slot + 1}</span>
            </div>
          ))}
        </div>
        <div className="md:col-span-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-center">
          <div className="text-xs font-mono text-emerald-300">EU</div>
          <div className="text-xs text-slate-300 mt-1">16-bit ALU &amp; Decode</div>
        </div>
      </div>
      <p className="text-xs font-mono text-slate-300">{log}</p>
    </div>
  );
};

// Interactive 8051 Internal RAM Map & Bank Selector
const Ram8051Visual: React.FC = () => {
  const [bank, setBank] = useState<number>(0);
  const bankStart = bank * 8;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">8051 128-Byte Internal RAM + SFR Partition</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select PSW bits RS1/RS0 to switch active Register Bank (R0–R7)</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBank(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${
                bank === b ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Bank {b} ({(b >> 1) & 1}{b & 1})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5">
          <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">00H – 1FH (32 Bytes)</div>
          <div className="font-medium mt-1 text-slate-900 dark:text-white">4 Register Banks</div>
          <div className="mt-2 font-mono text-slate-600 dark:text-slate-300">
            Active R0–R7: {toHex8(bankStart)}H – {toHex8(bankStart + 7)}H
          </div>
        </div>
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3.5">
          <div className="font-mono font-semibold text-cyan-700 dark:text-cyan-300">20H – 2FH (16 Bytes)</div>
          <div className="font-medium mt-1 text-slate-900 dark:text-white">Bit-Addressable RAM</div>
          <div className="mt-2 text-slate-600 dark:text-slate-300">128 individual bits (00H–7FH) for SETB/CLR/JB</div>
        </div>
        <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3.5">
          <div className="font-mono font-semibold text-blue-700 dark:text-blue-300">30H – 7FH (80 Bytes)</div>
          <div className="font-medium mt-1 text-slate-900 dark:text-white">General Scratchpad</div>
          <div className="mt-2 text-slate-600 dark:text-slate-300">Variables &amp; relocated stack space</div>
        </div>
        <div className="rounded-xl border border-violet-500/40 bg-violet-500/10 p-3.5">
          <div className="font-mono font-semibold text-violet-700 dark:text-violet-300">80H – FFH (SFR Space)</div>
          <div className="font-medium mt-1 text-slate-900 dark:text-white">21 Special Function Regs</div>
          <div className="mt-2 font-mono text-slate-600 dark:text-slate-300">A(E0), PSW(D0), SP(81), P0–P3</div>
        </div>
      </div>
    </div>
  );
};

// Interactive 8255A Control Word Builder (exported for reuse)
export const Ppi8255Visual: React.FC = () => {
  const [paIn, setPaIn] = useState(1);
  const [pcuIn, setPcuIn] = useState(0);
  const [pbIn, setPbIn] = useState(0);
  const [pclIn, setPclIn] = useState(1);
  const [paMode, setPaMode] = useState(0);

  const cw = 0x80 | ((paMode & 3) << 5) | (paIn << 4) | (pcuIn << 3) | (pbIn << 1) | pclIn;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Live 8255A I/O Control Word Builder (D7 = 1)</h4>
        <div className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400 tabular-nums">
          CW = {toHex8(cw)}H ({toBin8(cw)}B)
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <button type="button" onClick={() => setPaMode((m) => (m + 1) % 3)} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left cursor-pointer hover:border-blue-500">
          <div className="text-slate-500">Port A Mode</div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white mt-1">Mode {paMode}</div>
        </button>
        <button type="button" onClick={() => setPaIn((v) => (v ? 0 : 1))} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left cursor-pointer hover:border-blue-500">
          <div className="text-slate-500">Port A (D4)</div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white mt-1">{paIn ? '1 · INPUT' : '0 · OUTPUT'}</div>
        </button>
        <button type="button" onClick={() => setPcuIn((v) => (v ? 0 : 1))} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left cursor-pointer hover:border-blue-500">
          <div className="text-slate-500">Port C Upper (D3)</div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white mt-1">{pcuIn ? '1 · INPUT' : '0 · OUTPUT'}</div>
        </button>
        <button type="button" onClick={() => setPbIn((v) => (v ? 0 : 1))} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left cursor-pointer hover:border-blue-500">
          <div className="text-slate-500">Port B (D1)</div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white mt-1">{pbIn ? '1 · INPUT' : '0 · OUTPUT'}</div>
        </button>
        <button type="button" onClick={() => setPclIn((v) => (v ? 0 : 1))} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left cursor-pointer hover:border-blue-500">
          <div className="text-slate-500">Port C Lower (D0)</div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white mt-1">{pclIn ? '1 · INPUT' : '0 · OUTPUT'}</div>
        </button>
      </div>

      <div className="rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs p-3.5">
        MVI A, {toHex8(cw)}H &nbsp;; Load 8255 Control Word<br />
        OUT 03H &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;; Write to Control Register (A1=1, A0=1)
      </div>
    </div>
  );
};

// Interactive Von Neumann vs Harvard Cycle Stepper
const VonHarvardVisual: React.FC = () => {
  const [arch, setArch] = useState<'von' | 'harvard'>('harvard');
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-semibold">Live Bus Topology Comparison</span>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setArch('von')} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${arch === 'von' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            Von Neumann (8085 / 8086)
          </button>
          <button type="button" onClick={() => setArch('harvard')} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${arch === 'harvard' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            Harvard (8051 / DSP)
          </button>
        </div>
      </div>

      <svg viewBox="0 0 600 175" className="w-full h-auto">
        {arch === 'von' ? (
          <g>
            <rect x="40" y="38" width="170" height="96" rx="12" fill="#172554" stroke="#38bdf8" strokeWidth="2" />
            <text x="125" y="82" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">CPU Core</text>
            <text x="125" y="102" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="IBM Plex Mono, monospace">ALU + CU + Regs</text>

            <line x1="210" y1="86" x2="380" y2="86" stroke="#f59e0b" strokeWidth="5" className="animate-signal-flow" />
            <text x="295" y="72" textAnchor="middle" fill="#fcd34d" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">SHARED BUS (Bottleneck)</text>
            <text x="295" y="108" textAnchor="middle" fill="#94a3b8" fontSize="9.5">1 cycle: Fetch OR Data</text>

            <rect x="380" y="38" width="180" height="96" rx="12" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <text x="470" y="78" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">Unified Memory</text>
            <text x="470" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="10">Code + Data Together</text>
          </g>
        ) : (
          <g>
            <rect x="24" y="38" width="150" height="96" rx="12" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
            <text x="99" y="80" textAnchor="middle" fill="#fff" fontSize="13.5" fontWeight="700">Program ROM</text>
            <text x="99" y="100" textAnchor="middle" fill="#6ee7b7" fontSize="10">Instructions Only</text>

            <line x1="174" y1="86" x2="225" y2="86" stroke="#34d399" strokeWidth="4" className="animate-signal-flow" />

            <rect x="225" y="38" width="150" height="96" rx="12" fill="#172554" stroke="#38bdf8" strokeWidth="2" />
            <text x="300" y="80" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">CPU Core</text>
            <text x="300" y="100" textAnchor="middle" fill="#7dd3fc" fontSize="10">Parallel Fetch + Data!</text>

            <line x1="375" y1="86" x2="426" y2="86" stroke="#38bdf8" strokeWidth="4" className="animate-signal-flow" />

            <rect x="426" y="38" width="150" height="96" rx="12" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="2" />
            <text x="501" y="80" textAnchor="middle" fill="#fff" fontSize="13.5" fontWeight="700">Data RAM</text>
            <text x="501" y="100" textAnchor="middle" fill="#c4b5fd" fontSize="10">Operands &amp; Stack</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// Interactive Quick Flag Sandbox
const MiniFlagSandbox: React.FC = () => {
  const [aHex, setAHex] = useState('9A');
  const [bHex, setBHex] = useState('8C');
  const a = parseInt(aHex || '0', 16) & 0xff;
  const b = parseInt(bHex || '0', 16) & 0xff;
  const sum = a + b;
  const res = sum & 0xff;
  const S = res & 0x80 ? 1 : 0;
  const Z = res === 0 ? 1 : 0;
  const AC = (a & 0x0f) + (b & 0x0f) > 0x0f ? 1 : 0;
  const P = calcParity(res);
  const CY = sum > 0xff ? 1 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500">Accumulator A (Hex)</label>
          <input value={aHex} maxLength={2} onChange={(e) => setAHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())} className="mt-1 w-full px-3 py-2 rounded-lg font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
        </div>
        <div>
          <label className="text-xs text-slate-500">Register B (Hex)</label>
          <input value={bHex} maxLength={2} onChange={(e) => setBHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())} className="mt-1 w-full px-3 py-2 rounded-lg font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
        </div>
        <div className="rounded-xl bg-slate-950 text-white px-4 py-2.5 font-mono">
          <div className="text-[11px] text-slate-400">ADD B Result</div>
          <div className="text-lg font-bold text-cyan-300 tabular-nums">{toHex8(res)}H ({toBin8(res)})</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[
          { k: 'S (D7)', v: S },
          { k: 'Z (D6)', v: Z },
          { k: 'AC (D4)', v: AC },
          { k: 'P (D2)', v: P },
          { k: 'CY (D0)', v: CY },
        ].map((fl) => (
          <div
            key={fl.k}
            className={`rounded-xl border p-3 text-center font-mono ${
              fl.v
                ? 'bg-blue-600/15 border-blue-500 text-blue-600 dark:text-cyan-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            <div className="text-[11px]">{fl.k}</div>
            <div className="text-xl font-bold mt-0.5">{fl.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Interactive Memory Decoder Visual
const MemoryMapVisual: React.FC = () => {
  const [sizeKb, setSizeKb] = useState<number>(4);
  const [baseHex, setBaseHex] = useState<number>(0x2000);
  const bytes = sizeKb * 1024;
  const addrLines = Math.log2(bytes);
  const endAddr = (baseHex + bytes - 1) & 0xffff;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 4, 8, 16].map((kb) => (
            <button key={kb} type="button" onClick={() => setSizeKb(kb)} className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${sizeKb === kb ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {kb} KB Chip
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[0x0000, 0x2000, 0x4000, 0x8000].map((b) => (
            <button key={b} type="button" onClick={() => setBaseHex(b)} className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer ${baseHex === b ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              Base {toHex16(b)}H
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800">
          <div className="text-slate-400">Chip Address Pins</div>
          <div className="text-lg font-bold text-cyan-300 mt-1">A0 – A{addrLines - 1} ({addrLines} lines)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800">
          <div className="text-slate-400">Decoder Lines (CS&apos;)</div>
          <div className="text-lg font-bold text-violet-300 mt-1">A{addrLines} – A15 ({16 - addrLines} lines)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800">
          <div className="text-slate-400">Decoded Address Range</div>
          <div className="text-lg font-bold text-emerald-300 mt-1">{toHex16(baseHex)}H – {toHex16(endAddr)}H</div>
        </div>
      </div>
    </div>
  );
};

// Multi-Chip Peripheral Visual (8259A PIC + 8253/8254 Timer + 8237 DMA)
const SupportChipsVisual: React.FC = () => {
  const [chip, setChip] = useState<'8259' | '8254' | '8237'>('8259');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setChip('8259')} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${chip === '8259' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          8259A Interrupt Controller
        </button>
        <button type="button" onClick={() => setChip('8254')} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${chip === '8254' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          8253 / 8254 Interval Timer
        </button>
        <button type="button" onClick={() => setChip('8237')} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${chip === '8237' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          8237 DMA Bus Handover
        </button>
      </div>
      {chip === '8259' && <Pic8259Experiment />}
      {chip === '8254' && <Timer8253Experiment />}
      {chip === '8237' && <Dma8237Experiment />}
    </div>
  );
};

export const ConceptVisualEngine: React.FC<{ visualType: VisualWidgetType }> = ({ visualType }) => {
  switch (visualType) {
    case 'up-vs-uc':
      return <UpVsUcVisual />;
    case 'von-neumann-harvard':
      return <VonHarvardVisual />;
    case 'risc-cisc':
      return <RiscCiscVisual />;
    case '8085-architecture':
      return <Architecture8085Explorer />;
    case '8085-pinout':
    case '8085-buses':
      return <Pinout8085Explorer />;
    case '8085-addressing':
      return <InstructionVisualizer defaultInstruction="LDA" />;
    case '8085-timing':
      return <TimingDiagramInteractive />;
    case '8085-registers-flags':
      return <MiniFlagSandbox />;
    case '8085-interrupts':
      return <Interrupts8085Visual />;
    case '8085-memory-map':
      return <MemoryMapVisual />;
    case '8086-segments':
      return <Segment8086Visual />;
    case '8086-architecture':
    case '8086-pipeline':
      return <Pipeline8086Visual />;
    case '8051-ram-map':
    case '8051-architecture':
      return <Ram8051Visual />;
    case '8051-ports-timers':
      return <PortsTimers8051Visual />;
    case '8255-ppi':
      return <Ppi8255Visual />;
    case '8253-timer':
      return <Timer8253Experiment />;
    case '8259-pic':
      return <SupportChipsVisual />;
    case 'adc-dac':
    case 'led-seven-seg':
      return <AdcSevenSegVisual />;
    default:
      return <VonHarvardVisual />;
  }
};
