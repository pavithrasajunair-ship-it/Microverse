import React, { useEffect, useState } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { calcParity, toBin8, toHex16, toHex8 } from '../../engine/sim8085';

export type AnimatedInstructionId =
  | 'MOV'
  | 'ADD'
  | 'PUSH'
  | 'POP'
  | 'LDA'
  | 'STA'
  | 'INR'
  | 'DCR'
  | 'CMP'
  | 'JMP'
  | 'CALL'
  | 'RET';

interface StepFrame {
  title: string;
  phase: string;
  narration: string;
  activeNodes: string[];
  flowArrow?: { from: [number, number]; to: [number, number]; label: string; color: string };
  regs: { A: number; B: number; C: number; PC: number; SP: number; memVal: number; stackHi?: number; stackLo?: number };
  flags: { S: number; Z: number; AC: number; P: number; CY: number };
  flagNote?: string;
}

const INSTRUCTIONS_LIST: Array<{ id: AnimatedInstructionId; label: string; category: string }> = [
  { id: 'MOV', label: 'MOV A, B', category: 'Data Transfer' },
  { id: 'ADD', label: 'ADD B', category: 'Arithmetic' },
  { id: 'PUSH', label: 'PUSH B', category: 'Stack' },
  { id: 'POP', label: 'POP B', category: 'Stack' },
  { id: 'LDA', label: 'LDA 2500H', category: 'Memory' },
  { id: 'STA', label: 'STA 2500H', category: 'Memory' },
  { id: 'INR', label: 'INR A', category: 'Arithmetic' },
  { id: 'DCR', label: 'DCR B', category: 'Arithmetic' },
  { id: 'CMP', label: 'CMP B', category: 'Logical' },
  { id: 'JMP', label: 'JMP 2050H', category: 'Branch' },
  { id: 'CALL', label: 'CALL 2100H', category: 'Branch' },
  { id: 'RET', label: 'RET', category: 'Branch' },
];

function buildFrames(id: AnimatedInstructionId, initA: number, initB: number, initMem: number): StepFrame[] {
  const baseFlags = { S: 0, Z: 0, AC: 0, P: 0, CY: 1 };
  const baseRegs = { A: initA, B: initB, C: 0xa2, PC: 0x2000, SP: 0x2700, memVal: initMem };

  switch (id) {
    case 'MOV':
      return [
        {
          title: 'Initial Processor State',
          phase: 'Before Execution · PC = 2000H',
          narration: `Accumulator A holds ${toHex8(initA)}H and Register B holds ${toHex8(initB)}H. Program Counter points to 2000H containing opcode 78H (MOV A, B).`,
          activeNodes: ['PC', 'B'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'Opcode Fetch & Decode (M1 · 4T)',
          phase: 'T1–T4: Fetch 78H',
          narration: 'PC places 2000H on the address bus, fetches opcode 78H into the Instruction Register, decodes MOV A, B, and increments PC to 2001H.',
          activeNodes: ['PC', 'BUS'],
          regs: { ...baseRegs, PC: 0x2001 },
          flags: { ...baseFlags },
        },
        {
          title: 'Internal Bus Transfer (B → A)',
          phase: 'Data Copy on 8-Bit Internal Bus',
          narration: `Control Unit enables Register B output onto the 8-bit Internal Data Bus. Byte ${toHex8(initB)}H travels across the bus toward Accumulator A.`,
          activeNodes: ['B', 'BUS', 'A'],
          flowArrow: { from: [460, 118], to: [145, 118], label: `${toHex8(initB)}H`, color: '#38bdf8' },
          regs: { ...baseRegs, PC: 0x2001 },
          flags: { ...baseFlags },
        },
        {
          title: 'Register A Updated · B Preserved',
          phase: 'Instruction Complete (4 T-States)',
          narration: `Accumulator A latches ${toHex8(initB)}H! Register B remains unchanged (${toHex8(initB)}H). PC is ready at 2001H. No flags are modified by data-transfer instructions.`,
          activeNodes: ['A', 'B', 'PC'],
          regs: { ...baseRegs, A: initB, PC: 0x2001 },
          flags: { ...baseFlags },
          flagNote: 'MOV affects ZERO flags.',
        },
      ];

    case 'ADD': {
      const sum = initA + initB;
      const res = sum & 0xff;
      const newFlags = {
        S: (res & 0x80) ? 1 : 0,
        Z: res === 0 ? 1 : 0,
        AC: (initA & 0x0f) + (initB & 0x0f) > 0x0f ? 1 : 0,
        P: calcParity(res),
        CY: sum > 0xff ? 1 : 0,
      };
      return [
        {
          title: 'Initial Operands Loaded',
          phase: 'Before ADD B (Opcode 80H)',
          narration: `Accumulator A = ${toHex8(initA)}H (${toBin8(initA)}) and Register B = ${toHex8(initB)}H (${toBin8(initB)}). PC = 2000H.`,
          activeNodes: ['A', 'B', 'PC'],
          regs: { ...baseRegs },
          flags: { S: 0, Z: 0, AC: 0, P: 0, CY: 0 },
        },
        {
          title: 'Route B → Temp Reg & A → ALU',
          phase: 'Operand Latching',
          narration: `Register B (${toHex8(initB)}H) moves across the Internal Bus into the Temporary Register, while Accumulator A (${toHex8(initA)}H) feeds the ALU's other input.`,
          activeNodes: ['A', 'B', 'BUS', 'ALU'],
          flowArrow: { from: [460, 118], to: [290, 210], label: `${toHex8(initB)}H`, color: '#a78bfa' },
          regs: { ...baseRegs, PC: 0x2001 },
          flags: { S: 0, Z: 0, AC: 0, P: 0, CY: 0 },
        },
        {
          title: '8-Bit Binary Addition in ALU',
          phase: 'ALU Computing A + B',
          narration: `ALU computes ${toHex8(initA)}H + ${toHex8(initB)}H = ${sum.toString(16).toUpperCase()}H. Lower nibble carry D3→D4 sets AC=${newFlags.AC}; D7 carry sets CY=${newFlags.CY}.`,
          activeNodes: ['ALU', 'FLAGS'],
          flowArrow: { from: [145, 118], to: [255, 210], label: `${toHex8(initA)}H`, color: '#38bdf8' },
          regs: { ...baseRegs, PC: 0x2001 },
          flags: newFlags,
          flagNote: `S=${newFlags.S} (D7=${(res >> 7) & 1}), Z=${newFlags.Z}, AC=${newFlags.AC}, P=${newFlags.P} (${newFlags.P ? 'even' : 'odd'} 1s), CY=${newFlags.CY}.`,
        },
        {
          title: 'Result Stored in Accumulator A',
          phase: 'Complete (4 T-States)',
          narration: `Result ${toHex8(res)}H travels from ALU output back into Accumulator A. Register B stays ${toHex8(initB)}H and all 5 flags reflect the result.`,
          activeNodes: ['ALU', 'A', 'FLAGS'],
          flowArrow: { from: [260, 200], to: [145, 118], label: `${toHex8(res)}H`, color: '#34d399' },
          regs: { ...baseRegs, A: res, PC: 0x2001 },
          flags: newFlags,
          flagNote: `Updated all 5 flags: S=${newFlags.S}, Z=${newFlags.Z}, AC=${newFlags.AC}, P=${newFlags.P}, CY=${newFlags.CY}.`,
        },
      ];
    }

    case 'PUSH':
      return [
        {
          title: 'Initial Stack Pointer & BC Pair',
          phase: 'Before PUSH B (Opcode C5H · 12T)',
          narration: `BC pair holds ${toHex8(initB)}A2H (High B=${toHex8(initB)}H, Low C=A2H). Stack Pointer SP = 2700H (Top of Stack).`,
          activeNodes: ['B', 'SP'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'Decrement SP & Write High Byte B',
          phase: 'M2: Memory Write (SP − 1 = 26FFH)',
          narration: `SP decrements by 1 to 26FFH. High-order register B (${toHex8(initB)}H) is written to Stack RAM[26FFH].`,
          activeNodes: ['B', 'BUS', 'SP', 'MEM'],
          flowArrow: { from: [460, 118], to: [615, 220], label: `B=${toHex8(initB)}H`, color: '#38bdf8' },
          regs: { ...baseRegs, PC: 0x2001, SP: 0x26ff, stackHi: initB },
          flags: { ...baseFlags },
        },
        {
          title: 'Decrement SP Again & Write Low Byte C',
          phase: 'M3: Memory Write (SP − 2 = 26FEH)',
          narration: 'SP decrements again to 26FEH. Low-order register C (A2H) is written to Stack RAM[26FEH]. Stack grows downward in memory! Zero flags modified.',
          activeNodes: ['B', 'BUS', 'SP', 'MEM'],
          flowArrow: { from: [460, 145], to: [615, 252], label: 'C=A2H', color: '#a78bfa' },
          regs: { ...baseRegs, PC: 0x2001, SP: 0x26fe, stackHi: initB, stackLo: 0xa2 },
          flags: { ...baseFlags },
          flagNote: 'PUSH affects ZERO flags. 8085 stack grows downward.',
        },
      ];

    case 'POP':
      return [
        {
          title: 'Stack Frame Ready to Pop',
          phase: 'Before POP B (Opcode C1H · 10T)',
          narration: `SP = 26FEH pointing to Low Byte [26FEH]=A2H, with High Byte [26FFH]=${toHex8(initB)}H right above it. BC is currently 0000H.`,
          activeNodes: ['SP', 'MEM'],
          regs: { ...baseRegs, B: 0x00, C: 0x00, SP: 0x26fe, stackHi: initB, stackLo: 0xa2 },
          flags: { ...baseFlags },
        },
        {
          title: 'Read Low Byte into C & Increment SP',
          phase: 'M2: Memory Read [26FEH] → C',
          narration: 'CPU reads A2H from [26FEH] into low register C, then increments SP from 26FEH to 26FFH.',
          activeNodes: ['MEM', 'BUS', 'B', 'SP'],
          flowArrow: { from: [615, 252], to: [460, 145], label: 'A2H → C', color: '#34d399' },
          regs: { ...baseRegs, B: 0x00, C: 0xa2, PC: 0x2001, SP: 0x26ff, stackHi: initB, stackLo: 0xa2 },
          flags: { ...baseFlags },
        },
        {
          title: 'Read High Byte into B & Increment SP',
          phase: 'M3: Memory Read [26FFH] → B',
          narration: `CPU reads ${toHex8(initB)}H from [26FFH] into high register B and increments SP to 2700H. BC pair fully restored (${toHex8(initB)}A2H)!`,
          activeNodes: ['MEM', 'BUS', 'B', 'SP'],
          flowArrow: { from: [615, 220], to: [460, 118], label: `${toHex8(initB)}H → B`, color: '#38bdf8' },
          regs: { ...baseRegs, B: initB, C: 0xa2, PC: 0x2001, SP: 0x2700, stackHi: initB, stackLo: 0xa2 },
          flags: { ...baseFlags },
          flagNote: 'POP B affects ZERO flags (only POP PSW updates flags!).',
        },
      ];

    case 'LDA':
      return [
        {
          title: '3-Byte Direct Memory Read',
          phase: 'Before LDA 2500H (3AH, 00H, 25H · 13T)',
          narration: `RAM location 2500H holds ${toHex8(initMem)}H. Accumulator A currently holds ${toHex8(initA)}H.`,
          activeNodes: ['PC', 'MEM'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'Fetch Opcode + Little-Endian Address',
          phase: 'M1 (OF) + M2 (00H) + M3 (25H)',
          narration: 'CPU fetches 3AH, then Low Address 00H into Z and High Address 25H into W (internal WZ = 2500H). PC advances by 3 bytes to 2003H.',
          activeNodes: ['PC', 'BUS'],
          regs: { ...baseRegs, PC: 0x2003 },
          flags: { ...baseFlags },
        },
        {
          title: 'Memory Read [2500H] → Accumulator A',
          phase: 'M4: RD\'=0, IO/M\'=0',
          narration: `CPU places 2500H onto the 16-bit Address Bus and asserts RD' LOW. Byte ${toHex8(initMem)}H flows from RAM[2500H] directly into Accumulator A!`,
          activeNodes: ['MEM', 'BUS', 'A'],
          flowArrow: { from: [615, 130], to: [145, 118], label: `${toHex8(initMem)}H`, color: '#34d399' },
          regs: { ...baseRegs, A: initMem, PC: 0x2003 },
          flags: { ...baseFlags },
          flagNote: 'LDA transfers data without modifying any flags.',
        },
      ];

    case 'STA':
      return [
        {
          title: '3-Byte Direct Memory Write',
          phase: 'Before STA 2500H (32H, 00H, 25H · 13T)',
          narration: `Accumulator A holds ${toHex8(initA)}H. Target RAM location 2500H currently holds ${toHex8(initMem)}H.`,
          activeNodes: ['A', 'PC', 'MEM'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'Fetch Opcode + Target Address 2500H',
          phase: 'M1 (32H) + M2 (00H) + M3 (25H)',
          narration: 'CPU fetches all 3 bytes of STA 2500H into WZ temporary pair and advances PC to 2003H.',
          activeNodes: ['PC', 'BUS'],
          regs: { ...baseRegs, PC: 0x2003 },
          flags: { ...baseFlags },
        },
        {
          title: 'Write Accumulator A → RAM[2500H]',
          phase: 'M4: WR\'=0, IO/M\'=0',
          narration: `CPU drives 2500H onto Address Bus, places A (${toHex8(initA)}H) onto AD7–AD0, and pulses WR' LOW. RAM[2500H] updates to ${toHex8(initA)}H!`,
          activeNodes: ['A', 'BUS', 'MEM'],
          flowArrow: { from: [145, 118], to: [615, 130], label: `${toHex8(initA)}H`, color: '#f59e0b' },
          regs: { ...baseRegs, PC: 0x2003, memVal: initA },
          flags: { ...baseFlags },
          flagNote: 'STA preserves Accumulator A and modifies ZERO flags.',
        },
      ];

    case 'INR': {
      const res = (initA + 1) & 0xff;
      const ac = (initA & 0x0f) + 1 > 0x0f ? 1 : 0;
      const nf = { S: (res & 0x80) ? 1 : 0, Z: res === 0 ? 1 : 0, AC: ac, P: calcParity(res), CY: 1 };
      return [
        {
          title: 'Initial State (Note CY = 1)',
          phase: 'Before INR A (Opcode 3CH · 4T)',
          narration: `Accumulator A = ${toHex8(initA)}H and Carry Flag CY = 1 from a prior operation. Watch what happens to CY!`,
          activeNodes: ['A', 'FLAGS'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'ALU Increments A + 1',
          phase: 'Internal ALU Pass',
          narration: `ALU adds +1 to ${toHex8(initA)}H → ${toHex8(res)}H. S, Z, AC, and P are recomputed, while CY is hardwired to bypass update!`,
          activeNodes: ['A', 'ALU', 'FLAGS'],
          flowArrow: { from: [145, 118], to: [255, 210], label: '+1', color: '#38bdf8' },
          regs: { ...baseRegs, A: res, PC: 0x2001 },
          flags: nf,
          flagNote: `CRITICAL 8085 RULE: S=${nf.S}, Z=${nf.Z}, AC=${nf.AC}, P=${nf.P} updated — CY stayed 1 (unchanged)!`,
        },
      ];
    }

    case 'DCR': {
      const res = (initB - 1) & 0xff;
      const ac = (initB & 0x0f) === 0 ? 0 : 1;
      const nf = { S: (res & 0x80) ? 1 : 0, Z: res === 0 ? 1 : 0, AC: ac, P: calcParity(res), CY: 1 };
      return [
        {
          title: 'Initial Loop Counter B',
          phase: 'Before DCR B (Opcode 05H · 4T)',
          narration: `Register B = ${toHex8(initB)}H, CY = 1. DCR B is the classic 8085 loop-counter decrement instruction.`,
          activeNodes: ['B', 'FLAGS'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'ALU Computes B − 1 & Updates Flags',
          phase: 'Complete (4 T-States)',
          narration: `B becomes ${toHex8(res)}H. If B hits 00H, Z becomes 1 so JNZ exits the loop. Carry Flag CY remains 1 untouched!`,
          activeNodes: ['B', 'ALU', 'FLAGS'],
          flowArrow: { from: [460, 118], to: [290, 210], label: '−1', color: '#f43f5e' },
          regs: { ...baseRegs, B: res, PC: 0x2001 },
          flags: nf,
          flagNote: `S=${nf.S}, Z=${nf.Z}, AC=${nf.AC}, P=${nf.P} updated; CY intentionally preserved!`,
        },
      ];
    }

    case 'CMP': {
      const diff = initA - initB;
      const res = diff & 0xff;
      const nf = {
        S: (res & 0x80) ? 1 : 0,
        Z: res === 0 ? 1 : 0,
        AC: (initA & 0x0f) >= (initB & 0x0f) ? 1 : 0,
        P: calcParity(res),
        CY: diff < 0 ? 1 : 0,
      };
      const relation = initA < initB ? 'A < B → CY = 1, Z = 0' : initA === initB ? 'A == B → Z = 1, CY = 0' : 'A > B → CY = 0, Z = 0';
      return [
        {
          title: 'Compare A with B (Non-Destructive)',
          phase: 'Before CMP B (Opcode B8H · 4T)',
          narration: `Comparing A (${toHex8(initA)}H) against B (${toHex8(initB)}H). Unlike SUB B, CMP discards the numeric difference so A is never overwritten.`,
          activeNodes: ['A', 'B'],
          regs: { ...baseRegs },
          flags: { S: 0, Z: 0, AC: 0, P: 0, CY: 0 },
        },
        {
          title: 'ALU Evaluates (A − B) & Sets Flags',
          phase: 'Flag Comparison Complete',
          narration: `Internal subtraction yields ${toHex8(res)}H (discarded). Result: ${relation}. Accumulator A remains ${toHex8(initA)}H!`,
          activeNodes: ['A', 'B', 'ALU', 'FLAGS'],
          flowArrow: { from: [460, 118], to: [290, 210], label: 'A − B', color: '#fbbf24' },
          regs: { ...baseRegs, PC: 0x2001 },
          flags: nf,
          flagNote: `${relation} (A stays ${toHex8(initA)}H).`,
        },
      ];
    }

    case 'JMP':
      return [
        {
          title: 'Sequential Execution at 2000H',
          phase: 'Before JMP 2050H (C3H, 50H, 20H · 10T)',
          narration: 'PC = 2000H points to 3-byte unconditional branch JMP 2050H.',
          activeNodes: ['PC'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'Load Target Address Directly into PC',
          phase: 'PC ← 2050H (No Stack Used)',
          narration: 'CPU reads target bytes 50H (low) and 20H (high) and overwrites PC directly with 2050H. Next instruction fetches from 2050H!',
          activeNodes: ['BUS', 'PC'],
          flowArrow: { from: [615, 130], to: [460, 250], label: '2050H → PC', color: '#38bdf8' },
          regs: { ...baseRegs, PC: 0x2050 },
          flags: { ...baseFlags },
          flagNote: 'JMP does NOT touch SP or Flags.',
        },
      ];

    case 'CALL':
      return [
        {
          title: 'Subroutine Invocation at 2000H',
          phase: 'Before CALL 2100H (CDH, 00H, 21H · 18T)',
          narration: 'CALL 2100H is a 3-byte instruction, so the return address of the next instruction is 2003H. SP = 2700H.',
          activeNodes: ['PC', 'SP'],
          regs: { ...baseRegs },
          flags: { ...baseFlags },
        },
        {
          title: 'Save Return Address (2003H) onto Stack',
          phase: 'M4–M5: Push PC High (20H) & Low (03H)',
          narration: 'Before branching, 8085 pushes return PC (2003H) onto stack: [26FFH]←20H, [26FEH]←03H, SP becomes 26FEH.',
          activeNodes: ['PC', 'SP', 'MEM', 'BUS'],
          flowArrow: { from: [460, 250], to: [615, 235], label: '2003H → Stack', color: '#a78bfa' },
          regs: { ...baseRegs, PC: 0x2003, SP: 0x26fe, stackHi: 0x20, stackLo: 0x03 },
          flags: { ...baseFlags },
        },
        {
          title: 'Jump to Subroutine 2100H',
          phase: 'PC ← 2100H (Complete · 18T)',
          narration: 'PC loads subroutine start address 2100H. Execution now runs inside the subroutine until RET pops 2003H back!',
          activeNodes: ['PC', 'SP'],
          regs: { ...baseRegs, PC: 0x2100, SP: 0x26fe, stackHi: 0x20, stackLo: 0x03 },
          flags: { ...baseFlags },
        },
      ];

    case 'RET':
      return [
        {
          title: 'End of Subroutine at 2110H',
          phase: 'Before RET (Opcode C9H · 10T)',
          narration: 'CPU reaches RET at 2110H. Top of Stack (SP=26FEH) holds the saved return address 2003H (Low 03H at 26FEH, High 20H at 26FFH).',
          activeNodes: ['PC', 'SP', 'MEM'],
          regs: { ...baseRegs, PC: 0x2110, SP: 0x26fe, stackHi: 0x20, stackLo: 0x03 },
          flags: { ...baseFlags },
        },
        {
          title: 'Pop Return Address from Stack into PC',
          phase: 'M2–M3: PC ← [SP] & SP ← SP + 2',
          narration: 'RET pops Low Byte (03H) then High Byte (20H) into PC, incrementing SP back to 2700H. Main program resumes cleanly at 2003H!',
          activeNodes: ['MEM', 'BUS', 'PC', 'SP'],
          flowArrow: { from: [615, 235], to: [460, 250], label: '2003H → PC', color: '#34d399' },
          regs: { ...baseRegs, PC: 0x2003, SP: 0x2700, stackHi: 0x20, stackLo: 0x03 },
          flags: { ...baseFlags },
        },
      ];
  }
}

export const InstructionVisualizer: React.FC<{ defaultInstruction?: AnimatedInstructionId }> = ({
  defaultInstruction = 'MOV',
}) => {
  const [selected, setSelected] = useState<AnimatedInstructionId>(defaultInstruction);
  const [initA, setInitA] = useState<number>(defaultInstruction === 'ADD' ? 0x9a : 0x00);
  const [initB, setInitB] = useState<number>(defaultInstruction === 'ADD' ? 0x8c : 0x05);
  const [initMem, setInitMem] = useState<number>(0x4e);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const frames = buildFrames(selected, initA, initB, initMem);
  const frame = frames[Math.min(stepIdx, frames.length - 1)];

  const pickInstruction = (id: AnimatedInstructionId) => {
    setAutoPlay(false);
    setSelected(id);
    setStepIdx(0);
    if (id === 'MOV') { setInitA(0x00); setInitB(0x05); }
    else if (id === 'ADD') { setInitA(0x9a); setInitB(0x8c); }
    else if (id === 'INR') { setInitA(0x0f); }
    else if (id === 'DCR') { setInitB(0x01); }
    else if (id === 'CMP') { setInitA(0x25); setInitB(0x40); }
    else if (id === 'STA') { setInitA(0x7c); setInitMem(0x00); }
    else if (id === 'LDA') { setInitA(0x00); setInitMem(0x4e); }
    else if (id === 'PUSH' || id === 'POP') { setInitB(0x35); }
  };

  useEffect(() => {
    if (!autoPlay) return;
    if (stepIdx >= frames.length - 1) {
      setAutoPlay(false);
      return;
    }
    const id = window.setTimeout(() => setStepIdx((s) => s + 1), 1300);
    return () => window.clearTimeout(id);
  }, [autoPlay, stepIdx, frames.length]);

  const isActive = (node: string) => frame.activeNodes.includes(node);

  return (
    <div className="space-y-4">
      {/* Instruction Selector */}
      <div className="flex flex-wrap gap-1.5">
        {INSTRUCTIONS_LIST.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => pickInstruction(inst.id)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selected === inst.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {inst.label}
          </button>
        ))}
      </div>

      {/* Controls & Operand Customizer */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <label className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">A:</span>
            <input
              value={toHex8(initA)}
              maxLength={2}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9a-fA-F]/g, '') || '0', 16);
                setInitA(v & 0xff);
                setStepIdx(0);
              }}
              className="w-12 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center"
            />
          </label>
          <label className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">B:</span>
            <input
              value={toHex8(initB)}
              maxLength={2}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9a-fA-F]/g, '') || '0', 16);
                setInitB(v & 0xff);
                setStepIdx(0);
              }}
              className="w-12 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center"
            />
          </label>
          <label className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">[2500H]:</span>
            <input
              value={toHex8(initMem)}
              maxLength={2}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9a-fA-F]/g, '') || '0', 16);
                setInitMem(v & 0xff);
                setStepIdx(0);
              }}
              className="w-12 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (stepIdx >= frames.length - 1) setStepIdx(0);
              setAutoPlay((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
          >
            {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoPlay ? 'Pause' : 'Animate'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoPlay(false);
              setStepIdx((s) => (s < frames.length - 1 ? s + 1 : 0));
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5" />
            STEP ({stepIdx + 1}/{frames.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoPlay(false);
              setStepIdx(0);
            }}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            aria-label="Reset animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Animated SVG Datapath */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 overflow-x-auto">
        <svg viewBox="0 0 740 310" className="w-full min-w-[600px] h-auto select-none">
          <defs>
            <marker id="flowHead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
            </marker>
          </defs>

          {/* 8-Bit Internal Data Bus */}
          <rect
            x="24"
            y="24"
            width="500"
            height="26"
            rx="6"
            fill={isActive('BUS') ? '#0c4a6e' : '#0f172a'}
            stroke={isActive('BUS') ? '#38bdf8' : '#334155'}
            strokeWidth={isActive('BUS') ? '2.2' : '1.2'}
          />
          <line
            x1="34"
            y1="37"
            x2="514"
            y2="37"
            stroke="#38bdf8"
            strokeWidth="2.5"
            className={isActive('BUS') ? 'animate-signal-flow' : ''}
            opacity={isActive('BUS') ? 1 : 0.35}
          />
          <text x="274" y="41" textAnchor="middle" fill="#e0f2fe" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
            8-BIT INTERNAL DATA BUS
          </text>

          {/* Bus Tap Lines */}
          <line x1="110" y1="50" x2="110" y2="82" stroke={isActive('A') ? '#38bdf8' : '#334155'} strokeWidth="2" />
          <line x1="460" y1="50" x2="460" y2="82" stroke={isActive('B') ? '#a78bfa' : '#334155'} strokeWidth="2" />
          <line x1="524" y1="37" x2="572" y2="37" stroke={isActive('MEM') ? '#34d399' : '#334155'} strokeWidth="2.5" className={isActive('MEM') ? 'animate-signal-flow' : ''} />

          {/* Accumulator A */}
          <rect
            x="38"
            y="82"
            width="145"
            height="72"
            rx="10"
            fill={isActive('A') ? '#1e3a8a' : '#0f172a'}
            stroke={isActive('A') ? '#38bdf8' : '#334155'}
            strokeWidth={isActive('A') ? '2.4' : '1.2'}
          />
          <text x="110" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            ACCUMULATOR (A)
          </text>
          <text x="110" y="136" textAnchor="middle" fill="#38bdf8" fontSize="22" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
            {toHex8(frame.regs.A)}H
          </text>

          {/* ALU */}
          <polygon
            points="196,184 252,184 274,204 296,184 352,184 322,254 226,254"
            fill={isActive('ALU') ? '#312e81' : '#0f172a'}
            stroke={isActive('ALU') ? '#a78bfa' : '#334155'}
            strokeWidth={isActive('ALU') ? '2.4' : '1.2'}
          />
          <text x="274" y="232" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">
            8-BIT ALU
          </text>

          {/* Flags Strip */}
          <rect
            x="38"
            y="188"
            width="145"
            height="92"
            rx="10"
            fill={isActive('FLAGS') ? '#451a03' : '#0f172a'}
            stroke={isActive('FLAGS') ? '#f59e0b' : '#334155'}
            strokeWidth={isActive('FLAGS') ? '2.2' : '1.2'}
          />
          <text x="110" y="210" textAnchor="middle" fill="#fcd34d" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
            FLAG REGISTER
          </text>
          {(
            [
              ['S', frame.flags.S, 54],
              ['Z', frame.flags.Z, 82],
              ['AC', frame.flags.AC, 110],
              ['P', frame.flags.P, 138],
              ['CY', frame.flags.CY, 166],
            ] as const
          ).map(([lbl, val, xPos]) => (
            <g key={lbl}>
              <text x={xPos} y="234" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
                {lbl}
              </text>
              <text x={xPos} y="258" textAnchor="middle" fill={val ? '#fbbf24' : '#64748b'} fontSize="15" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                {val}
              </text>
            </g>
          ))}

          {/* Register Pair B & C */}
          <rect
            x="388"
            y="82"
            width="144"
            height="86"
            rx="10"
            fill={isActive('B') ? '#1e1b4b' : '#0f172a'}
            stroke={isActive('B') ? '#a78bfa' : '#334155'}
            strokeWidth={isActive('B') ? '2.4' : '1.2'}
          />
          <text x="460" y="102" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            REGISTER PAIR BC
          </text>
          <text x="424" y="136" textAnchor="middle" fill="#e2e8f0" fontSize="17" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
            B:{toHex8(frame.regs.B)}
          </text>
          <text x="496" y="136" textAnchor="middle" fill="#c4b5fd" fontSize="17" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
            C:{toHex8(frame.regs.C)}
          </text>

          {/* PC & SP */}
          <rect
            x="388"
            y="188"
            width="144"
            height="92"
            rx="10"
            fill={isActive('PC') || isActive('SP') ? '#0f394a' : '#0f172a'}
            stroke={isActive('PC') || isActive('SP') ? '#22d3ee' : '#334155'}
            strokeWidth={isActive('PC') || isActive('SP') ? '2.2' : '1.2'}
          />
          <text x="460" y="214" textAnchor="middle" fill="#67e8f9" fontSize="11.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
            PC: {toHex16(frame.regs.PC)}H
          </text>
          <text x="460" y="246" textAnchor="middle" fill="#c4b5fd" fontSize="11.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
            SP: {toHex16(frame.regs.SP)}H
          </text>

          {/* External RAM & Stack Grid */}
          <rect
            x="560"
            y="24"
            width="160"
            height="256"
            rx="12"
            fill={isActive('MEM') ? '#064e3b' : '#0f172a'}
            stroke={isActive('MEM') ? '#34d399' : '#334155'}
            strokeWidth={isActive('MEM') ? '2.2' : '1.2'}
          />
          <text x="640" y="48" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
            EXTERNAL RAM
          </text>

          <rect x="574" y="64" width="132" height="36" rx="6" fill="#0f172a" stroke="#1e293b" />
          <text x="640" y="86" textAnchor="middle" fill="#e2e8f0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
            2000H: {selected}
          </text>

          <rect x="574" y="110" width="132" height="40" rx="6" fill="#0f172a" stroke={selected === 'LDA' || selected === 'STA' ? '#34d399' : '#1e293b'} />
          <text x="640" y="134" textAnchor="middle" fill="#34d399" fontSize="11.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
            2500H: {toHex8(frame.regs.memVal)}H
          </text>

          <text x="640" y="176" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
            STACK SEGMENT
          </text>
          <rect x="574" y="186" width="132" height="26" rx="5" fill="#0f172a" stroke="#334155" />
          <text x="640" y="203" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            2700H: (Base)
          </text>
          <rect x="574" y="216" width="132" height="26" rx="5" fill="#0f172a" stroke={frame.regs.stackHi !== undefined ? '#38bdf8' : '#334155'} />
          <text x="640" y="233" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            26FFH: {frame.regs.stackHi !== undefined ? `${toHex8(frame.regs.stackHi)}H` : '--'}
          </text>
          <rect x="574" y="246" width="132" height="26" rx="5" fill="#0f172a" stroke={frame.regs.stackLo !== undefined ? '#a78bfa' : '#334155'} />
          <text x="640" y="263" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="IBM Plex Mono, monospace">
            26FEH: {frame.regs.stackLo !== undefined ? `${toHex8(frame.regs.stackLo)}H` : '--'}
          </text>

          {/* Animated Data Transfer Vector */}
          {frame.flowArrow && (
            <g>
              <line
                x1={frame.flowArrow.from[0]}
                y1={frame.flowArrow.from[1]}
                x2={frame.flowArrow.to[0]}
                y2={frame.flowArrow.to[1]}
                stroke={frame.flowArrow.color}
                strokeWidth="3.5"
                className="animate-signal-flow"
                markerEnd="url(#flowHead)"
              />
              <rect
                x={(frame.flowArrow.from[0] + frame.flowArrow.to[0]) / 2 - 42}
                y={(frame.flowArrow.from[1] + frame.flowArrow.to[1]) / 2 - 14}
                width="84"
                height="24"
                rx="6"
                fill="#020617"
                stroke={frame.flowArrow.color}
                strokeWidth="1.5"
              />
              <text
                x={(frame.flowArrow.from[0] + frame.flowArrow.to[0]) / 2}
                y={(frame.flowArrow.from[1] + frame.flowArrow.to[1]) / 2 + 2}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10.5"
                fontWeight="700"
                fontFamily="IBM Plex Mono, monospace"
              >
                {frame.flowArrow.label}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Step Narration Card */}
      <div className="rounded-2xl border border-blue-500/35 bg-blue-500/10 p-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="font-bold text-blue-700 dark:text-cyan-300">
            Step {stepIdx + 1} of {frames.length}: {frame.title}
          </span>
          <span className="text-slate-600 dark:text-slate-400">{frame.phase}</span>
        </div>
        <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{frame.narration}</p>
        {frame.flagNote && (
          <div className="text-xs font-mono text-amber-700 dark:text-amber-300 pt-1">
            Flag Impact: {frame.flagNote}
          </div>
        )}
      </div>
    </div>
  );
};
