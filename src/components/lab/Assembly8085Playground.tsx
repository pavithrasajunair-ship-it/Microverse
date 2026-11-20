import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, StepForward, RotateCcw, AlertCircle, Plus, Cpu } from 'lucide-react';
import {
  assemble8085,
  createInitialCpuState,
  PRESET_8085_PROGRAMS,
  step8085,
  toBin8,
  toHex16,
  toHex8,
  Cpu8085State,
} from '../../engine/sim8085';
import { useProgress } from '../../context/ProgressContext';
import { Architecture8085Explorer } from '../visuals/Architecture8085Explorer';

export const Assembly8085Playground: React.FC<{ initialCode?: string }> = ({ initialCode }) => {
  const { addXp } = useProgress();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_8085_PROGRAMS[0].id);
  const [code, setCode] = useState<string>(initialCode ?? PRESET_8085_PROGRAMS[0].code);
  const [speedMs, setSpeedMs] = useState<number>(500);
  const [running, setRunning] = useState<boolean>(false);
  const [customMemAddr, setCustomMemAddr] = useState<string>('2500');
  const [customMemVal, setCustomMemVal] = useState<string>('3A');
  const [trace, setTrace] = useState<Array<{ pc: string; action: string; cycles: string }>>([]);
  const rewardedRef = useRef(false);

  const assembled = useMemo(() => assemble8085(code, 0x2000), [code]);
  const [cpu, setCpu] = useState<Cpu8085State>(() => createInitialCpuState(0x2000));
  const [lastExecutedCycles, setLastExecutedCycles] = useState<string[]>(['OF']);

  const loadPreset = (presetId: string) => {
    const preset = PRESET_8085_PROGRAMS.find((p) => p.id === presetId);
    if (!preset) return;
    setRunning(false);
    setSelectedPresetId(preset.id);
    setCode(preset.code);
    setCpu(createInitialCpuState(0x2000, preset.initialMemory ?? {}));
    setTrace([{ pc: '2000H', action: `Loaded preset: ${preset.title}`, cycles: 'RESET' }]);
  };

  const handleReset = () => {
    setRunning(false);
    const preset = PRESET_8085_PROGRAMS.find((p) => p.id === selectedPresetId);
    setCpu(createInitialCpuState(assembled.origin, preset?.initialMemory ?? {}));
    setTrace([{ pc: `${toHex16(assembled.origin)}H`, action: 'Processor reset (PC initialized, SP = FFFFH).', cycles: 'RESET' }]);
  };

  const executeOneStep = () => {
    if (assembled.errors.length > 0) return;
    setCpu((prev) => {
      if (prev.halted) return prev;
      const inst = assembled.addressMap[prev.PC];
      const next = step8085(prev, assembled);
      if (inst) setLastExecutedCycles(inst.machineCycles);
      setTrace((t) =>
        [{ pc: `${toHex16(prev.PC)}H`, action: next.lastAction, cycles: inst ? `${inst.machineCycles.join(' → ')} (${inst.tStates}T)` : '-' }, ...t].slice(0, 20)
      );
      if (!rewardedRef.current) {
        rewardedRef.current = true;
        addXp(25, 'lab-coder');
      }
      return next;
    });
  };

  useEffect(() => {
    if (!running) return;
    if (cpu.halted || assembled.errors.length > 0) {
      setRunning(false);
      return;
    }
    const timer = window.setInterval(() => {
      setCpu((prev) => {
        if (prev.halted || prev.instructionCount > 250) {
          setRunning(false);
          return prev;
        }
        const inst = assembled.addressMap[prev.PC];
        const next = step8085(prev, assembled);
        if (inst) setLastExecutedCycles(inst.machineCycles);
        setTrace((t) =>
          [{ pc: `${toHex16(prev.PC)}H`, action: next.lastAction, cycles: inst ? `${inst.machineCycles.join(' → ')} (${inst.tStates}T)` : '-' }, ...t].slice(0, 20)
        );
        if (next.halted) setRunning(false);
        return next;
      });
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [running, speedMs, assembled, cpu.halted]);

  const writeCustomMemory = () => {
    const addr = parseInt(customMemAddr, 16);
    const val = parseInt(customMemVal, 16);
    if (Number.isNaN(addr) || Number.isNaN(val)) return;
    setCpu((prev) => ({
      ...prev,
      memory: { ...prev.memory, [addr & 0xffff]: val & 0xff },
    }));
    setTrace((t) => [{ pc: 'MEM', action: `Wrote [${toHex16(addr)}H] ← ${toHex8(val)}H`, cycles: 'MANUAL' }, ...t].slice(0, 20));
  };

  const currentInst = assembled.addressMap[cpu.PC];
  const port01 = cpu.ports[0x01] ?? 0;

  const memoryAddresses = useMemo(() => {
    const set = new Set<number>([
      0x2500, 0x2501, 0x2502, 0x2503, 0x2510,
      ...Object.keys(cpu.memory).map(Number),
    ]);
    return Array.from(set).sort((a, b) => a - b).slice(0, 16);
  }, [cpu.memory]);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 mr-1">Example Programs:</span>
          {PRESET_8085_PROGRAMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                selectedPresetId === p.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (assembled.errors.length === 0 && !cpu.halted) setRunning((r) => !r);
            }}
            disabled={assembled.errors.length > 0 || cpu.halted}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-45 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Pause' : 'Run'}
          </button>

          <button
            type="button"
            onClick={executeOneStep}
            disabled={running || assembled.errors.length > 0 || cpu.halted}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 disabled:opacity-45 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <StepForward className="w-3.5 h-3.5" />
            Step
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 pl-1">
            <span>Speed:</span>
            <input
              type="range"
              min={80}
              max={950}
              step={50}
              value={1030 - speedMs}
              onChange={(e) => setSpeedMs(1030 - Number(e.target.value))}
              className="w-20 accent-blue-600"
            />
          </label>
        </div>
      </div>

      {/* 3-COLUMN TOP STAGE: LEFT (Assembly + Highlight) | CENTRE (Animated 8085 Architecture) | RIGHT (Live Registers) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: Assembly Code & Highlighted Program Counter Listing */}
        <div className="xl:col-span-3 space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-slate-200 font-semibold">Assembly Source</span>
              <span>ORG 2000H</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => {
                setRunning(false);
                setCode(e.target.value);
              }}
              spellCheck={false}
              rows={9}
              className="w-full p-3 bg-slate-950 text-cyan-200 font-mono text-xs leading-relaxed focus:outline-none resize-y"
            />
          </div>

          {assembled.errors.length > 0 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4" /> Unsupported / Invalid Assembly
              </div>
              {assembled.errors.map((err, i) => (
                <div key={i} className="font-mono text-[11px]">
                  Line {err.line}: {err.message}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Live Execution Line</span>
              <span className="font-mono text-blue-600 dark:text-cyan-400">PC={toHex16(cpu.PC)}H</span>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-[11px]">
              {assembled.instructions.map((inst) => {
                const isNext = inst.address === cpu.PC && !cpu.halted;
                return (
                  <div
                    key={`${inst.address}-${inst.lineNumber}`}
                    className={`px-3 py-1.5 flex items-center justify-between gap-2 ${
                      isNext ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="tabular-nums opacity-80">{toHex16(inst.address)}</span>
                    <span className="truncate flex-1">{inst.source}</span>
                    <span className="tabular-nums opacity-75">{inst.tStates}T</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTRE PANE: Live Animated 8085 Architecture */}
        <div className="xl:col-span-6 space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <Cpu className="w-4 h-4 text-blue-500" />
              {cpu.halted ? 'CPU Halted (HLT)' : currentInst ? `Active: ${currentInst.source}` : 'Idle'}
            </span>
            <span className="font-mono text-blue-600 dark:text-cyan-400 tabular-nums">
              {lastExecutedCycles.join(' → ')} · Total: {cpu.cycles}T
            </span>
          </div>

          <Architecture8085Explorer externalActiveBlocks={cpu.activePath} liveCpu={cpu} compact />

          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-mono text-blue-800 dark:text-cyan-200">
            {cpu.lastAction}
          </div>
        </div>

        {/* RIGHT PANE: Live Register Bank (A, B, C, D, E, H, L, PC, SP) */}
        <div className="xl:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">Live 8085 Register Panel</div>
          <div className="space-y-1.5 font-mono text-xs">
            {[
              { name: 'A (Acc)', val: cpu.A, accent: true },
              { name: 'B', val: cpu.B },
              { name: 'C', val: cpu.C },
              { name: 'D', val: cpu.D },
              { name: 'E', val: cpu.E },
              { name: 'H', val: cpu.H },
              { name: 'L', val: cpu.L },
            ].map((r) => (
              <div
                key={r.name}
                className={`px-3 py-2 rounded-lg border flex items-center justify-between ${
                  r.accent
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-cyan-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{r.name}</span>
                <span className="tabular-nums font-bold">{toHex8(r.val)}H</span>
                <span className="text-[10px] text-slate-500 tabular-nums">{toBin8(r.val)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="px-3 py-2 rounded-lg bg-slate-950 text-cyan-300 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">PC</span>
              <span className="font-bold tabular-nums">{toHex16(cpu.PC)}H</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-950 text-violet-300 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">SP</span>
              <span className="font-bold tabular-nums">{toHex16(cpu.SP)}H</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-950 text-emerald-300 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">M [HL]</span>
              <span className="font-bold tabular-nums">{toHex8(cpu.memory[(cpu.H << 8) | cpu.L] ?? 0)}H</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STAGE: Flags, Machine Cycles, Memory Grid, Port 01H LEDs & Execution History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Flags & Port LEDs */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Flag Register (S, Z, AC, P, CY)</div>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-center">
              {(
                [
                  ['S', cpu.flags.S],
                  ['Z', cpu.flags.Z],
                  ['AC', cpu.flags.AC],
                  ['P', cpu.flags.P],
                  ['CY', cpu.flags.CY],
                ] as const
              ).map(([label, val]) => (
                <div
                  key={label}
                  className={`rounded-lg border py-2 ${
                    val
                      ? 'border-blue-500 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] opacity-80">{label}</div>
                  <div className="text-sm tabular-nums">{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-900 dark:text-white">Port 01H LEDs</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">{toHex8(port01)}H</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                const on = ((port01 >> bit) & 1) === 1;
                return (
                  <div key={bit} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        on
                          ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.85)]'
                          : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-500">D{bit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Memory Grid */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Live Memory Locations</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <input
                value={customMemAddr}
                maxLength={4}
                onChange={(e) => setCustomMemAddr(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
                className="w-14 px-1.5 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
              <input
                value={customMemVal}
                maxLength={2}
                onChange={(e) => setCustomMemVal(e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase())}
                className="w-10 px-1.5 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
              <button type="button" onClick={writeCustomMemory} className="p-1 rounded bg-blue-600 text-white cursor-pointer" title="Write Byte">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
            {memoryAddresses.map((addr) => (
              <div key={addr} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 text-center">
                <div className="text-[9px] text-slate-500 tabular-nums">{toHex16(addr)}</div>
                <div className="font-bold text-slate-900 dark:text-cyan-300 tabular-nums">{toHex8(cpu.memory[addr] ?? 0)}H</div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution History & Machine Cycles */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">Execution History &amp; Machine Cycles</div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[11px]">
            {trace.length === 0 ? (
              <div className="text-slate-500">Click Step or Run to observe live instruction trace and machine cycles.</div>
            ) : (
              trace.map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-900/70 px-2.5 py-1.5 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-cyan-400">
                    <span>{item.pc}</span>
                    <span>{item.cycles}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 truncate">{item.action}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
