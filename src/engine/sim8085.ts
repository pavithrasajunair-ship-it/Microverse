// Genuine Intel 8085 Microprocessor Assembler & Execution Engine

export interface Flags8085 {
  S: number;  // Bit 7: Sign
  Z: number;  // Bit 6: Zero
  AC: number; // Bit 4: Auxiliary Carry
  P: number;  // Bit 2: Parity (1 = even number of 1s)
  CY: number; // Bit 0: Carry
}

export interface Cpu8085State {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  H: number;
  L: number;
  PC: number;
  SP: number;
  flags: Flags8085;
  memory: Record<number, number>;
  ports: Record<number, number>;
  halted: boolean;
  cycles: number;
  instructionCount: number;
  lastAction: string;
  activePath: string[]; // For animating internal 8085 bus paths
}

export interface AssembledInstruction {
  address: number;
  lineNumber: number;
  source: string;
  mnemonic: string;
  operands: string[];
  bytes: number[];
  tStates: number;
  machineCycles: string[];
}

export interface AssemblyResult {
  instructions: AssembledInstruction[];
  addressMap: Record<number, AssembledInstruction>;
  labels: Record<string, number>;
  errors: Array<{ line: number; message: string }>;
  origin: number;
}

export interface PresetProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  initialMemory?: Record<number, number>;
  code: string;
}

export const toHex8 = (n: number): string => ((n & 0xff) >>> 0).toString(16).toUpperCase().padStart(2, '0');
export const toHex16 = (n: number): string => ((n & 0xffff) >>> 0).toString(16).toUpperCase().padStart(4, '0');
export const toBin8 = (n: number): string => ((n & 0xff) >>> 0).toString(2).padStart(8, '0');

export function packFlags(f: Flags8085): number {
  return (
    ((f.S & 1) << 7) |
    ((f.Z & 1) << 6) |
    ((f.AC & 1) << 4) |
    ((f.P & 1) << 2) |
    (f.CY & 1)
  );
}

export function unpackFlags(byte: number): Flags8085 {
  return {
    S: (byte >> 7) & 1,
    Z: (byte >> 6) & 1,
    AC: (byte >> 4) & 1,
    P: (byte >> 2) & 1,
    CY: byte & 1,
  };
}

export function calcParity(byte: number): number {
  let v = byte & 0xff;
  let ones = 0;
  for (let i = 0; i < 8; i++) {
    if ((v >> i) & 1) ones++;
  }
  return ones % 2 === 0 ? 1 : 0;
}

export function createInitialCpuState(origin = 0x2000, initialMemory: Record<number, number> = {}): Cpu8085State {
  return {
    A: 0x00,
    B: 0x00,
    C: 0x00,
    D: 0x00,
    E: 0x00,
    H: 0x00,
    L: 0x00,
    PC: origin,
    SP: 0xffff,
    flags: { S: 0, Z: 0, AC: 0, P: 0, CY: 0 },
    memory: { ...initialMemory },
    ports: { 0x00: 0x00, 0x01: 0x00, 0x02: 0x00 },
    halted: false,
    cycles: 0,
    instructionCount: 0,
    lastAction: 'CPU reset. Ready to execute from ' + toHex16(origin) + 'H.',
    activePath: [],
  };
}

function parseNumber(token: string, labels: Record<string, number>): number | null {
  const cleaned = token.trim().toUpperCase();
  if (!cleaned) return null;
  if (cleaned in labels) return labels[cleaned];
  if (cleaned.endsWith('H')) {
    const val = parseInt(cleaned.slice(0, -1), 16);
    return Number.isNaN(val) ? null : val;
  }
  if (cleaned.startsWith('0X')) {
    const val = parseInt(cleaned.slice(2), 16);
    return Number.isNaN(val) ? null : val;
  }
  if (cleaned.endsWith('B') && /^[01]+B$/.test(cleaned)) {
    return parseInt(cleaned.slice(0, -1), 2);
  }
  if (/^[0-9A-F]+$/.test(cleaned)) {
    // Standard 8085 assemblers commonly accept bare hex like 2500 or 0A
    const val = parseInt(cleaned, 16);
    return Number.isNaN(val) ? null : val;
  }
  return null;
}

const REG_CODE: Record<string, number> = {
  B: 0,
  C: 1,
  D: 2,
  E: 3,
  H: 4,
  L: 5,
  M: 6,
  A: 7,
};

const RP_CODE: Record<string, number> = {
  B: 0,
  BC: 0,
  D: 1,
  DE: 1,
  H: 2,
  HL: 2,
  SP: 3,
  PSW: 3,
};

function instructionSize(mnemonic: string): number {
  switch (mnemonic) {
    case 'MVI':
    case 'ADI':
    case 'ACI':
    case 'SUI':
    case 'SBI':
    case 'ANI':
    case 'ORI':
    case 'XRI':
    case 'CPI':
    case 'IN':
    case 'OUT':
      return 2;
    case 'LXI':
    case 'LDA':
    case 'STA':
    case 'LHLD':
    case 'SHLD':
    case 'JMP':
    case 'JZ':
    case 'JNZ':
    case 'JC':
    case 'JNC':
    case 'JP':
    case 'JM':
    case 'JPE':
    case 'JPO':
    case 'CALL':
    case 'CZ':
    case 'CNZ':
    case 'CC':
    case 'CNC':
      return 3;
    default:
      return 1;
  }
}

export function assemble8085(sourceCode: string, defaultOrigin = 0x2000): AssemblyResult {
  const lines = sourceCode.split('\n');
  const labels: Record<string, number> = {};
  const errors: Array<{ line: number; message: string }> = [];
  const parsedLines: Array<{ lineNumber: number; source: string; mnemonic: string; operands: string[]; address: number }> = [];

  let pc = defaultOrigin;
  let origin = defaultOrigin;
  let firstInstructionSeen = false;

  // Pass 1: Labels & addresses
  lines.forEach((rawLine, idx) => {
    const lineNumber = idx + 1;
    const noComment = rawLine.split(';')[0].trim();
    if (!noComment) return;

    let rest = noComment;
    if (rest.includes(':')) {
      const [labelPart, after] = rest.split(':');
      const label = labelPart.trim().toUpperCase();
      if (label) {
        labels[label] = pc;
      }
      rest = (after ?? '').trim();
      if (!rest) return;
    }

    const parts = rest.split(/\s+/);
    const mnemonic = parts[0].toUpperCase();
    const operandStr = rest.slice(parts[0].length).trim();
    const operands = operandStr ? operandStr.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) : [];

    if (mnemonic === 'ORG') {
      const addr = parseNumber(operands[0] ?? '', {});
      if (addr === null) {
        errors.push({ line: lineNumber, message: `Invalid ORG address: ${operands[0] ?? ''}` });
      } else {
        pc = addr & 0xffff;
        if (!firstInstructionSeen) origin = pc;
      }
      return;
    }

    if (mnemonic === 'DB') {
      firstInstructionSeen = true;
      parsedLines.push({ lineNumber, source: noComment, mnemonic, operands, address: pc });
      pc = (pc + Math.max(1, operands.length)) & 0xffff;
      return;
    }

    firstInstructionSeen = true;
    parsedLines.push({ lineNumber, source: noComment, mnemonic, operands, address: pc });
    pc = (pc + instructionSize(mnemonic)) & 0xffff;
  });

  // Pass 2: Encode opcodes & metadata
  const instructions: AssembledInstruction[] = [];
  const addressMap: Record<number, AssembledInstruction> = {};

  for (const item of parsedLines) {
    const { mnemonic, operands, address, lineNumber, source } = item;
    let bytes: number[] = [];
    let tStates = 4;
    let machineCycles = ['OF'];

    const err = (msg: string) => {
      errors.push({ line: lineNumber, message: msg });
    };

    switch (mnemonic) {
      case 'DB': {
        for (const op of operands) {
          const v = parseNumber(op, labels);
          if (v === null) err(`Invalid DB byte '${op}'`);
          else bytes.push(v & 0xff);
        }
        tStates = 0;
        machineCycles = [];
        break;
      }
      case 'NOP':
        bytes = [0x00];
        tStates = 4;
        break;
      case 'HLT':
        bytes = [0x76];
        tStates = 5;
        break;
      case 'MOV': {
        if (operands.length !== 2 || !(operands[0] in REG_CODE) || !(operands[1] in REG_CODE)) {
          err('MOV expects two valid registers (A,B,C,D,E,H,L,M), e.g. MOV A, B');
          break;
        }
        if (operands[0] === 'M' && operands[1] === 'M') {
          err('MOV M, M is invalid (opcode 76H is HLT)');
          break;
        }
        bytes = [0x40 | (REG_CODE[operands[0]] << 3) | REG_CODE[operands[1]]];
        tStates = operands[0] === 'M' || operands[1] === 'M' ? 7 : 4;
        machineCycles = operands[0] === 'M' ? ['OF', 'MW'] : operands[1] === 'M' ? ['OF', 'MR'] : ['OF'];
        break;
      }
      case 'MVI': {
        if (operands.length !== 2 || !(operands[0] in REG_CODE)) {
          err('MVI expects register and 8-bit data, e.g. MVI A, 32H');
          break;
        }
        const val = parseNumber(operands[1], labels);
        if (val === null) {
          err(`Invalid immediate value '${operands[1]}'`);
          break;
        }
        bytes = [0x06 | (REG_CODE[operands[0]] << 3), val & 0xff];
        tStates = operands[0] === 'M' ? 10 : 7;
        machineCycles = operands[0] === 'M' ? ['OF', 'MR', 'MW'] : ['OF', 'MR'];
        break;
      }
      case 'LXI': {
        if (operands.length !== 2 || !(operands[0] in RP_CODE) || operands[0] === 'PSW') {
          err('LXI expects register pair (B, D, H, or SP) and 16-bit address, e.g. LXI H, 2500H');
          break;
        }
        const val = parseNumber(operands[1], labels);
        if (val === null) {
          err(`Invalid 16-bit immediate '${operands[1]}'`);
          break;
        }
        bytes = [0x01 | (RP_CODE[operands[0]] << 4), val & 0xff, (val >> 8) & 0xff];
        tStates = 10;
        machineCycles = ['OF', 'MR', 'MR'];
        break;
      }
      case 'LDA':
      case 'STA':
      case 'LHLD':
      case 'SHLD': {
        const val = parseNumber(operands[0] ?? '', labels);
        if (val === null) {
          err(`${mnemonic} expects a 16-bit memory address, e.g. ${mnemonic} 2500H`);
          break;
        }
        const opMap: Record<string, number> = { LDA: 0x3a, STA: 0x32, LHLD: 0x2a, SHLD: 0x22 };
        bytes = [opMap[mnemonic], val & 0xff, (val >> 8) & 0xff];
        tStates = mnemonic === 'LDA' || mnemonic === 'STA' ? 13 : 16;
        machineCycles =
          mnemonic === 'LDA'
            ? ['OF', 'MR', 'MR', 'MR']
            : mnemonic === 'STA'
              ? ['OF', 'MR', 'MR', 'MW']
              : mnemonic === 'LHLD'
                ? ['OF', 'MR', 'MR', 'MR', 'MR']
                : ['OF', 'MR', 'MR', 'MW', 'MW'];
        break;
      }
      case 'LDAX':
      case 'STAX': {
        const rp = operands[0];
        if (rp !== 'B' && rp !== 'BC' && rp !== 'D' && rp !== 'DE') {
          err(`${mnemonic} only supports register pairs B (BC) or D (DE)`);
          break;
        }
        const isD = rp === 'D' || rp === 'DE';
        bytes = [mnemonic === 'LDAX' ? (isD ? 0x1a : 0x0a) : isD ? 0x12 : 0x02];
        tStates = 7;
        machineCycles = mnemonic === 'LDAX' ? ['OF', 'MR'] : ['OF', 'MW'];
        break;
      }
      case 'XCHG':
        bytes = [0xeb];
        tStates = 4;
        break;
      case 'ADD':
      case 'ADC':
      case 'SUB':
      case 'SBB':
      case 'ANA':
      case 'XRA':
      case 'ORA':
      case 'CMP': {
        const r = operands[0];
        if (!r || !(r in REG_CODE)) {
          err(`${mnemonic} expects a register (A,B,C,D,E,H,L,M)`);
          break;
        }
        const base: Record<string, number> = {
          ADD: 0x80,
          ADC: 0x88,
          SUB: 0x90,
          SBB: 0x98,
          ANA: 0xa0,
          XRA: 0xa8,
          ORA: 0xb0,
          CMP: 0xb8,
        };
        bytes = [base[mnemonic] | REG_CODE[r]];
        tStates = r === 'M' ? 7 : 4;
        machineCycles = r === 'M' ? ['OF', 'MR'] : ['OF'];
        break;
      }
      case 'ADI':
      case 'ACI':
      case 'SUI':
      case 'SBI':
      case 'ANI':
      case 'XRI':
      case 'ORI':
      case 'CPI': {
        const val = parseNumber(operands[0] ?? '', labels);
        if (val === null) {
          err(`${mnemonic} expects an 8-bit immediate value`);
          break;
        }
        const opMap: Record<string, number> = {
          ADI: 0xc6,
          ACI: 0xce,
          SUI: 0xd6,
          SBI: 0xde,
          ANI: 0xe6,
          XRI: 0xee,
          ORI: 0xf6,
          CPI: 0xfe,
        };
        bytes = [opMap[mnemonic], val & 0xff];
        tStates = 7;
        machineCycles = ['OF', 'MR'];
        break;
      }
      case 'INR':
      case 'DCR': {
        const r = operands[0];
        if (!r || !(r in REG_CODE)) {
          err(`${mnemonic} expects a register (A,B,C,D,E,H,L,M)`);
          break;
        }
        bytes = [(mnemonic === 'INR' ? 0x04 : 0x05) | (REG_CODE[r] << 3)];
        tStates = r === 'M' ? 10 : 4;
        machineCycles = r === 'M' ? ['OF', 'MR', 'MW'] : ['OF'];
        break;
      }
      case 'INX':
      case 'DCX':
      case 'DAD': {
        const rp = operands[0];
        if (!rp || !(rp in RP_CODE) || rp === 'PSW') {
          err(`${mnemonic} expects a register pair (B, D, H, or SP)`);
          break;
        }
        const opBase = mnemonic === 'INX' ? 0x03 : mnemonic === 'DCX' ? 0x0b : 0x09;
        bytes = [opBase | (RP_CODE[rp] << 4)];
        tStates = mnemonic === 'DAD' ? 10 : 6;
        machineCycles = mnemonic === 'DAD' ? ['OF', 'BI', 'BI'] : ['OF'];
        break;
      }
      case 'CMA':
        bytes = [0x2f];
        tStates = 4;
        break;
      case 'CMC':
        bytes = [0x3f];
        tStates = 4;
        break;
      case 'STC':
        bytes = [0x37];
        tStates = 4;
        break;
      case 'RLC':
        bytes = [0x07];
        tStates = 4;
        break;
      case 'RRC':
        bytes = [0x0f];
        tStates = 4;
        break;
      case 'RAL':
        bytes = [0x17];
        tStates = 4;
        break;
      case 'RAR':
        bytes = [0x1f];
        tStates = 4;
        break;
      case 'JMP':
      case 'JZ':
      case 'JNZ':
      case 'JC':
      case 'JNC':
      case 'JP':
      case 'JM':
      case 'JPE':
      case 'JPO':
      case 'CALL':
      case 'CZ':
      case 'CNZ':
      case 'CC':
      case 'CNC': {
        const target = parseNumber(operands[0] ?? '', labels);
        if (target === null) {
          err(`${mnemonic} target '${operands[0] ?? ''}' is not a valid address or label`);
          break;
        }
        const opMap: Record<string, number> = {
          JMP: 0xc3,
          JZ: 0xca,
          JNZ: 0xc2,
          JC: 0xda,
          JNC: 0xd2,
          JP: 0xf2,
          JM: 0xfa,
          JPE: 0xea,
          JPO: 0xe2,
          CALL: 0xcd,
          CZ: 0xcc,
          CNZ: 0xc4,
          CC: 0xdc,
          CNC: 0xd4,
        };
        bytes = [opMap[mnemonic], target & 0xff, (target >> 8) & 0xff];
        tStates = mnemonic.startsWith('C') ? 18 : 10;
        machineCycles = mnemonic.startsWith('C') ? ['OF', 'MR', 'MR', 'MW', 'MW'] : ['OF', 'MR', 'MR'];
        break;
      }
      case 'RET':
      case 'RZ':
      case 'RNZ':
      case 'RC':
      case 'RNC': {
        const opMap: Record<string, number> = { RET: 0xc9, RZ: 0xc8, RNZ: 0xc0, RC: 0xd8, RNC: 0xd0 };
        bytes = [opMap[mnemonic]];
        tStates = 10;
        machineCycles = ['OF', 'MR', 'MR'];
        break;
      }
      case 'PUSH':
      case 'POP': {
        const rp = operands[0];
        if (!rp || !(rp in RP_CODE) || rp === 'SP') {
          err(`${mnemonic} expects B, D, H, or PSW`);
          break;
        }
        const base = mnemonic === 'PUSH' ? 0xc5 : 0xc1;
        bytes = [base | (RP_CODE[rp] << 4)];
        tStates = mnemonic === 'PUSH' ? 12 : 10;
        machineCycles = mnemonic === 'PUSH' ? ['OF', 'MW', 'MW'] : ['OF', 'MR', 'MR'];
        break;
      }
      case 'OUT':
      case 'IN': {
        const port = parseNumber(operands[0] ?? '', labels);
        if (port === null) {
          err(`${mnemonic} expects an 8-bit port address, e.g. ${mnemonic} 01H`);
          break;
        }
        bytes = [mnemonic === 'OUT' ? 0xd3 : 0xdb, port & 0xff];
        tStates = 10;
        machineCycles = mnemonic === 'OUT' ? ['OF', 'MR', 'IOW'] : ['OF', 'MR', 'IOR'];
        break;
      }
      default:
        err(`Unsupported or unknown 8085 instruction '${mnemonic}'`);
    }

    if (bytes.length > 0) {
      const assembled: AssembledInstruction = {
        address,
        lineNumber,
        source,
        mnemonic,
        operands,
        bytes,
        tStates,
        machineCycles,
      };
      instructions.push(assembled);
      addressMap[address] = assembled;
    }
  }

  return { instructions, addressMap, labels, errors, origin };
}

function readReg(state: Cpu8085State, reg: string): number {
  switch (reg) {
    case 'A': return state.A;
    case 'B': return state.B;
    case 'C': return state.C;
    case 'D': return state.D;
    case 'E': return state.E;
    case 'H': return state.H;
    case 'L': return state.L;
    case 'M': {
      const addr = (state.H << 8) | state.L;
      return state.memory[addr] ?? 0;
    }
    default: return 0;
  }
}

function writeReg(state: Cpu8085State, reg: string, val: number): void {
  const v = val & 0xff;
  switch (reg) {
    case 'A': state.A = v; break;
    case 'B': state.B = v; break;
    case 'C': state.C = v; break;
    case 'D': state.D = v; break;
    case 'E': state.E = v; break;
    case 'H': state.H = v; break;
    case 'L': state.L = v; break;
    case 'M': {
      const addr = (state.H << 8) | state.L;
      state.memory[addr] = v;
      break;
    }
  }
}

function setSZP(flags: Flags8085, val: number): void {
  const v = val & 0xff;
  flags.S = (v & 0x80) ? 1 : 0;
  flags.Z = v === 0 ? 1 : 0;
  flags.P = calcParity(v);
}

export function step8085(prevState: Cpu8085State, assembled: AssemblyResult): Cpu8085State {
  if (prevState.halted) return prevState;

  const state: Cpu8085State = {
    ...prevState,
    flags: { ...prevState.flags },
    memory: { ...prevState.memory },
    ports: { ...prevState.ports },
    activePath: [],
  };

  const inst = assembled.addressMap[state.PC];
  if (!inst) {
    state.halted = true;
    state.lastAction = `No instruction at ${toHex16(state.PC)}H. Halted.`;
    return state;
  }

  const nextPC = (state.PC + inst.bytes.length) & 0xffff;
  const imm8 = inst.bytes[1] ?? 0;
  const imm16 = ((inst.bytes[2] ?? 0) << 8) | (inst.bytes[1] ?? 0);
  const op0 = inst.operands[0];
  const op1 = inst.operands[1];

  state.PC = nextPC;
  state.cycles += inst.tStates;
  state.instructionCount += 1;

  const push16 = (val: number) => {
    state.SP = (state.SP - 1) & 0xffff;
    state.memory[state.SP] = (val >> 8) & 0xff;
    state.SP = (state.SP - 1) & 0xffff;
    state.memory[state.SP] = val & 0xff;
  };

  const pop16 = (): number => {
    const lo = state.memory[state.SP] ?? 0;
    state.SP = (state.SP + 1) & 0xffff;
    const hi = state.memory[state.SP] ?? 0;
    state.SP = (state.SP + 1) & 0xffff;
    return ((hi << 8) | lo) & 0xffff;
  };

  switch (inst.mnemonic) {
    case 'NOP':
      state.lastAction = 'NOP: No operation performed.';
      state.activePath = ['PC', 'IR', 'CONTROL'];
      break;

    case 'HLT':
      state.halted = true;
      state.lastAction = 'HLT: Processor entered HALT state.';
      state.activePath = ['IR', 'CONTROL'];
      break;

    case 'MOV': {
      const val = readReg(state, op1);
      writeReg(state, op0, val);
      state.lastAction = `MOV ${op0}, ${op1}: Copied ${toHex8(val)}H from ${op1} to ${op0}.`;
      state.activePath = [op1 === 'A' ? 'ACC' : 'REGS', 'BUS', op0 === 'A' ? 'ACC' : 'REGS'];
      break;
    }

    case 'MVI': {
      writeReg(state, op0, imm8);
      state.lastAction = `MVI ${op0}, ${toHex8(imm8)}H: Loaded immediate ${toHex8(imm8)}H into ${op0}.`;
      state.activePath = ['MEMORY', 'BUS', op0 === 'A' ? 'ACC' : 'REGS'];
      break;
    }

    case 'LXI': {
      const hi = (imm16 >> 8) & 0xff;
      const lo = imm16 & 0xff;
      if (op0 === 'B' || op0 === 'BC') { state.B = hi; state.C = lo; }
      else if (op0 === 'D' || op0 === 'DE') { state.D = hi; state.E = lo; }
      else if (op0 === 'H' || op0 === 'HL') { state.H = hi; state.L = lo; }
      else if (op0 === 'SP') { state.SP = imm16; }
      state.lastAction = `LXI ${op0}, ${toHex16(imm16)}H: Loaded 16-bit pair ${op0} = ${toHex16(imm16)}H.`;
      state.activePath = ['MEMORY', 'BUS', 'REGS'];
      break;
    }

    case 'LDA': {
      const val = state.memory[imm16] ?? 0;
      state.A = val;
      state.lastAction = `LDA ${toHex16(imm16)}H: Loaded A = [${toHex16(imm16)}H] = ${toHex8(val)}H.`;
      state.activePath = ['ADDR_BUS', 'MEMORY', 'BUS', 'ACC'];
      break;
    }

    case 'STA': {
      state.memory[imm16] = state.A;
      state.lastAction = `STA ${toHex16(imm16)}H: Stored A (${toHex8(state.A)}H) at memory ${toHex16(imm16)}H.`;
      state.activePath = ['ACC', 'BUS', 'MEMORY'];
      break;
    }

    case 'LHLD': {
      state.L = state.memory[imm16] ?? 0;
      state.H = state.memory[(imm16 + 1) & 0xffff] ?? 0;
      state.lastAction = `LHLD ${toHex16(imm16)}H: Loaded HL = ${toHex8(state.H)}${toHex8(state.L)}H.`;
      state.activePath = ['MEMORY', 'BUS', 'REGS'];
      break;
    }

    case 'SHLD': {
      state.memory[imm16] = state.L;
      state.memory[(imm16 + 1) & 0xffff] = state.H;
      state.lastAction = `SHLD ${toHex16(imm16)}H: Stored HL (${toHex8(state.H)}${toHex8(state.L)}H) into memory.`;
      state.activePath = ['REGS', 'BUS', 'MEMORY'];
      break;
    }

    case 'LDAX': {
      const addr = op0 === 'D' || op0 === 'DE' ? (state.D << 8) | state.E : (state.B << 8) | state.C;
      state.A = state.memory[addr] ?? 0;
      state.lastAction = `LDAX ${op0}: Loaded A = [${toHex16(addr)}H] = ${toHex8(state.A)}H.`;
      state.activePath = ['REGS', 'MEMORY', 'BUS', 'ACC'];
      break;
    }

    case 'STAX': {
      const addr = op0 === 'D' || op0 === 'DE' ? (state.D << 8) | state.E : (state.B << 8) | state.C;
      state.memory[addr] = state.A;
      state.lastAction = `STAX ${op0}: Stored A (${toHex8(state.A)}H) at [${toHex16(addr)}H].`;
      state.activePath = ['ACC', 'BUS', 'MEMORY'];
      break;
    }

    case 'XCHG': {
      const tH = state.H;
      const tL = state.L;
      state.H = state.D;
      state.L = state.E;
      state.D = tH;
      state.E = tL;
      state.lastAction = `XCHG: Exchanged HL (${toHex8(state.H)}${toHex8(state.L)}H) with DE (${toHex8(state.D)}${toHex8(state.E)}H).`;
      state.activePath = ['REGS'];
      break;
    }

    case 'ADD':
    case 'ADI':
    case 'ADC':
    case 'ACI': {
      const operand = inst.mnemonic.endsWith('I') ? imm8 : readReg(state, op0);
      const carryIn = inst.mnemonic === 'ADC' || inst.mnemonic === 'ACI' ? state.flags.CY : 0;
      const sum = state.A + operand + carryIn;
      state.flags.AC = (state.A & 0x0f) + (operand & 0x0f) + carryIn > 0x0f ? 1 : 0;
      state.flags.CY = sum > 0xff ? 1 : 0;
      state.A = sum & 0xff;
      setSZP(state.flags, state.A);
      state.lastAction = `${inst.source}: A = ${toHex8(state.A)}H (CY=${state.flags.CY}, Z=${state.flags.Z}, AC=${state.flags.AC}).`;
      state.activePath = ['ACC', 'TEMP', 'ALU', 'FLAGS', 'BUS'];
      break;
    }

    case 'SUB':
    case 'SUI':
    case 'SBB':
    case 'SBI':
    case 'CMP':
    case 'CPI': {
      const operand = inst.mnemonic.endsWith('I') ? imm8 : readReg(state, op0);
      const borrowIn = inst.mnemonic === 'SBB' || inst.mnemonic === 'SBI' ? state.flags.CY : 0;
      const diff = state.A - operand - borrowIn;
      // 8085 subtraction AC uses 2's complement addition of lower nibble
      state.flags.AC = (state.A & 0x0f) >= ((operand & 0x0f) + borrowIn) ? 1 : 0;
      state.flags.CY = diff < 0 ? 1 : 0;
      const res = diff & 0xff;
      setSZP(state.flags, res);
      if (inst.mnemonic !== 'CMP' && inst.mnemonic !== 'CPI') {
        state.A = res;
        state.lastAction = `${inst.source}: A = ${toHex8(state.A)}H (CY=${state.flags.CY}, Z=${state.flags.Z}).`;
      } else {
        state.lastAction = `${inst.source}: Compared A (${toHex8(state.A)}H) with ${toHex8(operand)}H -> Z=${state.flags.Z}, CY=${state.flags.CY}.`;
      }
      state.activePath = ['ACC', 'TEMP', 'ALU', 'FLAGS'];
      break;
    }

    case 'INR': {
      const old = readReg(state, op0);
      const res = (old + 1) & 0xff;
      writeReg(state, op0, res);
      state.flags.AC = (old & 0x0f) + 1 > 0x0f ? 1 : 0;
      setSZP(state.flags, res); // Note: CY is intentionally NOT affected by INR on 8085!
      state.lastAction = `INR ${op0}: ${op0} = ${toHex8(res)}H (CY unchanged).`;
      state.activePath = ['REGS', 'ALU', 'FLAGS'];
      break;
    }

    case 'DCR': {
      const old = readReg(state, op0);
      const res = (old - 1) & 0xff;
      writeReg(state, op0, res);
      state.flags.AC = (old & 0x0f) === 0 ? 0 : 1;
      setSZP(state.flags, res); // Note: CY is intentionally NOT affected by DCR on 8085!
      state.lastAction = `DCR ${op0}: ${op0} = ${toHex8(res)}H (CY unchanged).`;
      state.activePath = ['REGS', 'ALU', 'FLAGS'];
      break;
    }

    case 'INX':
    case 'DCX': {
      const delta = inst.mnemonic === 'INX' ? 1 : -1;
      if (op0 === 'B' || op0 === 'BC') {
        const v = (((state.B << 8) | state.C) + delta) & 0xffff;
        state.B = (v >> 8) & 0xff; state.C = v & 0xff;
      } else if (op0 === 'D' || op0 === 'DE') {
        const v = (((state.D << 8) | state.E) + delta) & 0xffff;
        state.D = (v >> 8) & 0xff; state.E = v & 0xff;
      } else if (op0 === 'H' || op0 === 'HL') {
        const v = (((state.H << 8) | state.L) + delta) & 0xffff;
        state.H = (v >> 8) & 0xff; state.L = v & 0xff;
      } else if (op0 === 'SP') {
        state.SP = (state.SP + delta) & 0xffff;
      }
      // INX/DCX affect NO flags on 8085!
      state.lastAction = `${inst.mnemonic} ${op0}: Updated 16-bit pair (no flags affected).`;
      state.activePath = ['REGS'];
      break;
    }

    case 'DAD': {
      const hl = (state.H << 8) | state.L;
      const other =
        op0 === 'B' || op0 === 'BC'
          ? (state.B << 8) | state.C
          : op0 === 'D' || op0 === 'DE'
            ? (state.D << 8) | state.E
            : op0 === 'SP'
              ? state.SP
              : hl;
      const sum = hl + other;
      state.flags.CY = sum > 0xffff ? 1 : 0;
      state.H = (sum >> 8) & 0xff;
      state.L = sum & 0xff;
      state.lastAction = `DAD ${op0}: HL = ${toHex8(state.H)}${toHex8(state.L)}H (CY=${state.flags.CY}).`;
      state.activePath = ['REGS', 'ALU', 'FLAGS'];
      break;
    }

    case 'ANA':
    case 'ANI': {
      const val = inst.mnemonic === 'ANI' ? imm8 : readReg(state, op0);
      state.A = (state.A & val) & 0xff;
      state.flags.CY = 0;
      state.flags.AC = 1; // 8085 sets AC=1 for ANA/ANI
      setSZP(state.flags, state.A);
      state.lastAction = `${inst.source}: A = ${toHex8(state.A)}H (CY=0, AC=1).`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'ORA':
    case 'ORI': {
      const val = inst.mnemonic === 'ORI' ? imm8 : readReg(state, op0);
      state.A = (state.A | val) & 0xff;
      state.flags.CY = 0;
      state.flags.AC = 0;
      setSZP(state.flags, state.A);
      state.lastAction = `${inst.source}: A = ${toHex8(state.A)}H (CY=0, AC=0).`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'XRA':
    case 'XRI': {
      const val = inst.mnemonic === 'XRI' ? imm8 : readReg(state, op0);
      state.A = (state.A ^ val) & 0xff;
      state.flags.CY = 0;
      state.flags.AC = 0;
      setSZP(state.flags, state.A);
      state.lastAction = `${inst.source}: A = ${toHex8(state.A)}H (CY=0, AC=0).`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'CMA':
      state.A = (~state.A) & 0xff;
      state.lastAction = `CMA: Complemented A -> ${toHex8(state.A)}H (no flags affected).`;
      state.activePath = ['ACC', 'ALU'];
      break;

    case 'CMC':
      state.flags.CY = state.flags.CY ? 0 : 1;
      state.lastAction = `CMC: Carry flag inverted to ${state.flags.CY}.`;
      state.activePath = ['FLAGS'];
      break;

    case 'STC':
      state.flags.CY = 1;
      state.lastAction = 'STC: Carry flag set to 1.';
      state.activePath = ['FLAGS'];
      break;

    case 'RLC': {
      const bit7 = (state.A >> 7) & 1;
      state.A = ((state.A << 1) | bit7) & 0xff;
      state.flags.CY = bit7;
      state.lastAction = `RLC: Rotated A left -> ${toHex8(state.A)}H, CY=${bit7}.`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'RRC': {
      const bit0 = state.A & 1;
      state.A = ((state.A >> 1) | (bit0 << 7)) & 0xff;
      state.flags.CY = bit0;
      state.lastAction = `RRC: Rotated A right -> ${toHex8(state.A)}H, CY=${bit0}.`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'RAL': {
      const bit7 = (state.A >> 7) & 1;
      state.A = ((state.A << 1) | state.flags.CY) & 0xff;
      state.flags.CY = bit7;
      state.lastAction = `RAL: Rotated A left through carry -> ${toHex8(state.A)}H, CY=${bit7}.`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'RAR': {
      const bit0 = state.A & 1;
      state.A = ((state.A >> 1) | (state.flags.CY << 7)) & 0xff;
      state.flags.CY = bit0;
      state.lastAction = `RAR: Rotated A right through carry -> ${toHex8(state.A)}H, CY=${bit0}.`;
      state.activePath = ['ACC', 'ALU', 'FLAGS'];
      break;
    }

    case 'JMP':
    case 'JZ':
    case 'JNZ':
    case 'JC':
    case 'JNC':
    case 'JP':
    case 'JM':
    case 'JPE':
    case 'JPO': {
      const cond =
        inst.mnemonic === 'JMP' ||
        (inst.mnemonic === 'JZ' && state.flags.Z === 1) ||
        (inst.mnemonic === 'JNZ' && state.flags.Z === 0) ||
        (inst.mnemonic === 'JC' && state.flags.CY === 1) ||
        (inst.mnemonic === 'JNC' && state.flags.CY === 0) ||
        (inst.mnemonic === 'JP' && state.flags.S === 0) ||
        (inst.mnemonic === 'JM' && state.flags.S === 1) ||
        (inst.mnemonic === 'JPE' && state.flags.P === 1) ||
        (inst.mnemonic === 'JPO' && state.flags.P === 0);
      if (cond) {
        state.PC = imm16;
        state.lastAction = `${inst.source}: Condition met -> PC jumped to ${toHex16(imm16)}H.`;
      } else {
        state.lastAction = `${inst.source}: Condition false -> continuing to ${toHex16(state.PC)}H.`;
      }
      state.activePath = ['FLAGS', 'CONTROL', 'PC'];
      break;
    }

    case 'CALL':
    case 'CZ':
    case 'CNZ':
    case 'CC':
    case 'CNC': {
      const cond =
        inst.mnemonic === 'CALL' ||
        (inst.mnemonic === 'CZ' && state.flags.Z === 1) ||
        (inst.mnemonic === 'CNZ' && state.flags.Z === 0) ||
        (inst.mnemonic === 'CC' && state.flags.CY === 1) ||
        (inst.mnemonic === 'CNC' && state.flags.CY === 0);
      if (cond) {
        push16(state.PC);
        state.PC = imm16;
        state.lastAction = `${inst.source}: Pushed return address, jumped to ${toHex16(imm16)}H (SP=${toHex16(state.SP)}H).`;
      } else {
        state.lastAction = `${inst.source}: Call condition false.`;
      }
      state.activePath = ['PC', 'SP', 'MEMORY'];
      break;
    }

    case 'RET':
    case 'RZ':
    case 'RNZ':
    case 'RC':
    case 'RNC': {
      const cond =
        inst.mnemonic === 'RET' ||
        (inst.mnemonic === 'RZ' && state.flags.Z === 1) ||
        (inst.mnemonic === 'RNZ' && state.flags.Z === 0) ||
        (inst.mnemonic === 'RC' && state.flags.CY === 1) ||
        (inst.mnemonic === 'RNC' && state.flags.CY === 0);
      if (cond) {
        state.PC = pop16();
        state.lastAction = `${inst.mnemonic}: Popped return address -> PC=${toHex16(state.PC)}H (SP=${toHex16(state.SP)}H).`;
      } else {
        state.lastAction = `${inst.mnemonic}: Return condition false.`;
      }
      state.activePath = ['MEMORY', 'SP', 'PC'];
      break;
    }

    case 'PUSH': {
      let val = 0;
      if (op0 === 'B' || op0 === 'BC') val = (state.B << 8) | state.C;
      else if (op0 === 'D' || op0 === 'DE') val = (state.D << 8) | state.E;
      else if (op0 === 'H' || op0 === 'HL') val = (state.H << 8) | state.L;
      else if (op0 === 'PSW') val = (state.A << 8) | packFlags(state.flags);
      push16(val);
      state.lastAction = `PUSH ${op0}: Pushed ${toHex16(val)}H onto stack (SP=${toHex16(state.SP)}H).`;
      state.activePath = ['REGS', 'BUS', 'SP', 'MEMORY'];
      break;
    }

    case 'POP': {
      const val = pop16();
      const hi = (val >> 8) & 0xff;
      const lo = val & 0xff;
      if (op0 === 'B' || op0 === 'BC') { state.B = hi; state.C = lo; }
      else if (op0 === 'D' || op0 === 'DE') { state.D = hi; state.E = lo; }
      else if (op0 === 'H' || op0 === 'HL') { state.H = hi; state.L = lo; }
      else if (op0 === 'PSW') { state.A = hi; state.flags = unpackFlags(lo); }
      state.lastAction = `POP ${op0}: Popped ${toHex16(val)}H into ${op0} (SP=${toHex16(state.SP)}H).`;
      state.activePath = ['MEMORY', 'SP', 'BUS', 'REGS'];
      break;
    }

    case 'OUT': {
      state.ports[imm8] = state.A;
      state.lastAction = `OUT ${toHex8(imm8)}H: Sent A (${toHex8(state.A)}H) to output port ${toHex8(imm8)}H.`;
      state.activePath = ['ACC', 'BUS', 'IO'];
      break;
    }

    case 'IN': {
      state.A = state.ports[imm8] ?? 0;
      state.lastAction = `IN ${toHex8(imm8)}H: Read ${toHex8(state.A)}H from input port ${toHex8(imm8)}H into A.`;
      state.activePath = ['IO', 'BUS', 'ACC'];
      break;
    }
  }

  return state;
}

export const PRESET_8085_PROGRAMS: PresetProgram[] = [
  {
    id: 'add-carry',
    title: '8-Bit Addition with Carry',
    category: 'Arithmetic',
    description: 'Adds two 8-bit numbers (9AH + 8CH), stores the 8-bit sum at 2500H and the carry byte at 2501H.',
    code: `; 8-Bit Addition with Carry Tracking
MVI C, 00H    ; Clear carry counter C
MVI A, 9AH    ; Load first operand into A
MVI B, 8CH    ; Load second operand into B
ADD B         ; A = A + B (Sets CY=1, AC=1)
JNC SAVE      ; If no carry, jump to SAVE
INR C         ; Increment C if carry generated
SAVE: STA 2500H ; Store sum at 2500H
MOV A, C      ; Move carry count to A
STA 2501H     ; Store carry at 2501H
HLT           ; Stop execution`,
  },
  {
    id: 'find-largest',
    title: 'Find Largest Number in Array',
    category: 'Arrays & Loops',
    description: 'Scans 4 bytes stored at 2500H–2503H and writes the maximum value to 2510H.',
    initialMemory: {
      0x2500: 0x24,
      0x2501: 0x7f,
      0x2502: 0x4b,
      0x2503: 0x62,
    },
    code: `; Find Largest Byte in 4-Element Array (2500H..2503H)
LXI H, 2500H  ; Point HL to start of array
MVI C, 03H    ; Remaining comparisons = N - 1
MOV A, M      ; Assume first byte is largest
LOOP: INX H   ; Point to next element
CMP M         ; Compare A with [HL]
JNC SKIP      ; If A >= [HL], keep A
MOV A, M      ; Else update A = [HL]
SKIP: DCR C   ; Decrement loop counter
JNZ LOOP      ; Repeat until C = 0
STA 2510H     ; Store largest byte at 2510H
HLT`,
  },
  {
    id: 'multiply-loop',
    title: '8-Bit Multiplication (Repeated Addition)',
    category: 'Arithmetic',
    description: 'Multiplies 06H by 05H using repeated addition and stores result (1EH = 30) in B and 2500H.',
    code: `; Multiply 06H x 05H via Repeated Addition
MVI B, 06H    ; Multiplicand
MVI C, 05H    ; Multiplier (loop counter)
MVI A, 00H    ; Accumulator for product
NEXT: ADD B   ; A = A + B
DCR C         ; Decrement counter
JNZ NEXT      ; Repeat while C != 0
STA 2500H     ; Save product (1EH = 30 dec)
HLT`,
  },
  {
    id: 'stack-subroutine',
    title: 'Subroutine Call & Stack Demo',
    category: 'Stack & Control',
    description: 'Demonstrates PUSH, CALL, RET, and POP manipulating the 16-bit Stack Pointer (SP).',
    code: `; Subroutine & Stack Frame Demonstration
LXI SP, 27FFH ; Initialize Stack Pointer
MVI A, 15H    ; Load A = 15H
MVI B, 2AH    ; Load B = 2AH
PUSH B        ; Save BC onto stack
CALL DOUBLE   ; Call subroutine (pushes PC)
POP D         ; Restore saved BC into DE
STA 2500H     ; Store doubled A (2AH) at 2500H
HLT
DOUBLE: ADD A ; Double Accumulator
RET           ; Pop return address into PC`,
  },
  {
    id: 'led-pattern',
    title: 'LED Chaser via Output Port 01H',
    category: 'Interfacing',
    description: 'Rotates an active LED bit left across Output Port 01H using RLC and OUT.',
    code: `; Rotating LED Pattern on Output Port 01H
MVI A, 01H    ; Start with LED D0 ON (0000 0001)
MVI C, 08H    ; 8 rotations
SHIFT: OUT 01H ; Drive LEDs at Port 01H
RLC           ; Rotate bit left into next LED
DCR C         ; Decrement count
JNZ SHIFT     ; Loop through all 8 LEDs
HLT`,
  },
];
