import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Cpu8085State, toHex16, toHex8 } from '../../engine/sim8085';

interface ComponentSpec {
  id: string;
  name: string;
  width: string;
  purpose: string;
  internalFunction: string;
  inputsOutputs: string;
  connections: string;
  detailedExplanation: string;
  practicalExample: string;
}

const COMPONENTS: Record<string, ComponentSpec> = {
  ACC: {
    id: 'ACC',
    name: 'Accumulator (Register A)',
    width: '8-bit',
    purpose: 'Primary arithmetic, logic, and I/O register of the 8085.',
    internalFunction: 'Holds one 8-bit operand before an ALU operation and latches the 8-bit result back after execution.',
    inputsOutputs: 'Bidirectional to 8-bit Internal Data Bus; dedicated 8-bit output directly into ALU Port A.',
    connections: 'Internal Data Bus, ALU, Flag Register (forms 16-bit PSW).',
    detailedExplanation: 'Because the 8085 is an accumulator-based architecture, instructions like ADD B, SUB C, ANA D, IN 01H, and OUT 02H implicitly use Register A without needing bits in the opcode to encode a destination register.',
    practicalExample: 'MVI A, 25H loads 25H into A; ADD B adds B to A and overwrites A with the sum.',
  },
  TEMP: {
    id: 'TEMP',
    name: 'Temporary Register',
    width: '8-bit (Internal)',
    purpose: 'Feeds the second 8-bit operand into the ALU.',
    internalFunction: 'Temporarily latches data placed on the internal bus from registers (B–L) or memory so both operands arrive at the ALU simultaneously.',
    inputsOutputs: 'Input from 8-bit Internal Data Bus; Output directly to ALU Port B.',
    connections: 'Internal Data Bus → Temp Register → ALU.',
    detailedExplanation: 'Programmers cannot read or write the Temporary Register directly. Because there is only one 8-bit internal bus, the second operand must be parked here while the ALU computes.',
    practicalExample: 'During ADD C, C moves via Internal Bus into Temp Reg so ALU can add Accumulator + Temp Reg.',
  },
  ALU: {
    id: 'ALU',
    name: 'Arithmetic Logic Unit (ALU)',
    width: '8-bit Combinational Core',
    purpose: 'Performs all binary arithmetic, bitwise logic, and bit-shift/rotate operations.',
    internalFunction: 'Contains an 8-bit parallel adder/subtractor (2\'s complement), logic gates (AND, OR, XOR, NOT), and shifter circuits.',
    inputsOutputs: 'Inputs: Accumulator (8-bit) + Temp Register (8-bit). Outputs: 8-bit Result to Internal Bus + 5 Flag signals to Flag Register.',
    connections: 'Accumulator, Temporary Register, Flag Register, Internal Data Bus.',
    detailedExplanation: 'The 8085 ALU computes 8-bit binary math in a single pass and simultaneously generates Sign, Zero, Auxiliary Carry (bit D3→D4), Even Parity, and Carry (bit D7) signals.',
    practicalExample: 'ADD B adds 9AH + 8CH → outputs 26H to Internal Bus (into A) and sets AC=1, CY=1.',
  },
  FLAGS: {
    id: 'FLAGS',
    name: 'Flag Register (Status Flip-Flops)',
    width: '8-bit (5 Active: S, Z, AC, P, CY)',
    purpose: 'Records key status conditions produced by ALU instructions for conditional branching.',
    internalFunction: 'Five independent D flip-flops at D7(S), D6(Z), D4(AC), D2(P), and D0(CY).',
    inputsOutputs: 'Inputs from ALU status lines; Outputs to Timing/Control (for JZ, JC, etc.) and Internal Bus (for PUSH/POP PSW).',
    connections: 'ALU, Internal Data Bus, Timing & Control Unit.',
    detailedExplanation: 'Conditional instructions inspect these flip-flops to alter program flow. Critically, data-transfer instructions and 16-bit INX/DCX never modify flags, and INR/DCR intentionally preserve CY.',
    practicalExample: 'DCR C sets Z=1 when C reaches 00H, causing JNZ LOOP to terminate the loop.',
  },
  BUS: {
    id: 'BUS',
    name: '8-Bit Internal Data Bus',
    width: '8-bit Shared Spine',
    purpose: 'Central silicon highway carrying opcodes, operands, and addresses inside the 8085.',
    internalFunction: 'Tri-state multiplexed internal wire bundle where only one source drives the bus per clock phase.',
    inputsOutputs: 'Connects all internal registers, ALU output, IR, Interrupt/Serial control, and external AD7–AD0 buffer.',
    connections: 'Every major subsystem inside the 8085 CPU.',
    detailedExplanation: 'The Timing & Control Unit sequences tri-state gates so register transfers like MOV A, B happen cleanly without bus contention.',
    practicalExample: 'During MOV A, B, B drives 05H onto this bus while Accumulator A enables its input latch.',
  },
  IR: {
    id: 'IR',
    name: 'Instruction Register (IR)',
    width: '8-bit',
    purpose: 'Holds the opcode byte of the currently executing instruction.',
    internalFunction: 'Latches the 8-bit opcode fetched from external memory during T3 of the Opcode Fetch machine cycle.',
    inputsOutputs: 'Input from Internal Data Bus; Output continuously drives the Instruction Decoder.',
    connections: 'Internal Data Bus → IR → Instruction Decoder.',
    detailedExplanation: 'Keeping the opcode latched in IR frees the internal data bus during T4 and subsequent machine cycles to fetch operand bytes or transfer register data.',
    practicalExample: 'When fetching MVI A, 32H, opcode 3EH stays latched in IR while 32H is read in M2.',
  },
  DECODER: {
    id: 'DECODER',
    name: 'Instruction Decoder & Machine Cycle Encoder',
    width: 'Combinational PLA',
    purpose: 'Translates the 8-bit binary opcode in IR into internal control actions.',
    internalFunction: 'Decodes which registers participate, whether memory/IO cycles are required, and how many T-states the instruction needs.',
    inputsOutputs: 'Input: 8-bit opcode from IR. Output: Encoded control triggers to Timing & Control Unit.',
    connections: 'Instruction Register → Instruction Decoder → Timing & Control Unit.',
    detailedExplanation: 'During T4 of Opcode Fetch, the decoder determines whether the instruction ends immediately (like MOV A, B) or schedules further Memory Read/Write cycles (like STA 2500H).',
    practicalExample: 'Decoding 32H tells Timing & Control to run two Memory Reads (address) + one Memory Write (store A).',
  },
  CONTROL: {
    id: 'CONTROL',
    name: 'Timing & Control Unit',
    width: 'System Clock & Signal Generator',
    purpose: 'Synchronizes every internal micro-operation and external memory/I/O bus cycle.',
    internalFunction: 'Divides X1/X2 crystal by 2 and generates ALE, RD\', WR\', IO/M\', S1, S0, CLK OUT, HLDA, and RESET OUT.',
    inputsOutputs: 'Inputs: X1/X2, Decoder, READY, HOLD, RESET IN\'. Outputs: All external bus control strobes and internal register enable lines.',
    connections: 'Instruction Decoder, Flag Register, all internal register gates, external pins.',
    detailedExplanation: 'Think of it as the conductor of the processor: it guarantees addresses stabilize before ALE falls, and RD\'/WR\' pulse cleanly during T2–T3.',
    practicalExample: 'Drives IO/M\'=0, S1=1, S0=1, RD\'=0 during Opcode Fetch.',
  },
  B: {
    id: 'B',
    name: 'Register B (High Byte of BC)',
    width: '8-bit (Pairs with C → 16-bit BC)',
    purpose: 'General-purpose scratchpad register and upper byte of the 16-bit BC pair.',
    internalFunction: 'Stores 8-bit operands or counters; combines with C for LXI B, INX B, PUSH B, and LDAX B.',
    inputsOutputs: 'Bidirectional to Internal Data Bus & Address Latch (when used as BC pointer).',
    connections: 'Register Select Multiplexer, Internal Data Bus, Address Buffer.',
    detailedExplanation: 'Frequently holds the second operand in arithmetic or acts as a secondary loop counter.',
    practicalExample: 'MVI B, 05H loads 05H; ADD B adds B to Accumulator.',
  },
  C: {
    id: 'C',
    name: 'Register C (Low Byte of BC)',
    width: '8-bit (Pairs with B → 16-bit BC)',
    purpose: 'General-purpose register and standard 8-bit loop counter.',
    internalFunction: 'Fast on-chip storage; pairs with B as low byte of 16-bit BC.',
    inputsOutputs: 'Bidirectional to Internal Data Bus.',
    connections: 'Register Array, Internal Data Bus.',
    detailedExplanation: 'By convention in 8085 lab programs, Register C tracks carry counts or loop iterations.',
    practicalExample: 'DCR C followed by JNZ LOOP repeats a block N times.',
  },
  D: {
    id: 'D',
    name: 'Register D (High Byte of DE)',
    width: '8-bit (Pairs with E → 16-bit DE)',
    purpose: 'General-purpose register and high byte of the 16-bit DE memory pointer.',
    internalFunction: 'Stores 8-bit data or high address byte for destination arrays (STAX D, LDAX D, XCHG).',
    inputsOutputs: 'Bidirectional to Internal Data Bus & Address Buffer.',
    connections: 'Register Array, Internal Data Bus, HL (via XCHG).',
    detailedExplanation: 'Pairing D and E lets programs maintain a second 16-bit pointer alongside HL for block memory transfers.',
    practicalExample: 'LXI D, 2600H sets DE as the destination buffer pointer.',
  },
  E: {
    id: 'E',
    name: 'Register E (Low Byte of DE)',
    width: '8-bit (Pairs with D → 16-bit DE)',
    purpose: 'General-purpose register and low byte of the 16-bit DE pointer.',
    internalFunction: 'Stores 8-bit operands or low byte of a 16-bit address in DE.',
    inputsOutputs: 'Bidirectional to Internal Data Bus.',
    connections: 'Register Array, Internal Data Bus.',
    detailedExplanation: 'Swaps instantaneously with L during the single-byte XCHG instruction.',
    practicalExample: 'STAX D stores A at memory address [DE].',
  },
  H: {
    id: 'H',
    name: 'Register H (High Byte of HL Pointer M)',
    width: '8-bit (Pairs with L → 16-bit HL)',
    purpose: 'Upper 8 bits of the default 16-bit Memory Pointer (M).',
    internalFunction: 'Holds high byte of memory addresses for indirect instructions (MOV A, M; ADD M) and 16-bit DAD addition.',
    inputsOutputs: 'Bidirectional to Internal Data Bus & High Address Buffer (A15–A8).',
    connections: 'Register Array, Incrementer/Decrementer, Address Buffer.',
    detailedExplanation: 'HL is the most versatile register pair in 8085: whenever an instruction mentions M, hardware automatically drives HL onto the 16-bit address bus.',
    practicalExample: 'LXI H, 2500H puts 25H into H and 00H into L.',
  },
  L: {
    id: 'L',
    name: 'Register L (Low Byte of HL Pointer M)',
    width: '8-bit (Pairs with H → 16-bit HL)',
    purpose: 'Lower 8 bits of the default 16-bit Memory Pointer (M).',
    internalFunction: 'Drives A7–A0 (via AD7–AD0) whenever accessing memory indirectly through M.',
    inputsOutputs: 'Bidirectional to Internal Data Bus & AD7–AD0 Buffer.',
    connections: 'Register Array, Incrementer/Decrementer, AD7–AD0 Buffer.',
    detailedExplanation: 'Loaded first during little-endian LHLD and stored first during SHLD.',
    practicalExample: 'INX H increments the full 16-bit HL address to scan the next array byte.',
  },
  SP: {
    id: 'SP',
    name: 'Stack Pointer (SP)',
    width: '16-bit Pointer',
    purpose: 'Points to the Top of Stack (TOS) in external Read/Write RAM.',
    internalFunction: 'Decrements by 2 on PUSH/CALL/Interrupt (stack grows downward) and increments by 2 on POP/RET.',
    inputsOutputs: '16-bit output to Address Buffers via Incrementer/Decrementer Address Latch.',
    connections: 'Register Array, 16-bit Inc/Dec Unit, Address Buffers.',
    detailedExplanation: 'The Stack is a LIFO memory region essential for preserving registers and return addresses during nested subroutines and interrupts.',
    practicalExample: 'LXI SP, 27FFH initializes the top of stack before calling subroutines.',
  },
  PC: {
    id: 'PC',
    name: 'Program Counter (PC)',
    width: '16-bit Pointer',
    purpose: 'Tracks the 16-bit memory address of the next instruction byte to be fetched.',
    internalFunction: 'Automatically increments by 1 after every opcode or operand byte fetch; overwritten directly on JMP, CALL, RET, or Reset.',
    inputsOutputs: '16-bit output to Address Buffers via Incrementer/Decrementer Latch.',
    connections: '16-bit Inc/Dec Unit, Address Buffer (A15–A8), AD7–AD0 Buffer.',
    detailedExplanation: 'Upon power-on reset (RESET IN\' = 0), hardware forces PC = 0000H so boot code always begins at address 0000H.',
    practicalExample: 'After fetching 3-byte STA 2500H at 2000H, PC holds 2003H.',
  },
  ADDR_BUF: {
    id: 'ADDR_BUF',
    name: 'Address Buffer (A15–A8)',
    width: '8-bit Unidirectional Tri-State',
    purpose: 'Drives the upper 8 bits of the 16-bit memory address onto external pins A15–A8.',
    internalFunction: 'Buffers high address byte from PC, SP, HL, BC, DE, or WZ onto the PCB address bus; floats (high-Z) during DMA HLDA.',
    inputsOutputs: 'Input from internal 16-bit Address Latch; Output to Pins 21–28 (A8–A15).',
    connections: 'PC/SP/Reg Array Address Latch → A15–A8 External Pins.',
    detailedExplanation: 'Because A15–A8 are not multiplexed with data, they remain stable throughout the entire machine cycle.',
    practicalExample: 'For LDA 2500H, Address Buffer holds 25H steady on A15–A8 during M4.',
  },
  AD_BUF: {
    id: 'AD_BUF',
    name: 'Address/Data Buffer (AD7–AD0)',
    width: '8-bit Bidirectional Multiplexed',
    purpose: 'Time-shares pins 12–19 to output Low Address (A7–A0) in T1 and transfer Data (D7–D0) in T2–T3.',
    internalFunction: 'Switches between outward address driver (during ALE=1) and bidirectional data transceiver (during RD\'=0 or WR\'=0).',
    inputsOutputs: 'Bidirectional between Internal Data Bus / Low Address Latch and Pins 12–19.',
    connections: 'Internal Data Bus, Address Latch, External 74LS373 Latch & RAM/IO.',
    detailedExplanation: 'Multiplexing saved 8 IC pins so the 8085 fit inside a 40-pin DIP package.',
    practicalExample: 'In T1 outputs 00H (low byte of 2500H); in T2–T3 reads RAM byte back into CPU.',
  },
  INT: {
    id: 'INT',
    name: 'Interrupt Control',
    width: '5 Hardware Lines + INTA\'',
    purpose: 'Monitors asynchronous external interrupt requests and prioritizes them.',
    internalFunction: 'Enforces hardware priority TRAP > RST 7.5 > RST 6.5 > RST 5.5 > INTR and applies EI/DI & SIM masks.',
    inputsOutputs: 'Inputs: TRAP, RST 7.5–5.5, INTR. Output: INTA\' and internal interrupt trigger to Timing & Control.',
    connections: 'External Interrupt Pins, Internal Data Bus (SIM/RIM), Timing & Control.',
    detailedExplanation: 'When an unmasked interrupt arrives, the CPU finishes the current instruction, saves PC on the stack, and vectors to the ISR.',
    practicalExample: 'Asserting TRAP forces an immediate jump to 0024H even if DI is active.',
  },
  SERIAL: {
    id: 'SERIAL',
    name: 'Serial I/O Control (SID / SOD)',
    width: '1-bit Serial Interface',
    purpose: 'Provides direct single-pin serial input and output without an external UART.',
    internalFunction: 'SID (Pin 5) loads into A.D7 via RIM; A.D7 outputs onto SOD (Pin 4) via SIM when SDE (D6)=1.',
    inputsOutputs: 'Input: SID (Pin 5); Output: SOD (Pin 4); Bidirectional to Internal Bus.',
    connections: 'Pins 4 & 5, Internal Data Bus (Accumulator bit D7).',
    detailedExplanation: 'Useful for simple status LEDs, bit-banged serial links, or single-wire sensor polling.',
    practicalExample: 'MVI A, C0H followed by SIM sets SOD pin HIGH.',
  },
};

const DEMO_FLOWS = [
  { id: 'mov', label: 'MOV A, B', active: ['B', 'BUS', 'ACC', 'PC'], text: 'B drives its byte onto the 8-bit Internal Bus → Accumulator A latches the copy. B remains unchanged and PC increments.' },
  { id: 'add', label: 'ADD B', active: ['B', 'BUS', 'TEMP', 'ACC', 'ALU', 'FLAGS'], text: 'B → Temp Reg, A → ALU → 8-bit sum returns to A via Internal Bus and updates S, Z, AC, P, CY flags.' },
  { id: 'lda', label: 'LDA 2500H', active: ['PC', 'IR', 'DECODER', 'CONTROL', 'ADDR_BUF', 'AD_BUF', 'BUS', 'ACC'], text: 'PC fetches 3 bytes → Address/AD Buffers output 2500H → RAM byte enters through AD7–AD0 → Internal Bus → Accumulator A.' },
  { id: 'push', label: 'PUSH B', active: ['SP', 'B', 'C', 'BUS', 'ADDR_BUF', 'AD_BUF', 'CONTROL'], text: 'SP decrements twice while high byte B and low byte C travel out via AD7–AD0 into Stack RAM.' },
];

interface Props {
  externalActiveBlocks?: string[];
  liveCpu?: Cpu8085State;
  compact?: boolean;
}

export const Architecture8085Explorer: React.FC<Props> = ({
  externalActiveBlocks,
  liveCpu,
  compact = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>('ALU');
  const [demoId, setDemoId] = useState<string | null>(null);

  const activeDemo = DEMO_FLOWS.find((d) => d.id === demoId) ?? null;

  // Map simulator activePath tags onto detailed block IDs
  const mappedExternal = new Set<string>();
  (externalActiveBlocks ?? []).forEach((tag) => {
    mappedExternal.add(tag);
    if (tag === 'REGS') {
      ['B', 'C', 'D', 'E', 'H', 'L'].forEach((r) => mappedExternal.add(r));
    }
    if (tag === 'MEMORY' || tag === 'ADDR_BUS' || tag === 'IO') {
      mappedExternal.add('ADDR_BUF');
      mappedExternal.add('AD_BUF');
    }
    if (tag === 'IR') mappedExternal.add('DECODER');
  });

  const highlighted =
    mappedExternal.size > 0
      ? mappedExternal
      : activeDemo
        ? new Set(activeDemo.active)
        : new Set([selectedId]);

  const spec = COMPONENTS[selectedId] ?? COMPONENTS.ALU;

  const boxStyle = (id: string) => {
    const active = highlighted.has(id);
    const chosen = !compact && selectedId === id;
    return {
      fill: active ? '#1e3a8a' : '#0f172a',
      stroke: chosen ? '#38bdf8' : active ? '#60a5fa' : '#334155',
      strokeWidth: chosen ? 2.5 : active ? 2 : 1.2,
    };
  };

  const diagramSvg = (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-3.5 overflow-x-auto">
      <svg
        viewBox="0 0 760 445"
        className={`w-full ${compact ? 'min-w-[460px]' : 'min-w-[600px]'} h-auto select-none`}
        role="img"
        aria-label="Interactive Intel 8085 architecture diagram with clickable blocks"
      >
        {/* Top Row: Interrupt & Serial */}
        <g onClick={() => setSelectedId('INT')} className="cursor-pointer">
          <rect x="20" y="14" width="320" height="44" rx="8" {...boxStyle('INT')} />
          <text x="180" y="34" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600">Interrupt Control</text>
          <text x="180" y="49" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="IBM Plex Mono, monospace">TRAP · RST 7.5 · 6.5 · 5.5 · INTR · INTA&apos;</text>
        </g>

        <g onClick={() => setSelectedId('SERIAL')} className="cursor-pointer">
          <rect x="366" y="14" width="374" height="44" rx="8" {...boxStyle('SERIAL')} />
          <text x="553" y="34" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600">Serial I/O Control</text>
          <text x="553" y="49" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="IBM Plex Mono, monospace">SID (Pin 5) · SOD (Pin 4)</text>
        </g>

        {/* Internal 8-bit Data Bus */}
        <g onClick={() => setSelectedId('BUS')} className="cursor-pointer">
          <rect
            x="20"
            y="82"
            width="720"
            height="24"
            rx="5"
            fill={highlighted.has('BUS') ? '#0c4a6e' : '#0f2544'}
            stroke="#38bdf8"
            strokeWidth={highlighted.has('BUS') ? 2.2 : 1.3}
          />
          <line
            x1="30"
            y1="94"
            x2="730"
            y2="94"
            stroke="#38bdf8"
            strokeWidth="2.4"
            className={highlighted.has('BUS') || activeDemo || mappedExternal.size > 0 ? 'animate-signal-flow' : ''}
          />
          <text x="380" y="98" textAnchor="middle" fill="#e0f2fe" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
            8-BIT INTERNAL DATA BUS (CLICK TO INSPECT)
          </text>
        </g>

        {/* Bus Connectors */}
        {[82, 188, 298, 412, 622].map((x) => (
          <line
            key={`tap-${x}`}
            x1={x}
            y1="106"
            x2={x}
            y2="132"
            stroke={highlighted.has('BUS') ? '#38bdf8' : '#475569'}
            strokeWidth="2"
            className={highlighted.has('BUS') ? 'animate-signal-flow' : ''}
          />
        ))}
        <line x1="180" y1="58" x2="180" y2="82" stroke="#64748b" strokeWidth="1.6" />
        <line x1="553" y1="58" x2="553" y2="82" stroke="#64748b" strokeWidth="1.6" />

        {/* Accumulator */}
        <g onClick={() => setSelectedId('ACC')} className="cursor-pointer">
          <rect x="24" y="132" width="112" height="54" rx="8" {...boxStyle('ACC')} />
          <text x="80" y="153" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600">Accumulator A</text>
          <text x="80" y="172" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
            {liveCpu ? `${toHex8(liveCpu.A)}H` : '8-bit'}
          </text>
        </g>

        {/* Temp Reg */}
        <g onClick={() => setSelectedId('TEMP')} className="cursor-pointer">
          <rect x="146" y="132" width="84" height="54" rx="8" {...boxStyle('TEMP')} />
          <text x="188" y="155" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">Temp Reg</text>
          <text x="188" y="171" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">8-bit</text>
        </g>

        {/* Flag Register */}
        <g onClick={() => setSelectedId('FLAGS')} className="cursor-pointer">
          <rect x="240" y="132" width="112" height="54" rx="8" {...boxStyle('FLAGS')} />
          <text x="296" y="153" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600">Flag Register</text>
          <text x="296" y="171" textAnchor="middle" fill="#fcd34d" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
            {liveCpu ? `${liveCpu.flags.S}${liveCpu.flags.Z}-${liveCpu.flags.AC}-${liveCpu.flags.P}-${liveCpu.flags.CY}` : 'S Z AC P CY'}
          </text>
        </g>

        {/* ALU */}
        <g onClick={() => setSelectedId('ALU')} className="cursor-pointer">
          <polygon points="36,214 114,214 136,236 158,214 236,214 198,292 74,292" {...boxStyle('ALU')} />
          <text x="136" y="264" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">8-BIT ALU</text>
          <line x1="80" y1="186" x2="80" y2="214" stroke="#60a5fa" strokeWidth="2" />
          <line x1="188" y1="186" x2="188" y2="214" stroke="#60a5fa" strokeWidth="2" />
          <line x1="216" y1="248" x2="296" y2="248" stroke="#fbbf24" strokeWidth="1.8" />
          <line x1="296" y1="248" x2="296" y2="186" stroke="#fbbf24" strokeWidth="1.8" />
        </g>

        {/* Instruction Register (IR) */}
        <g onClick={() => setSelectedId('IR')} className="cursor-pointer">
          <rect x="364" y="132" width="128" height="54" rx="8" {...boxStyle('IR')} />
          <text x="428" y="155" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600">Instruction Reg (IR)</text>
          <text x="428" y="172" textAnchor="middle" fill="#93c5fd" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">8-bit Opcode Latch</text>
        </g>

        {/* Instruction Decoder */}
        <g onClick={() => setSelectedId('DECODER')} className="cursor-pointer">
          <rect x="364" y="206" width="128" height="66" rx="8" {...boxStyle('DECODER')} />
          <text x="428" y="233" textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600">Instruction Decoder</text>
          <text x="428" y="252" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontFamily="IBM Plex Mono, monospace">&amp; Machine Cycle Enc</text>
          <line x1="428" y1="186" x2="428" y2="206" stroke="#38bdf8" strokeWidth="2" />
        </g>

        {/* Timing & Control Unit */}
        <g onClick={() => setSelectedId('CONTROL')} className="cursor-pointer">
          <rect x="24" y="316" width="468" height="112" rx="8" {...boxStyle('CONTROL')} />
          <text x="258" y="346" textAnchor="middle" fill="#f8fafc" fontSize="13.5" fontWeight="700">Timing &amp; Control Unit</text>
          <text x="258" y="370" textAnchor="middle" fill="#67e8f9" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
            CLK OUT · ALE · RD&apos; · WR&apos; · IO/M&apos; · S1 · S0 · READY
          </text>
          <text x="258" y="392" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
            DMA: HOLD / HLDA · RESET IN&apos; / RESET OUT
          </text>
          <line x1="428" y1="272" x2="428" y2="316" stroke="#22d3ee" strokeWidth="2" />
        </g>

        {/* Individual General Purpose Registers B, C, D, E, H, L */}
        {[
          { id: 'B', x: 512, y: 132, val: liveCpu ? toHex8(liveCpu.B) : '8b' },
          { id: 'C', x: 628, y: 132, val: liveCpu ? toHex8(liveCpu.C) : '8b' },
          { id: 'D', x: 512, y: 174, val: liveCpu ? toHex8(liveCpu.D) : '8b' },
          { id: 'E', x: 628, y: 174, val: liveCpu ? toHex8(liveCpu.E) : '8b' },
          { id: 'H', x: 512, y: 216, val: liveCpu ? toHex8(liveCpu.H) : '8b' },
          { id: 'L', x: 628, y: 216, val: liveCpu ? toHex8(liveCpu.L) : '8b' },
        ].map((reg) => (
          <g key={reg.id} onClick={() => setSelectedId(reg.id)} className="cursor-pointer">
            <rect x={reg.x} y={reg.y} width="108" height="36" rx="6" {...boxStyle(reg.id)} />
            <text x={reg.x + 54} y={reg.y + 22} textAnchor="middle" fill="#f8fafc" fontSize="11.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
              {reg.id}: {reg.val}
            </text>
          </g>
        ))}

        {/* Stack Pointer SP */}
        <g onClick={() => setSelectedId('SP')} className="cursor-pointer">
          <rect x="512" y="262" width="224" height="34" rx="6" {...boxStyle('SP')} />
          <text x="624" y="283" textAnchor="middle" fill="#c4b5fd" fontSize="11.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
            SP (16-bit): {liveCpu ? `${toHex16(liveCpu.SP)}H` : 'FFFFH'}
          </text>
        </g>

        {/* Program Counter PC */}
        <g onClick={() => setSelectedId('PC')} className="cursor-pointer">
          <rect x="512" y="302" width="224" height="34" rx="6" {...boxStyle('PC')} />
          <text x="624" y="323" textAnchor="middle" fill="#67e8f9" fontSize="11.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
            PC (16-bit): {liveCpu ? `${toHex16(liveCpu.PC)}H` : '2000H'}
          </text>
        </g>

        {/* Address Buffer (A15-A8) & Address/Data Buffer (AD7-AD0) */}
        <g onClick={() => setSelectedId('ADDR_BUF')} className="cursor-pointer">
          <rect x="512" y="352" width="108" height="76" rx="8" {...boxStyle('ADDR_BUF')} />
          <text x="566" y="380" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontWeight="600">Address Buf</text>
          <text x="566" y="399" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">A15–A8</text>
          <text x="566" y="415" textAnchor="middle" fill="#94a3b8" fontSize="8.5">Unidirectional</text>
        </g>

        <g onClick={() => setSelectedId('AD_BUF')} className="cursor-pointer">
          <rect x="628" y="352" width="108" height="76" rx="8" {...boxStyle('AD_BUF')} />
          <text x="682" y="380" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontWeight="600">Addr/Data Buf</text>
          <text x="682" y="399" textAnchor="middle" fill="#a78bfa" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">AD7–AD0</text>
          <text x="682" y="415" textAnchor="middle" fill="#94a3b8" fontSize="8.5">Multiplexed</text>
        </g>
        <line x1="566" y1="336" x2="566" y2="352" stroke="#38bdf8" strokeWidth="1.8" />
        <line x1="682" y1="336" x2="682" y2="352" stroke="#a78bfa" strokeWidth="1.8" />
      </svg>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2.5">
        {diagramSvg}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] px-3.5 py-2.5 text-xs">
          <span className="font-mono font-semibold text-blue-600 dark:text-cyan-400">{spec.name}: </span>
          <span className="text-slate-600 dark:text-slate-300">{spec.purpose}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Animate Execution Flow:</span>
          {DEMO_FLOWS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDemoId(d.id);
                setSelectedId(d.active[0]);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer transition-colors ${
                demoId === d.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Play className="w-3 h-3" />
              {d.label}
            </button>
          ))}
        </div>
        {demoId && (
          <button
            type="button"
            onClick={() => setDemoId(null)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Stop Animation
          </button>
        )}
      </div>

      {activeDemo && (
        <div className="rounded-xl border border-blue-500/35 bg-blue-500/10 px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
          <span className="font-mono font-bold text-blue-600 dark:text-cyan-300 mr-2">{activeDemo.label}:</span>
          {activeDemo.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-7">{diagramSvg}</div>

        {/* Full 6-Field Component Inspector */}
        <div className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1729] p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-blue-600 dark:text-cyan-400">COMPONENT SPECIFICATION</span>
            <span className="font-mono text-slate-500">{spec.width}</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{spec.name}</h4>

          <div className="space-y-2.5 text-xs leading-relaxed">
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Purpose</div>
              <p className="text-slate-600 dark:text-slate-300">{spec.purpose}</p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Internal Function</div>
              <p className="text-slate-600 dark:text-slate-300">{spec.internalFunction}</p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Inputs &amp; Outputs</div>
              <p className="text-slate-600 dark:text-slate-300">{spec.inputsOutputs}</p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Connections</div>
              <p className="font-mono text-[11px] text-blue-600 dark:text-cyan-300">{spec.connections}</p>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">Engineering Detail</div>
              <p className="text-slate-600 dark:text-slate-300">{spec.detailedExplanation}</p>
            </div>
            <div className="rounded-xl bg-slate-950 text-cyan-200 p-3 font-mono text-[11px] border border-slate-800">
              <div className="text-slate-400 mb-0.5">Practical Example</div>
              {spec.practicalExample}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
