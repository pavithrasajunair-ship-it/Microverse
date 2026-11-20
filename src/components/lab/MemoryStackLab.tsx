import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, RotateCcw } from 'lucide-react';
import { toHex16, toHex8 } from '../../engine/sim8085';

export const MemoryStackLab: React.FC = () => {
  const [mem, setMem] = useState<Record<number, number>>({
    0x2500: 0x4e,
    0x2501: 0x92,
    0x2502: 0x1a,
    0x2503: 0xff,
  });
  const [acc, setAcc] = useState<number>(0x35);
  const [selectedAddr, setSelectedAddr] = useState<number>(0x2500);
  const [writeHex, setWriteHex] = useState<string>('7C');
  const [memLog, setMemLog] = useState<string>('Select any cell in the 2500H–250FH grid to read/write hex bytes or execute LDA / STA.');

  // Stack state
  const [sp, setSp] = useState<number>(0x27ff);
  const [stackMem, setStackMem] = useState<Record<number, { val: number; tag: string }>>({});
  const [stackLog, setStackLog] = useState<string>('SP = 27FFH. Click PUSH to watch SP decrement by 2 (High byte first, Low byte second).');

  // Little-Endian Explorer state
  const [word16, setWord16] = useState<string>('2500');
  const parsedWord = parseInt(word16 || '0', 16) & 0xffff;
  const lowByte = parsedWord & 0xff;
  const highByte = (parsedWord >> 8) & 0xff;

  const gridAddrs = Array.from({ length: 16 }, (_, i) => 0x2500 + i);
  const stackSlots = [0x27ff, 0x27fe, 0x27fd, 0x27fc, 0x27fb, 0x27fa, 0x27f9, 0x27f8];

  const writeCell = () => {
    const val = parseInt(writeHex || '0', 16) & 0xff;
    setMem((m) => ({ ...m, [selectedAddr]: val }));
    setMemLog(`Memory Write: RAM[${toHex16(selectedAddr)}H] ← ${toHex8(val)}H.`);
  };

  const execLDA = () => {
    const val = mem[selectedAddr] ?? 0;
    setAcc(val);
    setMemLog(`LDA ${toHex16(selectedAddr)}H executed: Loaded ${toHex8(val)}H from RAM into Accumulator A (13 T-states).`);
  };

  const execSTA = () => {
    setMem((m) => ({ ...m, [selectedAddr]: acc }));
    setMemLog(`STA ${toHex16(selectedAddr)}H executed: Stored Accumulator A (${toHex8(acc)}H) into RAM[${toHex16(selectedAddr)}H] (13 T-states).`);
  };

  const pushPair = (name: string, hi: number, lo: number) => {
    if (sp <= 0x27f9) {
      setStackLog('Demo stack window full! Click POP or Reset.');
      return;
    }
    const s1 = sp - 1;
    const s2 = sp - 2;
    setStackMem((m) => ({
      ...m,
      [s1]: { val: hi, tag: `${name} High` },
      [s2]: { val: lo, tag: `${name} Low` },
    }));
    setSp(s2);
    setStackLog(`PUSH ${name} (${toHex8(hi)}${toHex8(lo)}H): [SP-1 = ${toHex16(s1)}H] ← ${toHex8(hi)}H, [SP-2 = ${toHex16(s2)}H] ← ${toHex8(lo)}H. SP = ${toHex16(s2)}H.`);
  };

  const popPair = (target: string) => {
    if (sp >= 0x27ff) {
      setStackLog('Stack empty (SP = 27FFH). Push a register pair first.');
      return;
    }
    const lo = stackMem[sp]?.val ?? 0;
    const hi = stackMem[sp + 1]?.val ?? 0;
    setSp(sp + 2);
    setStackLog(`POP ${target}: Low=${toHex8(lo)}H from ${toHex16(sp)}H, High=${toHex8(hi)}H from ${toHex16(sp + 1)}H → ${target}=${toHex8(hi)}${toHex8(lo)}H, SP=${toHex16(sp + 2)}H.`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Addressable Memory Grid + LDA / STA */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Addressable Memory Grid (2500H – 250FH)</h4>
              <p className="text-xs text-slate-500">Click any cell to select address, write hex data, or run LDA / STA with Accumulator A.</p>
            </div>
            <div className="rounded-xl bg-slate-950 text-cyan-300 border border-slate-800 px-3.5 py-1.5 font-mono text-xs">
              Acc A = <strong className="text-base">{toHex8(acc)}H</strong>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            {gridAddrs.map((addr) => {
              const isSel = addr === selectedAddr;
              return (
                <button
                  key={addr}
                  type="button"
                  onClick={() => setSelectedAddr(addr)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSel
                      ? 'border-blue-500 bg-blue-600/15 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 hover:border-slate-400'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 tabular-nums">{toHex16(addr)}H</div>
                  <div className="text-base font-bold text-slate-900 dark:text-cyan-300 tabular-nums mt-0.5">
                    {toHex8(mem[addr] ?? 0)}H
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-500">Selected: {toHex16(selectedAddr)}H</span>
            <input
              value={writeHex}
              maxLength={2}
              onChange={(e) => setWriteHex(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
              className="w-14 px-2 py-1.5 rounded-lg font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center"
            />
            <button type="button" onClick={writeCell} className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium cursor-pointer">
              Write Hex
            </button>
            <button type="button" onClick={execLDA} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-mono font-semibold cursor-pointer">
              <ArrowUpFromLine className="w-3.5 h-3.5" /> LDA {toHex16(selectedAddr)}H
            </button>
            <button type="button" onClick={execSTA} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-mono font-semibold cursor-pointer">
              <ArrowDownToLine className="w-3.5 h-3.5" /> STA {toHex16(selectedAddr)}H
            </button>
          </div>
          <p className="text-xs font-mono text-blue-600 dark:text-cyan-300">{memLog}</p>
        </div>

        {/* Downward Stack Visualizer */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">8085 Stack Growth (PUSH / POP)</h4>
            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">SP = {toHex16(sp)}H</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => pushPair('BC', 0x35, 0xa2)} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-mono cursor-pointer">
              PUSH B (35A2H)
            </button>
            <button type="button" onClick={() => pushPair('DE', 0x19, 0x4f)} className="px-2.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-mono cursor-pointer">
              PUSH D (194FH)
            </button>
            <button type="button" onClick={() => popPair('HL')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-mono cursor-pointer">
              POP H
            </button>
            <button
              type="button"
              onClick={() => { setSp(0x27ff); setStackMem({}); setStackLog('Stack reset to SP = 27FFH.'); }}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
              aria-label="Reset stack"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 font-mono text-xs">
            {stackSlots.map((addr) => {
              const isSp = addr === sp;
              const cell = stackMem[addr];
              const active = addr >= sp && addr < 0x27ff;
              return (
                <div
                  key={addr}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg border ${
                    isSp
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold'
                      : active
                        ? 'border-blue-500/30 bg-blue-500/10 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                  }`}
                >
                  <span className="tabular-nums">{toHex16(addr)}H {isSp ? '← SP' : ''}</span>
                  <span className="tabular-nums">{cell ? `${toHex8(cell.val)}H (${cell.tag})` : '--'}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed">{stackLog}</p>
        </div>
      </div>

      {/* Little-Endian Storage Interactive Visualizer */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">Little-Endian Memory Storage Visualizer (8085 / 8086)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intel processors store the Low-Order Byte at the lower memory address and the High-Order Byte at the next higher address.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">16-Bit Value:</span>
            <input
              value={word16}
              maxLength={4}
              onChange={(e) => setWord16(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
              className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-bold"
            />
            <span>H</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-white">
            <div className="text-slate-400">2000H (Opcode)</div>
            <div className="text-xl font-bold text-violet-300 mt-1">21H</div>
            <div className="text-[11px] text-slate-400 mt-0.5">LXI H, {toHex16(parsedWord)}H</div>
          </div>
          <div className="rounded-xl bg-slate-950 border border-cyan-500/50 p-3.5 text-white">
            <div className="text-cyan-300">2001H (Lower Addr → LOW BYTE)</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">{toHex8(lowByte)}H</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Loads into Register L</div>
          </div>
          <div className="rounded-xl bg-slate-950 border border-emerald-500/50 p-3.5 text-white">
            <div className="text-emerald-300">2002H (Higher Addr → HIGH BYTE)</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{toHex8(highByte)}H</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Loads into Register H</div>
          </div>
        </div>
      </div>
    </div>
  );
};
