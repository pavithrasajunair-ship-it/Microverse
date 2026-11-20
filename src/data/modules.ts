import { LearningModule } from '../types';

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'fundamentals',
    number: 'Module 01',
    title: 'Fundamentals of Computing Silicon',
    shortTitle: 'Fundamentals',
    description:
      'Build rock-solid intuition on microprocessors, microcontrollers, Von Neumann vs Harvard architectures, and RISC vs CISC design philosophies.',
    accentColor: 'blue',
    topics: [
      {
        id: 'fund-up-vs-uc',
        moduleId: 'fundamentals',
        order: 1,
        title: 'Microprocessor vs Microcontroller',
        subtitle: 'CPU-on-a-chip versus a complete computer-on-a-chip',
        durationMin: 12,
        difficulty: 'Beginner',
        visualType: 'up-vs-uc',
        simpleExplanation:
          'A microprocessor (µP) is a single integrated circuit containing only the Central Processing Unit (ALU, control unit, and registers). To build a working system, you must wire external RAM, ROM, timers, and I/O chips around it. A microcontroller (µC) packs the CPU, RAM, ROM/Flash, timers, ADC, and I/O ports onto one single silicon die designed for dedicated control tasks.',
        analogy:
          'Think of a Microprocessor as a master chef who needs a separate kitchen, fridge, and pantry built around them. A Microcontroller is a self-contained food truck with chef, stove, fridge, and serving counter already integrated.',
        keyFacts: [
          'Microprocessors (8085, 8086, Core i7) optimize for general-purpose computing and high memory throughput.',
          'Microcontrollers (8051, AVR, ARM Cortex-M) optimize for low power, low cost, deterministic I/O, and compact PCB footprint.',
          'Microprocessors rely heavily on external system buses; microcontrollers keep most buses internal to free pins for GPIO.',
        ],
        interactiveHotspots: [
          {
            id: 'cpu-core',
            label: 'CPU Core (ALU + CU)',
            role: 'Decision & Arithmetic Engine',
            details: 'Executes fetch-decode-execute cycles, performs binary math/logic, and sequences control signals.',
          },
          {
            id: 'ext-memory',
            label: 'External RAM / ROM',
            role: 'Required by Microprocessor',
            details: 'Connected via Address, Data, and Control buses. Allows flexible memory scaling up to GBs.',
          },
          {
            id: 'onchip-periph',
            label: 'On-Chip Timers, UART & GPIO',
            role: 'Integrated in Microcontroller',
            details: 'Directly drives motors, reads sensors, and talks over serial links without extra ICs.',
          },
        ],
        stepByStep: [
          { step: 1, title: 'Power-On Reset', internalAction: 'CPU sets Program Counter to reset vector (0000H on 8085/8051).' },
          { step: 2, title: 'Fetch Instruction', internalAction: 'µP drives external address bus to read external ROM; µC reads internal Flash in 1 cycle.' },
          { step: 3, title: 'Decode & Execute', internalAction: 'Control unit routes operands through ALU or directly toggles on-chip GPIO latches.' },
          { step: 4, title: 'Interact with World', internalAction: 'µP communicates via 8255 PPI chip; µC toggles P1.0 directly via bit-addressable SFR.' },
        ],
        realWorldApplications: [
          { domain: 'Microprocessor', example: 'Laptops, servers, industrial workstations, and high-throughput POS terminals.' },
          { domain: 'Microcontroller', example: 'Washing machines, automotive ABS controllers, digital multimeters, and smart thermostats.' },
        ],
        examPerspective: {
          keyDefinitions: [
            'Microprocessor: Programmable multipurpose silicon device that accepts binary instructions, processes data, and provides results via external memory/IO.',
            'Microcontroller: Single-chip microcomputer integrating CPU, internal memory, timers, and I/O ports for embedded control.',
          ],
          importantDiagrams: ['Block comparison diagram of Microprocessor System vs Single-Chip Microcontroller'],
          likelyQuestions: [
            { marks: 2, question: 'State two key architectural differences between a microprocessor and a microcontroller.' },
            { marks: 5, question: 'Compare Microprocessor and Microcontroller across 6 engineering parameters with applications.' },
          ],
        },
        quickRecap: [
          { term: 'Microprocessor (µP)', summary: 'CPU only on chip; external RAM/ROM/I/O; high flexibility & power.' },
          { term: 'Microcontroller (µC)', summary: 'CPU + RAM + ROM + Timers + Ports on one chip; ideal for embedded systems.' },
          { term: 'Bit Handling', summary: 'Microcontrollers excel at single-bit I/O manipulation (e.g., SETB P1.0).' },
        ],
      },
      {
        id: 'fund-von-harvard',
        moduleId: 'fundamentals',
        order: 2,
        title: 'Von Neumann vs Harvard Architecture',
        subtitle: 'Shared bus simplicity vs simultaneous code and data pathways',
        durationMin: 10,
        difficulty: 'Beginner',
        visualType: 'von-neumann-harvard',
        simpleExplanation:
          'In Von Neumann (Princeton) architecture, program instructions and data share the exact same memory space and system bus. The CPU cannot fetch an instruction and read data at the same instant—this traffic jam is called the Von Neumann Bottleneck. Harvard architecture separates Program Memory and Data Memory with two independent buses, allowing simultaneous instruction fetch and data access.',
        analogy:
          'Von Neumann is a single-lane bridge where delivery trucks (data) and blueprints (instructions) must take turns crossing. Harvard is a two-bridge highway where both cross simultaneously.',
        keyFacts: [
          'Intel 8085 and 8086 use Von Neumann architecture (shared 64KB / 1MB memory space).',
          'Intel 8051 and most DSPs/AVR microcontrollers use Harvard architecture (separate 64KB Code ROM and RAM).',
          'Modern CPUs use Modified Harvard (separate L1 Instruction & Data caches feeding unified main RAM).',
        ],
        interactiveHotspots: [
          {
            id: 'shared-bus',
            label: 'Shared Address/Data Bus',
            role: 'Von Neumann Pathway',
            details: 'Simpler PCB wiring and flexible RAM allocation, but instruction fetch and data read are serialized.',
          },
          {
            id: 'code-bus',
            label: 'Dedicated Instruction Bus',
            role: 'Harvard Code Path',
            details: 'Fetches the next opcode from ROM/Flash while the data bus simultaneously reads/writes RAM.',
          },
          {
            id: 'data-bus',
            label: 'Dedicated Data Bus',
            role: 'Harvard Data Path',
            details: 'Can even have a different bit width from instruction memory, maximizing embedded throughput.',
          },
        ],
        stepByStep: [
          { step: 1, title: 'Cycle 1 (Von Neumann)', internalAction: 'CPU fetches opcode from unified RAM. Data access must wait.' },
          { step: 2, title: 'Cycle 2 (Von Neumann)', internalAction: 'CPU reads operand byte across the same bus.' },
          { step: 3, title: 'Cycle 1 (Harvard)', internalAction: 'CPU fetches next instruction from Program ROM AND reads current operand from Data RAM simultaneously!' },
        ],
        realWorldApplications: [
          { domain: 'Von Neumann', example: 'General-purpose PCs where programs are loaded dynamically into RAM.' },
          { domain: 'Harvard', example: '8051 embedded controllers, audio DSPs, and real-time flight control computers.' },
        ],
        examPerspective: {
          keyDefinitions: [
            'Von Neumann Bottleneck: Throughput limitation caused by sharing a single memory bus for both instructions and data.',
            'Harvard Architecture: Computer architecture with physically separate storage and signal pathways for instructions and data.',
          ],
          importantDiagrams: ['Side-by-side Von Neumann vs Harvard bus topology diagram'],
          likelyQuestions: [
            { marks: 2, question: 'What is the Von Neumann bottleneck?' },
            { marks: 5, question: 'Differentiate between Von Neumann and Harvard architectures with neat block diagrams.' },
          ],
        },
        quickRecap: [
          { term: 'Von Neumann', summary: '1 memory + 1 bus; cheaper hardware; used in 8085 & 8086.' },
          { term: 'Harvard', summary: '2 memories + 2 buses; faster parallel fetch; used in 8051 & DSPs.' },
        ],
      },
      {
        id: 'fund-risc-cisc',
        moduleId: 'fundamentals',
        order: 3,
        title: 'RISC vs CISC & Processor Evolution',
        subtitle: 'From 4-bit Intel 4004 to streamlined pipelines and complex instruction sets',
        durationMin: 11,
        difficulty: 'Beginner',
        visualType: 'risc-cisc',
        simpleExplanation:
          'CISC (Complex Instruction Set Computer) packs rich, multi-step operations into single variable-length instructions to minimize code size when memory was expensive (e.g., 8085, 8086, x86). RISC (Reduced Instruction Set Computer) uses a small set of fixed-length, single-cycle instructions with a Load/Store architecture so hardware pipelining runs effortlessly at high clock speeds (e.g., ARM, RISC-V).',
        analogy:
          'CISC is a Swiss Army knife with specialized multi-step tools built in. RISC is a clean set of single-purpose precision wrenches arranged on an assembly line.',
        keyFacts: [
          '1st Gen (1971): 4-bit Intel 4004 (PMOS, 740 kHz).',
          '2nd Gen (1974–76): 8-bit Intel 8080 & 8085 (NMOS, 3–5 MHz, 64KB memory).',
          '3rd Gen (1978): 16-bit Intel 8086 (HMOS, 1MB segmented memory, pipelined BIU/EU).',
          '4th & 5th Gen: 32-bit (80386/80486) and 64-bit multicore superscalar processors.',
        ],
        interactiveHotspots: [
          {
            id: 'cisc-decoder',
            label: 'Microprogrammed Control (CISC)',
            role: 'Variable-Length Decode',
            details: '1-to-6 byte instructions; supports memory-to-memory operations directly, lowering RAM footprint.',
          },
          {
            id: 'risc-pipeline',
            label: 'Hardwired Control & Pipeline (RISC)',
            role: 'Fixed-Length 1-Cycle Execution',
            details: 'Only LOAD/STORE touch memory; large register file enables predictable 1 instruction/clock throughput.',
          },
        ],
        stepByStep: [
          { step: 1, title: 'CISC Multiply Example', internalAction: 'Single instruction MULT [2000H], [2004H] triggers internal microcode over many clock cycles.' },
          { step: 2, title: 'RISC Multiply Example', internalAction: 'Compiler emits LOAD R1, LOAD R2, MUL R3, R1, R2, STORE R3 — each executing in a tight pipelined stage.' },
        ],
        realWorldApplications: [
          { domain: 'CISC', example: 'Intel 8086, x86-64 desktop/server processors.' },
          { domain: 'RISC', example: 'ARM Cortex-M microcontrollers, smartphone SoCs, Apple Silicon, RISC-V cores.' },
        ],
        examPerspective: {
          keyDefinitions: ['Load/Store Architecture: Only dedicated load and store instructions access memory; ALU works solely on registers.'],
          importantDiagrams: ['Evolution timeline from 4004 → 8085 → 8086 → 80386 → Multicore'],
          likelyQuestions: [
            { marks: 5, question: 'Compare RISC and CISC architectures with examples.' },
            { marks: 5, question: 'Trace the generation-wise evolution of microprocessors from 4-bit to 64-bit.' },
          ],
        },
        quickRecap: [
          { term: 'CISC', summary: 'Variable length, microprogrammed, rich addressing modes, fewer instructions per program.' },
          { term: 'RISC', summary: 'Fixed length, hardwired control, load/store, deep pipelining, large register bank.' },
        ],
      },
    ],
  },

  {
    id: '8085',
    number: 'Module 02',
    title: 'Intel 8085 Microprocessor',
    shortTitle: '8085 µP',
    description:
      'Complete mastery of the classic 8-bit 8085 CPU: internal architecture, registers, flags, 40-pin DIP, buses, addressing modes, timing diagrams, interrupts, memory interfacing, and assembly.',
    accentColor: 'cyan',
    topics: [
      {
        id: '8085-architecture',
        moduleId: '8085',
        order: 1,
        title: '8085 Internal Architecture & Block Diagram',
        subtitle: 'Explore the ALU, registers, timing & control unit, and 8-bit internal data bus',
        durationMin: 18,
        difficulty: 'Beginner',
        visualType: '8085-architecture',
        relatedLabTab: 'architecture',
        simpleExplanation:
          'The Intel 8085 is an 8-bit NMOS microprocessor operating at 3 MHz (single +5V supply) with a 16-bit address bus capable of addressing 64 KB of memory (0000H–FFFFH). Every internal unit—Accumulator, ALU, Flag Register, General Purpose Registers (B, C, D, E, H, L), Program Counter, Stack Pointer, and Instruction Decoder—communicates across a central 8-bit Internal Data Bus.',
        analogy:
          'Imagine an automated post-sorting hub: the 8-bit Internal Bus is the conveyor belt, the Accumulator is the main workbench, the ALU is the calculator station, and the Timing & Control Unit is the floor supervisor coordinating every handoff.',
        keyFacts: [
          '8-bit data bus (AD0–AD7 multiplexed) and 16-bit address bus (A15–A8 + AD7–AD0) → 2¹⁶ = 65,536 bytes (64 KB).',
          'Has 6 general-purpose 8-bit registers (B, C, D, E, H, L) usable as 16-bit pairs (BC, DE, HL).',
          'Includes 2 special 16-bit pointers: Program Counter (PC) and Stack Pointer (SP), plus invisible W & Z temporary registers.',
        ],
        interactiveHotspots: [
          { id: 'ACC', label: 'Accumulator (A)', role: '8-bit Primary ALU Register', details: 'Holds one operand for virtually all 8-bit ALU instructions and receives the result.' },
          { id: 'ALU', label: 'Arithmetic Logic Unit', role: '8-bit Math & Logic Engine', details: 'Performs binary ADD, SUB, AND, OR, XOR, Rotate, and updates the 5 status flags.' },
          { id: 'FLAGS', label: 'Flag Register (F)', role: '5 Status Flip-Flops', details: 'Tracks S (Sign), Z (Zero), AC (Auxiliary Carry), P (Parity), and CY (Carry).' },
          { id: 'REGS', label: 'Register Array (B,C,D,E,H,L)', role: 'Scratchpad & Pointers', details: 'Fast on-chip storage; HL serves as the default Memory Pointer (M).' },
          { id: 'PC_SP', label: 'PC & SP (16-bit)', role: 'Execution & Stack Pointers', details: 'PC always holds the address of the next instruction byte to fetch; SP points to Top of Stack.' },
          { id: 'CTRL', label: 'Timing & Control Unit', role: 'CPU Orchestra Conductor', details: 'Generates CLK, RD\', WR\', ALE, IO/M\', S1, S0 to synchronize internal and external transfers.' },
        ],
        stepByStep: [
          { step: 1, title: 'Address Out', internalAction: 'PC places 16-bit instruction address onto A15–A8 and AD7–AD0; ALE pulses HIGH.', busState: 'A15–A0 = PC, ALE = 1' },
          { step: 2, title: 'Opcode Fetch', internalAction: 'RD\' goes LOW; memory drives 8-bit opcode onto AD7–AD0 into the Instruction Register (IR).', busState: 'IO/M\'=0, S1=1, S0=1, RD\'=0' },
          { step: 3, title: 'Decode', internalAction: 'Instruction Decoder interprets opcode and instructs Timing & Control what micro-steps follow.', busState: 'PC ← PC + 1' },
          { step: 4, title: 'Execute & Update Flags', internalAction: 'ALU operates on Accumulator and Temp Register; result returns to A and Flag flip-flops latch.', busState: 'Internal Bus Active' },
        ],
        realWorldApplications: [
          { domain: 'Education & Instrumentation', example: 'Microprocessor trainer kits, digital scales, and early industrial PLC controllers.' },
          { domain: 'Spacecraft Heritage', example: 'Radiation-hardened 8085RH processors flew on NASA Mars Pathfinder (Sojourner rover) and CRRES.' },
        ],
        examPerspective: {
          keyDefinitions: [
            'Accumulator: 8-bit register integrated with the ALU that stores one source operand and the final result of arithmetic/logic instructions.',
            'Program Counter (PC): 16-bit register that sequences execution by holding the memory address of the next instruction to be fetched.',
          ],
          importantDiagrams: ['Complete Internal Functional Block Diagram of Intel 8085'],
          likelyQuestions: [
            { marks: 10, question: 'Draw and explain the internal architecture of the 8085 microprocessor in detail.' },
            { marks: 5, question: 'Explain the roles of Program Counter, Stack Pointer, and W/Z temporary registers in 8085.' },
          ],
        },
        quickRecap: [
          { term: 'Word Size', summary: '8-bit data, 16-bit address (64 KB space).' },
          { term: 'HL Pair', summary: 'Used as implicit 16-bit memory pointer "M".' },
          { term: 'W & Z Regs', summary: 'Internal 8-bit temporary registers used by CPU during CALL/XCHG; not user-accessible.' },
        ],
      },
      {
        id: '8085-flags',
        moduleId: '8085',
        order: 2,
        title: 'ALU, Registers & Flag Register (S, Z, AC, P, CY)',
        subtitle: 'How every arithmetic and logic instruction flips the 5 status bits',
        durationMin: 14,
        difficulty: 'Beginner',
        visualType: '8085-registers-flags',
        relatedLabTab: 'flags',
        simpleExplanation:
          'The 8085 Flag Register is an 8-bit register containing 5 active flip-flops: Sign (D7), Zero (D6), Auxiliary Carry (D4), Parity (D2), and Carry (D0). Bits D5, D3, and D1 are unused. Together with the Accumulator, the Flag Register forms the 16-bit Program Status Word (PSW). Conditional jumps like JZ, JNZ, JC, and JM inspect these flags to make decisions.',
        analogy:
          'Flags are dashboard warning lights on a car: after the engine (ALU) performs an action, the lights immediately indicate whether the result hit zero, overflowed 8 bits, or turned negative.',
        keyFacts: [
          'S (Sign, D7): Copies bit D7 of the result (1 = negative in 2\'s complement, 0 = positive).',
          'Z (Zero, D6): Set to 1 if the 8-bit result is 00H; otherwise 0.',
          'AC (Auxiliary Carry, D4): Set to 1 if a carry propagates from bit D3 to bit D4 (used internally by DAA for BCD math).',
          'P (Parity, D2): Set to 1 if the result has an EVEN number of 1-bits; 0 if odd.',
          'CY (Carry, D0): Set to 1 on unsigned overflow (carry out of D7) or borrow during subtraction.',
          'Crucial Exam Trap: INR/DCR update S, Z, AC, P but NEVER modify CY! INX/DCX modify NO flags at all.',
        ],
        interactiveHotspots: [
          { id: 'S', label: 'D7 · Sign Flag (S)', role: 'MSB Mirror', details: '1 if result D7 = 1 (80H–FFH); 0 if D7 = 0 (00H–7FH).' },
          { id: 'Z', label: 'D6 · Zero Flag (Z)', role: 'Zero Detector', details: '1 when result equals 00H; vital for loop termination (DCR C / JNZ LOOP).' },
          { id: 'AC', label: 'D4 · Auxiliary Carry (AC)', role: 'Nibble Carry', details: '1 when D3 → D4 carry occurs. Cannot be tested by jump instructions; used by DAA.' },
          { id: 'P', label: 'D2 · Parity Flag (P)', role: 'Even Parity Check', details: '1 for even count of 1s in result (e.g., 00H has zero 1s → even → P=1).' },
          { id: 'CY', label: 'D0 · Carry Flag (CY)', role: 'Overflow / Borrow', details: '1 on carry out of D7 in ADD or borrow in SUB/CMP.' },
        ],
        stepByStep: [
          { step: 1, title: 'Load Operands', internalAction: 'Suppose A = 9AH (1001 1010) and B = 8CH (1000 1100).' },
          { step: 2, title: 'Lower Nibble Sum', internalAction: '1010 + 1100 = 1 0110 → Carry from D3 to D4 sets AC = 1.' },
          { step: 3, title: 'Upper Nibble Sum', internalAction: '1001 + 1000 + 1(AC) = 1 0010 → Carry out of D7 sets CY = 1; Result A = 26H (0010 0110).' },
          { step: 4, title: 'Latch Remaining Flags', internalAction: 'D7=0 → S=0; Result≠0 → Z=0; Three 1-bits (odd) → P=0. Final Flags = 11H.' },
        ],
        realWorldApplications: [
          { domain: 'Multi-Byte Arithmetic', example: 'Chaining 8-bit additions into 16/32-bit math using ADC and the Carry flag.' },
          { domain: 'BCD Calculators', example: 'Using AC and CY with DAA to keep decimal displays accurate.' },
        ],
        examPerspective: {
          keyDefinitions: ['PSW (Program Status Word): 16-bit pair consisting of Accumulator (high byte) and Flag Register (low byte).'],
          importantDiagrams: ['8-bit Flag Register bit-layout diagram (D7=S, D6=Z, D5=X, D4=AC, D3=X, D2=P, D1=X, D0=CY)'],
          likelyQuestions: [
            { marks: 5, question: 'Explain the 8085 flag register with its bit layout and show flag states after adding 9AH and 8CH.' },
            { marks: 2, question: 'Why does INR not affect the Carry flag while ADD does?' },
          ],
        },
        quickRecap: [
          { term: 'Bit Positions', summary: 'D7=S, D6=Z, D4=AC, D2=P, D0=CY.' },
          { term: 'Parity Rule', summary: 'P = 1 means EVEN number of 1s (including 00H!).' },
          { term: 'No-Carry Ops', summary: 'INR/DCR skip CY; INX/DCX skip ALL flags; MOV/MVI skip ALL flags.' },
        ],
      },
      {
        id: '8085-pinout',
        moduleId: '8085',
        order: 3,
        title: '40-Pin DIP Configuration & Multiplexed Buses',
        subtitle: 'Interactive pin-by-pin explorer and how ALE demultiplexes AD0–AD7',
        durationMin: 16,
        difficulty: 'Intermediate',
        visualType: '8085-pinout',
        relatedLabTab: 'pinout',
        simpleExplanation:
          'To fit a 16-bit address bus, 8-bit data bus, power, clock, interrupts, DMA, and serial lines inside an affordable 40-pin DIP package, Intel time-multiplexed the lower 8 address lines (A0–A7) with the 8 data lines (D0–D7) onto pins AD0–AD7. During T1 of every machine cycle, AD0–AD7 carries the low address byte and ALE (Pin 30) pulses HIGH so an external 74LS373 latch captures it. In T2–T3, the same 8 pins switch to carrying data.',
        analogy:
          'Multiplexing is like a reversible toll lane: during morning rush (T1), the lane carries addresses outbound; once the latch records them, the exact same asphalt carries data in T2–T3.',
        keyFacts: [
          'Pin 40 = Vcc (+5V), Pin 20 = Vss (GND), Pins 1–2 = X1/X2 (6.144 MHz crystal divided internally by 2 → 3.072 MHz CLK OUT on Pin 37).',
          'Address Bus: A8–A15 (Pins 21–28, unidirectional) + AD0–AD7 (Pins 12–19, bidirectional multiplexed).',
          'Control & Status: ALE (30), RD\' (32), WR\' (31), IO/M\' (34), S0 (29), S1 (33), READY (35).',
          'Interrupts: TRAP (6), RST 7.5 (7), RST 6.5 (8), RST 5.5 (9), INTR (10), INTA\' (11).',
          'DMA: HOLD (39), HLDA (38); Serial I/O: SOD (4), SID (5); Reset: RESET IN\' (36), RESET OUT (3).',
        ],
        interactiveHotspots: [
          { id: 'ALE', label: 'Pin 30 · ALE', role: 'Address Latch Enable', details: 'Goes HIGH during T1 to strobe A0–A7 into external octal latch 74LS373.' },
          { id: 'IOM', label: 'Pin 34 · IO/M\'', role: 'I/O vs Memory Select', details: 'HIGH = I/O operation (IN/OUT); LOW = Memory operation (Opcode Fetch, MR, MW).' },
          { id: 'TRAP', label: 'Pin 6 · TRAP', role: 'Non-Maskable Interrupt', details: 'Highest priority, both edge and level triggered, vectors to 0024H.' },
          { id: 'HOLD', label: 'Pins 39 & 38 · HOLD/HLDA', role: 'DMA Handshake', details: '8237 DMA asserts HOLD; 8085 tri-states buses and replies with HLDA.' },
        ],
        stepByStep: [
          { step: 1, title: 'T1: Address Phase', internalAction: 'CPU drives A15–A8 and A7–A0 (on AD7–AD0) and raises ALE = 1.', busState: '74LS373 transparent → latches A7–A0' },
          { step: 2, title: 'End of T1: Latch Hold', internalAction: 'ALE drops LOW. External latch freezes A7–A0 on its output pins for the rest of the cycle.', busState: 'A7–A0 held steady externally' },
          { step: 3, title: 'T2–T3: Data Phase', internalAction: 'AD7–AD0 switches to bidirectional data mode; RD\' or WR\' goes LOW to transfer 8-bit byte.', busState: 'D7–D0 active on AD7–AD0' },
        ],
        realWorldApplications: [
          { domain: 'PCB Pin-Count Optimization', example: 'Address/data multiplexing saved 8 IC pins and became standard across 8086 and 8051 external memory interfaces.' },
        ],
        examPerspective: {
          keyDefinitions: ['Demultiplexing: Separating A0–A7 from AD0–AD7 using ALE and an external octal D-latch (74LS373).'],
          importantDiagrams: ['40-Pin DIP Diagram of 8085', 'Demultiplexing AD0–AD7 using 74LS373 Latch'],
          likelyQuestions: [
            { marks: 10, question: 'Draw the pin diagram of 8085 and explain the function of each signal group.' },
            { marks: 5, question: 'Explain how AD0–AD7 is demultiplexed using ALE and 74LS373 with a neat diagram.' },
          ],
        },
        quickRecap: [
          { term: 'Crystal Divider', summary: 'Internal clock = Crystal Frequency ÷ 2 (e.g., 6 MHz crystal → 3 MHz CPU).' },
          { term: 'S1, S0 Status', summary: '11=Opcode Fetch, 10=Read, 01=Write, 00=Halt.' },
          { term: 'READY Pin', summary: 'Allows slow memory/peripherals to insert Wait (Tw) states.' },
        ],
      },
      {
        id: '8085-addressing',
        moduleId: '8085',
        order: 4,
        title: 'Instruction Formats & Addressing Modes',
        subtitle: '1-byte, 2-byte, and 3-byte instructions plus all 5 ways 8085 locates data',
        durationMin: 15,
        difficulty: 'Intermediate',
        visualType: '8085-addressing',
        relatedLabTab: 'addressing',
        simpleExplanation:
          'An instruction tells the CPU WHAT to do (Opcode) and WHERE to find the data (Operand). Depending on operand size, 8085 instructions are 1-byte (e.g., MOV A, B), 2-byte (opcode + 8-bit immediate, e.g., MVI A, 32H), or 3-byte (opcode + 16-bit address, e.g., LDA 2500H, stored little-endian: low byte first, high byte second). The method of specifying the operand is its Addressing Mode.',
        analogy:
          'Finding a book: Immediate is holding the quote in your hand; Register is checking your desk; Direct is walking straight to Shelf 2500; Indirect is reading a sticky note (HL) that tells you which shelf to check.',
        keyFacts: [
          '1. Immediate Addressing: Data is inside the instruction itself (MVI A, 45H; LXI H, 2500H; ADI 05H).',
          '2. Register Addressing: Operand lives in a CPU register (MOV A, B; ADD C; SUB D).',
          '3. Direct Addressing: 16-bit memory address is written in the instruction (LDA 2500H; STA 3000H; IN 01H).',
          '4. Register Indirect Addressing: Memory address is held in HL, BC, or DE pair (MOV A, M; ADD M; LDAX B).',
          '5. Implied (Inherent) Addressing: Operand is implicitly the Accumulator or Flags (CMA, RLC, STC, HLT).',
        ],
        interactiveHotspots: [
          { id: 'IMM', label: 'Immediate Mode', role: 'MVI A, 32H', details: 'Byte 1 = 3EH (opcode), Byte 2 = 32H (data). Fast, no extra data memory pointer needed.' },
          { id: 'DIR', label: 'Direct Mode', role: 'LDA 2500H', details: 'Byte 1 = 3AH, Byte 2 = 00H (low addr), Byte 3 = 25H (high addr) — Little Endian!' },
          { id: 'IND', label: 'Register Indirect', role: 'MOV A, M', details: '1-byte instruction (7EH) that reads memory at address [HL]. Ideal for array loops.' },
        ],
        stepByStep: [
          { step: 1, title: 'Fetch Opcode', internalAction: 'CPU reads first byte at PC to determine instruction length (1, 2, or 3 bytes).' },
          { step: 2, title: 'Fetch Operand Bytes (if 2/3-byte)', internalAction: 'Reads 8-bit immediate or 16-bit address (low byte first, then high byte).' },
          { step: 3, title: 'Resolve Effective Address', internalAction: 'For Indirect (M), CPU reads HL pair and drives it onto A15–A0 to access RAM.' },
        ],
        realWorldApplications: [
          { domain: 'Array Processing', example: 'Register Indirect mode (MOV A, M + INX H) powers loops over sensor buffers and lookup tables.' },
        ],
        examPerspective: {
          keyDefinitions: ['Little-Endian Storage: Storing the low-order byte at the lower memory address and the high-order byte at the next address.'],
          importantDiagrams: ['1-Byte, 2-Byte, and 3-Byte Instruction Memory Layout'],
          likelyQuestions: [
            { marks: 5, question: 'Explain all five addressing modes of the 8085 microprocessor with two examples each.' },
            { marks: 5, question: 'Classify 8085 instructions by byte length and functional group with examples.' },
          ],
        },
        quickRecap: [
          { term: '5 Addressing Modes', summary: 'Immediate, Register, Direct, Register Indirect, Implied.' },
          { term: '5 Functional Groups', summary: 'Data Transfer, Arithmetic, Logical, Branching, Machine Control.' },
          { term: 'Little Endian', summary: 'LXI H, 2500H encodes in memory as: 21H, 00H, 25H.' },
        ],
      },
      {
        id: '8085-timing',
        moduleId: '8085',
        order: 5,
        title: 'Timing Diagrams & Machine Cycles',
        subtitle: 'T-states, Opcode Fetch (4T/6T), Memory Read/Write (3T), and I/O Cycles',
        durationMin: 18,
        difficulty: 'Advanced',
        visualType: '8085-timing',
        relatedLabTab: 'timing',
        simpleExplanation:
          'A Timing Diagram is an oscilloscope snapshot of how 8085 control signals (CLK, A15–A8, AD7–AD0, ALE, IO/M\', S1, S0, RD\', WR\') change tick-by-tick during an instruction. One clock period is a T-State. A group of 3 to 6 T-states forming one external bus access is a Machine Cycle. A complete instruction consists of 1 to 5 Machine Cycles (Instruction Cycle).',
        analogy:
          'Think of a Timing Diagram as musical sheet notation for hardware: every horizontal lane is an instrument (CLK, ALE, RD\', Bus), and T1–T4 are the beats keeping memory and CPU perfectly synchronized.',
        keyFacts: [
          'Opcode Fetch (OF): 4 T-states normally (6 T-states for INX, DCX, PUSH, CALL, SPHL, PCHL). IO/M\'=0, S1=1, S0=1.',
          'Memory Read (MR): 3 T-states. IO/M\'=0, S1=1, S0=0, RD\'=0 during T2–T3.',
          'Memory Write (MW): 3 T-states. IO/M\'=0, S1=0, S0=1, WR\'=0 during T2–T3.',
          'I/O Read (IOR) / I/O Write (IOW): 3 T-states each with IO/M\' = 1 (HIGH).',
          'Execution Time = Total T-states × (1 / Clock Frequency). At 3 MHz, 1 T-state = 333.3 ns.',
        ],
        interactiveHotspots: [
          { id: 'T1', label: 'T1 State', role: 'Address Broadcast & ALE Pulse', details: 'A15–A8 & AD7–AD0 emit 16-bit address; ALE goes HIGH; IO/M\', S1, S0 stabilize.' },
          { id: 'T2', label: 'T2 State', role: 'Control Strobe Asserted', details: 'RD\' or WR\' goes LOW; memory places data on AD7–AD0 (or latches data from CPU).' },
          { id: 'T3', label: 'T3 State', role: 'Data Transfer Complete', details: 'CPU latches data byte into IR/register; RD\'/WR\' returns HIGH.' },
          { id: 'T4', label: 'T4 State (OF only)', role: 'Internal Opcode Decode', details: 'Bus goes tri-state while Instruction Decoder decodes opcode internally.' },
        ],
        stepByStep: [
          { step: 1, title: 'M1: Opcode Fetch (4T)', internalAction: 'For MVI A, 32H: fetches opcode 3EH from PC in T1–T3, decodes in T4.' },
          { step: 2, title: 'M2: Memory Read (3T)', internalAction: 'Fetches immediate byte 32H from PC+1 into Accumulator in T1–T3.' },
          { step: 3, title: 'Total Time Calculation', internalAction: 'Total = 4T + 3T = 7 T-states. At 2 MHz (T=0.5 µs), MVI A, 32H takes 3.5 µs.' },
        ],
        realWorldApplications: [
          { domain: 'Hardware Bring-up', example: 'Engineers inspect ALE, RD\', and WR\' on logic analyzers to verify RAM access time margins.' },
        ],
        examPerspective: {
          keyDefinitions: ['T-State: One subdivision of an operation performed in one clock period.'],
          importantDiagrams: ['Timing diagram of MVI A, 32H (7T)', 'Timing diagram of STA 2500H (13T)', 'Timing diagram of OUT 01H (10T)'],
          likelyQuestions: [
            { marks: 10, question: 'Draw and explain the timing diagram for MVI A, 32H and calculate its execution time at 3 MHz.' },
            { marks: 5, question: 'Differentiate between Instruction Cycle, Machine Cycle, and T-State.' },
          ],
        },
        quickRecap: [
          { term: 'OF / MR / MW', summary: '4T (or 6T) / 3T / 3T respectively.' },
          { term: 'STA 2500H', summary: 'OF(4T) + MR(3T) + MR(3T) + MW(3T) = 13 T-states.' },
          { term: 'Delay Calculation', summary: 'Time = Total T-States / f_clk.' },
        ],
      },
      {
        id: '8085-interrupts',
        moduleId: '8085',
        order: 6,
        title: '8085 Interrupts & Priority Architecture',
        subtitle: 'TRAP, RST 7.5/6.5/5.5, INTR, vector addresses, and SIM/RIM instructions',
        durationMin: 14,
        difficulty: 'Intermediate',
        visualType: '8085-interrupts',
        relatedLabTab: 'interfacing',
        simpleExplanation:
          'An interrupt is an asynchronous hardware or software signal that pauses the main program so the CPU can immediately serve an urgent event (like a power-failure sensor or keyboard press). The 8085 pushes the current PC onto the stack, jumps to a fixed Vector Address (ISR), services the event, and executes RET to resume seamlessly.',
        analogy:
          'Interrupts are like a fire alarm (TRAP — cannot be ignored!) versus an office phone (RST 7.5/6.5/5.5 — can be put on Do Not Disturb via DI or SIM).',
        keyFacts: [
          'Priority Order (Highest to Lowest): TRAP (0024H) > RST 7.5 (003CH) > RST 6.5 (0034H) > RST 5.5 (002CH) > INTR (External).',
          'TRAP is Non-Maskable and BOTH edge- and level-triggered (must go high and stay high).',
          'RST 7.5 is positive edge-triggered (latched internally); RST 6.5 & RST 5.5 are active-high level-triggered.',
          'Software interrupts RST 0–RST 7 vector to (n × 8) in hex: 0000H, 0008H, 0010H, ..., 0038H.',
          'SIM (Set Interrupt Mask) selectively masks/unmasks RST 7.5, 6.5, 5.5 and controls SOD; RIM reads pending interrupts & SID.',
        ],
        interactiveHotspots: [
          { id: 'TRAP', label: 'TRAP (0024H)', role: 'Priority 1 · Non-Maskable', details: 'Cannot be disabled by DI or SIM. Reserved for catastrophic failures like power loss.' },
          { id: 'RST75', label: 'RST 7.5 (003CH)', role: 'Priority 2 · Edge Triggered', details: 'Internal flip-flop remembers a rising edge even if masked; cleared via SIM bit D4.' },
          { id: 'RST65', label: 'RST 6.5 (0034H) & RST 5.5 (002CH)', role: 'Priority 3 & 4 · Level Triggered', details: 'Maskable via EI/DI and SIM mask bits M6.5 / M5.5.' },
          { id: 'INTR', label: 'INTR + INTA\'', role: 'Priority 5 · Non-Vectored', details: 'External controller (e.g. 8259A) supplies RST or CALL opcode on data bus during INTA\'.' },
        ],
        stepByStep: [
          { step: 1, title: 'Interrupt Asserted', internalAction: 'CPU finishes current instruction and samples interrupt pins in the second-to-last T-state.' },
          { step: 2, title: 'Mask & Priority Check', internalAction: 'TRAP passes immediately; maskable pins require INTE=1 (EI) and Mask bit=0.' },
          { step: 3, title: 'Save Context & Vector Jump', internalAction: 'CPU disables further interrupts (INTE←0), pushes PC onto stack, and loads vector address into PC.' },
          { step: 4, title: 'ISR & Return', internalAction: 'ISR executes, calls EI to re-enable interrupts, and executes RET to restore PC from stack.' },
        ],
        realWorldApplications: [
          { domain: 'Real-Time Safety', example: 'Brown-out detection wired to TRAP saves critical calibration data to EEPROM before voltage collapses.' },
        ],
        examPerspective: {
          keyDefinitions: ['Vectored Interrupt: An interrupt whose ISR starting address is fixed internally by hardware (e.g. TRAP → 0024H).'],
          importantDiagrams: ['8085 Interrupt Priority & Masking Logic Diagram', 'SIM & RIM Accumulator Bit Pattern'],
          likelyQuestions: [
            { marks: 5, question: 'List all 5 hardware interrupts of 8085 in priority order with trigger types and vector addresses.' },
            { marks: 5, question: 'Explain the bit formats and operation of SIM and RIM instructions.' },
          ],
        },
        quickRecap: [
          { term: 'Vector Formula', summary: 'RST n → n × 8 (Hex). E.g., 7.5 × 8 = 60 = 003CH!' },
          { term: 'TRAP', summary: 'Non-maskable, Edge + Level, Vector 0024H.' },
          { term: 'INTR', summary: 'Only non-vectored hardware interrupt on 8085.' },
        ],
      },
      {
        id: '8085-memory-interfacing',
        moduleId: '8085',
        order: 7,
        title: 'Memory Interfacing & Address Decoding',
        subtitle: 'Mapping 2KB/4KB/8KB ROM and RAM chips onto the 64KB 8085 address bus',
        durationMin: 16,
        difficulty: 'Advanced',
        visualType: '8085-memory-map',
        simpleExplanation:
          'The 8085 has 16 address lines (A0–A15), giving 64 KB of address space. A smaller memory IC—say a 4 KB EPROM (2732)—only has 12 address pins (A0–A11, since 2¹² = 4096). The remaining upper address lines (A12–A15) pass through an Address Decoder (like a 74LS138 3-to-8 decoder or NAND gate) to activate that chip\'s active-low Chip Select (CS\') only within its assigned address range.',
        analogy:
          'Address decoding is like postal routing: upper address lines (A15–A12) pick the apartment building (Chip Select), while lower lines (A11–A0) pick the exact room inside that building.',
        keyFacts: [
          'Number of address pins needed for N-byte chip = log₂(N): 1KB=10 (A0–A9), 2KB=11 (A0–A10), 4KB=12 (A0–A11), 8KB=13 (A0–A12).',
          'Absolute (Exhaustive) Decoding uses ALL remaining upper address lines → no duplicate/foldback addresses.',
          'Partial Decoding ignores some upper lines → cheaper glue logic, but creates shadow/foldback memory ranges.',
          'Control Signals: MEMR\' = IO/M\' + RD\' (active low), MEMW\' = IO/M\' + WR\' (active low).',
        ],
        interactiveHotspots: [
          { id: 'LOWER', label: 'Lower Lines (A0–A11)', role: 'Internal Chip Offset', details: 'Wired directly to the 4KB memory IC to select one of its 4096 internal bytes.' },
          { id: 'DECODER', label: '74LS138 Decoder (A12–A15)', role: 'Chip Select Generator', details: 'Outputs active-low Y0\'–Y7\' so only one memory IC drives the data bus at a time (prevents bus contention).' },
          { id: 'CTRL_MEM', label: 'MEMR\' / MEMW\'', role: 'Read/Write Enable', details: 'EPROM connects only to MEMR\' (OE\'); RAM connects to both MEMR\' (OE\') and MEMW\' (WE\').' },
        ],
        stepByStep: [
          { step: 1, title: 'Determine Chip Size', internalAction: 'For 4KB chip: 4 × 1024 = 4096 = 2¹² → connect A0–A11 directly.' },
          { step: 2, title: 'Assign Upper Bits', internalAction: 'Set A15 A14 A13 A12 = 0000 for 0000H–0FFFH (EPROM), and 0010 for 2000H–2FFFH (RAM).' },
          { step: 3, title: 'Verify End Address', internalAction: 'Start 2000H + (0FFFH offset) = End 2FFFH.' },
        ],
        realWorldApplications: [
          { domain: 'Embedded Bootloaders', example: 'Boot EPROM is always decoded at 0000H because 8085 resets PC to 0000H on power-up.' },
        ],
        examPerspective: {
          keyDefinitions: ['Foldback Memory: Multiple memory addresses mapping to the same physical RAM byte due to partial address decoding.'],
          importantDiagrams: ['Interfacing 4KB EPROM (0000H–0FFFH) & 4KB RAM (2000H–2FFFH) using 74LS138'],
          likelyQuestions: [
            { marks: 10, question: 'Design an interfacing circuit to connect 4KB EPROM at 0000H and 2KB RAM at 2000H with 8085 using 74LS138.' },
          ],
        },
        quickRecap: [
          { term: 'Chip Lines', summary: '1KB→10, 2KB→11, 4KB→12, 8KB→13, 16KB→14.' },
          { term: 'EPROM Base', summary: 'Always starts at 0000H to catch power-on reset.' },
        ],
      },
    ],
  },

  {
    id: '8086',
    number: 'Module 03',
    title: 'Intel 8086 Microprocessor',
    shortTitle: '8086 µP',
    description:
      'Dive into 16-bit x86 architecture: BIU & EU pipelining, 6-byte instruction queue, 20-bit physical address segmentation, 16-bit flags, and Minimum/Maximum modes.',
    accentColor: 'violet',
    topics: [
      {
        id: '8086-biu-eu',
        moduleId: '8086',
        order: 1,
        title: '8086 Architecture: BIU, EU & 6-Byte Pipelining',
        subtitle: 'Two independent internal units working in parallel to eliminate fetch waits',
        durationMin: 16,
        difficulty: 'Intermediate',
        visualType: '8086-architecture',
        simpleExplanation:
          'Unlike the sequential 8085, the 16-bit Intel 8086 splits its CPU into two concurrent units: the Bus Interface Unit (BIU) and the Execution Unit (EU). While the EU executes instructions from a 6-byte FIFO Prefetch Queue, the BIU runs ahead on the external 20-bit bus fetching upcoming instruction bytes into the queue. This 2-stage instruction pipelining dramatically accelerates execution.',
        analogy:
          'The BIU is a prep cook constantly chopping ingredients and filling a 6-slot tray (Prefetch Queue), while the EU is the head chef continuously cooking from the tray without ever walking to the pantry.',
        keyFacts: [
          '16-bit ALU & 16-bit data bus (AD0–AD15); 20-bit address bus → 2²⁰ = 1 MB physical memory (00000H–FFFFFH).',
          'BIU contains: CS, DS, SS, ES segment registers, IP (Instruction Pointer), 20-bit Address Adder, and 6-byte Instruction Queue.',
          'EU contains: 16-bit ALU, AX/BX/CX/DX general registers, SP/BP/SI/DI pointers, Control Unit, and 16-bit Flag Register (9 active flags).',
          'Branch Penalty: On a JMP or CALL, the prefetched queue becomes invalid and is flushed immediately.',
        ],
        interactiveHotspots: [
          { id: 'BIU', label: 'Bus Interface Unit (BIU)', role: 'External Bus & Prefetch Engine', details: 'Computes 20-bit physical addresses, fetches opcodes into the 6-byte queue, and performs memory/IO reads & writes.' },
          { id: 'QUEUE', label: '6-Byte Instruction Queue', role: 'FIFO Pipeline Buffer', details: 'Refills whenever at least 2 bytes are empty and the bus is idle; flushes on branch instructions.' },
          { id: 'EU', label: 'Execution Unit (EU)', role: 'Decode & 16-bit ALU Core', details: 'Pulls opcodes from queue, decodes them, runs 16-bit ALU math, and updates the 9 flags.' },
        ],
        stepByStep: [
          { step: 1, title: 'BIU Prefetches Ahead', internalAction: 'BIU computes CS×10H + IP and streams up to 6 instruction bytes into the FIFO queue.' },
          { step: 2, title: 'Parallel EU Execution', internalAction: 'EU pulls already-fetched opcode from the queue in zero external bus cycles and executes it.' },
          { step: 3, title: 'Queue Refill / Flush', internalAction: 'If 2+ slots open, BIU fetches the next word; if EU executes JMP, BIU flushes queue and fetches new target.' },
        ],
        realWorldApplications: [
          { domain: 'Birth of x86', example: 'The 8086 ISA founded the entire x86 ecosystem powering modern PCs and cloud servers.' },
        ],
        examPerspective: {
          keyDefinitions: ['Pipelining in 8086: Overlapping instruction fetch (BIU) with instruction decode/execution (EU) via the 6-byte instruction queue.'],
          importantDiagrams: ['Internal Architecture of 8086 showing BIU, 6-byte Queue, and EU'],
          likelyQuestions: [
            { marks: 10, question: 'Explain the internal architecture of 8086 with a neat block diagram, highlighting BIU and EU.' },
            { marks: 5, question: 'How does the 6-byte instruction queue implement pipelining in 8086? When is it flushed?' },
          ],
        },
        quickRecap: [
          { term: 'BIU', summary: 'Segment regs + IP + 20-bit adder + 6-byte FIFO queue.' },
          { term: 'EU', summary: 'AX–DX + SP/BP/SI/DI + 16-bit ALU + 9-bit Flags.' },
          { term: 'Queue Size', summary: '6 bytes in 8086 (4 bytes in 8088).' },
        ],
      },
      {
        id: '8086-segmentation',
        moduleId: '8086',
        order: 2,
        title: 'Memory Segmentation & 20-Bit Physical Address',
        subtitle: 'Interactive calculator for Segment × 10H + Offset across CS, DS, SS, and ES',
        durationMin: 15,
        difficulty: 'Intermediate',
        visualType: '8086-segments',
        simpleExplanation:
          'Every register inside the 8086 is 16 bits wide (max 64 KB), yet the 8086 addresses 1 MB (20 bits)! How? Through Memory Segmentation. The 1 MB memory is divided into logical 64 KB segments pointed to by four 16-bit Segment Registers (CS, DS, SS, ES). The BIU shifts the Segment Register left by 4 bits (multiplying by 10H / 16) and adds a 16-bit Offset (IP, BX, SI, DI, SP, BP) to form a 20-bit Physical Address.',
        analogy:
          'A segmented address is like "Chapter 2000, Page 0450": even though page numbers only go up to 64K, shifting chapters lets a 16-bit notebook index a 1-million-byte library.',
        keyFacts: [
          'Formula: Physical Address (20-bit) = (Segment Register × 10H) + Offset.',
          'CS:IP → Code Segment + Instruction Pointer (fetches instructions).',
          'DS:BX / DS:SI / DS:DI → Data Segment for variables and arrays.',
          'SS:SP / SS:BP → Stack Segment for PUSH, POP, CALL, RET.',
          'ES:DI → Extra Segment used as destination for string instructions (MOVSB, STOSB).',
        ],
        interactiveHotspots: [
          { id: 'CS', label: 'CS : IP', role: 'Code Segment', details: 'Points to the currently executing instruction stream.' },
          { id: 'DS', label: 'DS : BX / SI', role: 'Data Segment', details: 'Default segment for general data variables.' },
          { id: 'SS', label: 'SS : SP / BP', role: 'Stack Segment', details: 'Stores return addresses, saved registers, and local stack frames.' },
          { id: 'ES', label: 'ES : DI', role: 'Extra Segment', details: 'Secondary data segment used primarily by string operations.' },
        ],
        stepByStep: [
          { step: 1, title: 'Take 16-bit Segment', internalAction: 'Example: CS = 348AH.' },
          { step: 2, title: 'Shift Left 4 Bits (× 10H)', internalAction: 'Appends one hex zero → Base Address = 348A0H.' },
          { step: 3, title: 'Add 16-bit Offset', internalAction: 'Suppose IP = 4214H → Physical Address = 348A0H + 4214H = 38AB4H.' },
        ],
        realWorldApplications: [
          { domain: 'Relocatable Programs', example: 'Changing CS/DS moves an entire program anywhere in 1 MB RAM without rewriting internal offsets.' },
        ],
        examPerspective: {
          keyDefinitions: ['Logical Address: Written as Segment:Offset (e.g., 2000H:0150H). Physical Address: Actual 20-bit address placed on A19–A0.'],
          importantDiagrams: ['20-bit Physical Address Generation Circuit in BIU'],
          likelyQuestions: [
            { marks: 5, question: 'Explain memory segmentation in 8086. Calculate the physical address if CS = 2400H and IP = 1234H.' },
            { marks: 5, question: 'List the advantages of memory segmentation and default Segment:Offset pairs.' },
          ],
        },
        quickRecap: [
          { term: 'Formula', summary: 'PA = Segment × 10H + Offset (20 bits = 5 hex digits).' },
          { term: 'Max Segment', summary: '64 KB per segment; 4 active segments = 256 KB directly visible at once.' },
        ],
      },
      {
        id: '8086-modes-flags',
        moduleId: '8086',
        order: 3,
        title: '16-Bit Flags, Minimum/Maximum Modes & Interrupts',
        subtitle: 'Control flags (TF, IF, DF), MN/MX\' pin switching, and the 256-vector IVT',
        durationMin: 15,
        difficulty: 'Advanced',
        visualType: '8086-pipeline',
        simpleExplanation:
          'The 8086 expands the 8085\'s 5 status flags by adding Overflow (OF) plus 3 Control Flags: Trap Flag (TF for single-step debugging), Interrupt Enable (IF), and Direction Flag (DF for auto-increment/decrement string ops). Pin 33 (MN/MX\') lets the exact same chip run in Minimum Mode (single CPU generating its own RD\'/WR\'/ALE signals) or Maximum Mode (multiprocessor with 8288 Bus Controller and 8087 Math Coprocessor).',
        analogy:
          'Minimum Mode is a solo pilot flying a light aircraft directly; Maximum Mode puts an air-traffic controller (8288) in charge so multiple co-pilots (8087/8089) can share the runway safely.',
        keyFacts: [
          '6 Status Flags: CF, PF, AF, ZF, SF, OF (Signed Overflow).',
          '3 Control Flags: TF (Single-step trap), IF (Enable INTR), DF (0=auto-increment, 1=auto-decrement strings).',
          'MN/MX\' = 1 (Vcc) → Minimum Mode; MN/MX\' = 0 (GND) → Maximum Mode (requires 8288 Bus Controller).',
          'Interrupt Vector Table (IVT): First 1 KB of memory (00000H–003FFH) holds 256 interrupt vectors (4 bytes each: IP then CS).',
        ],
        interactiveHotspots: [
          { id: 'OF', label: 'OF (Overflow Flag)', role: 'Signed Arithmetic Overflow', details: 'Sets to 1 when signed addition/subtraction exceeds -128..+127 (8-bit) or -32768..+32767 (16-bit).' },
          { id: 'CONTROL_FLAGS', label: 'TF, IF, DF', role: 'CPU Behavior Control', details: 'Programmatically set/cleared via STD/CLD, STI/CLI, or stack pushes for single-step debugging.' },
          { id: 'IVT', label: '256-Entry IVT', role: '00000H–003FFH', details: 'Interrupt type N looks up IP at 4×N and CS at 4×N + 2. Type 0 = Divide by Zero; Type 2 = NMI.' },
        ],
        stepByStep: [
          { step: 1, title: 'Interrupt Triggered (Type N)', internalAction: 'CPU pushes Flags, clears IF & TF, then pushes CS and IP onto stack.' },
          { step: 2, title: 'IVT Lookup', internalAction: 'CPU reads new IP from address (N × 4) and new CS from (N × 4 + 2).' },
          { step: 3, title: 'IRET Return', internalAction: 'At end of ISR, IRET pops IP, CS, and original Flags in reverse order.' },
        ],
        realWorldApplications: [
          { domain: 'Hardware Debuggers', example: 'Setting Trap Flag (TF=1) fires INT 1 after every instruction—the foundation of CPU breakpoints.' },
        ],
        examPerspective: {
          keyDefinitions: ['IVT (Interrupt Vector Table): 1 KB table at 00000H–003FFH storing 4-byte CS:IP pointers for 256 interrupt types.'],
          importantDiagrams: ['16-bit 8086 Flag Register Layout', 'IVT Memory Organization (00000H–003FFH)'],
          likelyQuestions: [
            { marks: 5, question: 'Draw the 8086 flag register and explain the significance of OF, DF, IF, and TF.' },
            { marks: 5, question: 'Compare Minimum Mode and Maximum Mode configurations of 8086.' },
          ],
        },
        quickRecap: [
          { term: '9 Active Flags', summary: '6 Status (CF,PF,AF,ZF,SF,OF) + 3 Control (TF,IF,DF).' },
          { term: 'IVT Address', summary: 'Type N vector starts at physical address 4 × N.' },
          { term: 'MN/MX\'', summary: 'HIGH = Minimum (single CPU); LOW = Maximum (8288 + multiprocessor).' },
        ],
      },
    ],
  },

  {
    id: '8051',
    number: 'Module 04',
    title: 'Intel 8051 Microcontroller',
    shortTitle: '8051 µC',
    description:
      'Master embedded control on the legendary 8051: Harvard memory map, 128B internal RAM & register banks, SFRs, 4 I/O ports, Timers T0/T1, UART serial port, and 5-source interrupts.',
    accentColor: 'emerald',
    topics: [
      {
        id: '8051-architecture',
        moduleId: '8051',
        order: 1,
        title: '8051 Architecture, Internal RAM & SFR Map',
        subtitle: 'Harvard architecture, 4 register banks, 16-byte bit-addressable zone, and Special Function Registers',
        durationMin: 17,
        difficulty: 'Beginner',
        visualType: '8051-ram-map',
        simpleExplanation:
          'The Intel 8051 is an 8-bit Harvard-architecture microcontroller with 4 KB on-chip ROM, 128 bytes of internal RAM (00H–7FH), 21 Special Function Registers (80H–FFH), four 8-bit bidirectional I/O ports (P0–P3), two 16-bit Timers/Counters (T0, T1), and a full-duplex UART serial port. Its 128-byte internal RAM is ingeniously divided into 3 regions: 32 bytes for 4 Register Banks (R0–R7), 16 bytes of Bit-Addressable RAM (128 individual bits!), and 80 bytes of general scratchpad/stack.',
        analogy:
          'Think of 8051 internal RAM as a smart workshop: Drawers 00H–1FH hold 4 identical toolsets (Banks 0–3) for instant context switching during interrupts; 20H–2FH is a switchboard of 128 individual toggles; 30H–7FH is your open workbench.',
        keyFacts: [
          'Internal RAM (00H–7FH = 128B): Bank 0 (00–07H), Bank 1 (08–0FH), Bank 2 (10–17H), Bank 3 (18–1FH); Bit-Addressable (20–2FH); Scratchpad (30–7FH).',
          'Active Register Bank is selected by RS1 & RS0 bits in PSW (D0H). On reset, Bank 0 is active and SP = 07H (stack grows UPWARD to 08H!).',
          'Key SFRs (80H–FFH): A (E0H), B (F0H), PSW (D0H), SP (81H), DPTR (DPL=82H, DPH=83H), P0 (80H), P1 (90H), P2 (A0H), P3 (B0H), TMOD (89H), TCON (88H), SCON (98H), IE (A8H), IP (B8H).',
          '1 Machine Cycle = 12 Oscillator Periods (at 11.0592 MHz crystal, 1 MC = 1.085 µs).',
        ],
        interactiveHotspots: [
          { id: 'BANKS', label: '00H–1FH · 4 Register Banks', role: 'Fast Interrupt Context Switch', details: 'Switch RS1/RS0 in PSW to swap R0–R7 in 1 instruction without pushing 8 registers to stack.' },
          { id: 'BITRAM', label: '20H–2FH · Bit-Addressable RAM', role: '128 Boolean Flags (00H–7FH)', details: 'Every single bit can be set, cleared, or jumped on directly (SETB 25H, JB 25H, TARGET).' },
          { id: 'SCRATCH', label: '30H–7FH · Scratchpad RAM', role: '80 Bytes General Storage', details: 'Stores user variables and relocated stack frames.' },
          { id: 'SFR', label: '80H–FFH · Special Function Regs', role: 'Hardware Control Panel', details: 'Every port, timer, UART, and interrupt controller is configured by writing bytes here.' },
        ],
        stepByStep: [
          { step: 1, title: 'Power-On Reset', internalAction: 'PC = 0000H, SP = 07H, P0–P3 = FFH (configured as inputs), PSW = 00H (Bank 0 selected).' },
          { step: 2, title: 'Select Register Bank', internalAction: 'Writing RS1=0, RS0=1 in PSW instantly remaps R0–R7 to RAM addresses 08H–0FH.' },
          { step: 3, title: 'Stack Push Direction', internalAction: 'Unlike 8085 (stack grows down), 8051 PUSH increments SP first (SP ← SP + 1), then writes data!' },
        ],
        realWorldApplications: [
          { domain: 'Consumer Appliances', example: 'Microwave oven timers, IR remote decoders, keypad door locks, and industrial temperature controllers.' },
        ],
        examPerspective: {
          keyDefinitions: ['DPTR (Data Pointer): The only user-accessible 16-bit data register in 8051 (DPH + DPL), used to index external 64KB ROM/RAM.'],
          importantDiagrams: ['8051 Internal RAM Organization (00H–7FH) and SFR Map (80H–FFH)'],
          likelyQuestions: [
            { marks: 10, question: 'Explain the internal RAM organization and Special Function Registers (SFRs) of the 8051 microcontroller.' },
            { marks: 2, question: 'Why is an 11.0592 MHz crystal commonly used with the 8051?' },
          ],
        },
        quickRecap: [
          { term: 'Stack Growth', summary: '8051 stack grows UPWARD (SP starts at 07H; PUSH increments SP).' },
          { term: 'Bit-Addressable SFRs', summary: 'SFRs whose addresses end in 0H or 8H (80H, 88H, 90H, 98H, A8H, D0H, E0H, F0H).' },
          { term: '11.0592 MHz', summary: 'Divides cleanly by 12 and 32 to yield exact standard UART baud rates (9600, 4800, 2400 bps).' },
        ],
      },
      {
        id: '8051-ports-timers-serial',
        moduleId: '8051',
        order: 2,
        title: '8051 I/O Ports, Timers/Counters, UART & Interrupts',
        subtitle: 'P0–P3 alternate functions, TMOD/TCON timer modes, and serial communication',
        durationMin: 18,
        difficulty: 'Intermediate',
        visualType: '8051-ports-timers',
        relatedLabTab: 'interfacing',
        simpleExplanation:
          'The 8051 provides 32 I/O pins across four 8-bit ports (P0–P3). Port 0 is open-drain and needs external 10 kΩ pull-up resistors when used as general I/O (or acts as multiplexed AD0–AD7 for external memory). Port 3 carries vital alternate functions: RXD/TXD (UART), INT0\'/INT1\' (External Interrupts), T0/T1 (Counter inputs), and WR\'/RD\'. Two 16-bit Timers (T0 & T1) count internal machine cycles (Timer mode) or external pin pulses (Counter mode) to generate precise delays or UART baud rates.',
        analogy:
          'Timers T0/T1 are like digital kitchen timers that count UP from a preloaded number until they roll over from FFFFH to 0000H, ringing the TF0/TF1 bell (flag/interrupt)!',
        keyFacts: [
          'Port 0 (Pins 32–39): Open-drain; needs pull-up resistors; dual-role AD0–AD7.',
          'Port 1 (Pins 1–8): Dedicated general-purpose I/O with internal pull-ups.',
          'Port 2 (Pins 21–28): General I/O or High Address Byte (A8–A15) for external memory.',
          'Port 3 (Pins 10–17): Alternate functions RXD (P3.0), TXD (P3.1), INT0\' (P3.2), INT1\' (P3.3), T0 (P3.4), T1 (P3.5), WR\' (P3.6), RD\' (P3.7).',
          'Timer Modes (TMOD): Mode 0 (13-bit), Mode 1 (16-bit, 0000H–FFFFH), Mode 2 (8-bit Auto-Reload — standard for UART baud rate), Mode 3 (Split Timer).',
          '5 Interrupts & Vectors: INT0 (0003H), TF0 (000BH), INT1 (0013H), TF1 (001BH), Serial RI/TI (0023H).',
        ],
        interactiveHotspots: [
          { id: 'TMOD', label: 'TMOD (89H)', role: 'Timer Mode Register', details: 'Upper nibble controls Timer 1, lower nibble controls Timer 0: [GATE | C/T\' | M1 | M0].' },
          { id: 'TCON', label: 'TCON (88H)', role: 'Timer Control & Flags', details: 'TR0/TR1 start/stop timers; TF0/TF1 set to 1 automatically on timer rollover.' },
          { id: 'UART', label: 'SCON & SBUF', role: 'Full-Duplex Serial Port', details: 'Mode 1 = 8-bit UART, 1 start + 1 stop bit; Timer 1 in Mode 2 (TH1=FDH @ 11.0592 MHz) gives 9600 bps.' },
        ],
        stepByStep: [
          { step: 1, title: 'Configure TMOD', internalAction: 'MOV TMOD, #01H selects Timer 0 in 16-bit Mode 1 (Timer mode, C/T\'=0).' },
          { step: 2, title: 'Load Initial Count', internalAction: 'Load TH0/TL0 with (65536 - N) so timer rolls over after exactly N machine cycles.' },
          { step: 3, title: 'Start & Monitor TF0', internalAction: 'SETB TR0 starts counting; poll JNB TF0, $ until rollover sets TF0 = 1, then CLR TR0 and CLR TF0.' },
        ],
        realWorldApplications: [
          { domain: 'UART Telemetry', example: 'Sending sensor readings to a PC terminal at 9600 bps using Timer 1 Mode 2 (TH1 = 0FDH).' },
        ],
        examPerspective: {
          keyDefinitions: ['Auto-Reload Mode (Mode 2): 8-bit timer where TLx counts up to FFH, sets TFx, and automatically reloads from THx without software overhead.'],
          importantDiagrams: ['TMOD & TCON Bit Formats', '8051 40-Pin Diagram with Port 3 Alternate Functions'],
          likelyQuestions: [
            { marks: 10, question: 'Explain the Timer/Counter modes of 8051 with TMOD and TCON registers. Write an assembly delay routine using Timer 0 Mode 1.' },
            { marks: 5, question: 'List all 5 interrupts of 8051 with their default priorities and vector addresses.' },
          ],
        },
        quickRecap: [
          { term: 'Delay Formula', summary: 'Initial Count = 65536 − (Desired Delay ÷ 1.085 µs) in Mode 1.' },
          { term: '9600 Baud', summary: 'Crystal 11.0592 MHz → Timer 1 Mode 2 → TH1 = FDH (-3).' },
          { term: 'Port 0 Catch', summary: 'Open-drain output — always attach external 10 kΩ pull-ups for I/O.' },
        ],
      },
    ],
  },

  {
    id: 'peripherals',
    number: 'Module 05',
    title: 'Peripheral Interfacing & I/O Chips',
    shortTitle: 'Peripherals',
    description:
      'Connect microprocessors to the physical world: 8255 PPI, 8253/8254 Timer, 8259A Interrupt Controller, 8237 DMA, ADC/DAC converters, LEDs, switches, keypads, and 7-segment displays.',
    accentColor: 'amber',
    topics: [
      {
        id: 'periph-8255',
        moduleId: 'peripherals',
        order: 1,
        title: '8255 Programmable Peripheral Interface (PPI)',
        subtitle: '24 programmable I/O pins, BSR vs I/O mode, and interactive Control Word builder',
        durationMin: 16,
        difficulty: 'Intermediate',
        visualType: '8255-ppi',
        simpleExplanation:
          'The Intel 8255A PPI gives an 8085/8086 system 24 programmable I/O pins grouped into three 8-bit ports: Port A, Port B, and Port C (split into Port C Upper PC7–PC4 and Port C Lower PC3–PC0). By writing a single 8-bit Control Word to the Control Register (A1=1, A0=1), software configures every port as Input or Output across 3 operating modes: Mode 0 (Simple I/O), Mode 1 (Strobed Handshake I/O), and Mode 2 (Bidirectional Bus on Port A).',
        analogy:
          'The 8255 PPI is like a programmable patch bay: a single 8-bit blueprint (Control Word) tells each bank of 8 pins whether to listen to switches or drive LEDs/printers.',
        keyFacts: [
          'Port Addressing via A1, A0: 00 = Port A, 01 = Port B, 10 = Port C, 11 = Control Word Register.',
          'Control Word D7 = 1 → I/O Mode; D7 = 0 → BSR (Bit Set/Reset) Mode for setting/clearing individual Port C bits!',
          'Common Control Word: 80H (1000 0000) sets ALL ports (A, B, C) as Mode 0 Outputs; 90H sets Port A Input, B & C Output.',
          'Mode 2 (Bidirectional) is ONLY available on Port A (using PC3–PC7 for handshaking).',
        ],
        interactiveHotspots: [
          { id: 'PA', label: 'Port A (8-bit)', role: 'Modes 0, 1, or 2', details: 'Full latched input/output; the only port supporting bidirectional Mode 2.' },
          { id: 'PB', label: 'Port B (8-bit)', role: 'Modes 0 or 1', details: 'Ideal for driving 7-segment displays, DACs, or reading 8-bit ADC outputs.' },
          { id: 'PC', label: 'Port C (PCU + PCL)', role: 'Split 4-bit I/O or Handshake', details: 'Works as two 4-bit ports in Mode 0, BSR bit toggles, or STB\'/IBF/INTR handshake lines in Modes 1 & 2.' },
        ],
        stepByStep: [
          { step: 1, title: 'Build Control Word', internalAction: 'Set D7=1 (I/O), D6–D5=00 (PA Mode 0), D4=1 (PA In), D3=0 (PCU Out), D2=0 (PB Mode 0), D1=0 (PB Out), D0=0 (PCL Out) → 90H.' },
          { step: 2, title: 'Initialize 8255', internalAction: 'MVI A, 90H followed by OUT Control_Port_Addr.' },
          { step: 3, title: 'Transfer Data', internalAction: 'IN PortA_Addr reads switches; OUT PortB_Addr drives LEDs.' },
        ],
        realWorldApplications: [
          { domain: 'Industrial Automation', example: 'Interfacing stepper motors, matrix keypads, Centronics printers (Mode 1), and relay banks to 8085/8086.' },
        ],
        examPerspective: {
          keyDefinitions: ['BSR Mode (D7=0): Allows setting or resetting any single bit (PC0–PC7) of Port C without disturbing other bits.'],
          importantDiagrams: ['8255A Internal Block Diagram', 'I/O Mode & BSR Mode Control Word Formats'],
          likelyQuestions: [
            { marks: 10, question: 'Explain the architecture, operating modes, and Control Word format of the 8255A PPI.' },
            { marks: 5, question: 'Find the 8255 control word for Port A as Mode 0 input, Port B as Mode 0 output, and Port C as output.' },
          ],
        },
        quickRecap: [
          { term: 'D7 Bit', summary: 'D7=1 selects I/O Mode; D7=0 selects BSR Mode (Port C only).' },
          { term: '80H Control Word', summary: 'All ports (A, B, C) configured as Mode 0 Output.' },
        ],
      },
      {
        id: 'periph-timer-pic-dma',
        moduleId: 'peripherals',
        order: 2,
        title: '8253/8254 Timer, 8259A PIC & 8237 DMA Controller',
        subtitle: 'Offloading timing, multi-source interrupts, and high-speed bulk memory transfers from the CPU',
        durationMin: 16,
        difficulty: 'Advanced',
        visualType: '8259-pic',
        simpleExplanation:
          'A single CPU wastes massive time running software delay loops, polling devices, or copying kilobytes byte-by-byte. Specialized Intel support ICs offload these tasks: the 8253/8254 provides three independent 16-bit hardware counters (6 modes including Square Wave Generator Mode 3); the 8259A PIC expands 1 INTR pin into 8 prioritized interrupts (up to 64 when cascaded); and the 8237 DMA controller takes over the bus via HOLD/HLDA to copy data directly between memory and peripherals at hardware speed.',
        analogy:
          '8254 is your dedicated stopwatch, 8259A is your executive receptionist sorting 8 urgent callers by priority, and 8237 DMA is a freight courier moving boxes directly between warehouse and loading dock without bothering the manager (CPU).',
        keyFacts: [
          '8253/8254: 3 independent 16-bit down-counters (Counter 0–2), 6 modes (Mode 0 Interrupt on Terminal Count, Mode 2 Rate Generator, Mode 3 Square Wave Generator). 8254 adds Read-Back command and higher 10 MHz clock.',
          '8259A PIC: Manages 8 IR inputs (IR0–IR7) using IRR (Request), ISR (In-Service), and IMR (Mask) registers; configured via ICW1–ICW4 and OCW1–OCW3. Cascading 1 master + 8 slaves supports 64 interrupts!',
          '8237 DMA: 4 independent channels (CH0–CH3), supports Single, Block, Demand, and Cascade transfer modes using DREQ/DACK and CPU HOLD/HLDA.',
        ],
        interactiveHotspots: [
          { id: 'IRR', label: '8259A IRR / PR / ISR / IMR', role: 'Interrupt Priority Pipeline', details: 'IRR latches incoming IR0–IR7; IMR masks disabled lines; Priority Resolver picks highest unmasked request and marks ISR.' },
          { id: '8254', label: '8253/8254 Mode 3', role: 'Square Wave Generator', details: 'Reloads count N automatically; outputs HIGH for N/2 clocks and LOW for N/2 clocks.' },
          { id: '8237', label: '8237 HOLD / HLDA', role: 'Direct Memory Access', details: 'Bypasses CPU registers to transfer blocks directly between I/O and RAM in 1 bus cycle per byte.' },
        ],
        stepByStep: [
          { step: 1, title: 'DMA Request (DREQ)', internalAction: 'High-speed peripheral (e.g., disk controller) asserts DREQ to 8237.' },
          { step: 2, title: 'Bus Handover (HOLD/HLDA)', internalAction: '8237 asserts HOLD; 8085 finishes current cycle, tri-states address/data buses, and raises HLDA.' },
          { step: 3, title: 'Direct Transfer', internalAction: '8237 drives address & control lines directly, moving bytes RAM ↔ I/O until terminal count hits zero.' },
        ],
        realWorldApplications: [
          { domain: 'PC Motherboards', example: 'Legacy IBM PCs used 8254 for system clock ticks, dual cascaded 8259As for IRQ0–IRQ15, and 8237 for sound/floppy DMA.' },
        ],
        examPerspective: {
          keyDefinitions: ['ICW & OCW: Initialization Command Words (setup sequence) and Operation Command Words (runtime masking/EOI) for 8259A.'],
          importantDiagrams: ['8259A Internal Block Diagram', '8237 DMA Handshake Sequence with 8085'],
          likelyQuestions: [
            { marks: 10, question: 'Explain the architecture and priority modes of the 8259A Programmable Interrupt Controller.' },
            { marks: 5, question: 'Explain all 6 operating modes of the 8253/8254 Programmable Interval Timer.' },
          ],
        },
        quickRecap: [
          { term: '8254 Counters', summary: '3 × 16-bit down-counters; binary or BCD counting.' },
          { term: '8259A Cascade', summary: '1 Master + 8 Slaves = 64 prioritized vectored interrupts.' },
          { term: '8237 Channels', summary: '4 DMA channels using HOLD/HLDA bus arbitration.' },
        ],
      },
      {
        id: 'periph-adc-dac-led',
        moduleId: 'peripherals',
        order: 3,
        title: 'ADC/DAC, LEDs, Switches, Keypads & 7-Segment Displays',
        subtitle: 'Bridging analog voltages and human interfaces to digital microprocessor ports',
        durationMin: 15,
        difficulty: 'Beginner',
        visualType: 'led-seven-seg',
        relatedLabTab: 'interfacing',
        simpleExplanation:
          'Real-world sensors (temperature, pressure, light) produce continuous analog voltages, while microprocessors only speak binary. An ADC (like 8-bit ADC0808/0809) converts analog input into a digital byte using SOC (Start of Conversion) and EOC (End of Conversion) handshaking. Conversely, a DAC (like DAC0808) converts an 8-bit digital word into an analog current/voltage to generate waveforms. For human interaction, 7-segment displays map 7 LEDs (a–g) + decimal point (dp) to an 8-bit port byte.',
        analogy:
          'ADC is a digital thermometer turning smooth mercury height into a number; DAC is a music player turning digital MP3 numbers back into smooth speaker vibrations.',
        keyFacts: [
          '8-bit ADC Resolution (Step Size) = Vref / (2⁸ − 1) = Vref / 255 (often approximated Vref / 256; at 5V, ~19.53 mV/step).',
          'ADC0808 Handshake: Select channel (A,B,C) → pulse ALE & SOC → wait for EOC = HIGH → enable OE → read D0–D7.',
          'Common Cathode (CC) 7-Segment: Logic 1 lights a segment (digit "0" = 3FH = 0011 1111B).',
          'Common Anode (CA) 7-Segment: Logic 0 lights a segment (digit "0" = C0H = bitwise inverse of CC!).',
          '4×4 Matrix Keypad: Uses only 8 I/O pins (4 rows + 4 columns) instead of 16 via row-scanning + software debouncing (10–20 ms).',
        ],
        interactiveHotspots: [
          { id: 'CC_CA', label: 'Common Cathode vs Anode', role: '7-Segment Polarity', details: 'In CC, cathodes tie to GND so logic 1 lights segments. In CA, anodes tie to +5V so logic 0 lights segments.' },
          { id: 'ADC', label: 'ADC0808 SOC/EOC Loop', role: '8-Channel 8-bit SAR ADC', details: 'Successive Approximation takes ~100 µs; CPU polls EOC or connects EOC to an interrupt.' },
          { id: 'DAC', label: 'DAC0808 R-2R Ladder', role: 'Waveform Generator', details: 'Outputs Iout = Iref × (D/256); an op-amp I-to-V converter turns it into ramp, triangle, or sine waves.' },
        ],
        stepByStep: [
          { step: 1, title: 'Lookup 7-Segment Code', internalAction: 'To show "5" on Common Cathode (segments a,c,d,f,g = 1): binary 0110 1101 = 6DH.' },
          { step: 2, title: 'Drive Output Port', internalAction: 'MVI A, 6DH followed by OUT 01H illuminates "5" instantly.' },
          { step: 3, title: 'Scan Matrix Keypad', internalAction: 'Drive 0 on Row 0, read Columns; if Col 2 reads 0, key (0,2) is pressed. Wait 20 ms to debounce.' },
        ],
        realWorldApplications: [
          { domain: 'Digital Voltmeters & Audio', example: 'ADCs digitize battery/sensor voltages; DACs drive audio speakers and industrial actuator valves.' },
        ],
        examPerspective: {
          keyDefinitions: ['Key Debouncing: Waiting 10–20 ms after detecting a switch closure so mechanical contact bounce settles before reading.'],
          importantDiagrams: ['ADC0808 Interfacing with 8085 via 8255', '4×4 Matrix Keypad Scanning Flow', '7-Segment (a–g, dp) Segment Map'],
          likelyQuestions: [
            { marks: 5, question: 'Explain ADC0808 interfacing with 8085 showing SOC, EOC, ALE, and OE signal sequence.' },
            { marks: 5, question: 'Write an 8085 program using DAC0808 to generate a continuous sawtooth (ramp) waveform.' },
          ],
        },
        quickRecap: [
          { term: '8-bit Step Size', summary: 'Vref / 256 (5V → 19.53 mV per LSB).' },
          { term: '7-Seg CC vs CA', summary: 'CC: 1=ON ("0"=3FH). CA: 0=ON ("0"=C0H).' },
          { term: 'Keypad Pins', summary: '4×4 matrix reads 16 keys using just 8 GPIO pins.' },
        ],
      },
    ],
  },
];

export const ALL_TOPICS = LEARNING_MODULES.flatMap((m) => m.topics);
export const getTopicById = (id: string) => ALL_TOPICS.find((t) => t.id === id);
export const getModuleById = (id: string) => LEARNING_MODULES.find((m) => m.id === id);
