import React, { useState } from 'react';

type PinGroup = 'all' | 'bus' | 'control' | 'interrupt' | 'power' | 'dma' | 'serial';

interface PinDef {
  num: number;
  name: string;
  group: Exclude<PinGroup, 'all'>;
  dir: 'In' | 'Out' | 'Bidirectional' | 'Power';
  desc: string;
}

const PINS_8085: PinDef[] = [
  { num: 1, name: 'X1', group: 'power', dir: 'In', desc: 'Crystal input 1. Connect a 6.144 MHz crystal across X1–X2 (internally divided by 2 → 3.072 MHz).' },
  { num: 2, name: 'X2', group: 'power', dir: 'In', desc: 'Crystal input 2 for the internal oscillator circuit.' },
  { num: 3, name: 'RESET OUT', group: 'control', dir: 'Out', desc: 'Active-HIGH output indicating the 8085 is being reset; used to reset peripheral chips (8255, 8259).' },
  { num: 4, name: 'SOD', group: 'serial', dir: 'Out', desc: 'Serial Output Data: outputs 1-bit serial data loaded via the SIM instruction (bit D7 with SDE=1).' },
  { num: 5, name: 'SID', group: 'serial', dir: 'In', desc: 'Serial Input Data: 1-bit serial input sampled into Accumulator bit D7 by the RIM instruction.' },
  { num: 6, name: 'TRAP', group: 'interrupt', dir: 'In', desc: 'Priority 1 Non-Maskable Interrupt. Edge + Level triggered. Fixed vector address: 0024H.' },
  { num: 7, name: 'RST 7.5', group: 'interrupt', dir: 'In', desc: 'Priority 2 Maskable Interrupt. Positive edge-triggered (internal latch). Vector address: 003CH.' },
  { num: 8, name: 'RST 6.5', group: 'interrupt', dir: 'In', desc: 'Priority 3 Maskable Interrupt. Active-HIGH level-triggered. Vector address: 0034H.' },
  { num: 9, name: 'RST 5.5', group: 'interrupt', dir: 'In', desc: 'Priority 4 Maskable Interrupt. Active-HIGH level-triggered. Vector address: 002CH.' },
  { num: 10, name: 'INTR', group: 'interrupt', dir: 'In', desc: 'Priority 5 General-purpose maskable, non-vectored interrupt request (commonly driven by 8259A PIC).' },
  { num: 11, name: 'INTA\'', group: 'interrupt', dir: 'Out', desc: 'Active-LOW Interrupt Acknowledge output prompting external hardware to place RST/CALL opcode on AD0–AD7.' },
  { num: 12, name: 'AD0', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A0 (during T1) and Data bit D0 (during T2–T3).' },
  { num: 13, name: 'AD1', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A1 (T1) and Data bit D1 (T2–T3).' },
  { num: 14, name: 'AD2', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A2 (T1) and Data bit D2 (T2–T3).' },
  { num: 15, name: 'AD3', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A3 (T1) and Data bit D3 (T2–T3).' },
  { num: 16, name: 'AD4', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A4 (T1) and Data bit D4 (T2–T3).' },
  { num: 17, name: 'AD5', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A5 (T1) and Data bit D5 (T2–T3).' },
  { num: 18, name: 'AD6', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A6 (T1) and Data bit D6 (T2–T3).' },
  { num: 19, name: 'AD7', group: 'bus', dir: 'Bidirectional', desc: 'Multiplexed Address bit A7 (T1) and Data bit D7 (T2–T3). Demultiplexed with 74LS373 + ALE.' },
  { num: 20, name: 'Vss (GND)', group: 'power', dir: 'Power', desc: 'Ground reference (0V).' },
  // Right side 21..40 (bottom to top physically on DIP)
  { num: 21, name: 'A8', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A8 (tri-stated during HOLD and HALT).' },
  { num: 22, name: 'A9', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A9.' },
  { num: 23, name: 'A10', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A10.' },
  { num: 24, name: 'A11', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A11.' },
  { num: 25, name: 'A12', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A12 (often wired to 74LS138 decoder).' },
  { num: 26, name: 'A13', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A13.' },
  { num: 27, name: 'A14', group: 'bus', dir: 'Out', desc: 'Unidirectional High-Order Address bit A14.' },
  { num: 28, name: 'A15', group: 'bus', dir: 'Out', desc: 'Unidirectional MSB Address bit A15 (0 = lower 32KB, 1 = upper 32KB).' },
  { num: 29, name: 'S0', group: 'control', dir: 'Out', desc: 'Status output S0. Together with S1 identifies Opcode Fetch (11), Read (10), Write (01), Halt (00).' },
  { num: 30, name: 'ALE', group: 'control', dir: 'Out', desc: 'Address Latch Enable: pulses HIGH during T1 of every machine cycle to latch A0–A7 into 74LS373.' },
  { num: 31, name: 'WR\'', group: 'control', dir: 'Out', desc: 'Active-LOW Write strobe indicating data on AD0–AD7 is ready to be written to memory or I/O.' },
  { num: 32, name: 'RD\'', group: 'control', dir: 'Out', desc: 'Active-LOW Read strobe enabling selected memory or I/O chip to drive data onto AD0–AD7.' },
  { num: 33, name: 'S1', group: 'control', dir: 'Out', desc: 'Status output S1 paired with S0 and IO/M\' to encode exact bus machine cycle.' },
  { num: 34, name: 'IO/M\'', group: 'control', dir: 'Out', desc: 'HIGH = I/O operation (IN/OUT); LOW = Memory operation (Opcode Fetch, MR, MW).' },
  { num: 35, name: 'READY', group: 'control', dir: 'In', desc: 'When pulled LOW by slow memory/I/O, CPU inserts Wait states (Tw) until READY returns HIGH.' },
  { num: 36, name: 'RESET IN\'', group: 'control', dir: 'In', desc: 'Active-LOW reset input: forces PC = 0000H, disables interrupts (INTE=0), and asserts RESET OUT.' },
  { num: 37, name: 'CLK OUT', group: 'power', dir: 'Out', desc: 'System clock output (f_crystal / 2) used to synchronize peripheral ICs.' },
  { num: 38, name: 'HLDA', group: 'dma', dir: 'Out', desc: 'Hold Acknowledge: indicates 8085 has tri-stated its buses and granted bus control to the 8237 DMA.' },
  { num: 39, name: 'HOLD', group: 'dma', dir: 'In', desc: 'DMA bus request input asking 8085 to relinquish Address, Data, and Control buses.' },
  { num: 40, name: 'Vcc (+5V)', group: 'power', dir: 'Power', desc: 'Single +5V DC power supply (major upgrade over 8080 which required +5V, -5V, and +12V).' },
];

const GROUP_COLOR: Record<Exclude<PinGroup, 'all'>, string> = {
  bus: '#38bdf8',
  control: '#a78bfa',
  interrupt: '#f59e0b',
  power: '#10b981',
  dma: '#f43f5e',
  serial: '#ec4899',
};

const FILTER_LABELS: Array<{ id: PinGroup; label: string }> = [
  { id: 'all', label: 'All 40 Pins' },
  { id: 'bus', label: 'Address / Data' },
  { id: 'control', label: 'Control & Status' },
  { id: 'interrupt', label: 'Interrupts' },
  { id: 'dma', label: 'DMA' },
  { id: 'serial', label: 'Serial I/O' },
  { id: 'power', label: 'Power & Clock' },
];

export const Pinout8085Explorer: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<number>(30); // ALE default
  const [filter, setFilter] = useState<PinGroup>('all');

  const leftPins = PINS_8085.slice(0, 20);
  const rightPins = [...PINS_8085.slice(20)].reverse(); // Pin 40 at top right down to Pin 21 at bottom right!
  const current = PINS_8085.find((p) => p.num === selectedPin) ?? PINS_8085[29];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTER_LABELS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 overflow-x-auto">
          <svg
            viewBox="0 0 460 510"
            className="w-full max-w-[460px] mx-auto h-auto select-none"
            role="img"
            aria-label="Interactive Intel 8085 40-pin DIP IC diagram"
          >
            {/* IC Body */}
            <rect x="135" y="16" width="190" height="478" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <path d="M 206 16 A 24 24 0 0 0 254 16" fill="#070d19" stroke="#475569" strokeWidth="1.5" />
            <text x="230" y="235" textAnchor="middle" fill="#e2e8f0" fontSize="22" fontWeight="700" fontFamily="Outfit, sans-serif">
              INTEL 8085A
            </text>
            <text x="230" y="258" textAnchor="middle" fill="#64748b" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
              40-PIN DIP · NMOS +5V
            </text>
            <text x="230" y="276" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
              Click any pin to inspect
            </text>

            {/* Left Pins 1..20 */}
            {leftPins.map((pin, i) => {
              const y = 34 + i * 23;
              const match = filter === 'all' || pin.group === filter;
              const isSel = selectedPin === pin.num;
              const col = GROUP_COLOR[pin.group];
              return (
                <g
                  key={pin.num}
                  onClick={() => setSelectedPin(pin.num)}
                  className="cursor-pointer"
                  opacity={match ? 1 : 0.25}
                >
                  <rect
                    x="110"
                    y={y - 7}
                    width="25"
                    height="14"
                    rx="2"
                    fill={isSel ? col : '#1e293b'}
                    stroke={col}
                    strokeWidth={isSel ? 1.8 : 1}
                  />
                  <text x="148" y={y + 4} fill={isSel ? '#ffffff' : '#94a3b8'} fontSize="10" fontFamily="IBM Plex Mono, monospace">
                    {pin.num}
                  </text>
                  <text
                    x="104"
                    y={y + 4}
                    textAnchor="end"
                    fill={isSel ? col : '#e2e8f0'}
                    fontSize="10.5"
                    fontWeight={isSel ? '700' : '500'}
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {pin.name}
                  </text>
                </g>
              );
            })}

            {/* Right Pins 40..21 */}
            {rightPins.map((pin, i) => {
              const y = 34 + i * 23;
              const match = filter === 'all' || pin.group === filter;
              const isSel = selectedPin === pin.num;
              const col = GROUP_COLOR[pin.group];
              return (
                <g
                  key={pin.num}
                  onClick={() => setSelectedPin(pin.num)}
                  className="cursor-pointer"
                  opacity={match ? 1 : 0.25}
                >
                  <rect
                    x="325"
                    y={y - 7}
                    width="25"
                    height="14"
                    rx="2"
                    fill={isSel ? col : '#1e293b'}
                    stroke={col}
                    strokeWidth={isSel ? 1.8 : 1}
                  />
                  <text x="312" y={y + 4} textAnchor="end" fill={isSel ? '#ffffff' : '#94a3b8'} fontSize="10" fontFamily="IBM Plex Mono, monospace">
                    {pin.num}
                  </text>
                  <text
                    x="356"
                    y={y + 4}
                    textAnchor="start"
                    fill={isSel ? col : '#e2e8f0'}
                    fontSize="10.5"
                    fontWeight={isSel ? '700' : '500'}
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {pin.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono tabular-nums">Pin {current.num} of 40</span>
              <span>Direction: {current.dir}</span>
            </div>
            <h4 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{current.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{current.desc}</p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Signal Group</span>
              <span className="font-medium capitalize text-slate-900 dark:text-slate-100">{current.group}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-2.5">
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Pin Shortcuts</h5>
            <div className="flex flex-wrap gap-1.5">
              {[6, 7, 10, 12, 19, 30, 31, 32, 34, 35, 36, 38, 39, 40].map((num) => {
                const p = PINS_8085.find((x) => x.num === num)!;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedPin(num)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                      selectedPin === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.num}:{p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
