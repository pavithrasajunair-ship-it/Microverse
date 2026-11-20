import React, { useState } from 'react';

interface CoreZone {
  id: string;
  label: string;
  spec: string;
  detail: string;
}

const ZONES: Record<string, CoreZone> = {
  alu: {
    id: 'alu',
    label: '8-Bit ALU Core',
    spec: 'ADD · SUB · AND · OR · XOR · ROTATE',
    detail: 'Executes binary arithmetic and updates Sign, Zero, Auxiliary Carry, Parity, and Carry flip-flops in real time.',
  },
  regs: {
    id: 'regs',
    label: 'Register File',
    spec: 'A · B · C · D · E · H · L · SP · PC',
    detail: 'High-speed on-chip flip-flop array feeding operands directly onto the internal 8-bit data bus.',
  },
  control: {
    id: 'control',
    label: 'Timing & Control',
    spec: "ALE · RD' · WR' · IO/M' · CLK",
    detail: 'Synchronizes Opcode Fetch, Memory Read/Write, and I/O machine cycles tick-by-tick.',
  },
  bus: {
    id: 'bus',
    label: 'System Bus Fabric',
    spec: 'A15–A8 · AD7–AD0 · 64 KB Space',
    detail: 'Multiplexed address/data pins and high-order address bus bridging silicon to external RAM, ROM, and 8255 PPI.',
  },
};

export const HeroChipVisual: React.FC = () => {
  const [activeZone, setActiveZone] = useState<string>('alu');
  const zone = ZONES[activeZone];

  const isSelected = (id: string) => activeZone === id;

  return (
    <div className="relative rounded-2xl border border-[#BFC6CE]/60 dark:border-[#BFC6CE]/20 bg-[#0A1424] text-[#F5F3EE] p-5 overflow-hidden h-full flex flex-col justify-between">
      {/* Subtle Silver Specular Light Reflection */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 72% 22%, rgba(216, 221, 227, 0.14), transparent 54%), radial-gradient(circle at 20% 84%, rgba(191, 198, 206, 0.08), transparent 50%)',
        }}
      />

      <div className="relative flex flex-col gap-4 h-full justify-between">
        <div className="flex items-center justify-between text-xs text-[#BFC6CE]">
          <span className="font-mono tracking-[0.14em] text-[#D8DDE3]">INTERACTIVE SILICON DIE</span>
          <span className="font-mono tabular-nums text-[#BFC6CE]/80">8085 · 8086 · 8051</span>
        </div>

        <svg
          viewBox="0 0 420 270"
          className="w-full h-auto select-none"
          role="img"
          aria-label="Interactive animated microprocessor die diagram"
        >
          <defs>
            <linearGradient id="heroDieBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#16253D" />
              <stop offset="100%" stopColor="#0A1424" />
            </linearGradient>
            <linearGradient id="heroSilverTrace" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#BFC6CE" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#BFC6CE" />
            </linearGradient>
          </defs>

          {/* Left Outer PCB Traces */}
          {[42, 76, 110, 144, 178, 212].map((y, idx) => (
            <g key={`pin-l-${idx}`}>
              <line x1="16" y1={y} x2="66" y2={y} stroke="#24344D" strokeWidth="2.4" />
              <line
                x1="16"
                y1={y}
                x2="66"
                y2={y}
                stroke="#D8DDE3"
                strokeWidth="1.6"
                className="animate-signal-flow"
                opacity={isSelected('bus') ? 1 : 0.42}
              />
              <rect x="64" y={y - 4} width="12" height="8" rx="1.5" fill="#BFC6CE" />
            </g>
          ))}

          {/* Right Outer PCB Traces */}
          {[42, 76, 110, 144, 178, 212].map((y, idx) => (
            <g key={`pin-r-${idx}`}>
              <line x1="354" y1={y} x2="404" y2={y} stroke="#24344D" strokeWidth="2.4" />
              <line
                x1="354"
                y1={y}
                x2="404"
                y2={y}
                stroke="#F5F3EE"
                strokeWidth="1.6"
                className="animate-signal-flow"
                opacity={isSelected('bus') ? 1 : 0.42}
              />
              <rect x="344" y={y - 4} width="12" height="8" rx="1.5" fill="#BFC6CE" />
            </g>
          ))}

          {/* Ceramic IC Package */}
          <rect
            x="76"
            y="18"
            width="268"
            height="226"
            rx="14"
            fill="url(#heroDieBg)"
            stroke={isSelected('bus') ? '#FFFFFF' : '#BFC6CE'}
            strokeOpacity={isSelected('bus') ? '0.95' : '0.45'}
            strokeWidth={isSelected('bus') ? '2' : '1.4'}
          />

          {/* IC Notch */}
          <path d="M 192 18 A 18 18 0 0 0 228 18" fill="none" stroke="#BFC6CE" strokeOpacity="0.45" strokeWidth="1.4" />

          {/* Internal Animated 8-bit Bus Spine */}
          <g onClick={() => setActiveZone('bus')} className="cursor-pointer">
            <rect
              x="98"
              y="122"
              width="224"
              height="18"
              rx="4"
              fill={isSelected('bus') ? '#1E314E' : '#101B2D'}
              stroke={isSelected('bus') ? '#FFFFFF' : '#BFC6CE'}
              strokeOpacity={isSelected('bus') ? '1' : '0.5'}
              strokeWidth={isSelected('bus') ? '1.8' : '1'}
            />
            <line
              x1="104"
              y1="131"
              x2="316"
              y2="131"
              stroke="url(#heroSilverTrace)"
              strokeWidth="2.2"
              className="animate-signal-flow"
            />
            <text x="210" y="134.5" textAnchor="middle" fill="#F5F3EE" fontSize="9.2" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
              8-BIT INTERNAL DATA BUS
            </text>
          </g>

          {/* ALU Block */}
          <g onClick={() => setActiveZone('alu')} className="cursor-pointer">
            <rect
              x="98"
              y="40"
              width="104"
              height="68"
              rx="9"
              fill={isSelected('alu') ? '#1B2D49' : '#101B2D'}
              stroke={isSelected('alu') ? '#FFFFFF' : '#BFC6CE'}
              strokeOpacity={isSelected('alu') ? '0.95' : '0.38'}
              strokeWidth={isSelected('alu') ? '2' : '1.1'}
            />
            <text x="150" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="600" fontFamily="Outfit, sans-serif">
              ALU + ACC
            </text>
            <text x="150" y="86" textAnchor="middle" fill="#BFC6CE" fontSize="9.2" fontFamily="IBM Plex Mono, monospace">
              S Z AC P CY
            </text>
            <line x1="150" y1="108" x2="150" y2="122" stroke="#D8DDE3" strokeWidth="1.8" className="animate-signal-flow" />
          </g>

          {/* Register Array Block */}
          <g onClick={() => setActiveZone('regs')} className="cursor-pointer">
            <rect
              x="218"
              y="40"
              width="104"
              height="68"
              rx="9"
              fill={isSelected('regs') ? '#1B2D49' : '#101B2D'}
              stroke={isSelected('regs') ? '#FFFFFF' : '#BFC6CE'}
              strokeOpacity={isSelected('regs') ? '0.95' : '0.38'}
              strokeWidth={isSelected('regs') ? '2' : '1.1'}
            />
            <text x="270" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="600" fontFamily="Outfit, sans-serif">
              REGISTERS
            </text>
            <text x="270" y="86" textAnchor="middle" fill="#BFC6CE" fontSize="9.2" fontFamily="IBM Plex Mono, monospace">
              BC · DE · HL · PC
            </text>
            <line x1="270" y1="108" x2="270" y2="122" stroke="#D8DDE3" strokeWidth="1.8" className="animate-signal-flow" />
          </g>

          {/* Timing & Control Block */}
          <g onClick={() => setActiveZone('control')} className="cursor-pointer">
            <rect
              x="98"
              y="156"
              width="224"
              height="68"
              rx="9"
              fill={isSelected('control') ? '#1B2D49' : '#101B2D'}
              stroke={isSelected('control') ? '#FFFFFF' : '#BFC6CE'}
              strokeOpacity={isSelected('control') ? '0.95' : '0.38'}
              strokeWidth={isSelected('control') ? '2' : '1.1'}
            />
            <text x="210" y="184" textAnchor="middle" fill="#FFFFFF" fontSize="12.5" fontWeight="600" fontFamily="Outfit, sans-serif">
              TIMING &amp; CONTROL UNIT
            </text>
            <text x="210" y="202" textAnchor="middle" fill="#D8DDE3" fontSize="9.2" fontFamily="IBM Plex Mono, monospace">
              FETCH → DECODE → EXECUTE (3.07 MHz)
            </text>
            <line x1="210" y1="140" x2="210" y2="156" stroke="#D8DDE3" strokeWidth="1.8" className="animate-signal-flow" />
          </g>
        </svg>

        {/* Interactive Zone Readout */}
        <div className="rounded-xl bg-[#101B2D]/95 border border-[#BFC6CE]/25 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-[#FFFFFF]">{zone.label}</span>
            <span className="text-xs font-mono text-[#D8DDE3]">{zone.spec}</span>
          </div>
          <p className="text-xs text-[#BFC6CE] leading-relaxed">{zone.detail}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.values(ZONES).map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setActiveZone(z.id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeZone === z.id
                    ? 'bg-[#F5F3EE] text-[#101B2D] font-semibold'
                    : 'bg-[#0A1424] border border-[#BFC6CE]/25 text-[#D8DDE3] hover:border-[#BFC6CE]/70'
                }`}
              >
                {z.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
