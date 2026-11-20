export interface SyllabusTerm {
  term: string;
  definition: string;
}

export interface WorkedExample {
  title: string;
  problem: string;
  steps: string[];
  finalAnswer: string;
}

export interface UniversityQuestion {
  marks: 2 | 5 | 10 | 15;
  question: string;
  modelAnswer: string;
}

export interface TopicSyllabusTheory {
  introduction: string;
  whyNeeded: string;
  workingPrinciple: string[];
  architectureDetails: string;
  terminology: SyllabusTerm[];
  advantages: string[];
  limitations: string[];
  comparisonTable: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  workedExamples: WorkedExample[];
  universityQuestions: UniversityQuestion[];
}

export const SYLLABUS_THEORY: Record<string, TopicSyllabusTheory> = {
  'fund-up-vs-uc': {
    introduction:
      'A Microprocessor (µP) is a VLSI programmable central processing unit fabricated on a single semiconductor die containing the Arithmetic Logic Unit (ALU), Control Unit (CU), and internal registers, while relying on external chips for RAM, ROM, timers, and I/O interfaces. A Microcontroller (µC) integrates that CPU core together with on-chip Flash/ROM, SRAM, timers/counters, interrupt controllers, serial UART/SPI/I2C engines, and programmable GPIO ports onto a single integrated circuit.',
    whyNeeded:
      'General-purpose computers require massive, expandable memory and flexible I/O subsystems, which a standalone microprocessor delivers through wide external buses. Conversely, mass-produced embedded products (appliances, automotive ECUs, medical sensors) demand minimum PCB area, low bill-of-materials cost, deterministic real-time I/O response, and milliwatt power envelopes—making a single-chip microcontroller essential.',
    workingPrinciple: [
      'In a microprocessor-based microcomputer (such as an 8085 or 8086 board), every instruction fetch, memory read/write, and peripheral access travels over external Address, Data, and Control buses. Support ICs such as 74LS373 latches, 74LS138 decoders, 2732 EPROMs, 6264 SRAMs, and 8255 PPIs must be wired externally.',
      'In a microcontroller (such as the Intel 8051 or ARM Cortex-M), instruction memory (ROM/Flash) and data memory (SRAM) sit directly beside the CPU on the same silicon die. Dedicated internal buses connect the ALU to Special Function Registers (SFRs) that directly control on-chip timers, ADCs, and physical I/O pins—allowing single-cycle bit manipulation (e.g., SETB P1.0) without external bus cycles.',
    ],
    architectureDetails:
      'Microprocessors typically adopt Von Neumann unified memory maps with high external pin allocation for 16–32 bit address/data buses. Microcontrollers predominantly employ Harvard architecture with separate code and data pathways, dedicating 60–80% of package pins directly to multifunctional GPIO and peripheral signals.',
    terminology: [
      { term: 'VLSI (Very Large Scale Integration)', definition: 'Integrating tens of thousands to billions of transistors onto a single silicon die.' },
      { term: 'GPIO (General Purpose I/O)', definition: 'Digital IC pins dynamically configurable in software as logic inputs or outputs.' },
      { term: 'SFR (Special Function Register)', definition: 'Memory-mapped control registers inside a microcontroller that configure internal peripherals.' },
      { term: 'Glue Logic', definition: 'External latches, buffers, and address decoders needed to connect memory and I/O chips to a microprocessor.' },
    ],
    advantages: [
      'Microprocessors offer virtually unlimited external RAM/ROM expandability and higher clock frequencies for heavy compute workloads.',
      'Microcontrollers slash PCB size, wiring complexity, power consumption, and unit manufacturing cost for dedicated embedded systems.',
      'Microcontrollers provide native single-bit boolean instructions and deterministic hardware interrupt latency.',
    ],
    limitations: [
      'Microprocessor systems require multi-chip PCBs, higher power budgets, and complex address decoding circuitry.',
      'Microcontrollers have fixed, modest on-chip RAM/Flash capacities and are unsuitable for running full desktop operating systems.',
    ],
    comparisonTable: {
      title: 'Microprocessor (µP) vs Microcontroller (µC)',
      headers: ['Parameter', 'Microprocessor (8085 / 8086)', 'Microcontroller (8051 / AVR)'],
      rows: [
        ['On-Chip Components', 'CPU only (ALU, CU, Registers)', 'CPU + RAM + ROM + Timers + UART + GPIO'],
        ['Architecture', 'Usually Von Neumann (shared bus)', 'Usually Harvard (separate code/data buses)'],
        ['External Glue Logic', 'Mandatory (latches, decoders, PPI)', 'Minimal or zero external ICs required'],
        ['Power Consumption', 'Higher (external bus switching)', 'Very low (supports idle & power-down modes)'],
        ['Bit-Level I/O', 'Limited (byte-wise mask & write)', 'Native bit-addressable pins & RAM'],
        ['Typical Cost & Size', 'Higher system cost, larger PCB', 'Low unit cost, compact single-IC footprint'],
      ],
    },
    workedExamples: [
      {
        title: 'System Component Sizing Selection',
        problem: 'An engineering team is designing (a) a battery-powered smart digital thermometer requiring 16 KB code, 1 KB RAM, 1 ADC, and 12 GPIO pins, and (b) an industrial workstation needing 2 GB RAM and multi-monitor graphics. Choose µP or µC for each and justify.',
        steps: [
          'Evaluate (a): 16 KB Flash + 1 KB SRAM + on-chip ADC + 12 GPIOs fit entirely inside a $1 microcontroller with microamp sleep modes.',
          'Evaluate (b): 2 GB external DRAM, PCIe peripherals, and multi-tasking OS demand a high-speed microprocessor with MMU and wide external memory controllers.',
        ],
        finalAnswer: '(a) Microcontroller (µC) for low power, integration, and BOM cost; (b) Microprocessor (µP) for external memory bandwidth and OS support.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Define a microprocessor and state why external latches are required around an 8085.',
        modelAnswer: 'A microprocessor is a single-chip programmable CPU containing ALU, Control Unit, and registers without integrated RAM/ROM/I/O. External latches (e.g., 74LS373) are required to demultiplex AD0–AD7 using ALE so lower address lines remain stable throughout T2–T3.',
      },
      {
        marks: 5,
        question: 'Compare microprocessors and microcontrollers across at least six engineering parameters.',
        modelAnswer: 'Present a structured 6-row table covering silicon integration, bus architecture (Von Neumann vs Harvard), external hardware overhead, power consumption, bit-manipulation instructions, cost, and real-world applications (e.g., 8085/8086 vs 8051).',
      },
      {
        marks: 10,
        question: 'Draw neat block diagrams of a microprocessor-based system and a single-chip microcontroller, explaining how instruction execution and I/O interfacing differ between them.',
        modelAnswer: 'Sketch (1) µP connected via external Address/Data/Control buses to external EPROM, SRAM, and 8255 PPI; (2) µC single die enclosing CPU, internal ROM, RAM, Timers, Serial, and P0–P3. Detail external machine cycles vs internal SFR access and real-time embedded suitability.',
      },
      {
        marks: 15,
        question: 'Critically analyze the architectural evolution from early 4-bit microprocessors to modern microcontrollers and SoCs, explaining how bus integration, memory technology, and application domains drove the split between µP and µC families.',
        modelAnswer: 'Cover 4004 (4-bit) → 8080/8085 (8-bit) → 8086 (16-bit) → 80386/Pentium (32/64-bit) alongside the embedded branch (8048 → 8051 → AVR/PIC → ARM Cortex-M). Contrast general-purpose compute scaling vs embedded cost/power optimization with block diagrams and application case studies.',
      },
    ],
  },

  'fund-von-harvard': {
    introduction:
      'Computer memory organization follows two foundational paradigms: Von Neumann (Princeton) architecture, where program instructions and data reside in one unified memory accessed over a single system bus, and Harvard architecture, which physically separates Program Memory and Data Memory with independent address and data buses.',
    whyNeeded:
      'As processor clock frequencies increased, sharing a single bus for both opcode fetching and operand transfers created a severe performance ceiling known as the Von Neumann Bottleneck. Separating code and data pathways eliminates bus contention and allows single-cycle pipelined execution in microcontrollers and DSPs.',
    workingPrinciple: [
      'In Von Neumann machines (Intel 8085, 8086), the CPU executes sequentially: first it drives the shared address bus to fetch an instruction byte; only after that cycle finishes can it reuse the same bus to read or write data.',
      'In Harvard machines (Intel 8051, AVR, TMS320 DSPs), the Control Unit fetches the next instruction across the Program Bus at the exact same clock edge that the ALU reads or writes an operand across the Data Bus. Moreover, instruction word width (e.g., 14-bit or 16-bit Flash) does not even have to match data word width (8-bit SRAM).',
    ],
    architectureDetails:
      'Modern high-performance CPUs employ Modified Harvard Architecture: unified main DRAM externally (Von Neumann flexibility) paired with physically split on-chip L1 Instruction Cache (I-Cache) and L1 Data Cache (D-Cache) directly feeding the execution pipelines.',
    terminology: [
      { term: 'Von Neumann Bottleneck', definition: 'Throughput degradation caused when instruction fetches and data transfers contend for the same single memory bus.' },
      { term: 'Unified Memory Space', definition: 'A single address range (e.g., 0000H–FFFFH in 8085) containing both machine opcodes and runtime variables.' },
      { term: 'Modified Harvard Architecture', definition: 'Hybrid design using split L1 instruction/data caches backed by a single unified L2/main memory.' },
      { term: 'Program Store Enable (PSEN\')', definition: 'Dedicated 8051 control pin that reads external Code ROM separately from RD\'/WR\' Data RAM accesses.' },
    ],
    advantages: [
      'Von Neumann simplifies PCB routing, lowers pin count, and lets memory dynamically hold either code or data.',
      'Harvard doubles effective memory bandwidth by overlapping instruction fetch and data access simultaneously.',
      'Harvard inherently protects code Flash from accidental runtime data overwrites.',
    ],
    limitations: [
      'Von Neumann suffers bus saturation when instructions require frequent memory operands.',
      'Pure Harvard cannot easily load dynamic programs into Data RAM and requires extra silicon buses and pins.',
    ],
    comparisonTable: {
      title: 'Von Neumann vs Harvard Architecture',
      headers: ['Feature', 'Von Neumann (Princeton)', 'Harvard Architecture'],
      rows: [
        ['Memory Organization', 'Single shared memory for code & data', 'Physically separate Program & Data memories'],
        ['Bus Count', 'One shared Address/Data bus', 'Two independent Address/Data buses'],
        ['Simultaneous Fetch + Data', 'Not possible (serialized)', 'Yes — parallel in single clock cycle'],
        ['Hardware Complexity', 'Lower pin count & simpler control', 'Higher internal bus & pin complexity'],
        ['Word Width Flexibility', 'Code and data must share word width', 'Code bus width can differ from data bus width'],
        ['Examples', 'Intel 8085, 8086, classic mainframes', 'Intel 8051, AVR, PIC, Audio DSPs'],
      ],
    },
    workedExamples: [
      {
        title: 'Bus Cycle Throughput Comparison',
        problem: 'A CPU executes an instruction that requires 1 opcode fetch and 1 data read from memory. Each memory access takes 1 bus cycle. Compare total cycles for executing 100 such instructions on a non-pipelined Von Neumann CPU vs a pipelined Harvard CPU.',
        steps: [
          'Von Neumann: Each instruction needs 1 cycle for Fetch + 1 cycle for Data Read = 2 cycles/instruction → 100 × 2 = 200 cycles.',
          'Harvard: Cycle 1 fetches Instruction 1. From Cycle 2 onward, Instruction k data read overlaps with Instruction k+1 fetch → 100 + 1 = 101 cycles.',
          'Speedup = 200 / 101 ≈ 1.98× throughput improvement.',
        ],
        finalAnswer: 'Von Neumann: 200 cycles | Harvard: 101 cycles (~1.98× faster bus utilization).',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'What is the Von Neumann bottleneck? Give one architectural solution.',
        modelAnswer: 'It is the throughput limitation arising when a CPU uses one shared memory bus for both instruction fetches and data transfers, forcing them to occur sequentially. Solutions include Harvard split buses, instruction prefetch queues (8086), or split L1 I/D caches.',
      },
      {
        marks: 5,
        question: 'Differentiate between Von Neumann and Harvard architectures with neat labeled block diagrams.',
        modelAnswer: 'Draw CPU ↔ Shared Bus ↔ Unified Memory vs Program ROM ↔ CPU ↔ Data RAM. Compare across 6 criteria: memory banks, bus count, simultaneous access, pin complexity, self-modifying code capability, and classic chip examples (8085 vs 8051).',
      },
      {
        marks: 10,
        question: 'Explain how the Intel 8051 implements Harvard architecture using PSEN\', RD\', WR\', and EA\', and contrast this with how Intel 8085 accesses its 64 KB unified address space.',
        modelAnswer: 'Show 8085 using IO/M\', RD\', WR\' across one 64 KB address map (0000H–FFFFH). Show 8051 maintaining separate 64 KB external Code ROM (strobed by PSEN\') and 64 KB external Data RAM (strobed by RD\'/WR\'), plus internal 128B RAM and 4KB ROM selected by EA\'.',
      },
      {
        marks: 15,
        question: 'Analyze Von Neumann, pure Harvard, and Modified Harvard architectures in terms of bus bandwidth, cache coherence, security against code injection, and suitability for real-time DSP vs general-purpose computing.',
        modelAnswer: 'Detail bus cycle timing equations, explain why DSP MAC (Multiply-Accumulate) loops require dual simultaneous fetches, explain how modern x86/ARM CPUs blend split L1 caches with unified DRAM (Modified Harvard), and evaluate hardware cost vs execution efficiency.',
      },
    ],
  },

  'fund-risc-cisc': {
    introduction:
      'Instruction Set Architecture (ISA) design divides into two classic philosophies: CISC (Complex Instruction Set Computer), which provides rich, multi-cycle, variable-length instructions capable of direct memory operations, and RISC (Reduced Instruction Set Computer), which restricts memory access to explicit LOAD/STORE instructions while executing fixed-length register-to-register instructions in a single pipelined clock cycle.',
    whyNeeded:
      'In the 1970s, RAM was slow and expensive, so CISC designers (8085, 8086, VAX) packed complex tasks into compact instructions to reduce memory fetches. By the 1980s, fast on-chip silicon and optimizing compilers revealed that 80% of executed programs used only 20% of instructions—sparking RISC designs optimized for deep hardware pipelining and high clock speeds.',
    workingPrinciple: [
      'CISC processors decode variable-length instructions (1–6 bytes in 8086) using a Microprogrammed Control Unit storing micro-routines in an internal Control ROM. A single instruction like string move (REP MOVSB) or memory addition invokes dozens of internal micro-steps.',
      'RISC processors enforce fixed-width instructions (typically 32 bits), minimal addressing modes, a large orthogonal register file (16–32 registers), and Hardwired Control logic. Because every instruction follows identical Fetch → Decode → Execute → Memory → Writeback stages, a 5-stage pipeline retires 1 instruction per clock cycle (CPI ≈ 1).',
    ],
    architectureDetails:
      'Evolution spans 5 generations: 1st Gen 4-bit Intel 4004 (1971, PMOS, 740 kHz) → 2nd Gen 8-bit 8008/8080/8085 (NMOS, 3–5 MHz) → 3rd Gen 16-bit 8086/80286 (HMOS, 1 MB segmented) → 4th Gen 32-bit 80386/80486 (virtual memory, on-chip cache) → 5th Gen 64-bit multicore superscalar x86-64, ARMv9, and RISC-V.',
    terminology: [
      { term: 'Load/Store Architecture', definition: 'ISA rule where only dedicated LOAD and STORE instructions touch memory; ALU operates strictly on CPU registers.' },
      { term: 'CPI (Cycles Per Instruction)', definition: 'Average number of clock cycles needed to execute one instruction; RISC targets CPI ≈ 1.' },
      { term: 'Hardwired Control', definition: 'Control signals generated directly by fast combinational logic gates rather than microcode ROM.' },
      { term: 'Microcode (Microprogramming)', definition: 'Internal low-level ROM routines translating complex CISC opcodes into sequences of elementary register transfers.' },
    ],
    advantages: [
      'CISC yields compact code density and simpler assembly programming with fewer instructions per task.',
      'RISC achieves predictable single-cycle pipelining, simpler silicon decoders, lower heat/watt, and higher clock scalability.',
    ],
    limitations: [
      'CISC variable-length decoding complicates deep pipelining and consumes larger control-unit die area.',
      'RISC requires more instructions per program (larger code size) and relies heavily on smart compiler register allocation.',
    ],
    comparisonTable: {
      title: 'RISC vs CISC Architecture Comparison',
      headers: ['Criteria', 'CISC (8085 / 8086 / x86)', 'RISC (ARM / RISC-V / MIPS)'],
      rows: [
        ['Instruction Length', 'Variable (1 to 6+ bytes)', 'Fixed (commonly 32 bits)'],
        ['Memory Access', 'Memory-to-memory & reg-mem ops', 'Strict Load/Store architecture'],
        ['Control Unit', 'Microprogrammed (Control ROM)', 'Hardwired combinational logic'],
        ['Register Set', 'Small specialized set (A, B, C...)', 'Large uniform bank (16–32 regs)'],
        ['Addressing Modes', 'Many complex modes (8–12+)', 'Few simple modes (3–5)'],
        ['Pipelining & CPI', 'Harder to pipeline; CPI 2–15', 'Deep uniform pipeline; CPI ≈ 1'],
      ],
    },
    workedExamples: [
      {
        title: 'CPU Execution Time Calculation (Iron Law of Performance)',
        problem: 'A benchmark compiles to 1,000 instructions on a CISC processor (average CPI = 4.0, clock = 2 GHz) and 1,600 instructions on a RISC processor (average CPI = 1.2, clock = 2.4 GHz). Which processor finishes faster?',
        steps: [
          'Formula: Execution Time = (Instruction Count × CPI) / Clock Frequency.',
          'CISC Time = (1,000 × 4.0) / (2.0 × 10⁹) = 4,000 / 2×10⁹ = 2.00 µs.',
          'RISC Time = (1,600 × 1.2) / (2.4 × 10⁹) = 1,920 / 2.4×10⁹ = 0.80 µs.',
          'Speedup = 2.00 / 0.80 = 2.5× faster on the RISC core despite 60% more instructions.',
        ],
        finalAnswer: 'RISC completes in 0.80 µs vs CISC in 2.00 µs (2.5× faster).',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Define Load/Store architecture and name two processor families that use it.',
        modelAnswer: 'In a Load/Store architecture, only explicit LOAD and STORE instructions access RAM; all arithmetic and logic instructions operate exclusively on internal CPU registers. Examples: ARM and RISC-V (or MIPS).',
      },
      {
        marks: 5,
        question: 'Compare RISC and CISC processors across six architectural criteria.',
        modelAnswer: 'Compare instruction format (fixed vs variable), addressing modes, control unit (hardwired vs microcode), register file size, pipelining efficiency/CPI, and compiler complexity with examples.',
      },
      {
        marks: 10,
        question: 'Trace the generation-wise evolution of microprocessors from 1st Generation (4-bit) to 5th Generation (64-bit), detailing word length, semiconductor technology, addressing capacity, and architectural breakthroughs.',
        modelAnswer: 'Detail 1st Gen (4004, 4-bit PMOS), 2nd Gen (8080/8085, 8-bit NMOS, 64KB), 3rd Gen (8086, 16-bit HMOS, 1MB pipelined), 4th Gen (80386/486, 32-bit CMOS, 4GB paged/cached), and 5th Gen (Pentium/x86-64/ARM64 superscalar multicore).',
      },
      {
        marks: 15,
        question: 'Explain why modern desktop x86-64 CPUs internally translate CISC instructions into RISC-like micro-operations (µops). Derive the CPU performance equation and analyze instruction count, CPI, and clock-rate trade-offs.',
        modelAnswer: 'Present the Iron Law (T = IC × CPI / f_clk), explain binary backward compatibility of x86 CISC code density combined with out-of-order superscalar RISC execution backends (µop cache, register renaming, deep pipelines), and walk through a numerical CPI comparison.',
      },
    ],
  },

  '8085-architecture': {
    introduction:
      'The Intel 8085A is an 8-bit general-purpose NMOS microprocessor packaged in a 40-pin DIP operating from a single +5 V power supply at up to 3 MHz (5 MHz for 8085A-2). Its architecture features an 8-bit ALU, an 8-bit internal data bus, a 16-bit address bus supporting 64 KB of memory, 6 general-purpose registers, a 16-bit Program Counter, a 16-bit Stack Pointer, an Interrupt Control block, and a Serial I/O controller.',
    whyNeeded:
      'The earlier Intel 8080 required three supply voltages (+5V, -5V, +12V) and two external support chips (8224 clock generator and 8228 system controller). The 8085 integrated the clock oscillator, system controller, and vectored interrupts on-chip while needing only a single +5 V rail—simplifying industrial and academic system design.',
    workingPrinciple: [
      'Every functional unit attaches to the bidirectional 8-bit Internal Data Bus. To execute an instruction, the Program Counter (PC) drives a 16-bit address out through the Address Buffer (A15–A8) and Address/Data Buffer (AD7–AD0). The fetched 8-bit opcode enters the Instruction Register (IR) and feeds the Instruction Decoder.',
      'The Instruction Decoder activates the Timing and Control Unit, which generates synchronized internal register strobes and external control pins (ALE, RD\', WR\', IO/M\', S1, S0). During ALU instructions, one operand arrives from the Accumulator (A) and the second arrives via the Temporary Register (TMP), preventing bus conflicts while the result writes back to A and latches the 5 Flag flip-flops.',
      'The Register Array holds 6 programmable 8-bit registers (B, C, D, E, H, L) usable as 16-bit pairs (BC, DE, HL), plus invisible W and Z temporary registers used internally during multi-byte operations like CALL, JMP, and XCHG, alongside an internal 16-bit Incrementer/Decrementer dedicated to PC and SP updates.',
    ],
    architectureDetails:
      'Data width: 8 bits; Address width: 16 bits (2¹⁶ = 65,536 bytes = 64 KB); I/O addressing: 8-bit port space (256 input + 256 output ports); Internal Clock = Crystal ÷ 2 (6.144 MHz crystal → 3.072 MHz operating frequency, T = 325.5 ns).',
    terminology: [
      { term: 'Accumulator (A)', definition: 'Primary 8-bit register hardwired to one ALU input and receiving ALU results and IN/OUT port transfers.' },
      { term: 'Program Counter (PC)', definition: '16-bit pointer that always stores the memory address of the next instruction byte to be fetched.' },
      { term: 'Stack Pointer (SP)', definition: '16-bit register holding the address of the Top of Stack in read/write RAM (grows downward on PUSH).' },
      { term: 'W & Z Registers', definition: 'Two internal 8-bit temporary registers invisible to the programmer, used by the CPU to hold 16-bit addresses during CALL/LDA/XCHG.' },
      { term: 'Instruction Register (IR)', definition: '8-bit latch that captures the fetched opcode byte and presents it continuously to the Instruction Decoder.' },
    ],
    advantages: [
      'Single +5 V supply and built-in clock generator drastically reduce external circuit complexity vs 8080.',
      'Clean, orthogonal 8-bit educational architecture that transparently exposes every bus cycle and register handoff.',
      'Built-in vectored hardware interrupts (TRAP, RST 7.5/6.5/5.5) and single-bit serial lines (SID/SOD).',
    ],
    limitations: [
      'No hardware multiply or divide instructions (must be implemented via shift-and-add software loops).',
      'Limited to 64 KB unified address space and sequential non-pipelined Von Neumann execution.',
      '8-bit data width requires multi-byte routines for 16-bit or floating-point arithmetic.',
    ],
    comparisonTable: {
      title: 'Intel 8085 Register & Pointer Organization',
      headers: ['Register', 'Width', 'User Accessible?', 'Primary Architectural Role'],
      rows: [
        ['Accumulator (A)', '8-bit', 'Yes', 'Primary ALU operand/result & I/O transfer register'],
        ['Flag Register (F)', '8-bit (5 active)', 'Via PSW / Jumps', 'Stores S, Z, AC, P, CY status flip-flops'],
        ['B, C, D, E, H, L', '6 × 8-bit (3 × 16-bit)', 'Yes', 'General scratchpad; HL acts as Memory Pointer (M)'],
        ['W & Z', '2 × 8-bit', 'No (Internal)', 'Holds 16-bit target address during JMP/CALL/LDA/XCHG'],
        ['Program Counter (PC)', '16-bit', 'Indirect (JMP/CALL)', 'Points to next instruction byte in memory'],
        ['Stack Pointer (SP)', '16-bit', 'Yes (LXI SP, SPHL)', 'Points to Top of Stack in external RAM'],
      ],
    },
    workedExamples: [
      {
        title: 'Internal Trace of XCHG Using W & Z Registers',
        problem: 'Given HL = 2500H and DE = 3040H, trace how the 8085 swaps HL ↔ DE without corrupting data over a single 8-bit internal bus.',
        steps: [
          'Opcode EBH (XCHG) is fetched into IR and decoded in 4 T-states.',
          'Internal control logic transfers D → W and E → Z temporarily.',
          'Next, H → D and L → E overwrite DE with 2500H.',
          'Finally, W → H and Z → L load 3040H into HL.',
        ],
        finalAnswer: 'HL = 3040H, DE = 2500H, zero flags affected, completed in 4 T-states.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'What is the function of the W and Z registers in the 8085 microprocessor?',
        modelAnswer: 'W and Z are two internal 8-bit temporary registers not accessible to the programmer. The 8085 uses them to temporarily store 16-bit addresses or operands during instructions like CALL, JMP, LDA, STA, and XCHG.',
      },
      {
        marks: 5,
        question: 'Explain the functions of Program Counter, Stack Pointer, Instruction Register, and Incrementer/Decrementer Address Latch in 8085.',
        modelAnswer: 'Explain PC sequencing (auto-increments after every byte fetch), SP downward LIFO tracking, IR holding current opcode for the Instruction Decoder, and the 16-bit Incrementer/Decrementer updating PC/SP/register pairs without involving the 8-bit ALU.',
      },
      {
        marks: 10,
        question: 'Draw the complete internal block diagram of the Intel 8085 microprocessor and explain each functional unit in detail.',
        modelAnswer: 'Draw all blocks wired to the 8-bit internal data bus: Accumulator, Temp Reg, ALU, Flags, IR, Decoder, Timing & Control, Interrupt Control, Serial I/O Control, Register Array (W,Z,B,C,D,E,H,L,SP,PC), Address Buffer, and Address/Data Buffer. Explain each block clearly.',
      },
      {
        marks: 15,
        question: 'With a neat architecture diagram of the 8085, trace the complete internal data flow across registers, internal bus, ALU, and external buffers for both (a) ADD B and (b) LDA 2500H.',
        modelAnswer: 'Provide the labeled 8085 architecture diagram, then walk step-by-step through every machine cycle and internal register transfer for ADD B (1-byte, 4T, A+TMP→ALU→A+Flags) and LDA 2500H (3-byte, 13T, W/Z holding 2500H → Address Buffer → RAM read → Accumulator).',
      },
    ],
  },

  '8085-flags': {
    introduction:
      'The 8085 ALU performs 8-bit binary addition, subtraction (via 2\'s complement), logical AND/OR/XOR, comparison, and bit rotation. Immediately after an ALU operation, five D-type flip-flops inside the 8-bit Flag Register (S, Z, AC, P, CY) latch key properties of the result so conditional branches (JZ, JNZ, JC, JNC, JP, JM, JPE, JPO) can steer program flow.',
    whyNeeded:
      'Without hardware flags, software could not detect zero loop counters, multi-byte arithmetic carries, negative signed numbers, or BCD nibble overflows. Flags turn the ALU from a dumb calculator into a decision-making computer.',
    workingPrinciple: [
      'Flag Register bit positions are strictly fixed: D7 = S (Sign), D6 = Z (Zero), D5 = unused (0), D4 = AC (Auxiliary Carry), D3 = unused (0), D2 = P (Parity), D1 = unused (0), D0 = CY (Carry). Together, A (high byte) and F (low byte) form the 16-bit Program Status Word (PSW), saved on the stack via PUSH PSW.',
      'During subtraction (SUB, SUI, CMP), the 8085 internally adds the 2\'s complement of the subtrahend to A and INVERTS the resulting carry out of D7 to form the Borrow flag (CY = 1 means A < Operand, CY = 0 means A ≥ Operand).',
      'Special flag rules are favorite university exam traps: INR and DCR update S, Z, AC, P but deliberately preserve CY (useful inside multi-byte addition loops!); INX and DCX affect NO flags; ANA sets AC=1 and CY=0; ORA and XRA clear both AC=0 and CY=0; MOV/MVI/LDA/STA affect NO flags.',
    ],
    architectureDetails:
      '5 active flip-flops inside an 8-bit latch wired directly to the ALU output bus. AC has no conditional jump instruction (it is read exclusively by DAA — Decimal Adjust Accumulator).',
    terminology: [
      { term: 'Sign Flag (S · D7)', definition: 'Copies bit D7 of the 8-bit ALU result; 1 indicates a negative number in 2\'s complement representation.' },
      { term: 'Zero Flag (Z · D6)', definition: 'Set to 1 whenever the 8-bit result equals 00H; reset to 0 for any non-zero byte.' },
      { term: 'Auxiliary Carry (AC · D4)', definition: 'Set to 1 when a carry propagates from lower nibble bit D3 into upper nibble bit D4; used by DAA.' },
      { term: 'Parity Flag (P · D2)', definition: 'Set to 1 when the result contains an EVEN number of 1-bits (0, 2, 4, 6, or 8 ones); 0 for odd count.' },
      { term: 'Carry Flag (CY · D0)', definition: 'Set to 1 on carry out of D7 during addition or borrow required during subtraction/comparison.' },
    ],
    advantages: [
      'Enables 1-instruction conditional branching, looping, and arbitrary-precision multi-byte arithmetic (ADC/SBB).',
      'Hardware AC flag allows compact packed-BCD arithmetic via the single-byte DAA instruction.',
    ],
    limitations: [
      'Lacks a dedicated Signed Overflow (OF) flag (later added in Intel 8086).',
      'Auxiliary Carry cannot be tested directly by any conditional JMP/CALL instruction.',
    ],
    comparisonTable: {
      title: 'How 8085 Instruction Families Affect Flags',
      headers: ['Instruction Group', 'S', 'Z', 'AC', 'P', 'CY'],
      rows: [
        ['ADD / ADC / SUB / SBB / CMP', 'Updated', 'Updated', 'Updated', 'Updated', 'Updated'],
        ['INR / DCR (8-bit)', 'Updated', 'Updated', 'Updated', 'Updated', 'Unchanged!'],
        ['INX / DCX (16-bit)', 'None', 'None', 'None', 'None', 'None'],
        ['ANA / ANI', 'Updated', 'Updated', 'Set to 1', 'Updated', 'Reset to 0'],
        ['ORA / ORI / XRA / XRI', 'Updated', 'Updated', 'Reset to 0', 'Updated', 'Reset to 0'],
        ['DAD rp (16-bit add)', 'None', 'None', 'None', 'None', 'Updated Only'],
        ['RLC / RRC / RAL / RAR', 'None', 'None', 'None', 'None', 'Updated Only'],
      ],
    },
    workedExamples: [
      {
        title: 'Flag Determination After ADD B (9AH + 8CH)',
        problem: 'Initially A = 9AH and B = 8CH. Determine A and all 5 flags (S, Z, AC, P, CY) after executing ADD B.',
        steps: [
          'Convert to binary: 9AH = 1001 1010, 8CH = 1000 1100.',
          'Lower nibble: 1010 + 1100 = 1 0110 → lower nibble = 6H, carry from D3→D4 sets AC = 1.',
          'Upper nibble: 1001 + 1000 + 1(AC) = 1 0010 → upper nibble = 2H, carry out of D7 sets CY = 1.',
          'Result in A = 26H (0010 0110): D7 = 0 → S = 0; non-zero → Z = 0; count of 1-bits = 3 (odd) → P = 0.',
        ],
        finalAnswer: 'A = 26H | S = 0, Z = 0, AC = 1, P = 0, CY = 1 (Flag Byte = 11H).',
      },
      {
        title: 'Flag Determination After CMP B (45H vs 45H and 45H vs 60H)',
        problem: 'Explain the flags and Accumulator value after CMP B when (a) A=45H, B=45H and (b) A=45H, B=60H.',
        steps: [
          'CMP B computes (A − B) internally without modifying A.',
          'Case (a): 45H − 45H = 00H → Z = 1, CY = 0, S = 0, P = 1 (zero 1s = even). A stays 45H.',
          'Case (b): 45H < 60H → borrow required so CY = 1, Z = 0, result = E5H (D7=1) → S = 1. A stays 45H.',
        ],
        finalAnswer: '(a) Z=1, CY=0 (A=B); (b) Z=0, CY=1 (A<B); Accumulator A remains 45H in both cases.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Why does INR not affect the Carry flag while ADD does?',
        modelAnswer: 'INR is frequently used to increment an address or loop counter inside multi-byte arithmetic routines where the Carry flag from a previous ADC must remain intact for the next byte.',
      },
      {
        marks: 5,
        question: 'Draw the bit format of the 8085 Flag Register and explain each flag with a numerical example.',
        modelAnswer: 'Draw D7(S), D6(Z), D5(X), D4(AC), D3(X), D2(P), D1(X), D0(CY). Define all 5 flags and work out A = 9AH + B = 8CH → A = 26H, S=0, Z=0, AC=1, P=0, CY=1.',
      },
      {
        marks: 10,
        question: 'Explain the Program Status Word (PSW), the working of DAA using AC and CY flags, and tabulate how Arithmetic, Logical, Rotate, and 16-bit instructions affect the 8085 flags.',
        modelAnswer: 'Define PSW (A + F), detail the two-step DAA BCD adjustment rule (lower nibble >9 or AC=1 adds 06H; upper nibble >9 or CY=1 adds 60H), and present the complete flag impact table.',
      },
      {
        marks: 15,
        question: 'Design an 8085 assembly program to add two 16-bit numbers stored at 2500H–2501H and 2502H–2503H, storing the 16-bit sum at 2504H–2505H and carry at 2506H. Trace all register and flag changes step by step for F58CH + 1A94H.',
        modelAnswer: 'Write the complete assembly routine using LHLD/XCHG/DAD or byte-wise ADD/ADC, explain why INR preserves CY if counting carries, and step through 8CH+94H=20H (CY=1) and F5H+1AH+1=10H (CY=1) → Sum = 1020H with final carry 01H.',
      },
    ],
  },

  '8085-pinout': {
    introduction:
      'The Intel 8085 is housed in a 40-pin Dual In-Line Package (DIP). Its 40 pins are organized into six functional groups: Power & Clock, Address Bus (A15–A8), Multiplexed Address/Data Bus (AD7–AD0), Control & Status signals, Externally Initiated Signals (Interrupts, DMA, READY, RESET), and Serial I/O (SID/SOD).',
    whyNeeded:
      'A 16-bit address bus + 8-bit data bus alone would consume 24 pins, leaving insufficient pins in a cost-effective 40-pin IC for power, clock, interrupts, DMA, and control lines. Time-division multiplexing A7–A0 with D7–D0 onto AD7–AD0 saved 8 critical package pins.',
    workingPrinciple: [
      'During the first clock cycle (T1) of every machine cycle, the 8085 outputs the lower 8 address bits (A7–A0) on pins AD7–AD0 (Pins 12–19) and simultaneously drives ALE (Pin 30) HIGH. An external octal transparent D-latch (74LS373) wired to AD7–AD0 captures A7–A0 while ALE=1.',
      'On the falling edge of ALE at the end of T1, the 74LS373 freezes A7–A0 steadily at its output pins for T2 and T3. The 8085 then switches AD7–AD0 into a bidirectional 8-bit data bus so memory or I/O chips can transfer data when RD\' (Pin 32) or WR\' (Pin 31) goes LOW.',
      'The internal clock generator connects an external crystal across X1 (Pin 1) and X2 (Pin 2) and divides its frequency by 2 to generate the internal CPU clock and CLK OUT (Pin 37) for peripheral synchronization.',
    ],
    architectureDetails:
      'Power: Vcc=+5V (Pin 40), Vss=GND (Pin 20). Status decoding (IO/M\', S1, S0): 0,1,1 = Opcode Fetch; 0,1,0 = Memory Read; 0,0,1 = Memory Write; 1,1,0 = I/O Read; 1,0,1 = I/O Write; 1,1,1 = Interrupt Acknowledge; Z,0,0 = Halt.',
    terminology: [
      { term: 'ALE (Pin 30)', definition: 'Address Latch Enable — active-HIGH pulse emitted during T1 to latch A7–A0 from AD7–AD0 into 74LS373.' },
      { term: 'IO/M\' (Pin 34)', definition: 'Status pin distinguishing I/O operations (HIGH = 1) from Memory operations (LOW = 0).' },
      { term: 'READY (Pin 35)', definition: 'Active-HIGH synchronization input; pulling it LOW forces the 8085 to insert Wait (Tw) states for slow peripherals.' },
      { term: 'HOLD / HLDA (Pins 39, 38)', definition: 'Bus arbitration handshake enabling a DMA controller (8237) to request and take over tri-stated system buses.' },
      { term: 'RESET IN\' / RESET OUT (Pins 36, 3)', definition: 'RESET IN\' resets PC to 0000H and clears INTE/HLDA; RESET OUT resets external peripheral chips simultaneously.' },
    ],
    advantages: [
      'Saves 8 IC pins via AD0–AD7 multiplexing, reducing IC package cost and PCB area.',
      'Integrated crystal oscillator and CLK OUT eliminate the external 8224 clock driver chip.',
      'READY pin cleanly accommodates slow EPROMs or ADCs without slowing the main crystal.',
    ],
    limitations: [
      'Requires an external 74LS373 latch IC on every board to demultiplex A0–A7.',
      'Generating separate MEMR\', MEMW\', IOR\', and IOW\' strobes requires external combinational gates (74LS32 OR gates or 74LS138).',
    ],
    comparisonTable: {
      title: '8085 Control & Status Signal Decoding Table',
      headers: ['Machine Cycle', "IO/M'", 'S1', 'S0', "RD'", "WR'"],
      rows: [
        ['Opcode Fetch (OF)', '0', '1', '1', '0', '1'],
        ['Memory Read (MR)', '0', '1', '0', '0', '1'],
        ['Memory Write (MW)', '0', '0', '1', '1', '0'],
        ['I/O Read (IOR)', '1', '1', '0', '0', '1'],
        ['I/O Write (IOW)', '1', '0', '1', '1', '0'],
        ['Interrupt Ack (INTA)', '1', '1', '1', '1 (INTA\'=0)', '1'],
        ['Halt (HLT)', 'Tri-state', '0', '0', 'Tri-state', 'Tri-state'],
      ],
    },
    workedExamples: [
      {
        title: 'Generating Separate Memory & I/O Control Signals',
        problem: 'Show the logic equations to derive active-low MEMR\', MEMW\', IOR\', and IOW\' from 8085 pins IO/M\', RD\', and WR\'.',
        steps: [
          'MEMR\' must be LOW (0) only when IO/M\' = 0 AND RD\' = 0 → Use an OR gate: MEMR\' = IO/M\' + RD\'.',
          'MEMW\' must be LOW (0) only when IO/M\' = 0 AND WR\' = 0 → MEMW\' = IO/M\' + WR\'.',
          'Invert IO/M\' to get (IO/M\')\' which is 0 during I/O cycles: IOR\' = (IO/M\')\' + RD\', IOW\' = (IO/M\')\' + WR\'.',
        ],
        finalAnswer: 'MEMR\' = IO/M\' + RD\' | MEMW\' = IO/M\' + WR\' | IOR\' = (IO/M\')\' + RD\' | IOW\' = (IO/M\')\' + WR\'.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Why is the lower address bus multiplexed with the data bus in 8085, and which pin demultiplexes it?',
        modelAnswer: 'To limit the IC to a compact 40-pin DIP package by sharing 8 pins between A0–A7 and D0–D7. Pin 30 (ALE — Address Latch Enable) strobes an external 74LS373 latch in T1 to separate A0–A7.',
      },
      {
        marks: 5,
        question: 'Draw and explain the circuit used to demultiplex AD0–AD7 using 74LS373 and generate MEMR\', MEMW\', IOR\', and IOW\'.',
        modelAnswer: 'Sketch AD0–AD7 feeding D0–D7 of 74LS373 with ALE wired to Latch Enable (G) and OE\' tied to GND, yielding stable A0–A7 while AD0–AD7 passes directly to the data bus. Show the 4 OR-gate/decoder control signal equations.',
      },
      {
        marks: 10,
        question: 'Draw the complete 40-pin diagram of the Intel 8085 microprocessor and explain all six functional pin groups.',
        modelAnswer: 'Draw pins 1–20 (left) and 21–40 (right) accurately (X1/X2, RESET OUT, SOD/SID, TRAP..INTA\', AD0–AD7, Vss, A8–A15, S0, ALE, WR\', RD\', S1, IO/M\', READY, RESET IN\', CLK OUT, HLDA, HOLD, Vcc) and explain each group.',
      },
      {
        marks: 15,
        question: 'Explain the complete bus structure of the 8085 microprocessor, including demultiplexing, buffering, control signal generation, READY wait-state insertion, and HOLD/HLDA bus tri-stating with neat schematic diagrams.',
        modelAnswer: 'Present a full 8085 minimum-system bus schematic with 74LS373 latch, 74LS245 bidirectional data transceiver, 74LS244 address buffer, 74LS138 control signal generator, READY timing wait-state effect, and DMA tri-state behavior.',
      },
    ],
  },

  '8085-addressing': {
    introduction:
      'Every 8085 machine instruction consists of an 8-bit Opcode followed by 0, 1, or 2 operand bytes, classifying instructions into 1-byte, 2-byte, and 3-byte formats. Addressing Modes specify the exact mechanism the CPU uses to locate the source or destination operand for an instruction.',
    whyNeeded:
      'Different programming tasks demand different ways of referencing data: constants need Immediate mode, fast scratchpad variables use Register mode, fixed hardware variables use Direct mode, and dynamic arrays or lookup tables require Register Indirect pointers.',
    workingPrinciple: [
      '1. Immediate Addressing: The 8-bit or 16-bit operand is embedded directly in the bytes immediately following the opcode (e.g., MVI A, 32H [2B]; LXI H, 2500H [3B]). Note that 16-bit operands are stored in Little-Endian order (low byte at lower address, high byte at higher address).',
      '2. Register Addressing: Both source and destination operands reside inside internal CPU registers (e.g., MOV A, B; ADD C; XRA A). These are always 1-byte instructions executing in just 4 T-states.',
      '3. Direct Addressing: The 16-bit memory address (or 8-bit I/O port) appears explicitly inside the instruction (e.g., LDA 2500H → 3AH, 00H, 25H; STA 3000H; LHLD 2500H; IN 01H).',
      '4. Register Indirect Addressing: The 16-bit memory address is held inside a register pair—primarily HL (denoted M in MOV A, M / ADD M / INR M), or BC/DE in LDAX/STAX. Changing HL lets a single 1-byte instruction sweep through an entire array.',
      '5. Implied (Inherent) Addressing: The opcode itself implicitly identifies the operand, requiring no explicit operand field (e.g., CMA, RLC, STC, CMC, DAA, HLT, NOP).',
    ],
    architectureDetails:
      'The 8085 has 74 distinct instruction types and 246 unique 8-bit opcodes divided into 5 functional categories: Data Transfer, Arithmetic, Logical, Branching, and Stack/I/O/Machine Control.',
    terminology: [
      { term: 'Opcode', definition: 'The first 8-bit machine byte telling the Instruction Decoder which operation to perform.' },
      { term: 'Effective Address (EA)', definition: 'The final 16-bit memory location from which an operand is read or written.' },
      { term: 'Little-Endian Format', definition: 'Intel convention storing the least-significant byte (LSB) at the lower memory address and MSB at the next address.' },
      { term: 'Memory Pointer M', definition: 'Mnemonic symbol referring to the RAM byte located at the 16-bit address currently inside the HL register pair.' },
    ],
    advantages: [
      'Register and Implied modes achieve compact 1-byte code and maximum speed (4 T-states).',
      'Register Indirect mode (HL + INX H) enables tight, reusable loops over variable-length memory arrays.',
    ],
    limitations: [
      'Lacks Indexed and Base+Offset addressing modes (introduced in Intel 8086 via BX+SI+disp).',
      'Direct addressing consumes 3 bytes and 13 T-states per access.',
    ],
    comparisonTable: {
      title: 'All 5 Addressing Modes of Intel 8085',
      headers: ['Addressing Mode', 'Operand Location', 'Examples', 'Typical Size'],
      rows: [
        ['Immediate', 'Inside instruction bytes', 'MVI A, 32H; ADI 05H; LXI H, 2500H', '2 or 3 Bytes'],
        ['Register', 'Internal CPU register', 'MOV A, B; ADD C; SUB D; INR B', '1 Byte'],
        ['Direct', 'Explicit address in instruction', 'LDA 2500H; STA 3000H; IN 01H', '3 Bytes (2B I/O)'],
        ['Register Indirect', 'Memory pointed by HL/BC/DE', 'MOV A, M; ADD M; LDAX B; STAX D', '1 Byte'],
        ['Implied / Inherent', 'Fixed implicitly by opcode', 'CMA; RLC; DAA; STC; HLT; NOP', '1 Byte'],
      ],
    },
    workedExamples: [
      {
        title: 'Little-Endian Machine Code Assembly Layout',
        problem: 'Assemble the 3-instruction sequence starting at 2000H: LXI H, 2500H (opcode 21H), MOV A, M (7EH), STA 2600H (32H). Show exact byte-by-byte memory contents.',
        steps: [
          '2000H: 21H (LXI H opcode), 2001H: 00H (low byte of 2500H), 2002H: 25H (high byte of 2500H) → 3 bytes.',
          '2003H: 7EH (MOV A, M — Register Indirect) → 1 byte.',
          '2004H: 32H (STA opcode), 2005H: 00H (low byte of 2600H), 2006H: 26H (high byte of 2600H) → 3 bytes.',
        ],
        finalAnswer: 'Total = 7 bytes occupying 2000H–2006H: [21, 00, 25, 7E, 32, 00, 26].',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Distinguish between LDA 2500H and LDAX B in terms of addressing mode, byte length, and T-states.',
        modelAnswer: 'LDA 2500H uses Direct addressing (3 bytes, 13T) specifying the 16-bit address explicitly; LDAX B uses Register Indirect addressing (1 byte, 7T) using the 16-bit address already loaded in register pair BC.',
      },
      {
        marks: 5,
        question: 'Explain all five addressing modes of the 8085 microprocessor with two examples each.',
        modelAnswer: 'Define Immediate, Register, Direct, Register Indirect, and Implied addressing modes, giving two accurate examples and byte sizes for each.',
      },
      {
        marks: 10,
        question: 'Classify the 8085 instruction set both by word size (1-, 2-, 3-byte) and by functional group (5 groups), illustrating each category with machine code layout and flag behavior.',
        modelAnswer: 'Detail 1/2/3-byte instruction memory layouts (highlighting Little-Endian 16-bit addresses) and all 5 functional groups (Data Transfer, Arithmetic, Logical, Branch, Machine Control) with examples and flag impact.',
      },
      {
        marks: 15,
        question: 'Write an 8085 assembly program using Register Indirect addressing to find the largest unsigned 8-bit number in an array of 10 bytes starting at 2500H and store the result at 2600H. Identify the addressing mode, byte size, and T-states of every instruction used.',
        modelAnswer: 'Present the complete loop using LXI H, 2500H; MVI C, 09H; MOV A, M; LOOP: INX H; CMP M; JNC SKIP; MOV A, M; SKIP: DCR C; JNZ LOOP; STA 2600H; HLT. Annotate every line with addressing mode, bytes, and T-states.',
      },
    ],
  },

  '8085-timing': {
    introduction:
      'A Timing Diagram is a graphical representation of all bus and control signal transitions (CLK, A15–A8, AD7–AD0, ALE, IO/M\', S1, S0, RD\', WR\') plotted against discrete clock cycles during the execution of an instruction. Understanding timing diagrams links assembly software directly to oscilloscope-level hardware behavior.',
    whyNeeded:
      'Memory chips and peripherals have finite setup, hold, and access times (e.g., 150 ns–450 ns). Hardware engineers use timing diagrams to verify bus margins, compute exact software delay loops, and determine whether READY wait states are required.',
    workingPrinciple: [
      'Three hierarchical time units govern 8085 execution: (1) T-State = 1 clock period (T = 1 / f_clk); (2) Machine Cycle = 3 to 6 T-states required to complete one bus transaction (Opcode Fetch, Memory Read, Memory Write, I/O Read, I/O Write, Interrupt Ack, or Bus Idle); (3) Instruction Cycle = 1 to 5 Machine Cycles needed to fetch and execute a complete instruction.',
      'In every bus-active machine cycle: during T1, A15–A8 and AD7–AD0 carry the 16-bit address, IO/M\' & S1/S0 assert status, and ALE pulses HIGH; during T2, RD\' or WR\' drops LOW and data appears on AD7–AD0; during T3, data is latched and the strobe rises HIGH. Opcode Fetch appends a T4 state for internal instruction decoding (and T5–T6 for 16-bit/stack opcodes like INX, DCX, PUSH, CALL, SPHL, PCHL).',
    ],
    architectureDetails:
      'Wait states (Tw) are inserted between T2 and T3 whenever READY = 0 is sampled during T2. For I/O Read and I/O Write cycles (IN/OUT), the 8-bit port address is duplicated simultaneously onto BOTH A15–A8 and AD7–AD0 during T1!',
    terminology: [
      { term: 'T-State', definition: 'One subdivision of CPU operation lasting exactly one clock period (1 / f_clk).' },
      { term: 'Machine Cycle (MC)', definition: 'One external memory or I/O bus transaction taking 3, 4, or 6 T-states.' },
      { term: 'Instruction Cycle (IC)', definition: 'Total time required to fetch, decode, and completely execute one instruction (4T to 18T in 8085).' },
      { term: 'Wait State (Tw)', definition: 'Extra idle clock period inserted between T2 and T3 when READY = 0 for slow memory/I/O.' },
    ],
    advantages: [
      'Deterministic T-state counts allow microsecond-accurate software timing delays without external timer hardware.',
      'Clear separation of address (T1) and data (T2–T3) simplifies logic-analyzer debugging.',
    ],
    limitations: [
      'Non-pipelined sequential machine cycles mean complex instructions like CALL take 18 T-states (6 µs @ 3 MHz).',
      'Multiplexing adds latch propagation delay to the external address path.',
    ],
    comparisonTable: {
      title: 'Standard 8085 Instruction Machine Cycle & T-State Breakdown',
      headers: ['Instruction', 'Bytes', 'Machine Cycles', 'Total T-States'],
      rows: [
        ['MOV A, B / ADD B', '1', '1 (OF)', '4T'],
        ['MVI A, 32H', '2', '2 (OF + MR)', '7T (4 + 3)'],
        ['OUT 01H / IN 02H', '2', '3 (OF + MR + IOW/IOR)', '10T (4 + 3 + 3)'],
        ['LXI H, 2500H', '3', '3 (OF + MR + MR)', '10T (4 + 3 + 3)'],
        ['LDA 2500H / STA 2500H', '3', '4 (OF + MR + MR + MR/MW)', '13T (4 + 3 + 3 + 3)'],
        ['PUSH B', '1', '3 (OF[6T] + MW + MW)', '12T (6 + 3 + 3)'],
        ['CALL 2100H', '3', '5 (OF[6T] + MR + MR + MW + MW)', '18T (6 + 3 + 3 + 3 + 3)'],
      ],
    },
    workedExamples: [
      {
        title: 'Execution Time & Software Delay Calculation',
        problem: 'Calculate the exact execution time of STA 2500H on an 8085 driven by a 6 MHz crystal.',
        steps: [
          'Internal CPU clock frequency = Crystal / 2 = 6 MHz / 2 = 3 MHz.',
          'Duration of 1 T-state = 1 / (3 × 10⁶) = 0.3333 µs (333.3 ns).',
          'STA 2500H machine cycles: M1 Opcode Fetch (4T) + M2 Read Low Addr (3T) + M3 Read High Addr (3T) + M4 Memory Write (3T) = 13 T-states.',
          'Total Execution Time = 13 × 0.3333 µs = 4.333 µs.',
        ],
        finalAnswer: '13 T-states = 4.33 µs @ 3 MHz internal clock.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Differentiate between Instruction Cycle, Machine Cycle, and T-State.',
        modelAnswer: 'A T-State is one clock period; a Machine Cycle is a group of 3–6 T-states executing one bus operation (e.g., Memory Read); an Instruction Cycle comprises 1–5 Machine Cycles to fetch and execute a complete instruction.',
      },
      {
        marks: 5,
        question: 'Explain why Opcode Fetch requires 4 T-states while Memory Read requires only 3 T-states, and name three instructions whose Opcode Fetch takes 6 T-states.',
        modelAnswer: 'Memory Read finishes once the operand byte latches in T3. Opcode Fetch requires T4 to decode the fetched opcode internally. Instructions needing 6T Opcode Fetch include INX, DCX, PUSH, CALL, SPHL, and PCHL.',
      },
      {
        marks: 10,
        question: 'Draw and explain the complete timing diagram of STA 2500H (13 T-states) showing CLK, A15–A8, AD7–AD0, ALE, IO/M\', S1, S0, RD\', and WR\'.',
        modelAnswer: 'Plot all 4 machine cycles (M1: OF 4T reading 32H; M2: MR 3T reading 00H; M3: MR 3T reading 25H; M4: MW 3T writing [A] to 2500H with WR\'=0) and narrate every signal transition.',
      },
      {
        marks: 15,
        question: 'Draw timing diagrams for (a) MVI A, 32H and (b) OUT 01H. Then design a software delay subroutine producing an exact 10 ms delay on a 3 MHz 8085 using a 16-bit register-pair loop (LXI B / DCX B / MOV A, B / ORA C / JNZ).',
        modelAnswer: 'Draw MVI (7T) and OUT (10T, highlighting IO/M\'=1 and duplicated port address 01H on A15–A8 & AD7–AD0 in M3). Derive loop T-states: DCX B(6) + MOV A,B(4) + ORA C(4) + JNZ(10) = 24T per iteration → N ≈ (10 ms / 0.333 µs) / 24 ≈ 1250 = 04E2H.',
      },
    ],
  },

  '8085-interrupts': {
    introduction:
      'An Interrupt is an event—triggered by external hardware pins or software RST instructions—that temporarily suspends normal sequential execution so the 8085 can branch to a dedicated Interrupt Service Routine (ISR), handle the urgent event, and seamlessly resume the interrupted program via RET.',
    whyNeeded:
      'Polling (continuously checking peripheral status in a loop) wastes CPU cycles and misses fast asynchronous events like power-fail warnings or incoming serial bytes. Interrupts allow the CPU to perform useful work until a device explicitly signals readiness.',
    workingPrinciple: [
      'The 8085 features 5 hardware interrupt pins ranked in strict priority: (1) TRAP (Non-maskable, edge+level triggered, Vector 0024H); (2) RST 7.5 (Maskable, positive edge-triggered with internal latch, Vector 003CH); (3) RST 6.5 (Maskable, high-level triggered, Vector 0034H); (4) RST 5.5 (Maskable, high-level triggered, Vector 002CH); (5) INTR (Maskable, level-triggered, Non-vectored — requires external hardware like 8259A to place an RST/CALL opcode during INTA\').',
      'Additionally, 8 software interrupts (RST 0 through RST 7) act as 1-byte CALL instructions to vector address (n × 8) in hex (0000H, 0008H, ..., 0038H).',
      'Global enabling uses EI (sets INTE flip-flop = 1) and DI (clears INTE = 0). Individual masking of RST 7.5/6.5/5.5 uses SIM (Set Interrupt Mask) with Accumulator bits: D3=MSE (Mask Set Enable must be 1), D2=M7.5, D1=M6.5, D0=M5.5, D4=R7.5 (reset pending 7.5 latch), plus D7/D6 for SOD serial output. RIM (Read Interrupt Mask) reads pending flags, current masks, INTE, and SID.',
    ],
    architectureDetails:
      'When any interrupt is acknowledged, the 8085 automatically resets INTE = 0 (disabling nested maskable interrupts), pushes the current 16-bit PC onto the Stack, and loads the Vector Address into PC. The ISR must execute EI before RET to re-enable interrupts.',
    terminology: [
      { term: 'Vectored Interrupt', definition: 'Interrupt whose ISR starting memory address is fixed internally in hardware (TRAP, RST 7.5, 6.5, 5.5).' },
      { term: 'Non-Maskable Interrupt (NMI)', definition: 'Interrupt (TRAP) that cannot be ignored or disabled by DI or SIM; reserved for critical emergencies.' },
      { term: 'SIM (30H)', definition: 'Set Interrupt Mask instruction — configures M7.5/M6.5/M5.5 masks, resets R7.5, and outputs bit D7 on SOD.' },
      { term: 'RIM (20H)', definition: 'Read Interrupt Mask instruction — loads A with SID, pending I7.5/I6.5/I5.5, IE status, and current mask bits.' },
    ],
    advantages: [
      'Eliminates wasteful polling loops and guarantees rapid deterministic response to urgent hardware signals.',
      'Flexible two-level masking (global EI/DI + selective SIM bits) supports priority-critical systems.',
    ],
    limitations: [
      'Only 5 hardware pins directly on-chip (requires 8259A PIC for systems needing 8–64 interrupt lines).',
      'Interrupts do NOT automatically push registers/PSW (unlike 8086 pushing Flags); ISR software must explicitly PUSH/POP registers.',
    ],
    comparisonTable: {
      title: 'Intel 8085 Hardware Interrupts Master Table',
      headers: ['Interrupt', 'Priority', 'Vector Addr', 'Trigger Type', 'Maskable?'],
      rows: [
        ['TRAP (RST 4.5)', '1 (Highest)', '0024H', 'Rising Edge + High Level', 'No (Non-Maskable)'],
        ['RST 7.5', '2', '003CH', 'Positive Edge (Latched)', 'Yes (EI/DI & SIM)'],
        ['RST 6.5', '3', '0034H', 'Active-High Level', 'Yes (EI/DI & SIM)'],
        ['RST 5.5', '4', '002CH', 'Active-High Level', 'Yes (EI/DI & SIM)'],
        ['INTR', '5 (Lowest)', 'External (INTA\')', 'Active-High Level', 'Yes (EI/DI only)'],
      ],
    },
    workedExamples: [
      {
        title: 'Computing the SIM Accumulator Control Byte',
        problem: 'Write an 8085 sequence to enable interrupts globally, unmask RST 7.5 and RST 5.5, mask RST 6.5, and clear any latched RST 7.5 request without altering SOD.',
        steps: [
          'SIM bit layout: D7(SOD)=0, D6(SDE)=0 (ignore SOD), D5=0, D4(R7.5)=1 (reset 7.5 flip-flop), D3(MSE)=1 (enable mask update), D2(M7.5)=0 (unmask), D1(M6.5)=1 (mask), D0(M5.5)=0 (unmask).',
          'Binary byte = 0001 1010B = 1AH.',
          'Code: EI ; MVI A, 1AH ; SIM.',
        ],
        finalAnswer: 'EI → MVI A, 1AH → SIM.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Calculate the vector address of RST 6.5 and explain why TRAP is both edge- and level-triggered.',
        modelAnswer: '6.5 × 8 = 52 decimal = 0034H. TRAP is both edge- and level-triggered to prevent false triggering from narrow noise spikes while also preventing repeated re-entry if TRAP remains held HIGH.',
      },
      {
        marks: 5,
        question: 'Tabulate all 5 hardware interrupts of 8085 with their priorities, triggering modes, maskability, and vector addresses.',
        modelAnswer: 'Present the exact 5-row table: TRAP (1, 0024H, Edge+Level, Non-maskable), RST 7.5 (2, 003CH, Edge, Maskable), RST 6.5 (3, 0034H, Level, Maskable), RST 5.5 (4, 002CH, Level, Maskable), INTR (5, External, Level, Maskable).',
      },
      {
        marks: 10,
        question: 'Draw the bit formats of SIM and RIM instructions and explain how 8085 handles an INTR interrupt cycle using INTA\'.',
        modelAnswer: 'Draw D7–D0 formats for SIM (SOD, SDE, X, R7.5, MSE, M7.5, M6.5, M5.5) and RIM (SID, I7.5, I6.5, I5.5, IE, M7.5, M6.5, M5.5). Trace INTR → CPU finishes instruction → asserts INTA\' → external 8259A places RST (1 INTA\') or 3-byte CALL (3 INTA\' pulses) on data bus.',
      },
      {
        marks: 15,
        question: 'Explain the complete interrupt architecture of the 8085 microprocessor, including priority logic, context saving, software vs hardware interrupts, SIM/RIM bit operations, and how an 8259A expands INTR to 8 prioritized levels.',
        modelAnswer: 'Provide the internal interrupt masking/priority diagram, software RST 0–7 table, ISR PUSH PSW/PUSH B...EI/RET best practice, worked SIM example, and INTR/INTA\' cascade with 8259A.',
      },
    ],
  },

  '8085-memory-interfacing': {
    introduction:
      'Memory Interfacing is the hardware design process of connecting external EPROM (non-volatile code) and SRAM (volatile data/stack) integrated circuits to the 8085 Address, Data, and Control buses so each chip responds exclusively within its assigned non-overlapping address range.',
    whyNeeded:
      'The 8085 provides a 64 KB address space (A0–A15), whereas practical memory ICs come in smaller capacities (1 KB, 2 KB, 4 KB, 8 KB). Without proper address decoding, multiple memory chips would drive the data bus simultaneously, causing destructive electrical bus contention.',
    workingPrinciple: [
      'Step 1 (Internal Chip Lines): A memory chip of size N bytes requires k = log₂(N) address pins wired directly to lower CPU address lines A0–A(k−1). For example, a 4 KB chip (4096 = 2¹²) connects to A0–A11.',
      'Step 2 (Chip Select Decoding): The remaining upper address lines A(k)–A15 feed an address decoder (such as a 74LS138 3-to-8 decoder or NAND gate network) whose active-low output drives the chip\'s CS\' pin.',
      'Step 3 (Control Signals): EPROM connects OE\' to MEMR\' (IO/M\' + RD\'). SRAM connects OE\' to MEMR\' and WE\' to MEMW\' (IO/M\' + WR\').',
      'Absolute (Exhaustive) Decoding uses EVERY remaining upper address line so each physical byte has exactly one unique 16-bit address. Partial (Linear) Decoding omits some upper lines to save gates, creating mirror/foldback addresses.',
    ],
    architectureDetails:
      'Because 8085 resets PC = 0000H on power-up, the Boot EPROM MUST always occupy the lowest address block starting at 0000H (e.g., 0000H–0FFFH for 4 KB EPROM), while Read/Write SRAM sits higher (e.g., 2000H–2FFFH).',
    terminology: [
      { term: 'Chip Select (CS\')', definition: 'Active-low enable input on a memory IC; when HIGH, the chip tri-states its data pins.' },
      { term: 'Absolute Decoding', definition: 'Decoding all unused upper address lines so every memory location has one unique address with zero foldback.' },
      { term: 'Foldback (Shadow) Memory', definition: 'Multiple distinct hex addresses mapping to the same physical RAM byte due to partial decoding.' },
      { term: '74LS138 Decoder', definition: 'Standard 3-to-8 active-low decoder (inputs A,B,C + enables G1, G2A\', G2B\') generating up to 8 non-overlapping CS\' lines.' },
    ],
    advantages: [
      '74LS138 decoding cleanly partitions 64 KB into 8 uniform blocks (e.g., eight 4 KB or 8 KB banks) with a single IC.',
      'Absolute decoding ensures maximum future memory expandability with zero address collisions.',
    ],
    limitations: [
      'External address decoding and buffers add propagation delay that must fit inside the CPU read-access window.',
      'Partial decoding wastes large chunks of the 64 KB address map on duplicate mirror images.',
    ],
    comparisonTable: {
      title: 'Memory IC Capacity vs Address Pin Mapping (8085)',
      headers: ['Chip Capacity', 'Bytes (2^k)', 'Direct Chip Pins', 'Decoder Lines', 'Block Span (Hex)'],
      rows: [
        ['1 KB (2114×2)', '1,024 (2¹⁰)', 'A0 – A9 (10)', 'A10 – A15 (6)', '0400H (e.g., 0000–03FFH)'],
        ['2 KB (6116 / 2716)', '2,048 (2¹¹)', 'A0 – A10 (11)', 'A11 – A15 (5)', '0800H (e.g., 2000–27FFH)'],
        ['4 KB (2732)', '4,096 (2¹²)', 'A0 – A11 (12)', 'A12 – A15 (4)', '1000H (e.g., 0000–0FFFH)'],
        ['8 KB (6264 / 2764)', '8,192 (2¹³)', 'A0 – A12 (13)', 'A13 – A15 (3)', '2000H (e.g., 8000–9FFFH)'],
        ['16 KB (27128)', '16,384 (2¹⁴)', 'A0 – A13 (14)', 'A14 – A15 (2)', '4000H (e.g., 4000–7FFFH)'],
      ],
    },
    workedExamples: [
      {
        title: 'Interfacing 4 KB EPROM at 0000H and 4 KB RAM at 2000H Using 74LS138',
        problem: 'Design an absolute address map using a 74LS138 for a 4 KB EPROM starting at 0000H and a 4 KB RAM starting at 2000H.',
        steps: [
          '4 KB = 4096 = 2¹² → wire A0–A11 directly to both EPROM and RAM.',
          'Remaining lines: A15, A14, A13, A12. Wire A12→A, A13→B, A14→C of 74LS138; tie A15→G2A\', IO/M\'→G2B\', +5V→G1.',
          'Output Y0\' is active when A15=0, A14–A12=000 → Range 0000H–0FFFH → Connect Y0\' to EPROM CS\'.',
          'Output Y2\' is active when A15=0, A14–A12=010 → Range 2000H–2FFFH → Connect Y2\' to RAM CS\'.',
        ],
        finalAnswer: 'EPROM: 0000H–0FFFH (Y0\') | RAM: 2000H–2FFFH (Y2\') | Absolute decoding with zero foldback.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'How many address lines are required for an 8 KB memory chip, and why is EPROM always mapped at 0000H in 8085?',
        modelAnswer: '8 KB = 8192 = 2¹³ requires 13 address lines (A0–A12). EPROM must start at 0000H because on RESET, 8085 clears PC to 0000H and immediately fetches its first boot instruction from there.',
      },
      {
        marks: 5,
        question: 'Compare Absolute Decoding and Partial Decoding with an example of foldback memory.',
        modelAnswer: 'Explain full decoding of all upper lines vs ignoring don\'t-care lines (e.g., if A15 is ignored for a 4 KB chip at 0000H–0FFFH, it also responds at 8000H–8FFFH as foldback).',
      },
      {
        marks: 10,
        question: 'Design a complete interfacing schematic connecting one 4 KB EPROM (0000H–0FFFH) and two 2 KB RAM chips (2000H–27FFH and 2800H–2FFFH) to the 8085 using 74LS138.',
        modelAnswer: 'Derive the full binary address map table (A15 down to A0), specify 74LS138 enable & select wiring, show MEMR\'/MEMW\' connections, and verify non-overlapping hex ranges.',
      },
      {
        marks: 15,
        question: 'Compare Memory-Mapped I/O and I/O-Mapped I/O in 8085, and design an interface combining an 8 KB EPROM, an 8 KB SRAM, and an I/O-mapped output latch.',
        modelAnswer: 'Tabulate Memory-Mapped vs I/O-Mapped I/O (16-bit vs 8-bit address, all memory instructions vs IN/OUT only, 64KB shared vs 256 dedicated ports, MEMR\'/MEMW\' vs IOR\'/IOW\'), then provide the full decoded schematic and address map.',
      },
    ],
  },

  '8086-biu-eu': {
    introduction:
      'The Intel 8086 (1978) is a true 16-bit HMOS microprocessor with a 16-bit ALU, 16-bit data bus (AD0–AD15), and a 20-bit address bus capable of directly addressing 1 MB of physical memory (00000H–FFFFFH). Its landmark architectural innovation is splitting the CPU into two asynchronous, concurrently operating units: the Bus Interface Unit (BIU) and the Execution Unit (EU).',
    whyNeeded:
      'In the 8085, the ALU sits completely idle while the bus fetches the next opcode, and the external bus sits idle while the ALU executes. Dividing the 8086 into BIU and EU linked by a 6-byte FIFO Prefetch Queue overlaps Fetch with Execution—introducing instruction pipelining to microprocessors.',
    workingPrinciple: [
      'The Bus Interface Unit (BIU) handles all external 20-bit bus activity: computing physical addresses via its dedicated 20-bit Segment Adder, reading/writing memory and I/O operands, and proactively prefetching upcoming instruction bytes into the 6-byte FIFO Instruction Queue whenever at least 2 bytes are free.',
      'The Execution Unit (EU) has zero direct connection to external pins. It pulls already-prefetched instruction bytes straight from the 6-byte queue, decodes them in its Control Unit, performs 16-bit/8-bit operations in the ALU across general registers (AX, BX, CX, DX) and pointers/indices (SP, BP, SI, DI), and updates the 16-bit Flag Register.',
      'When the EU executes a branch instruction (JMP, CALL, RET, conditional jump taken), the sequentially prefetched bytes in the queue become stale, so the BIU immediately flushes the queue and reloads from the new CS:IP target.',
    ],
    architectureDetails:
      'AX, BX, CX, DX can each be split into High/Low 8-bit registers (AH/AL, BH/BL, CH/CL, DH/DL). Memory is physically organized into Even Bank (D0–D7, selected by A0=0) and Odd Bank (D8–D15, selected by BHE\'=0) so aligned 16-bit words transfer in a single 4-T-state bus cycle.',
    terminology: [
      { term: 'BIU (Bus Interface Unit)', definition: 'Front-end unit containing CS, DS, SS, ES, IP, 20-bit Address Adder, and the 6-byte Instruction Queue.' },
      { term: 'EU (Execution Unit)', definition: 'Back-end unit containing 16-bit ALU, AX–DX, SP/BP/SI/DI, Control Unit, and 16-bit Flag Register.' },
      { term: '6-Byte Prefetch Queue', definition: 'FIFO byte buffer between BIU and EU implementing 2-stage instruction pipelining (4 bytes in 8088).' },
      { term: 'BHE\' (Bus High Enable)', definition: 'Active-low pin enabling the Odd memory bank (D8–D15) for 16-bit word or odd-byte transfers.' },
    ],
    advantages: [
      '2-stage BIU/EU pipelining dramatically hides memory latency and boosts instruction throughput.',
      '16-bit ALU natively supports hardware multiply (MUL/IMUL), divide (DIV/IDIV), and string instructions.',
      '1 MB address space (16× larger than 8085) enables multi-segment structured software.',
    ],
    limitations: [
      'Branch instructions flush the prefetch queue, incurring a temporary refill stall.',
      'Unaligned 16-bit word reads starting at an odd address require two consecutive bus cycles.',
    ],
    comparisonTable: {
      title: 'Intel 8085 vs Intel 8086 Architectural Leap',
      headers: ['Specification', 'Intel 8085', 'Intel 8086'],
      rows: [
        ['Data Bus & ALU Width', '8-bit', '16-bit'],
        ['Address Bus & Memory', '16-bit (64 KB)', '20-bit (1 MB)'],
        ['Instruction Queue', 'None (Non-pipelined)', '6-byte FIFO Queue (Pipelined)'],
        ['Memory Segmentation', 'Flat 64 KB space', 'Segmented (CS, DS, SS, ES)'],
        ['Hardware MUL / DIV', 'Not available', 'Built-in 8/16-bit MUL & DIV'],
        ['Active Flags', '5 Status Flags', '9 Flags (6 Status + 3 Control)'],
      ],
    },
    workedExamples: [
      {
        title: 'Even vs Odd Memory Bank Access Analysis',
        problem: 'Explain how many bus cycles the 8086 takes to read a 16-bit word stored at (a) 02000H and (b) 02001H, specifying A0 and BHE\'.',
        steps: [
          'Case (a) Even-aligned word at 02000H (low byte) & 02001H (high byte): A0=0 enables Even Bank (D0–D7) and BHE\'=0 enables Odd Bank (D8–D15) simultaneously → 1 bus cycle!',
          'Case (b) Odd-aligned word at 02001H & 02002H: Cycle 1 sets A0=1, BHE\'=0 to read 02001H on D8–D15; Cycle 2 sets A0=0, BHE\'=1 to read 02002H on D0–D7 → 2 bus cycles.',
        ],
        finalAnswer: 'Aligned even word = 1 bus cycle; Unaligned odd word = 2 bus cycles.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Why does the 8086 have a 6-byte instruction queue while the 8088 has only a 4-byte queue?',
        modelAnswer: 'The 8086 has a 16-bit external data bus that fetches 2 bytes per bus cycle quickly enough to keep a 6-byte queue fed; the 8088 has an 8-bit external bus fetching 1 byte at a time, where a 4-byte queue matches EU consumption rate.',
      },
      {
        marks: 5,
        question: 'Explain the roles of BIU and EU in achieving pipelining in the 8086. What happens to the queue on a JMP instruction?',
        modelAnswer: 'Explain concurrent BIU prefetching into the 6-byte FIFO while EU decodes/executes from the head of the queue. On JMP/CALL, prefetched sequential bytes are invalid, so the queue flushes and BIU restarts fetching from the new CS:IP.',
      },
      {
        marks: 10,
        question: 'Draw the complete internal block diagram of the Intel 8086 microprocessor and explain every register inside the BIU and EU.',
        modelAnswer: 'Draw BIU (CS, DS, SS, ES, IP, Σ 20-bit adder, 6-byte queue) and EU (ALU, AX/BX/CX/DX, SP/BP/SI/DI, Flags, Control System) clearly, noting specialized roles (AX accumulator, BX base, CX loop counter, DX I/O & high word).',
      },
      {
        marks: 15,
        question: 'Compare 8085 and 8086 architectures thoroughly, then explain 8086 Even/Odd memory banking using A0 and BHE\' with aligned and unaligned word transfer examples.',
        modelAnswer: 'Provide a detailed 10-point 8085 vs 8086 comparison, draw the 512 KB Even + 512 KB Odd bank memory wiring with A1–A19, A0, and BHE\', and tabulate all 4 combinations of (BHE\', A0).',
      },
    ],
  },

  '8086-segmentation': {
    introduction:
      'Memory Segmentation is the 8086 addressing mechanism that allows 16-bit internal registers (capable of indexing only 64 KB) to access a full 1 MB (20-bit) physical memory space. The 1 MB space is partitioned into logical 64 KB segments addressed by four 16-bit Segment Registers (CS, DS, SS, ES) combined with 16-bit Offset registers.',
    whyNeeded:
      'Expanding all internal registers and instruction pointers to 20 or 32 bits in 1978 would have bloated silicon die cost and broken 16-bit code compactness. Segmentation cleanly bridges 16-bit pointers to 20-bit physical RAM while isolating Code, Data, and Stack.',
    workingPrinciple: [
      'Every memory reference is specified as a Logical Address (Segment : Offset). Inside the BIU, a dedicated 20-bit hardware adder appends four zero bits (0H) to the right of the 16-bit Segment Register—effectively multiplying it by 16 (10H)—to compute the 20-bit Segment Base Address (always aligned on a 16-byte paragraph boundary).',
      'Next, the BIU adds the 16-bit Offset (0000H–FFFFH) to the Base Address: Physical Address (PA) = (Segment × 10H) + Offset.',
      'Default pairings enforced by hardware: CS:IP (Instruction Fetch), SS:SP / SS:BP (Stack & Frame ops), DS:BX / DS:SI / DS:DI (Data variables), and ES:DI (String instruction destinations). Segment Override Prefixes allow redirecting data references to another segment.',
    ],
    architectureDetails:
      'At any instant, 4 active 64 KB segments (up to 256 KB) are directly visible without reloading segment registers. Segments may be completely disjoint, contiguous, or overlapping (allowing multiple logical Segment:Offset pairs to map to the exact same physical byte!).',
    terminology: [
      { term: 'Logical Address', definition: 'Programmer-visible Segment:Offset notation (e.g., 2400H:1234H).' },
      { term: 'Physical Address (PA)', definition: 'Actual 20-bit address placed on external pins A19–A0 = (Segment × 10H) + Offset.' },
      { term: 'Paragraph Boundary', definition: 'Every 16-byte boundary (ending in hex 0H) where a new 8086 segment can legally begin.' },
      { term: 'Overlapping Segments', definition: 'Two segments whose 64 KB address spans partially coincide to conserve RAM in small programs.' },
    ],
    advantages: [
      'Enables 1 MB memory addressing using compact 16-bit registers and 16-bit instruction offsets.',
      'Supports effortless program relocation: moving code in RAM only requires updating CS/DS without editing internal offsets.',
      'Logically separates Code, Data, and Stack regions for cleaner multi-user and modular programming.',
    ],
    limitations: [
      'Individual data arrays larger than 64 KB require cumbersome far-pointer segment switching.',
      'Non-unique logical-to-physical mapping (aliasing) complicates pointer comparison.',
    ],
    comparisonTable: {
      title: '8086 Default Segment & Offset Pairings',
      headers: ['Segment Register', 'Default Offset(s)', 'Memory Purpose', 'Can Override?'],
      rows: [
        ['CS (Code)', 'IP', 'Instruction opcode fetching', 'No'],
        ['SS (Stack)', 'SP, BP', 'PUSH, POP, CALL, RET, stack frames', 'BP yes; SP no'],
        ['DS (Data)', 'BX, SI, DI, 16-bit disp', 'General variables & string source', 'Yes (CS/SS/ES)'],
        ['ES (Extra)', 'DI (string ops)', 'Destination for MOVSB, STOSB, SCASB', 'No (for string dest)'],
      ],
    },
    workedExamples: [
      {
        title: '20-Bit Physical Address & Segment Span Calculation',
        problem: 'If DS = 348AH and BX = 4214H, calculate (a) the Segment Base Address, (b) the Segment End Address, and (c) the 20-bit Physical Address.',
        steps: [
          '(a) Base Address = DS × 10H = 348A0H.',
          '(b) End Address = Base + FFFFH = 348A0H + 0FFFFH = 4489FH (64 KB span).',
          '(c) Physical Address = 348A0H + 04214H = 38AB4H.',
        ],
        finalAnswer: 'Base = 348A0H | Range = 348A0H–4489FH | Physical Address = 38AB4H.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Calculate the 20-bit physical address if CS = 2400H and IP = 1234H.',
        modelAnswer: 'PA = (CS × 10H) + IP = 24000H + 1234H = 25234H.',
      },
      {
        marks: 5,
        question: 'Explain memory segmentation in the 8086 and list four engineering advantages.',
        modelAnswer: 'Explain 1 MB divided into 64 KB segments via CS/DS/SS/ES, derive PA = Segment×10H + Offset, and list advantages: 1 MB reach with 16-bit pointers, relocatability, code/data/stack separation, and compact code.',
      },
      {
        marks: 10,
        question: 'Explain overlapping vs non-overlapping segments in 8086 with a neat memory map diagram, tabulate all default Segment:Offset rules, and prove that 2000H:0150H and 2010H:0050H refer to the exact same physical byte.',
        modelAnswer: 'Draw overlapping vs disjoint 64 KB windows inside 00000H–FFFFFH, list all 4 default pairings, and compute 20000H+0150H = 20150H and 20100H+0050H = 20150H.',
      },
      {
        marks: 15,
        question: 'Describe all 8086 data addressing modes (Immediate, Register, Direct, Register Indirect, Based, Indexed, Based-Indexed, Based-Indexed with Displacement) and compute effective and physical addresses for MOV AX, [BX+SI+0020H] given DS=4000H, BX=1200H, SI=0350H.',
        modelAnswer: 'Define all 8 addressing modes with syntax examples; calculate EA = 1200H + 0350H + 0020H = 1570H; PA = 40000H + 1570H = 41570H (reads AL from 41570H and AH from 41571H).',
      },
    ],
  },

  '8086-modes-flags': {
    introduction:
      'The Intel 8086 expands status and system control through a 16-bit Flag Register (9 active bits: 6 Status + 3 Control), dual-mode hardware pin switching (Minimum Mode for single-CPU boards vs Maximum Mode for multiprocessor systems), and a 256-entry Interrupt Vector Table (IVT) occupying the first 1 KB of memory.',
    whyNeeded:
      'Signed 16-bit arithmetic requires an Overflow Flag (OF), hardware debuggers need a single-step Trap Flag (TF), string loops need a Direction Flag (DF), and workstation motherboards needed seamless support for 8087 math coprocessors without manufacturing two separate CPU packages.',
    workingPrinciple: [
      'Flag Register (16-bit): Status flags are CF (D0), PF (D2), AF (D4), ZF (D6), SF (D7), and OF (D11 — detects signed overflow when Carry-in to MSB ≠ Carry-out of MSB). Control flags are TF (D8 — triggers Type 1 single-step trap after every instruction), IF (D9 — enables maskable INTR via STI/CLI), and DF (D10 — 0 auto-increments SI/DI, 1 auto-decrements SI/DI in string ops).',
      'Minimum vs Maximum Mode: Pin 33 (MN/MX\') strapped HIGH (+5V) places 8086 in Minimum Mode where pins 24–31 directly emit ALE, RD\', WR\', M/IO\', DT/R\', DEN\', INTA\', HOLD, and HLDA. Strapping MN/MX\' LOW (GND) enters Maximum Mode, repurposing pins 24–31 into S2\', S1\', S0\', LOCK\', QS1, QS0, and RQ\'/GT\' so an external 8288 Bus Controller generates system signals for multiprocessor/8087 sharing.',
      'Interrupt Vector Table (IVT): Addresses 00000H–003FFH (1024 bytes) store 256 four-byte vectors (Type 0 to Type 255). For Interrupt Type N, new IP is read from (4×N) and new CS from (4×N + 2). Dedicated types: Type 0 (Divide Error), Type 1 (Single Step), Type 2 (NMI), Type 3 (Breakpoint), Type 4 (INTO Overflow).',
    ],
    architectureDetails:
      'On any 8086 interrupt, the CPU automatically pushes Flags (2B), clears IF and TF, pushes CS (2B), pushes IP (2B) — consuming 6 stack bytes — before jumping to the IVT target. IRET pops all 6 bytes back cleanly.',
    terminology: [
      { term: 'Overflow Flag (OF · D11)', definition: 'Set to 1 when signed arithmetic exceeds representable 2\'s complement range (-128..+127 or -32768..+32767).' },
      { term: 'Trap Flag (TF · D8)', definition: 'Setting TF=1 forces the 8086 to execute a Type 1 interrupt after every single instruction for debugging.' },
      { term: '8288 Bus Controller', definition: 'Support chip used in Maximum Mode that decodes S2\'–S0\' into MRDC\', MWTC\', IORC\', IOWC\', ALE, and DEN.' },
      { term: 'IVT (00000H–003FFH)', definition: '1 KB lookup table mapping 256 interrupt types to 4-byte CS:IP ISR entry addresses.' },
    ],
    advantages: [
      'One silicon chip serves both low-cost single-processor boards and coprocessor-accelerated workstations.',
      '256 flexible software/hardware interrupt vectors underpin BIOS and OS system call interfaces.',
    ],
    limitations: [
      'Maximum mode requires extra external ICs (8288 Bus Controller, 8289 Bus Arbiter).',
      'Real-mode IVT sits in unprotected low RAM, vulnerable to wild pointer overwrites.',
    ],
    comparisonTable: {
      title: '8086 Minimum Mode vs Maximum Mode',
      headers: ['Feature', 'Minimum Mode (MN/MX\' = 1)', 'Maximum Mode (MN/MX\' = 0)'],
      rows: [
        ['System Topology', 'Single 8086 processor', 'Multiprocessor + 8087 / 8089'],
        ['Control Signals', 'Generated directly by 8086', 'Generated externally by 8288'],
        ['Bus Arbitration', 'HOLD and HLDA pins', 'RQ\'/GT0\' and RQ\'/GT1\' pins'],
        ['Queue Status Pins', 'Not available', 'QS1, QS0 track prefetch queue'],
        ['Bus Locking', 'Not available', 'LOCK\' pin prevents bus takeover'],
        ['Board Cost', 'Lower (fewer support ICs)', 'Higher (needs 8288 / 8289)'],
      ],
    },
    workedExamples: [
      {
        title: 'IVT Address Calculation & Signed Overflow Check',
        problem: '(a) Find the exact physical IVT memory addresses storing IP and CS for INT 21H. (b) Check CF and OF after adding 8-bit signed numbers 70H (+112) and 20H (+32).',
        steps: [
          '(a) Type N = 21H = 33 decimal. Starting IVT address = 4 × 33 = 132 decimal = 00084H.',
          'IP low byte at 00084H, IP high byte at 00085H; CS low byte at 00086H, CS high byte at 00087H.',
          '(b) 70H + 20H = 90H (1001 0000B = −112 signed!). Adding two positive numbers produced a negative MSB → OF = 1, while unsigned sum < 256 → CF = 0.',
        ],
        finalAnswer: '(a) IP at 00084H–00085H, CS at 00086H–00087H | (b) Result = 90H, CF = 0, OF = 1.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Distinguish between Carry Flag (CF) and Overflow Flag (OF) in the 8086.',
        modelAnswer: 'CF detects out-of-range carry/borrow in UNSIGNED arithmetic (carry out of MSB). OF detects out-of-range sign corruption in SIGNED 2\'s complement arithmetic (carry into MSB XOR carry out of MSB).',
      },
      {
        marks: 5,
        question: 'Draw the 16-bit 8086 Flag Register and explain the three Control Flags (TF, IF, DF).',
        modelAnswer: 'Plot bits D15–D0 showing all 9 active flags and 7 reserved slots. Explain TF (single-stepping via INT 1), IF (enabling INTR via STI/CLI), and DF (string auto-increment CLD vs auto-decrement STD).',
      },
      {
        marks: 10,
        question: 'Compare Minimum Mode and Maximum Mode configurations of 8086 with neat schematic block diagrams showing 8284, 8282 latches, 8286 transceivers, and 8288 Bus Controller.',
        modelAnswer: 'Draw both configuration schematics, show pin 24–31 dual definitions, and tabulate 6+ differences between Minimum and Maximum modes.',
      },
      {
        marks: 15,
        question: 'Explain the 8086 Interrupt mechanism in full detail: Interrupt Vector Table structure, dedicated Types 0–4, hardware NMI vs INTR, software INT n, exact stack actions on entry and IRET, and priority ordering.',
        modelAnswer: 'Draw the 00000H–003FFH IVT map, detail Types 0–4, trace the 6-byte stack push (Flags, CS, IP) + IF/TF clear, explain IRET restoration, and solve an INT 21H vector lookup.',
      },
    ],
  },

  '8051-architecture': {
    introduction:
      'The Intel 8051 (MCS-51 family, 1980) is an 8-bit Harvard-architecture single-chip microcontroller integrating an 8-bit CPU with a Boolean bit processor, 4 KB on-chip Program ROM, 128 bytes of internal Data RAM, 21 Special Function Registers (SFRs), four 8-bit bidirectional I/O ports (32 pins), two 16-bit Timers/Counters, a full-duplex UART serial port, and a 5-source two-priority interrupt system.',
    whyNeeded:
      'Embedded industrial and consumer controllers require compact single-chip integration, rapid interrupt context switching, and direct bit-level control of relays, LEDs, and sensor switches—features awkward and expensive to implement with an external-bus 8085 system.',
    workingPrinciple: [
      'Internal Data Memory (00H–7FH = 128 bytes) is uniquely partitioned into three functional zones: (1) 00H–1FH (32 bytes) forms 4 Register Banks (Bank 0–3), each containing R0–R7; switching PSW bits RS1/RS0 instantly swaps working registers during an ISR without pushing 8 bytes to the stack! (2) 20H–2FH (16 bytes) forms 128 individually bit-addressable flags (bit addresses 00H–7FH) manipulated by SETB, CLR, CPL, JB, and JNB. (3) 30H–7FH (80 bytes) serves as general scratchpad RAM and relocated stack space.',
      'Addresses 80H–FFH map directly to the 21 Special Function Registers (SFRs), accessible via direct addressing only (e.g., A=E0H, B=F0H, PSW=D0H, SP=81H, DPL=82H, DPH=83H, P0=80H, P1=90H, P2=A0H, P3=B0H). SFRs whose hex addresses end in 0H or 8H are also bit-addressable!',
      'CRITICAL DIFFERENCE FROM 8085: On reset, SP initializes to 07H and the 8051 stack grows UPWARD (PUSH increments SP first, then writes to 08H, 09H...). If Bank 1 (08H–0FH) is used, software should relocate SP (e.g., MOV SP, #30H) to avoid stack/register collision.',
    ],
    architectureDetails:
      'External expandability: up to 64 KB External Code ROM (selected via PSEN\' and EA\') + up to 64 KB External Data RAM (accessed via MOVX using DPTR and RD\'/WR\'). One 8051 Machine Cycle = 12 Oscillator Periods.',
    terminology: [
      { term: 'PSW (D0H)', definition: 'Program Status Word holding CY, AC, F0, RS1, RS0 (Register Bank Select), OV (Overflow), and P (Parity).' },
      { term: 'DPTR (DPH=83H, DPL=82H)', definition: 'The 8051\'s primary 16-bit data pointer used for external RAM (MOVX) and ROM lookup tables (MOVC).' },
      { term: 'EA\' (Pin 31 · External Access)', definition: 'Tie HIGH (+5V) to boot from internal 4 KB ROM; tie LOW (GND) to fetch all code from external ROM.' },
      { term: 'Bit-Addressable Space', definition: 'RAM 20H–2FH (128 bits) plus SFRs ending in 0H/8H, addressable down to a single bit.' },
    ],
    advantages: [
      '4 Register Banks allow 1-instruction interrupt context switching.',
      'True Boolean processor supports single-bit logic directly on RAM and I/O pins.',
      'Hardware 8×8 MUL AB and DIV AB instructions built directly into the ALU.',
    ],
    limitations: [
      '12 clocks per machine cycle makes classic 8051 slower per MHz than single-cycle AVR/ARM cores.',
      'Small 128-byte internal RAM requires careful stack management when using Register Banks 1–3.',
    ],
    comparisonTable: {
      title: 'Intel 8051 Internal RAM & SFR Memory Map',
      headers: ['Address Range', 'Size', 'Region Name', 'Addressing & Notes'],
      rows: [
        ['00H – 07H', '8 B', 'Register Bank 0 (Default)', 'R0–R7 when PSW RS1:RS0 = 00'],
        ['08H – 1FH', '24 B', 'Register Banks 1, 2, 3', 'Selected via RS1:RS0 = 01, 10, 11'],
        ['20H – 2FH', '16 B', 'Bit-Addressable RAM', '128 bits addressed 00H–7FH'],
        ['30H – 7FH', '80 B', 'General Scratchpad', 'Variables & relocated Stack'],
        ['80H – FFH', '128 B slot', '21 Special Function Regs', 'Direct addressing ONLY (SFRs at 0H/8H bit-addr)'],
      ],
    },
    workedExamples: [
      {
        title: 'Computing Bit Address inside 20H–2FH & Register Bank Selection',
        problem: '(a) Find the bit address of bit D3 inside RAM byte 24H. (b) Which physical RAM address corresponds to R5 when PSW = 18H?',
        steps: [
          '(a) Byte 24H is offset (24H − 20H) = 4 bytes from start of bit-addressable zone. Base bit = 4 × 8 = 32 = 20H. Add bit position D3 → 20H + 3 = 23H (bit address 23H).',
          '(b) PSW = 18H = 0001 1000B → bits D4(RS1) = 1 and D3(RS0) = 1 → Bank 3 active (18H–1FH).',
          'R5 inside Bank 3 = 18H + 5 = 1DH.',
        ],
        finalAnswer: '(a) Bit address 23H | (b) Bank 3 active → R5 maps to internal RAM 1DH.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'What is the reset value of SP in 8051 and in which direction does its stack grow?',
        modelAnswer: 'On reset, SP = 07H. Unlike 8085, the 8051 stack grows UPWARD: PUSH increments SP first (to 08H) and then writes data; POP reads data and then decrements SP.',
      },
      {
        marks: 5,
        question: 'Draw the PSW register of 8051 and explain how RS1 and RS0 select the four register banks.',
        modelAnswer: 'Draw D7(CY), D6(AC), D5(F0), D4(RS1), D3(RS0), D2(OV), D1(—), D0(P). Show Bank 0 (00: 00–07H), Bank 1 (01: 08–0FH), Bank 2 (10: 10–17H), Bank 3 (11: 18–1FH) and explain interrupt context switching.',
      },
      {
        marks: 10,
        question: 'Explain the complete internal RAM organization (00H–7FH) and Special Function Register map (80H–FFH) of the Intel 8051 with a neat memory diagram.',
        modelAnswer: 'Draw the partitioned 256-byte internal map, explain all 3 RAM zones (Banks, Bit-addressable 128 bits, Scratchpad), list key SFRs with exact hex addresses, and explain why 80H–FFH uses direct addressing.',
      },
      {
        marks: 15,
        question: 'Draw the internal architecture block diagram of the 8051 microcontroller, explain its Harvard external memory interfacing using P0, P2, ALE, PSEN\', EA\', RD\', and WR\', and compare 8051 with 8085 across 8 criteria.',
        modelAnswer: 'Provide the full 8051 block diagram, external 64KB ROM + 64KB RAM interfacing schematic (with 74LS373 on P0), and an 8-row 8051 vs 8085 architectural table.',
      },
    ],
  },

  '8051-ports-timers-serial': {
    introduction:
      'Beyond its CPU core, the 8051 integrates four 8-bit I/O ports (P0–P3), two programmable 16-bit Timers/Counters (Timer 0 and Timer 1), a full-duplex UART Serial Communication unit, and a 5-source two-level priority Interrupt Controller—making it a self-contained embedded control platform.',
    whyNeeded:
      'Real-time embedded applications must simultaneously measure external pulse frequencies, generate precise millisecond delays, exchange ASCII/binary telemetry over RS-232 UART, and respond instantly to external sensor triggers without external 8255/8254/8251 support chips.',
    workingPrinciple: [
      'I/O Ports (P0–P3): All 4 ports initialize to FFH (input mode) on reset. Port 0 (Pins 32–39) has open-drain outputs requiring external 10 kΩ pull-up resistors for general I/O (or acts as AD0–AD7 for external memory). Port 1 (1–8) is pure GPIO with internal pull-ups. Port 2 (21–28) is GPIO or high address A8–A15. Port 3 (10–17) carries dual alternate functions: RXD (P3.0), TXD (P3.1), INT0\' (P3.2), INT1\' (P3.3), T0 (P3.4), T1 (P3.5), WR\' (P3.6), RD\' (P3.7).',
      'Timers/Counters (T0 & T1): Configured via TMOD (89H: upper nibble T1, lower nibble T0 → [GATE | C/T\' | M1 | M0]) and started/monitored via TCON (88H: TR0/TR1 run bits, TF0/TF1 overflow flags). C/T\'=0 counts internal machine cycles (f_osc / 12); C/T\'=1 counts external falling edges on pin T0/T1. Modes: Mode 0 (13-bit), Mode 1 (16-bit: 0000H–FFFFH), Mode 2 (8-bit Auto-Reload from THx → TLx, ideal for UART baud rate!), Mode 3 (Split Timer 0).',
      'Serial UART & Interrupts: SCON (98H) sets Mode 1 (8-bit UART, 10-bit frame: 1 start + 8 data + 1 stop, variable baud via Timer 1 Mode 2). SBUF (99H) buffers TX and RX bytes, flagging TI/RI. Five interrupts enabled via IE (A8H) and prioritized via IP (B8H): INT0 (0003H), TF0 (000BH), INT1 (0013H), TF1 (001BH), Serial RI/TI (0023H).',
    ],
    architectureDetails:
      'Why 11.0592 MHz crystal? Dividing 11.0592 MHz by 12 gives 921.6 kHz machine clock; dividing by 32 inside UART Mode 1 yields 28,800 Hz, which divides evenly by 3 (TH1 = −3 = FDH) for exact 9600 bps with 0.00% framing error!',
    terminology: [
      { term: 'TMOD (89H)', definition: 'Non-bit-addressable SFR selecting Gate, Counter/Timer, and Mode (M1, M0) for Timers 0 and 1.' },
      { term: 'TCON (88H)', definition: 'Bit-addressable SFR controlling Timer Run (TR0/TR1), Overflow Flags (TF0/TF1), and External Interrupt trigger edges.' },
      { term: 'Auto-Reload Mode (Mode 2)', definition: '8-bit timer mode where TLx overflows from FFH→00H, sets TFx, and hardware copies THx back into TLx automatically.' },
      { term: 'SCON & SBUF (98H, 99H)', definition: 'Serial Control register (Mode, REN, TI, RI) and dual TX/RX shift buffer register.' },
    ],
    advantages: [
      'Hardware timers generate jitter-free delays and baud clocks while the CPU executes other tasks.',
      'Dual-level Interrupt Priority (IP register) allows critical real-time ISRs to preempt lower-priority ISRs.',
    ],
    limitations: [
      'Port 0 lacks internal pull-ups, catching beginners off guard when driving LEDs or reading switches.',
      'Only 1 UART channel and no built-in ADC/PWM on original 8051 (added in later derivatives like 8052/C8051).',
    ],
    comparisonTable: {
      title: 'Intel 8051 Interrupt Vector & Priority Table',
      headers: ['Interrupt Source', 'Flag Bit', 'Vector Address', 'Default Priority', 'Auto-Cleared?'],
      rows: [
        ['External Interrupt 0 (INT0\')', 'IE0', '0003H', '1 (Highest)', 'Yes (if edge-trig)'],
        ['Timer 0 Overflow', 'TF0', '000BH', '2', 'Yes (by hardware)'],
        ['External Interrupt 1 (INT1\')', 'IE1', '0013H', '3', 'Yes (if edge-trig)'],
        ['Timer 1 Overflow', 'TF1', '001BH', '4', 'Yes (by hardware)'],
        ['Serial Port (TX / RX)', 'TI or RI', '0023H', '5 (Lowest)', 'No (clear in ISR!)'],
      ],
    },
    workedExamples: [
      {
        title: 'Timer 0 Mode 1 Exact 5 ms Delay @ 11.0592 MHz',
        problem: 'Calculate TH0 and TL0 reload values to generate a 5 ms delay using Timer 0 Mode 1 with an 11.0592 MHz crystal.',
        steps: [
          'Machine cycle period T_mc = 12 / 11.0592 MHz = 1.085 µs.',
          'Number of counts needed N = 5,000 µs / 1.085 µs = 4,608 counts.',
          'Preload value = 65536 − 4608 = 60928 decimal = EE00H.',
          'Load TH0 = EEH, TL0 = 00H; MOV TMOD, #01H; SETB TR0; wait JNB TF0, $; CLR TR0; CLR TF0.',
        ],
        finalAnswer: 'TH0 = EEH, TL0 = 00H (Preload = EE00H).',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'Why does Port 0 require external pull-up resistors when used as general-purpose I/O, and why is 11.0592 MHz preferred for 8051 UART?',
        modelAnswer: 'Port 0 output stage is open-drain (no internal pull-up FETs) so it can serve as a multiplexed high-speed AD0–AD7 bus. 11.0592 MHz ÷ (12 × 32) = 28,800 Hz, dividing cleanly by integers to produce exact standard baud rates (9600, 4800, 2400 bps).',
      },
      {
        marks: 5,
        question: 'List all Port 3 alternate functions and explain the bit format of the TMOD register.',
        modelAnswer: 'List P3.0–P3.7 (RXD, TXD, INT0\', INT1\', T0, T1, WR\', RD\') and draw TMOD (D7–D4 for Timer 1, D3–D0 for Timer 0: GATE, C/T\', M1, M0) explaining all 4 timer modes.',
      },
      {
        marks: 10,
        question: 'Explain 8051 Timer Mode 1 and Mode 2 in detail. Write an 8051 assembly program to generate a 1 kHz square wave on pin P1.5 using Timer 0 Mode 1 (f_osc = 11.0592 MHz).',
        modelAnswer: 'For 1 kHz square wave: period = 1 ms → half-period = 500 µs → N = 500 / 1.085 = 461 → 65536 − 461 = 65075 = FE33H. Write loop loading TH0=#FEH, TL0=#33H, SETB TR0, polling TF0, and executing CPL P1.5.',
      },
      {
        marks: 15,
        question: 'Explain the 8051 UART serial communication architecture (SCON, SBUF, PCON.SMOD, Timer 1 baud generation) and write an assembly routine to transmit the string "OK" continuously at 9600 bps, 8-N-1.',
        modelAnswer: 'Draw SCON bit format (SM0, SM1, SM2, REN, TB8, RB8, TI, RI), derive TH1 = 256 − (28800 / 9600) = 253 = FDH, and write complete code initializing TMOD=#20H, TH1=#FDH, SCON=#50H, SETB TR1, sending \'O\' and \'K\' via SBUF while polling TI.',
      },
    ],
  },

  'periph-8255': {
    introduction:
      'The Intel 8255A Programmable Peripheral Interface (PPI) is a general-purpose 40-pin I/O expansion IC providing 24 software-configurable digital I/O lines arranged as three 8-bit ports—Port A (PA0–PA7), Port B (PB0–PB7), and Port C (PC0–PC7, split into PC Upper and PC Lower)—interfaced cleanly to 8085 or 8086 buses.',
    whyNeeded:
      'Microprocessors like the 8085 and 8086 have zero dedicated GPIO pins on-chip. Hardwiring discrete latches and tri-state buffers for every switch, LED, printer, or stepper motor is inflexible; the 8255A lets software reconfigure all 24 pins instantaneously via one Control Word byte.',
    workingPrinciple: [
      'Address pins A1 and A0 select the internal register when CS\'=0: 00 = Port A, 01 = Port B, 10 = Port C, 11 = Control Word Register (write-only).',
      'I/O Mode (Control Word D7 = 1): Group A controls Port A (Modes 0, 1, or 2 via D6–D5; Direction via D4) and Port C Upper (D3). Group B controls Port B (Mode 0 or 1 via D2; Direction via D1) and Port C Lower (D0). Bit = 1 configures Input; Bit = 0 configures Output.',
      'BSR Mode (Control Word D7 = 0): Bit Set/Reset Mode affects ONLY Port C without disturbing Ports A or B! Bits D3–D1 pick the bit index (000 = PC0 through 111 = PC7), and D0 = 1 sets that bit HIGH while D0 = 0 resets it LOW—ideal for toggling stepper coils or ADC SOC pulses.',
      'Three Operating Modes: Mode 0 (Simple latched output / unlatched input), Mode 1 (Strobed Handshake I/O using Port C pins for STB\'/IBF/INTR or OBF\'/ACK\'/INTR), and Mode 2 (Bidirectional 8-bit bus on Port A ONLY using PC3–PC7 for handshaking).',
    ],
    architectureDetails:
      'RESET pin (Pin 35, active HIGH) clears the Control Register and configures all 24 pins of Ports A, B, and C as high-impedance Inputs to protect connected hardware on power-up.',
    terminology: [
      { term: 'Control Word Register (CWR)', definition: 'Write-only register at A1=1, A0=1 configuring I/O directions, operating modes, or BSR Port C bit toggles.' },
      { term: 'BSR Mode (D7 = 0)', definition: 'Bit Set/Reset mode enabling individual set/clear operations on PC0–PC7 without read-modify-write masking.' },
      { term: 'Group A & Group B', definition: 'Internal control partition: Group A = Port A + PC7–PC4; Group B = Port B + PC3–PC0.' },
      { term: 'Handshaking (Mode 1)', definition: 'Hardware coordination signals (STB\', IBF, OBF\', ACK\', INTR) synchronizing fast CPUs with slower peripherals like printers.' },
    ],
    advantages: [
      '24 reprogrammable I/O pins in a single 40-pin IC eliminate dozens of discrete latch/buffer gates.',
      'Built-in Mode 1/Mode 2 hardware handshaking simplifies interrupt-driven peripheral interfaces.',
      'BSR mode provides clean single-bit control on Port C.',
    ],
    limitations: [
      'Control Register is write-only (cannot read back active configuration).',
      'Low pin drive current (~1.7–2.5 mA) requires external ULN2003 / transistor drivers for relays or motors.',
    ],
    comparisonTable: {
      title: '8255A Port Addressing & Operating Modes',
      headers: ['A1', 'A0', 'Selected Target', 'Supported Modes'],
      rows: [
        ['0', '0', 'Port A (PA0–PA7)', 'Mode 0, Mode 1, Mode 2 (Bidirectional)'],
        ['0', '1', 'Port B (PB0–PB7)', 'Mode 0, Mode 1'],
        ['1', '0', 'Port C (PCU + PCL)', 'Mode 0 (two 4-bit), BSR, or Mode 1/2 Handshake'],
        ['1', '1', 'Control Word Register', 'Write-only: D7=1 (I/O Mode), D7=0 (BSR Mode)'],
      ],
    },
    workedExamples: [
      {
        title: 'Computing 8255A I/O and BSR Control Words',
        problem: 'Given 8255 port addresses 80H (PA), 81H (PB), 82H (PC), 83H (CWR): (a) Find the I/O Control Word for PA = Mode 0 Input, PB = Mode 0 Output, PCU = Output, PCL = Input. (b) Find the BSR Control Word to set pin PC5 HIGH.',
        steps: [
          '(a) I/O Word: D7=1, D6D5=00 (PA M0), D4=1 (PA In), D3=0 (PCU Out), D2=0 (PB M0), D1=0 (PB Out), D0=1 (PCL In) → 1001 0001B = 91H.',
          '(b) BSR Word: D7=0, D6–D4=000 (don\'t care), D3D2D1=101 (select PC5), D0=1 (SET) → 0000 1011B = 0BH.',
        ],
        finalAnswer: '(a) MVI A, 91H ; OUT 83H | (b) MVI A, 0BH ; OUT 83H.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'What is the difference between I/O Mode and BSR Mode in the 8255A PPI?',
        modelAnswer: 'When D7=1 of the Control Word, 8255 enters I/O Mode to configure directions/modes of Ports A, B, and C. When D7=0, it enters BSR Mode to individually set or reset any single pin (PC0–PC7) of Port C.',
      },
      {
        marks: 5,
        question: 'Draw both I/O Mode and BSR Mode Control Word formats of the 8255A and compute the control words for (a) All Mode 0 Outputs, and (b) Resetting PC3.',
        modelAnswer: 'Draw D7–D0 for both modes. (a) 1000 0000B = 80H; (b) 0000 0110B = 06H.',
      },
      {
        marks: 10,
        question: 'Draw the internal block diagram of the 8255A PPI and explain Mode 0, Mode 1 (input & output handshake signals), and Mode 2 in detail.',
        modelAnswer: 'Draw Data Bus Buffer, Read/Write Control Logic, Group A/B Controls, and Ports A/B/C. Explain STB\'/IBF/INTR (Mode 1 In), OBF\'/ACK\'/INTR (Mode 1 Out), and Mode 2 bidirectional bus on Port A.',
      },
      {
        marks: 15,
        question: 'Interface an 8255A with an 8085 at base port address 40H to read 8 DIP switches on Port A, display the 1\'s complement on 8 LEDs on Port B, and toggle a buzzer on PC7 using BSR mode. Show full decoding schematic, Control Words, and assembly code.',
        modelAnswer: 'Decode A7–A2=010000 + IO/M\'=1 for CS\' (ports 40H–43H). Control Word = 90H (PA In, PB/PC Out). Write 8085 program reading IN 40H, CMA, OUT 41H, and pulsing PC7 via BSR 0FH/0EH.',
      },
    ],
  },

  'periph-timer-pic-dma': {
    introduction:
      'High-efficiency microprocessor systems offload timing, multi-source interrupt arbitration, and bulk memory transfers to three specialized Intel support controllers: the 8253/8254 Programmable Interval Timer (PIT), the 8259A Programmable Interrupt Controller (PIC), and the 8237 Direct Memory Access (DMA) Controller.',
    whyNeeded:
      'Running software delay loops wastes 100% of CPU cycles; a single INTR pin cannot prioritize 8–64 peripherals; and copying kilobytes of disk/ADC data through CPU registers limits throughput to a fraction of RAM bandwidth. Dedicated hardware controllers solve all three bottlenecks.',
    workingPrinciple: [
      '8253 / 8254 Interval Timer: Contains three independent 16-bit down-counters (Counter 0, 1, 2) programmable in Binary or BCD across 6 modes: Mode 0 (Interrupt on Terminal Count), Mode 1 (Hardware Retriggerable One-Shot), Mode 2 (Rate Generator — periodic 1-clock low pulse), Mode 3 (Square Wave Generator — 50% duty cycle), Mode 4 (Software Triggered Strobe), Mode 5 (Hardware Triggered Strobe). The 8254 upgrades the 8253 with a 10 MHz clock rating and a Read-Back command.',
      '8259A Interrupt Controller: Accepts 8 interrupt lines (IR0–IR7). Internally, the IRR (Interrupt Request Register) latches pending requests, IMR (Interrupt Mask Register) blocks masked inputs, the Priority Resolver picks the highest unmasked line and asserts INT to the CPU, and upon INTA\' marks the ISR (In-Service Register) while supplying the vector address. Configured via ICW1–ICW4 (initialization) and OCW1–OCW3 (runtime masking, EOI, rotating priority). Cascading 1 Master + 8 Slaves manages 64 vectored interrupts!',
      '8237 DMA Controller: Features 4 independent channels (CH0–CH3), each with a 16-bit Current Address Register and 16-bit Word Count Register. When a peripheral asserts DREQ, 8237 raises HOLD to the 8085; the CPU tri-states its buses and replies HLDA; 8237 asserts DACK and drives Address/MEMR\'/MEMW\'/IOR\'/IOW\' directly to transfer blocks in Single, Block, Demand, or Cascade modes.',
    ],
    architectureDetails:
      '8254 addresses via A1, A0: 00=Counter 0, 01=Counter 1, 10=Counter 2, 11=Control Word. 8259A uses single address line A0 (0 or 1) to sequence ICW1→ICW2→(ICW3)→(ICW4) and OCWs. 8237 transfers up to 64 KB per channel per programming cycle.',
    terminology: [
      { term: 'IRR / ISR / IMR (8259A)', definition: 'Interrupt Request (pending), In-Service (currently executing), and Interrupt Mask (disabled) 8-bit registers.' },
      { term: 'ICW & OCW', definition: 'Initialization Command Words (setup sequence on boot) and Operation Command Words (runtime EOI/masking) for 8259A.' },
      { term: 'Cycle Stealing / Single Mode', definition: 'DMA mode transferring 1 byte per bus acquisition and immediately returning bus control to the CPU.' },
      { term: 'Terminal Count (TC)', definition: 'Event when an 8254 or 8237 down-counter reaches zero, signaling completion of timing or DMA transfer.' },
    ],
    advantages: [
      '8254 generates microsecond-accurate square waves and real-time clock ticks with zero CPU polling.',
      '8259A dynamically supports Fixed, Rotating, and Special Mask priority schemes up to 64 sources.',
      '8237 DMA accelerates bulk RAM↔I/O throughput by 5–10× by eliminating opcode fetch overhead per byte.',
    ],
    limitations: [
      'Complex multi-byte ICW/OCW initialization sequences require strict ordering.',
      'Burst/Block DMA temporarily stalls CPU instruction execution while HOLD is active.',
    ],
    comparisonTable: {
      title: 'Intel Support Controllers Comparison (8254 vs 8259A vs 8237)',
      headers: ['Controller IC', 'Primary Function', 'Channels / Lines', 'Key Hardware Pins'],
      rows: [
        ['8253 / 8254 PIT', 'Hardware timing, delays, waveforms', '3 × 16-bit Counters', 'CLK0–2, GATE0–2, OUT0–2'],
        ['8259A PIC', 'Prioritized vectored interrupts', '8 IR lines (64 cascaded)', 'IR0–IR7, INT, INTA\', CAS0–2, SP\'/EN\''],
        ['8237 DMA', 'Direct RAM ↔ I/O bulk transfer', '4 DMA Channels', 'DREQ0–3, DACK0–3, HRQ(HOLD), HLDA'],
      ],
    },
    workedExamples: [
      {
        title: 'Programming 8254 Counter 0 for a 1 kHz Square Wave',
        problem: 'An 8254 receives a 2 MHz clock on CLK0. Compute the 16-bit Count N and Control Word to generate a 1 kHz square wave on OUT0 in Binary Mode 3.',
        steps: [
          'Required Count N = f_in / f_out = 2,000,000 / 1,000 = 2,000 decimal = 07D0H.',
          'Control Word format [SC1 SC0 | RL1 RL0 | M2 M1 M0 | BCD]: Counter 0 = 00, Read/Load LSB then MSB = 11, Mode 3 = 011, Binary = 0 → 0011 0110B = 36H.',
          'Assembly: MVI A, 36H ; OUT CWR ; MVI A, D0H ; OUT CNT0 ; MVI A, 07H ; OUT CNT0.',
        ],
        finalAnswer: 'Control Word = 36H | Count = 07D0H (Load LSB D0H first, then MSB 07H).',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'State two key differences between the Intel 8253 and 8254 Programmable Interval Timers.',
        modelAnswer: '(1) 8254 supports up to 10 MHz input clocks vs 2.6 MHz on 8253; (2) 8254 includes a Read-Back command allowing software to latch count and status of multiple counters simultaneously.',
      },
      {
        marks: 5,
        question: 'Explain the roles of IRR, IMR, Priority Resolver, and ISR inside the 8259A Interrupt Controller.',
        modelAnswer: 'Trace how IR0–IR7 set bits in IRR, pass through the IMR mask gate, enter the Priority Resolver which selects the highest unmasked bit and asserts INT, and transfer to ISR on INTA\' until cleared by EOI.',
      },
      {
        marks: 10,
        question: 'Explain all 6 operating modes of the 8253/8254 timer with neat output waveforms, and write an initialization routine for Counter 1 in Mode 2.',
        modelAnswer: 'Sketch GATE, CLK, and OUT waveforms for Modes 0–5, clearly contrasting Mode 2 (narrow 1-clock low pulse) vs Mode 3 (50% square wave), and show the 8-bit Control Word + LSB/MSB load sequence.',
      },
      {
        marks: 15,
        question: 'Draw the block diagram of the 8237 DMA controller interfaced to an 8085 microprocessor. Trace the exact DREQ → HOLD → HLDA → DACK signal handshake and compare Single, Block, Demand, and Cascade DMA transfer modes.',
        modelAnswer: 'Draw 8085 ↔ 8237 ↔ RAM ↔ Peripheral with address latch, trace every handshake transition, detail 8237 internal Address/Word-Count/Command/Mode registers, and compare all 4 transfer modes.',
      },
    ],
  },

  'periph-adc-dac-led': {
    introduction:
      'Physical sensors produce continuous analog voltages, and human operators interact via switches, keypads, LEDs, and 7-segment displays. Interfacing these transducers to a digital microprocessor requires Analog-to-Digital Converters (ADC0808/0809), Digital-to-Analog Converters (DAC0808), current-limited LED/7-segment drivers, and matrix keypad scanning routines.',
    whyNeeded:
      'Microprocessors only process discrete 0/1 logic levels. Bridging real-world temperature, voltage, sound, and operator inputs cleanly without electrical damage or mechanical switch-bounce errors is the core skill of embedded hardware engineering.',
    workingPrinciple: [
      'ADC0808/0809 (8-Channel, 8-Bit SAR ADC): Software selects 1 of 8 analog channels (IN0–IN7) via pins A, B, C and latches it with ALE. Pulsing SOC (Start of Conversion) launches Successive Approximation (~100 µs @ 640 kHz clock). When finished, EOC (End of Conversion) goes HIGH; the CPU raises OE (Output Enable) and reads the 8-bit code D0–D7. Resolution (1 LSB) = Vref / 255 (≈ Vref / 256; for 5V, 19.53 mV/step).',
      'DAC0808 (8-Bit R-2R Ladder DAC): Accepts an 8-bit digital word D7–D0 and outputs analog current Iout = Iref × (D / 256). An external Op-Amp (741/LM358) current-to-voltage converter produces Vout = Vref × (D / 256). Sending incremental counts (00H→FFH) generates a sawtooth/ramp wave; ramping up and down generates a triangular wave; looping through a sine lookup table generates a sine wave.',
      '7-Segment Displays & 4×4 Matrix Keypads: A 7-segment display wires 7 LEDs (a–g) + decimal point (dp) to an 8-bit port. Common Cathode (CC) illuminates a segment on logic 1 ("0" = 3FH); Common Anode (CA) illuminates on logic 0 ("0" = C0H). A 4×4 Matrix Keypad monitors 16 keys using only 8 I/O lines (4 Row outputs + 4 Column inputs with pull-ups) by grounding one row at a time, reading columns, and applying a 10–20 ms software debounce delay.',
    ],
    architectureDetails:
      'Every LED or 7-segment pin requires a series current-limiting resistor R = (V_supply − V_LED) / I_LED (typically (5V − 2V) / 10 mA = 300–330 Ω) to protect both the LED and 8255/8051 port drivers.',
    terminology: [
      { term: 'ADC Resolution (Step Size)', definition: 'Smallest analog voltage change producing a 1-LSB digital increment: Vref / (2^n − 1) or Vref / 2^n.' },
      { term: 'SOC & EOC', definition: 'Start of Conversion (input trigger to ADC) and End of Conversion (status flag signaling valid digital output).' },
      { term: 'Common Cathode vs Common Anode', definition: 'CC ties all LED cathodes to GND (active-HIGH 1=ON); CA ties all anodes to +5V (active-LOW 0=ON).' },
      { term: 'Switch Debouncing', definition: 'Inserting a 10–20 ms delay after detecting a keypress so mechanical contact vibrations settle before reading.' },
    ],
    advantages: [
      'ADC0808 integrates an 8-channel analog multiplexer on-chip, reading 8 sensors through one 8-bit port.',
      'Matrix scanning reduces 16-key wiring from 16 GPIO pins down to 8 pins (4 rows + 4 columns).',
    ],
    limitations: [
      '8-bit quantization limits measurement precision to ~0.39% of full scale (1 part in 256).',
      'Software-polled EOC and debounce loops consume CPU cycles unless driven by interrupts/timers.',
    ],
    comparisonTable: {
      title: 'Common Cathode (CC) vs Common Anode (CA) 7-Segment Lookup Codes',
      headers: ['Digit', 'Lit Segments', 'CC Hex (1=ON)', 'CA Hex (0=ON)'],
      rows: [
        ['0', 'a, b, c, d, e, f', '3FH', 'C0H'],
        ['1', 'b, c', '06H', 'F9H'],
        ['2', 'a, b, d, e, g', '5BH', 'A4H'],
        ['3', 'a, b, c, d, g', '4FH', 'B0H'],
        ['5', 'a, c, d, f, g', '6DH', '92H'],
        ['8', 'a, b, c, d, e, f, g', '7FH', '80H'],
      ],
    },
    workedExamples: [
      {
        title: 'ADC0808 Digital Code & DAC0808 Sawtooth Generator',
        problem: '(a) An ADC0808 has Vref = 5.0 V and analog input Vin = 3.125 V. Find the 8-bit hex output. (b) Write an 8085 loop to output a continuous sawtooth waveform on DAC0808 wired to Port 01H.',
        steps: [
          '(a) Step size = 5.0 V / 256 = 19.53125 mV. Digital count = 3.125 / 0.01953125 = 160 decimal = A0H (1010 0000B).',
          '(b) Sawtooth rises linearly 00H → FFH and drops sharply back to 00H on wrap-around: MVI A, 00H ; RAMP: OUT 01H ; INR A ; JMP RAMP.',
        ],
        finalAnswer: '(a) A0H (160 decimal) | (b) 4-instruction ramp loop using OUT 01H + INR A.',
      },
    ],
    universityQuestions: [
      {
        marks: 2,
        question: 'What is key debouncing, and why is it necessary when interfacing mechanical switches to an 8085?',
        modelAnswer: 'Mechanical switch contacts physically bounce open and closed for 5–20 ms upon pressing. Without a 10–20 ms debounce delay in software (or RC Schmitt hardware), the high-speed CPU misreads one press as dozens of presses.',
      },
      {
        marks: 5,
        question: 'Draw the timing/handshake sequence for interfacing ADC0808 with 8085 via 8255A, clearly explaining Channel Select, ALE, SOC, EOC, and OE.',
        modelAnswer: 'Trace the 5-step sequence: write 3-bit channel to A,B,C → pulse ALE & SOC HIGH then LOW → poll EOC via Port C until HIGH → assert OE HIGH → read digital byte from Port A → lower OE.',
      },
      {
        marks: 10,
        question: 'Explain how a 4×4 Matrix Keypad is interfaced to an 8085 through an 8255A PPI. Draw the circuit schematic and flowchart for row scanning, key identification, and debouncing.',
        modelAnswer: 'Connect 4 rows to Port C Lower (Output) and 4 columns with pull-ups to Port C Upper (Input). Flowchart: ground all rows → wait for key press → debounce 20 ms → ground one row at a time → read columns → combine row+col index to look up hex key.',
      },
      {
        marks: 15,
        question: 'Design a complete DAC0808 interfacing schematic with 8085 (via 8255) and write 8085 assembly programs to generate (a) a triangular wave, (b) a square wave, and (c) a staircase wave with 5 discrete steps.',
        modelAnswer: 'Draw 8085 → 8255 Port A → DAC0808 → Op-Amp I-to-V converter. Write well-commented assembly routines: triangular (INR up to FFH then DCR down to 00H), square (00H + delay + FFH + delay), and staircase (add 33H five times with delay).',
      },
    ],
  },
};
