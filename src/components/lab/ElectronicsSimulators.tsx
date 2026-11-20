import React, { useState } from 'react';
import { calcParity, toBin8, toHex16, toHex8 } from '../../engine/sim8085';
import { RotateCcw, Zap } from 'lucide-react';

// 1. Flag Register & Bit-by-Bit ALU Simulator
export const FlagAluSimulator: React.FC = () => {
  const [op, setOp] = useState<'ADD' | 'SUB' | 'ANA' | 'ORA' | 'XRA' | 'INR' | 'DCR' | 'CMP'>('ADD');
  const [aVal, setAVal] = useState<number>(0x9a);
  const [bVal, setBVal] = useState<number>(0x8c);
  const [prevCy, setPrevCy] = useState<number>(0);

  let result = aVal;
  let S = 0;
  let Z = 0;
  let AC = 0;
  let P = 0;
  let CY = prevCy;

  if (op === 'ADD') {
    const sum = aVal + bVal;
    result = sum & 0xff;
    AC = (aVal & 0x0f) + (bVal & 0x0f) > 0x0f ? 1 : 0;
    CY = sum > 0xff ? 1 : 0;
  } else if (op === 'SUB' || op === 'CMP') {
    const diff = aVal - bVal;
    result = diff & 0xff;
    AC = (aVal & 0x0f) >= (bVal & 0x0f) ? 1 : 0;
    CY = diff < 0 ? 1 : 0;
  } else if (op === 'ANA') {
    result = aVal & bVal;
    AC = 1;
    CY = 0;
  } else if (op === 'ORA') {
    result = aVal | bVal;
    AC = 0;
    CY = 0;
  } else if (op === 'XRA') {
    result = aVal ^ bVal;
    AC = 0;
    CY = 0;
  } else if (op === 'INR') {
    result = (aVal + 1) & 0xff;
    AC = (aVal & 0x0f) + 1 > 0x0f ? 1 : 0;
    CY = prevCy; // Preserved!
  } else if (op === 'DCR') {
    result = (aVal - 1) & 0xff;
    AC = (aVal & 0x0f) === 0 ? 0 : 1;
    CY = prevCy; // Preserved!
  }

  S = (result & 0x80) ? 1 : 0;
  Z = result === 0 ? 1 : 0;
  P = calcParity(result);

  const parseHexInput = (val: string, setter: (n: number) => void) => {
    const clean = val.replace(/[^0-9a-fA-F]/g, '').slice(0, 2);
    setter(clean ? parseInt(clean, 16) : 0);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {(['ADD', 'SUB', 'ANA', 'ORA', 'XRA', 'INR', 'DCR', 'CMP'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setOp(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors ${
                op === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Accumulator A (Hex / Dec)</label>
            <input
              value={toHex8(aVal)}
              onChange={(e) => parseHexInput(e.target.value, setAVal)}
              className="w-full px-3 py-2 rounded-lg font-mono text-lg font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
            />
            <div className="font-mono text-xs text-slate-500 tabular-nums">
              {toBin8(aVal).slice(0, 4)} {toBin8(aVal).slice(4)} ({aVal})
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              {op === 'INR' || op === 'DCR' ? 'Previous CY Flag (Preserved!)' : 'Operand B (Hex / Dec)'}
            </label>
            {op === 'INR' || op === 'DCR' ? (
              <button
                type="button"
                onClick={() => setPrevCy((c) => (c ? 0 : 1))}
                className="w-full px-3 py-2.5 rounded-lg font-mono text-sm font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Prior CY = {prevCy} (Click to Toggle)
              </button>
            ) : (
              <>
                <input
                  value={toHex8(bVal)}
                  onChange={(e) => parseHexInput(e.target.value, setBVal)}
                  className="w-full px-3 py-2 rounded-lg font-mono text-lg font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
                <div className="font-mono text-xs text-slate-500 tabular-nums">
                  {toBin8(bVal).slice(0, 4)} {toBin8(bVal).slice(4)} ({bVal})
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl bg-slate-950 text-white p-4 border border-blue-500/40 font-mono">
            <div className="text-xs text-slate-400">
              {op === 'CMP' ? 'Internal A − B (A stays ' + toHex8(aVal) + 'H)' : 'ALU Result → Register A'}
            </div>
            <div className="text-2xl font-bold text-cyan-300 mt-1 tabular-nums">{toHex8(result)}H</div>
            <div className="text-xs text-slate-300 mt-1 tabular-nums">
              {toBin8(result).slice(0, 4)} {toBin8(result).slice(4)} ({result}d)
            </div>
          </div>
        </div>

        {/* 8-Bit Flag Register Bit Map */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-center">
          {[
            { bit: 'D7', name: 'S', val: S, active: true, desc: S ? 'Negative (MSB=1)' : 'Positive (MSB=0)' },
            { bit: 'D6', name: 'Z', val: Z, active: true, desc: Z ? 'Result is Zero' : 'Non-Zero' },
            { bit: 'D5', name: 'X', val: 0, active: false, desc: 'Unused' },
            { bit: 'D4', name: 'AC', val: AC, active: true, desc: AC ? 'D3→D4 Carry' : 'No Nibble Carry' },
            { bit: 'D3', name: 'X', val: 0, active: false, desc: 'Unused' },
            { bit: 'D2', name: 'P', val: P, active: true, desc: P ? 'Even # of 1s' : 'Odd # of 1s' },
            { bit: 'D1', name: 'X', val: 0, active: false, desc: 'Unused' },
            { bit: 'D0', name: 'CY', val: CY, active: true, desc: op === 'INR' || op === 'DCR' ? 'Unchanged!' : CY ? 'Carry/Borrow' : 'No Carry' },
          ].map((f) => (
            <div
              key={f.bit}
              className={`rounded-xl border p-2.5 ${
                !f.active
                  ? 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  : f.val
                    ? 'border-blue-500 bg-blue-600/15 text-blue-700 dark:text-cyan-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="text-[10px] opacity-70">{f.bit}</div>
              <div className="text-xs font-bold">{f.name}</div>
              <div className="text-xl font-bold tabular-nums my-0.5">{f.active ? f.val : '—'}</div>
              <div className="text-[10px] leading-tight">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Binary / Hex / Decimal / Signed Converter with Interactive Bit Switches
export const NumberSystemLab: React.FC = () => {
  const [value, setValue] = useState<number>(0x5a);

  const toggleBit = (bit: number) => {
    setValue((v) => (v ^ (1 << bit)) & 0xff);
  };

  const signed = value >= 128 ? value - 256 : value;
  const twosComp = ((~value + 1) & 0xff);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">Interactive 8-Bit Binary &amp; Hexadecimal Converter</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click any bit switch D7–D0 or type directly to observe live radix conversions.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setValue((v) => (~v) & 0xff)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 cursor-pointer">
            1&apos;s Comp (CMA)
          </button>
          <button type="button" onClick={() => setValue(twosComp)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 cursor-pointer">
            2&apos;s Comp
          </button>
          <button type="button" onClick={() => setValue(0)} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 cursor-pointer">
            Clear
          </button>
        </div>
      </div>

      {/* 8 Clickable Bit Toggles */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
          const isSet = ((value >> bit) & 1) === 1;
          return (
            <button
              key={bit}
              type="button"
              onClick={() => toggleBit(bit)}
              className={`rounded-xl border p-3 font-mono text-center transition-all cursor-pointer ${
                isSet
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-400'
              }`}
            >
              <div className="text-[10px] opacity-75">D{bit} (2^{bit})</div>
              <div className="text-2xl font-bold mt-1 tabular-nums">{isSet ? 1 : 0}</div>
              <div className="text-[10px] opacity-75 tabular-nums">{1 << bit}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
          <div className="text-xs text-slate-400">Hexadecimal</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1 tabular-nums">{toHex8(value)}H</div>
        </div>
        <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
          <div className="text-xs text-slate-400">Unsigned Decimal</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">{value}</div>
        </div>
        <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
          <div className="text-xs text-slate-400">Signed (2&apos;s Comp)</div>
          <div className="text-2xl font-bold text-violet-300 mt-1 tabular-nums">{signed}</div>
        </div>
        <div className="rounded-xl bg-slate-950 text-white p-3.5 border border-slate-800">
          <div className="text-xs text-slate-400">Octal / Parity</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1 tabular-nums">
            {value.toString(8).padStart(3, '0')}o · P={calcParity(value)}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Stack PUSH/POP & Addressing Mode Visualizer
export const StackAndAddressingLab: React.FC = () => {
  const [sp, setSp] = useState<number>(0x27ff);
  const [stackMem, setStackMem] = useState<Record<number, { val: number; tag: string }>>({});
  const [log, setLog] = useState<string>('8085 Stack initialized at SP = 27FFH. Remember: PUSH decrements SP by 2 (High byte first, then Low byte).');
  const [addrMode, setAddrMode] = useState<'imm' | 'reg' | 'dir' | 'ind' | 'imp'>('ind');

  const pushPair = (name: string, hi: number, lo: number) => {
    const sp1 = (sp - 1) & 0xffff;
    const sp2 = (sp - 2) & 0xffff;
    setStackMem((m) => ({
      ...m,
      [sp1]: { val: hi, tag: `${name} High` },
      [sp2]: { val: lo, tag: `${name} Low` },
    }));
    setSp(sp2);
    setLog(`PUSH ${name}: SP←${toHex16(sp1)}H ([SP]←${toHex8(hi)}H), then SP←${toHex16(sp2)}H ([SP]←${toHex8(lo)}H).`);
  };

  const popPair = (target: string) => {
    if (sp >= 0x27ff) {
      setLog('Stack underflow: SP is already at base 27FFH!');
      return;
    }
    const lo = stackMem[sp]?.val ?? 0;
    const hi = stackMem[(sp + 1) & 0xffff]?.val ?? 0;
    setSp((s) => (s + 2) & 0xffff);
    setLog(`POP ${target}: Read Low=${toHex8(lo)}H from ${toHex16(sp)}H, High=${toHex8(hi)}H from ${toHex16(sp + 1)}H → ${target}=${toHex8(hi)}${toHex8(lo)}H, SP=${toHex16(sp + 2)}H.`);
  };

  const stackSlots = [0x27ff, 0x27fe, 0x27fd, 0x27fc, 0x27fb, 0x27fa, 0x27f9, 0x27f8];

  const MODE_INFO = {
    imm: { title: 'Immediate Addressing', inst: 'MVI A, 45H', bytes: '2 Bytes (3EH, 45H)', path: 'Operand 45H lives directly inside the instruction byte in Program ROM → copied straight into A.' },
    reg: { title: 'Register Addressing', inst: 'MOV A, B', bytes: '1 Byte (78H)', path: 'Both source (B) and destination (A) reside on-chip → zero extra memory cycles (4 T-states).' },
    dir: { title: 'Direct Addressing', inst: 'LDA 2500H', bytes: '3 Bytes (3AH, 00H, 25H)', path: '16-bit memory address 2500H is embedded in instruction → CPU reads byte from RAM[2500H] into A.' },
    ind: { title: 'Register Indirect Addressing', inst: 'MOV A, M', bytes: '1 Byte (7EH)', path: 'HL pair holds pointer (e.g. 2500H) → CPU places HL on Address Bus and reads RAM[HL] into A.' },
    imp: { title: 'Implied (Inherent) Addressing', inst: 'CMA / RLC', bytes: '1 Byte (2FH / 07H)', path: 'Operand is implicitly the Accumulator; no register or address needs to be specified.' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Stack Simulator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">8085 Stack PUSH / POP Visualizer</h4>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">SP = {toHex16(sp)}H</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => pushPair('BC', 0x35, 0xa2)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-mono cursor-pointer">
            PUSH B (35A2H)
          </button>
          <button type="button" onClick={() => pushPair('DE', 0x19, 0x4f)} className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-mono cursor-pointer">
            PUSH D (194FH)
          </button>
          <button type="button" onClick={() => popPair('HL')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-mono cursor-pointer">
            POP H
          </button>
          <button
            type="button"
            onClick={() => {
              setSp(0x27ff);
              setStackMem({});
              setLog('Stack reset to SP = 27FFH.');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {stackSlots.map((addr) => {
            const isSp = addr === sp;
            const cell = stackMem[addr];
            const active = addr >= sp && addr < 0x27ff;
            return (
              <div
                key={addr}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  isSp
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold'
                    : active
                      ? 'border-blue-500/30 bg-blue-500/10 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                }`}
              >
                <span className="tabular-nums">{toHex16(addr)}H {isSp ? '← SP (TOS)' : ''}</span>
                <span className="tabular-nums">{cell ? `${toHex8(cell.val)}H (${cell.tag})` : '--'}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{log}</p>
      </div>

      {/* Addressing Mode Visualizer */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
        <h4 className="text-base font-semibold text-slate-900 dark:text-white">8085 Addressing Mode Visualizer</h4>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['imm', 'Immediate'],
              ['reg', 'Register'],
              ['dir', 'Direct'],
              ['ind', 'Reg Indirect'],
              ['imp', 'Implied'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAddrMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                addrMode === id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-slate-950 text-slate-100 p-4 space-y-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-semibold">{MODE_INFO[addrMode].title}</span>
            <span className="font-mono text-slate-400">{MODE_INFO[addrMode].bytes}</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white">{MODE_INFO[addrMode].inst}</div>
          <p className="text-xs text-slate-300 leading-relaxed">{MODE_INFO[addrMode].path}</p>

          <svg viewBox="0 0 420 115" className="w-full h-auto mt-2">
            <rect x="8" y="20" width="115" height="68" rx="8" fill="#172554" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="65" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Instruction</text>
            <text x="65" y="68" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="IBM Plex Mono, monospace">{MODE_INFO[addrMode].inst}</text>

            <line x1="123" y1="54" x2="158" y2="54" stroke="#38bdf8" strokeWidth="2.5" className="animate-signal-flow" />

            <rect x="158" y="20" width="108" height="68" rx="8" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1.5" />
            <text x="212" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
              {addrMode === 'imm' ? 'Imm Byte' : addrMode === 'reg' ? 'Reg B' : addrMode === 'dir' ? 'Addr 2500H' : addrMode === 'ind' ? 'HL Pointer' : 'Acc (Implicit)'}
            </text>
            <text x="212" y="68" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="IBM Plex Mono, monospace">
              {addrMode === 'imm' ? '45H' : addrMode === 'reg' ? '3AH' : addrMode === 'dir' ? '→ RAM' : addrMode === 'ind' ? 'HL=2500H' : 'A'}
            </text>

            <line x1="266" y1="54" x2="300" y2="54" stroke="#34d399" strokeWidth="2.5" className="animate-signal-flow" />

            <rect x="300" y="20" width="112" height="68" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
            <text x="356" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Operand Ready</text>
            <text x="356" y="68" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="IBM Plex Mono, monospace">In ALU / Acc</text>
          </svg>
        </div>
      </div>
    </div>
  );
};

// 4. Hardware Interfacing Lab: LED + 7-Segment, 8051 Port/Timer, 8085 Interrupt Flow
const SEG_CODES_CC: Record<string, number> = {
  '0': 0x3f, '1': 0x06, '2': 0x5b, '3': 0x4f, '4': 0x66,
  '5': 0x6d, '6': 0x7d, '7': 0x07, '8': 0x7f, '9': 0x6f,
  A: 0x77, B: 0x7c, C: 0x39, D: 0x5e, E: 0x79, F: 0x71,
};

export const HardwareInterfacingLab: React.FC = () => {
  // LED & 7-Segment State
  const [portByte, setPortByte] = useState<number>(0x3f);
  const [commonAnode, setCommonAnode] = useState<boolean>(false);

  // 8051 Timer0 State
  const [t0Val, setT0Val] = useState<number>(0xfffb);
  const [tf0, setTf0] = useState<number>(0);
  const [counterMode, setCounterMode] = useState<boolean>(false);

  // 8085 Interrupt State
  const [inte, setInte] = useState<boolean>(true);
  const [masks, setMasks] = useState({ m75: false, m65: false, m55: false });
  const [intResult, setIntResult] = useState<string>('System ready. Click any interrupt request pin to test 8085 hardware priority & masking.');

  const effectiveSeg = commonAnode ? (~portByte) & 0xff : portByte;
  const segOn = (bit: number) => ((effectiveSeg >> bit) & 1) === 1;

  const tick8051Timer = () => {
    setT0Val((prev) => {
      if (prev === 0xffff) {
        setTf0(1);
        return 0x0000;
      }
      return prev + 1;
    });
  };

  const triggerInterrupt = (name: 'TRAP' | 'RST75' | 'RST65' | 'RST55' | 'INTR') => {
    if (name === 'TRAP') {
      setIntResult('TRAP ACCEPTED (Priority 1, Non-Maskable)! Pushed PC to stack → Jumped to Vector 0024H regardless of DI/SIM.');
      return;
    }
    if (!inte) {
      setIntResult(`${name} IGNORED: Global Interrupt Enable (INTE) is 0 (DI active). Execute EI first!`);
      return;
    }
    if (name === 'RST75') {
      setIntResult(masks.m75 ? 'RST 7.5 PENDING (Masked by SIM M7.5=1, latched in edge flip-flop).' : 'RST 7.5 ACCEPTED (Priority 2)! Pushed PC → Vector 003CH.');
    } else if (name === 'RST65') {
      setIntResult(masks.m65 ? 'RST 6.5 BLOCKED (Masked by SIM M6.5=1).' : 'RST 6.5 ACCEPTED (Priority 3)! Pushed PC → Vector 0034H.');
    } else if (name === 'RST55') {
      setIntResult(masks.m55 ? 'RST 5.5 BLOCKED (Masked by SIM M5.5=1).' : 'RST 5.5 ACCEPTED (Priority 4)! Pushed PC → Vector 002CH.');
    } else {
      setIntResult('INTR ACCEPTED (Priority 5)! 8085 pulses INTA\' LOW to fetch RST/CALL opcode from external 8259A PIC.');
    }
  };

  return (
    <div className="space-y-5">
      {/* LED & 7-Segment Display Simulator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">LED &amp; 7-Segment Display Interfacing Simulator</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle Output Port bits D7–D0 or pick a hex digit to observe Common Cathode vs Common Anode polarity.</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                if (commonAnode) { setPortByte((b) => (~b) & 0xff); setCommonAnode(false); }
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${!commonAnode ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Common Cathode (1=ON)
            </button>
            <button
              type="button"
              onClick={() => {
                if (!commonAnode) { setPortByte((b) => (~b) & 0xff); setCommonAnode(true); }
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${commonAnode ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Common Anode (0=ON)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-4 flex justify-center rounded-xl bg-slate-950 p-5 border border-slate-800">
            <svg viewBox="0 0 130 190" className="w-28 h-40">
              {/* a (D0) */}
              <polygon points="28,16 92,16 84,26 36,26" fill={segOn(0) ? '#38bdf8' : '#1e293b'} />
              {/* b (D1) */}
              <polygon points="96,20 96,86 86,78 86,28" fill={segOn(1) ? '#38bdf8' : '#1e293b'} />
              {/* c (D2) */}
              <polygon points="96,94 96,160 86,152 86,102" fill={segOn(2) ? '#38bdf8' : '#1e293b'} />
              {/* d (D3) */}
              <polygon points="28,164 92,164 84,154 36,154" fill={segOn(3) ? '#38bdf8' : '#1e293b'} />
              {/* e (D4) */}
              <polygon points="24,94 24,160 34,152 34,102" fill={segOn(4) ? '#38bdf8' : '#1e293b'} />
              {/* f (D5) */}
              <polygon points="24,20 24,86 34,78 34,28" fill={segOn(5) ? '#38bdf8' : '#1e293b'} />
              {/* g (D6) */}
              <polygon points="29,90 37,84 83,84 91,90 83,96 37,96" fill={segOn(6) ? '#38bdf8' : '#1e293b'} />
              {/* dp (D7) */}
              <circle cx="110" cy="158" r="7" fill={segOn(7) ? '#38bdf8' : '#1e293b'} />
            </svg>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {['dp', 'g', 'f', 'e', 'd', 'c', 'b', 'a'].map((seg, i) => {
                const bit = 7 - i;
                const val = (portByte >> bit) & 1;
                return (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => setPortByte((b) => (b ^ (1 << bit)) & 0xff)}
                    className={`rounded-xl border p-2 font-mono text-center cursor-pointer ${
                      val ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px]">D{bit} ({seg})</div>
                    <div className="text-base font-bold">{val}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SEG_CODES_CC).map(([digit, ccCode]) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setPortByte(commonAnode ? (~ccCode) & 0xff : ccCode)}
                  className="w-8 h-8 rounded-lg font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs p-3.5">
              MVI A, {toHex8(portByte)}H &nbsp;; {commonAnode ? 'Common Anode' : 'Common Cathode'} Pattern ({toBin8(portByte)}B)<br />
              OUT 01H &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;; Drive 7-Segment Port
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: 8051 Timer/Counter + 8085 Interrupt Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 8051 Timer 0 Simulator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">8051 Timer 0 (Mode 1 · 16-Bit)</h4>
            <button
              type="button"
              onClick={() => setCounterMode((c) => !c)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 cursor-pointer"
            >
              C/T&apos; = {counterMode ? '1 (Counter P3.4)' : '0 (Internal Timer)'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
            <div className="rounded-xl bg-slate-950 text-white p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">TH0 (High)</div>
              <div className="text-xl font-bold text-cyan-300 tabular-nums">{toHex8(t0Val >> 8)}H</div>
            </div>
            <div className="rounded-xl bg-slate-950 text-white p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">TL0 (Low)</div>
              <div className="text-xl font-bold text-cyan-300 tabular-nums">{toHex8(t0Val & 0xff)}H</div>
            </div>
            <div className={`rounded-xl p-3 border ${tf0 ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="text-[11px]">TF0 Flag</div>
              <div className="text-xl font-bold tabular-nums">{tf0 ? '1 (OVF!)' : '0'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={tick8051Timer} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
              <Zap className="w-3.5 h-3.5" />
              {counterMode ? 'Pulse Pin P3.4 (+1)' : 'Clock Machine Cycle (+1)'}
            </button>
            <button
              type="button"
              onClick={() => { setT0Val(0xfffb); setTf0(0); }}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono cursor-pointer"
            >
              Preload FFFBH
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click 5 times from FFFBH → FFFFH → 0000H rollover sets TF0 = 1 and triggers 8051 Timer 0 interrupt vector 000BH!
          </p>
        </div>

        {/* 8085 Interrupt Flow Simulator */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">8085 Interrupt Priority &amp; SIM Simulator</h4>
            <button
              type="button"
              onClick={() => setInte((e) => !e)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                inte ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {inte ? 'EI (INTE = 1)' : 'DI (INTE = 0)'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {(
              [
                ['m75', 'Mask M7.5'],
                ['m65', 'Mask M6.5'],
                ['m55', 'Mask M5.5'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMasks((m) => ({ ...m, [k]: !m[k] }))}
                className={`px-2.5 py-1 rounded-md border cursor-pointer ${
                  masks[k] ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {label}: {masks[k] ? '1 (Masked)' : '0 (Open)'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ['TRAP', 'TRAP (0024H)'],
                ['RST75', 'RST 7.5 (003CH)'],
                ['RST65', 'RST 6.5 (0034H)'],
                ['RST55', 'RST 5.5 (002CH)'],
                ['INTR', 'INTR'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => triggerInterrupt(id)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white text-xs font-mono cursor-pointer transition-colors"
              >
                Fire {label}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs p-3.5 leading-relaxed">
            {intResult}
          </div>
        </div>
      </div>
    </div>
  );
};
