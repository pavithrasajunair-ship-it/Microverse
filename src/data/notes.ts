import { ModuleId } from '../types';

export interface ModuleNotes {
  moduleId: ModuleId;
  title: string;
  conciseSummary: string[];
  detailedSections: Array<{ heading: string; body: string }>;
  formulaAndTables: Array<{ label: string; expression: string; note: string }>;
  examQA: {
    twoMark: Array<{ q: string; a: string }>;
    fiveMark: Array<{ q: string; a: string }>;
    tenMark: Array<{ q: string; outline: string[] }>;
  };
  lastMinuteSheet: string[];
}

export const MODULE_NOTES: Record<ModuleId, ModuleNotes> = {
  fundamentals: {
    moduleId: 'fundamentals',
    title: 'Module 01 · Fundamentals Revision Guide',
    conciseSummary: [
      'Microprocessor (µP) = CPU only on silicon; requires external RAM, ROM, timers, and I/O chips.',
      'Microcontroller (µC) = CPU + RAM + ROM/Flash + Timers + GPIO + UART on a single IC.',
      'Von Neumann shares one bus for code & data (8085, 8086); Harvard uses separate code & data buses (8051, DSPs).',
      'RISC = fixed-length instructions, Load/Store, hardwired control, deep pipelines; CISC = variable-length, rich addressing, microprogrammed.',
    ],
    detailedSections: [
      {
        heading: 'Choosing Between µP and µC in Engineering Design',
        body: 'Select a Microprocessor when memory capacity, multitasking OS support, and raw floating-point throughput dominate (PCs, gateways). Select a Microcontroller when unit cost, deterministic microsecond pin control, low milliamp sleep currents, and minimal PCB area dominate (appliances, automotive ECUs, IoT nodes).',
      },
      {
        heading: 'Evolution of Intel x86 & Embedded Lineages',
        body: '1971 Intel 4004 (4-bit, 2,300 transistors) → 1974 Intel 8080 (8-bit) → 1976 Intel 8085 (single +5V, built-in clock & serial I/O) → 1978 Intel 8086 (16-bit, 1 MB segmented memory, pipelined BIU/EU) → 1980 Intel 8051 (classic 8-bit Harvard µC) → 80386 (32-bit protected mode) → 64-bit multicore SoCs.',
      },
    ],
    formulaAndTables: [
      { label: 'Max Addressable Memory', expression: '2^N bytes', note: 'N = address bus width (16-bit → 64 KB, 20-bit → 1 MB).' },
      { label: 'Bus Bandwidth', expression: 'Data Width (bytes) × Bus Clock (Hz)', note: 'Peak bytes transferred per second.' },
    ],
    examQA: {
      twoMark: [
        { q: 'Define Von Neumann Bottleneck.', a: 'The throughput limit caused by fetching instructions and reading/writing data over a single shared memory bus.' },
        { q: 'Give two examples each of RISC and CISC processors.', a: 'RISC: ARM Cortex-M, RISC-V (MIPS). CISC: Intel 8085, Intel 8086 (x86).' },
      ],
      fiveMark: [
        { q: 'Compare Microprocessor and Microcontroller on 6 criteria.', a: 'Compare Integration (CPU only vs SoC), Memory (external vs internal), Power (high vs low), Cost (higher system BOM vs low), Bit-handling (limited vs rich bit instructions), and Applications (PCs vs embedded control).' },
      ],
      tenMark: [
        {
          q: 'Explain Von Neumann, Harvard, RISC, and CISC architectural paradigms with block diagrams and trade-offs.',
          outline: [
            'Draw side-by-side Von Neumann (1 bus) vs Harvard (2 buses) diagrams.',
            'Explain Modified Harvard L1 I-Cache / D-Cache in modern CPUs.',
            'Tabulate 8 differences between RISC and CISC (instruction length, control unit, memory access, register count).',
          ],
        },
      ],
    },
    lastMinuteSheet: [
      '8085/8086 = Von Neumann + CISC | 8051 = Harvard + CISC | ARM = Modified Harvard + RISC.',
      'Bit-level I/O manipulation is a hallmark advantage of Microcontrollers over Microprocessors.',
    ],
  },

  '8085': {
    moduleId: '8085',
    title: 'Module 02 · Intel 8085 Master Sheet',
    conciseSummary: [
      '8-bit data bus (AD0–AD7), 16-bit address bus (64 KB: 0000H–FFFFH), +5V supply, 3 MHz internal clock (6 MHz crystal ÷ 2).',
      'Registers: A (8-bit), Flag (5 active: S,Z,AC,P,CY), B-C, D-E, H-L pairs, PC (16-bit), SP (16-bit).',
      'Flags Trap: INR/DCR preserve CY! INX/DCX affect ZERO flags! ANA sets AC=1, CY=0.',
      'Interrupt Priority: TRAP (0024H) > RST 7.5 (003CH) > RST 6.5 (0034H) > RST 5.5 (002CH) > INTR.',
    ],
    detailedSections: [
      {
        heading: 'Instruction Classification & T-State Reference',
        body: 'Data Transfer (MOV=4T, MVI=7T, LXI=10T, LDA/STA=13T) affect NO flags. Arithmetic (ADD=4T, ADI=7T, INR/DCR=4T, DAD=10T) update flags. Logical (ANA/ORA/XRA/CMP=4T, RLC/RRC=4T) clear CY or rotate bits. Branching (JMP=10T, CALL=18T, RET=10T) alter PC. Machine Control (PUSH=12T, POP=10T, OUT/IN=10T, HLT=5T).',
      },
      {
        heading: 'Demultiplexing & Machine Cycle Status Codes',
        body: 'External 74LS373 latches A0–A7 when ALE=1 in T1. Status table (IO/M\', S1, S0): Opcode Fetch = (0,1,1); Memory Read = (0,1,0); Memory Write = (0,0,1); I/O Read = (1,1,0); I/O Write = (1,0,1); Interrupt Ack = (1,1,1); Halt = (Z,0,0).',
      },
    ],
    formulaAndTables: [
      { label: 'Internal Clock Frequency', expression: 'f_clk = f_crystal / 2', note: '6.144 MHz crystal yields 3.072 MHz CPU clock.' },
      { label: 'Instruction Execution Time', expression: 'T_exec = Total T-States × (1 / f_clk)', note: 'At 3 MHz, 1 T-state = 333.33 ns.' },
      { label: 'RST n Vector Address', expression: 'Vector = n × 8 (converted to Hex)', note: 'RST 5.5 → 44d = 002CH; RST 7.5 → 60d = 003CH.' },
      { label: 'Memory Chip Address Pins', expression: 'k = log₂(Chip Size in Bytes)', note: '2KB=11, 4KB=12, 8KB=13, 16KB=14 pins.' },
    ],
    examQA: {
      twoMark: [
        { q: 'Why is AD0–AD7 multiplexed in 8085?', a: 'To save 8 IC pins so the entire processor fits in an economical 40-pin DIP package.' },
        { q: 'What is the difference between CMP R and SUB R?', a: 'Both compute A − R and set all 5 flags identically, but CMP discards the numerical result so A remains unchanged.' },
      ],
      fiveMark: [
        { q: 'Explain SIM and RIM instructions with bit formats.', a: 'SIM (D7=SOD, D6=SDE, D5=X, D4=R7.5, D3=MSE, D2=M7.5, D1=M6.5, D0=M5.5) configures interrupt masks & serial output. RIM (D7=SID, D6..D4=Pending I7.5–I5.5, D3=IE, D2..D0=Masks) reads pending interrupts & serial input.' },
      ],
      tenMark: [
        {
          q: 'Draw the complete 8085 architecture and explain Timing Diagram for LDA 2500H (13T).',
          outline: [
            'Draw ALU, Accumulator, Flags, Reg Array, IR/Decoder, Timing & Control, Interrupt & Serial blocks.',
            'Break LDA 2500H into 4 Machine Cycles: OF(4T) + MR(3T for 00H) + MR(3T for 25H) + MR(3T for data at 2500H).',
            'Sketch CLK, A15–A8, AD7–AD0, ALE, IO/M\', S1, S0, and RD\' waveforms accurately.',
          ],
        },
      ],
    },
    lastMinuteSheet: [
      'Flag Bit Map: S(7) Z(6) X(5) AC(4) X(3) P(2) X(1) CY(0).',
      'Stack grows DOWNWARD: PUSH decrements SP by 2 (High byte at SP-1, Low byte at SP-2).',
      'Always use MOV A, B + ORA C after DCX B when looping with a 16-bit counter!',
    ],
  },

  '8086': {
    moduleId: '8086',
    title: 'Module 03 · Intel 8086 Master Sheet',
    conciseSummary: [
      '16-bit CPU, 16-bit data bus, 20-bit address bus (1 MB memory: 00000H–FFFFFH).',
      'Split into BIU (Segments, IP, 20-bit Adder, 6-byte Queue) and EU (ALU, AX–DX, Pointers, 9 Flags).',
      'Physical Address = (Segment × 10H) + Offset. Default pairs: CS:IP, DS:BX/SI, SS:SP/BP, ES:DI.',
      'MN/MX\' = 1 → Minimum Mode (single CPU); MN/MX\' = 0 → Maximum Mode (8288 Bus Controller).',
    ],
    detailedSections: [
      {
        heading: 'Even & Odd Memory Banking (BHE\' and A0)',
        body: 'To read a 16-bit word in one bus cycle, 1 MB memory is split into two 512 KB banks: Even Bank (D0–D7, enabled by A0=0) and Odd Bank (D8–D15, enabled by BHE\'=0). Word access at an even address takes 1 cycle; at an odd address takes 2 cycles.',
      },
    ],
    formulaAndTables: [
      { label: '20-bit Physical Address', expression: 'PA = (Segment × 10H) + Offset', note: 'Shift 16-bit segment left 4 bits, then add 16-bit offset.' },
      { label: 'IVT Vector Pointer', expression: 'IP at (4 × N), CS at (4 × N + 2)', note: 'IVT occupies 00000H–003FFH (256 types × 4 bytes).' },
    ],
    examQA: {
      twoMark: [
        { q: 'State the role of BHE\' (Bus High Enable) in 8086.', a: 'Active-low signal that enables data transfer on the upper data bus D8–D15 (Odd memory bank).' },
      ],
      fiveMark: [
        { q: 'Compare Minimum Mode and Maximum Mode of 8086.', a: 'Minimum (MN/MX\'=Vcc): single processor, 8086 directly generates ALE, RD\', WR\', DEN\', DT/R\', HOLD/HLDA. Maximum (MN/MX\'=GND): multiprocessor/8087 support, pins 24–31 output S0\'–S2\' status to 8288 Bus Controller + RQ\'/GT\'.' },
      ],
      tenMark: [
        {
          q: 'Explain 8086 Architecture, Segmentation, and Addressing Modes with examples.',
          outline: [
            'Draw BIU + 6-byte queue + EU block diagram.',
            'Show 20-bit physical address calculation with a numeric example.',
            'Explain Register, Immediate, Direct, Register Indirect, Based, Indexed, and Based-Indexed addressing.',
          ],
        },
      ],
    },
    lastMinuteSheet: [
      'Control Flags: TF (Trap), IF (Interrupt), DF (Direction). Status Flags: CF, PF, AF, ZF, SF, OF.',
      '8086 Queue = 6 bytes; flushes on JMP, CALL, RET, INT.',
    ],
  },

  '8051': {
    moduleId: '8051',
    title: 'Module 04 · Intel 8051 Master Sheet',
    conciseSummary: [
      '8-bit Harvard Microcontroller: 4 KB ROM, 128B Internal RAM, 21 SFRs, 4 I/O Ports (32 pins), 2 × 16-bit Timers, Full-Duplex UART.',
      'Internal RAM: 00–1FH (4 Banks R0–R7), 20–2FH (128 Bit-Addressable bits), 30–7FH (Scratchpad).',
      'Stack starts at SP = 07H and grows UPWARD (PUSH increments SP).',
      '1 Machine Cycle = 12 Oscillator clocks (1.085 µs @ 11.0592 MHz).',
    ],
    detailedSections: [
      {
        heading: 'Port 3 Alternate Functions (Must Memorize)',
        body: 'P3.0=RXD, P3.1=TXD, P3.2=INT0\', P3.3=INT1\', P3.4=T0, P3.5=T1, P3.6=WR\', P3.7=RD\'. Writing 1 to a port latch configures that pin as an input.',
      },
    ],
    formulaAndTables: [
      { label: 'Machine Cycle Period', expression: 'T_MC = 12 / f_osc', note: 'At 11.0592 MHz → 1.085 µs; at 12 MHz → 1.000 µs.' },
      { label: 'Timer Mode 1 Preload', expression: 'Count = 65536 − (Delay / T_MC)', note: 'Convert Count to 4-digit Hex → THx (high), TLx (low).' },
      { label: 'UART Mode 1 Baud Rate', expression: 'Baud = (f_osc / 384) / (256 − TH1)', note: 'With SMOD=0, 11.0592 MHz: TH1 = FDH (−3) gives 9600 bps.' },
    ],
    examQA: {
      twoMark: [
        { q: 'What is the role of EA\' (Pin 31) in 8051?', a: 'External Access: connect to +5V to execute internal 4 KB ROM; ground (0V) to fetch all code from external ROM.' },
      ],
      fiveMark: [
        { q: 'Explain the 5 interrupt sources of 8051 with vector addresses and IE/IP control.', a: 'Priority: INT0 (0003H) > TF0 (000BH) > INT1 (0013H) > TF1 (001BH) > Serial RI/TI (0023H). Enabled via IE (A8H, EA global bit D7) and prioritized via IP (B8H).' },
      ],
      tenMark: [
        {
          q: 'Draw the 8051 Internal Architecture and explain Internal RAM, SFRs, and Timer Mode 1 programming.',
          outline: [
            'Draw CPU, 4KB ROM, 128B RAM, Timers T0/T1, UART, Bus Control, and P0–P3.',
            'Sketch 00H–7FH RAM partition + key SFR addresses.',
            'Show TMOD (89H) bit fields and write a 10 ms Timer 0 Mode 1 delay routine.',
          ],
        },
      ],
    },
    lastMinuteSheet: [
      'Port 0 = Open Drain (needs 10 kΩ pull-ups for I/O).',
      '11.0592 MHz crystal → TH1 = FDH for 9600 bps, FAH for 4800 bps.',
    ],
  },

  peripherals: {
    moduleId: 'peripherals',
    title: 'Module 05 · Peripheral Interfacing Master Sheet',
    conciseSummary: [
      '8255A PPI: 3 ports (PA, PB, PC = 24 pins); D7=1 I/O Mode (Modes 0/1/2), D7=0 BSR Mode (Port C bit toggle).',
      '8253/8254 PIT: Three 16-bit counters, 6 modes (Mode 2 Rate Gen, Mode 3 Square Wave).',
      '8259A PIC: 8 IR lines (cascades to 64), IRR/ISR/IMR registers, configured via ICW1–4 & OCW1–3.',
      '8237 DMA: 4 channels, takes bus via HOLD/HLDA for CPU-free RAM ↔ I/O block transfer.',
    ],
    detailedSections: [
      {
        heading: 'ADC0808 & DAC0808 Interfacing Essentials',
        body: 'ADC0808 has 8 analog channels (IN0–IN7) selected by ADD A/B/C + ALE. Assert SOC to start SAR conversion, wait for EOC=1, raise OE to read digital output. DAC0808 outputs proportional current I_out = I_ref × (D/256) converted to voltage via op-amp.',
      },
    ],
    formulaAndTables: [
      { label: '8-bit ADC/DAC Step Size', expression: 'ΔV = V_ref / 256', note: 'At V_ref = 5.0 V, step size ≈ 19.53 mV.' },
      { label: '8254 Square Wave Count', expression: 'N = f_in / f_out', note: 'Load N into Mode 3 counter for f_out square wave.' },
    ],
    examQA: {
      twoMark: [
        { q: 'Distinguish between Common Cathode and Common Anode 7-segment displays.', a: 'Common Cathode ties all LED cathodes to GND (Logic 1 = ON); Common Anode ties all anodes to +5V (Logic 0 = ON).' },
      ],
      fiveMark: [
        { q: 'Explain the I/O and BSR Control Word formats of 8255A with an example of each.', a: 'I/O (D7=1): D6–D5=PA mode, D4=PA dir, D3=PCU dir, D2=PB mode, D1=PB dir, D0=PCL dir. BSR (D7=0): D3–D1=bit select (000–111), D0=Set(1)/Reset(0).' },
      ],
      tenMark: [
        {
          q: 'Interface an 8255A PPI, 7-segment display, and 4×4 matrix keypad with the 8085 microprocessor.',
          outline: [
            'Draw address decoding for 8255 CS\' and A1/A0 port mapping.',
            'Assign Port A (outputs) to 7-segment display and Port C (PCU rows, PCL cols) to 4×4 keypad.',
            'Write initialization control word and row-scan + 20 ms debounce algorithm.',
          ],
        },
      ],
    },
    lastMinuteSheet: [
      '8255 Control Words: 80H (all out), 90H (PA in, PB/PC out), 9BH (all in).',
      '8259A Registers: IRR (pending), ISR (active), IMR (masked).',
    ],
  },
};

export interface Flashcard {
  id: string;
  moduleId: ModuleId;
  front: string;
  back: string;
}

export const FLASHCARDS: Flashcard[] = [
  { id: 'fc-1', moduleId: 'fundamentals', front: 'What is the Von Neumann Bottleneck?', back: 'Instructions and data share a single bus, preventing simultaneous opcode fetch and data read/write.' },
  { id: 'fc-2', moduleId: '8085', front: 'Which flags does INR / DCR affect on 8085?', back: 'Updates S, Z, AC, and P — intentionally does NOT affect Carry (CY)!' },
  { id: 'fc-3', moduleId: '8085', front: 'Which flags do INX / DCX affect on 8085?', back: 'NONE! Zero flags are affected. Always use MOV A, B + ORA C before JNZ.' },
  { id: 'fc-4', moduleId: '8085', front: 'List 8085 hardware interrupt vector addresses in priority order.', back: 'TRAP (0024H) > RST 7.5 (003CH) > RST 6.5 (0034H) > RST 5.5 (002CH) > INTR (External).' },
  { id: 'fc-5', moduleId: '8085', front: 'What is the purpose of ALE (Pin 30)?', back: 'Address Latch Enable pulses HIGH during T1 to strobe A0–A7 from AD0–AD7 into external 74LS373 latch.' },
  { id: 'fc-6', moduleId: '8086', front: 'How does the 8086 BIU compute a 20-bit Physical Address?', back: 'Physical Address = (16-bit Segment Register × 10H) + 16-bit Offset.' },
  { id: 'fc-7', moduleId: '8086', front: 'What are the 3 Control Flags in 8086?', back: 'TF (Trap/Single-Step), IF (Interrupt Enable), and DF (String Direction).' },
  { id: 'fc-8', moduleId: '8051', front: 'How is the 8051 128-byte Internal RAM partitioned?', back: '00H–1FH: 4 Register Banks (R0–R7); 20H–2FH: 16B Bit-Addressable (128 bits); 30H–7FH: 80B Scratchpad.' },
  { id: 'fc-9', moduleId: '8051', front: 'Which direction does the 8051 stack grow?', back: 'UPWARD! SP resets to 07H; PUSH increments SP first (to 08H) and writes data.' },
  { id: 'fc-10', moduleId: 'peripherals', front: 'What does D7 control in the 8255A Control Word?', back: 'D7 = 1 selects I/O Mode (Modes 0/1/2); D7 = 0 selects BSR Mode (individual Port C bit Set/Reset).' },
  { id: 'fc-11', moduleId: 'peripherals', front: 'How many interrupts can cascaded 8259A controllers handle?', back: 'Up to 64 prioritized interrupts (1 Master + 8 Slave 8259As).' },
  { id: 'fc-12', moduleId: 'peripherals', front: 'Common Cathode "0" is 3FH. What is Common Anode "0"?', back: 'C0H (exact bitwise 1\'s complement of 3FH).' },
];

export interface VivaPrompt {
  id: string;
  moduleId: ModuleId;
  question: string;
  hint: string;
  modelAnswer: string;
  keyPoints: string[];
}

export const VIVA_PROMPTS: VivaPrompt[] = [
  {
    id: 'viva-1',
    moduleId: '8085',
    question: 'Why does the 8085 have an 8-bit data bus yet a 16-bit address bus?',
    hint: 'Consider how much memory an 8-bit address bus could access versus practical program sizes.',
    modelAnswer: 'An 8-bit address bus could only address 2⁸ = 256 bytes, which is far too tiny for programs. A 16-bit address bus expands addressable memory to 2¹⁶ = 64 KB while keeping the ALU and data paths compact at 8 bits.',
    keyPoints: ['2⁸ = 256 bytes too small', '2¹⁶ = 65,536 bytes (64 KB)', 'Compact 8-bit ALU + multiplexed AD0–AD7'],
  },
  {
    id: 'viva-2',
    moduleId: '8085',
    question: 'Explain why a 6 MHz crystal produces a 3 MHz clock inside the 8085.',
    hint: 'Think about the duty cycle required for reliable synchronous digital logic.',
    modelAnswer: 'The 8085 contains an internal divide-by-2 flip-flop driven by X1/X2. Dividing the crystal frequency by 2 guarantees a clean, symmetrical 50% duty cycle internal clock.',
    keyPoints: ['Internal divide-by-2 circuit', 'Guarantees exact 50% duty cycle'],
  },
  {
    id: 'viva-3',
    moduleId: '8086',
    question: 'If the 8086 prefetches 6 bytes into its queue, why isn\'t execution always 100% bus-wait free?',
    hint: 'Think about branch instructions and instructions that access large amounts of memory.',
    modelAnswer: 'Whenever a branch instruction (JMP, CALL, RET, INT) occurs, the prefetched sequential bytes are discarded (queue flush), forcing the EU to wait while the BIU fetches from the new target address.',
    keyPoints: ['Queue flush on branches', 'Sequential prefetch invalidated on JMP/CALL'],
  },
  {
    id: 'viva-4',
    moduleId: '8051',
    question: 'Why do engineers almost universally pair an 8051 with an 11.0592 MHz crystal instead of a neat 12 MHz crystal?',
    hint: 'Calculate 11,059,200 ÷ 12 ÷ 32 ÷ 9600.',
    modelAnswer: '11.0592 MHz divides cleanly by 12 (machine cycle) and 32 (UART prescaler) to give 28,800 Hz, which divides by 3 (TH1 = FDH) to produce an exact 9600 bps serial baud rate with 0% timing error.',
    keyPoints: ['11.0592 MHz ÷ 12 ÷ 32 = 28,800 Hz', 'Exact 9600 / 4800 / 2400 baud rates', 'Zero UART framing error'],
  },
  {
    id: 'viva-5',
    moduleId: 'peripherals',
    question: 'Why is DMA (8237) dramatically faster than interrupt-driven I/O for transferring a 4 KB block from disk to RAM?',
    hint: 'Count how many instructions the CPU executes per byte in an ISR versus DMA.',
    modelAnswer: 'Interrupt-driven I/O saves registers, enters an ISR, reads a byte into A, writes it to RAM, increments a pointer, and executes RET for every single byte. DMA takes over the bus via HOLD/HLDA and transfers bytes directly between peripheral and RAM in a single hardware bus cycle without CPU instruction overhead.',
    keyPoints: ['Bypasses CPU registers & instruction fetch', 'Uses HOLD/HLDA arbitration', 'Direct I/O ↔ RAM transfer'],
  },
];
