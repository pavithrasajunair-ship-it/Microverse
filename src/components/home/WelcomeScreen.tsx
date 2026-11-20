import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MicroVerseLogo } from '../brand/MicroVerseLogo';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const PARTICLES = [
  { id: 1, x: '11%', y: '18%', size: 2.5, delay: '0s', dur: '6.2s' },
  { id: 2, x: '22%', y: '72%', size: 2, delay: '1.1s', dur: '5.4s' },
  { id: 3, x: '84%', y: '21%', size: 2.5, delay: '0.6s', dur: '6.8s' },
  { id: 4, x: '78%', y: '68%', size: 2, delay: '2.0s', dur: '5.8s' },
  { id: 5, x: '34%', y: '26%', size: 1.8, delay: '1.7s', dur: '4.9s' },
  { id: 6, x: '67%', y: '31%', size: 2.2, delay: '0.4s', dur: '6.0s' },
  { id: 7, x: '16%', y: '48%', size: 1.8, delay: '2.5s', dur: '5.2s' },
  { id: 8, x: '89%', y: '49%', size: 2.4, delay: '1.4s', dur: '6.4s' },
  { id: 9, x: '44%', y: '84%', size: 2, delay: '0.9s', dur: '5.6s' },
  { id: 10, x: '58%', y: '14%', size: 2.2, delay: '1.9s', dur: '5.1s' },
  { id: 11, x: '29%', y: '56%', size: 1.6, delay: '2.8s', dur: '6.6s' },
  { id: 12, x: '72%', y: '82%', size: 2, delay: '0.2s', dur: '5.9s' },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [entering, setEntering] = useState(false);
  const [chipHovered, setChipHovered] = useState(false);

  const triggerEnter = () => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(() => {
      onEnter();
    }, 820);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [entering]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: entering ? 0 : 1 }}
      transition={{ duration: entering ? 0.55 : 0.7, delay: entering ? 0.28 : 0, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#0A1424] text-[#F5F3EE] select-none flex flex-col justify-between"
    >
      {/* Layer 1: Deep Ink Navy Atmosphere + Subtle Brushed Silver Specular Reflections */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 72% 58% at 50% 44%, rgba(25, 42, 70, 0.92) 0%, rgba(16, 27, 45, 0.96) 52%, #0A1424 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: entering ? 0.95 : chipHovered ? 0.58 : 0.36,
          background:
            'radial-gradient(circle at 50% 42%, rgba(216, 221, 227, 0.16) 0%, rgba(191, 198, 206, 0.05) 32%, transparent 62%)',
        }}
      />

      {/* Layer 2: Precision Full-Screen Orthogonal Circuit-Board Network (Expands Outward on Entry) */}
      <motion.svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        animate={{
          scale: entering ? 1.18 : 1,
          opacity: entering ? 0.95 : 0.65,
        }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <radialGradient id="welcomeLineFade" cx="50%" cy="46%" r="54%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#BFC6CE" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#BFC6CE" stopOpacity="0.04" />
          </radialGradient>
          <linearGradient id="silverPulse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BFC6CE" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#BFC6CE" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Fine Architectural Grid Hairlines */}
        <g stroke="#BFC6CE" strokeOpacity="0.045" strokeWidth="1">
          {[180, 360, 540, 720, 900, 1080, 1260].map((x) => (
            <line key={`vg-${x}`} x1={x} y1="0" x2={x} y2="900" />
          ))}
          {[150, 300, 450, 600, 750].map((y) => (
            <line key={`hg-${y}`} x1="0" y1={y} x2="1440" y2={y} />
          ))}
        </g>

        {/* Static Precision Metallic Silver Circuit Traces Radiating from Center */}
        <g fill="none" stroke="url(#welcomeLineFade)" strokeWidth="1.25">
          {/* Upper Left Bus */}
          <path d="M 610 380 L 490 380 L 430 320 L 240 320 L 180 260 L 0 260" />
          <path d="M 610 350 L 520 350 L 460 290 L 310 290 L 250 230 L 120 230 L 70 180 L 0 180" />
          <path d="M 650 310 L 650 210 L 590 150 L 380 150 L 320 90 L 190 90" />

          {/* Lower Left Bus */}
          <path d="M 610 430 L 480 430 L 410 500 L 230 500 L 160 570 L 0 570" />
          <path d="M 610 460 L 530 460 L 460 530 L 310 530 L 240 600 L 110 600 L 50 660 L 0 660" />
          <path d="M 660 500 L 660 630 L 590 700 L 360 700 L 300 760 L 180 760" />

          {/* Upper Right Bus */}
          <path d="M 830 380 L 950 380 L 1010 320 L 1200 320 L 1260 260 L 1440 260" />
          <path d="M 830 350 L 920 350 L 980 290 L 1130 290 L 1190 230 L 1320 230 L 1370 180 L 1440 180" />
          <path d="M 790 310 L 790 210 L 850 150 L 1060 150 L 1120 90 L 1250 90" />

          {/* Lower Right Bus */}
          <path d="M 830 430 L 960 430 L 1030 500 L 1210 500 L 1280 570 L 1440 570" />
          <path d="M 830 460 L 910 460 L 980 530 L 1130 530 L 1200 600 L 1330 600 L 1390 660 L 1440 660" />
          <path d="M 780 500 L 780 630 L 850 700 L 1080 700 L 1140 760 L 1260 760" />
        </g>

        {/* Animated Illuminated Silver Data Pulses Along Key Circuit Traces */}
        <g
          fill="none"
          stroke={entering ? '#FFFFFF' : 'url(#silverPulse)'}
          strokeWidth={entering ? '2.2' : '1.6'}
          opacity={entering ? 1 : 0.72}
        >
          <path d="M 610 380 L 490 380 L 430 320 L 240 320 L 180 260 L 0 260" className="animate-silver-trace" />
          <path d="M 830 380 L 950 380 L 1010 320 L 1200 320 L 1260 260 L 1440 260" className="animate-silver-trace" />
          <path d="M 610 430 L 480 430 L 410 500 L 230 500 L 160 570 L 0 570" className="animate-silver-trace-slow" />
          <path d="M 830 430 L 960 430 L 1030 500 L 1210 500 L 1280 570 L 1440 570" className="animate-silver-trace-slow" />
          <path d="M 650 310 L 650 210 L 590 150 L 380 150 L 320 90 L 190 90" className="animate-silver-trace-slow" />
          <path d="M 790 310 L 790 210 L 850 150 L 1060 150 L 1120 90 L 1250 90" className="animate-silver-trace" />
        </g>

        {/* Precision Via Nodes */}
        <g fill="#0A1424" stroke="#D8DDE3" strokeWidth="1.2" opacity={entering ? 0.95 : 0.5}>
          {[
            [430, 320], [240, 320], [590, 150], [380, 150], [190, 90],
            [410, 500], [230, 500], [590, 700], [360, 700], [180, 760],
            [1010, 320], [1200, 320], [850, 150], [1060, 150], [1250, 90],
            [1030, 500], [1210, 500], [850, 700], [1080, 700], [1260, 760],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="3.5" />
          ))}
        </g>
      </motion.svg>

      {/* Layer 3: Subtle Floating Electronic Signal Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-[#D8DDE3] animate-particle-drift"
            style={{
              left: p.x,
              top: p.y,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.dur,
              boxShadow: '0 0 8px rgba(216, 221, 227, 0.55)',
            }}
          />
        ))}
      </div>

      {/* Expanding Radial Silver Halo on Entry */}
      {entering && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0.75 }}
          animate={{ scale: 4.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-[#F5F3EE]/80 pointer-events-none"
          style={{
            boxShadow: '0 0 90px 24px rgba(245, 243, 238, 0.28)',
          }}
        />
      )}

      {/* Top Minimal Architectural Brand Mark Bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1360px] mx-auto px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <MicroVerseLogo size={32} />
          <span className="text-sm font-semibold tracking-[0.18em] text-[#F5F3EE]/90 font-display whitespace-nowrap">
            MICROVERSE
          </span>
        </div>
        <span className="hidden sm:inline text-xs font-mono tracking-[0.16em] text-[#BFC6CE]/75 whitespace-nowrap">
          8085 · 8086 · 8051 · DIGITAL SYSTEMS
        </span>
      </motion.header>

      {/* Center Immersive Focal Stage — Clicking Anywhere Here Enters */}
      <main
        onClick={triggerEnter}
        onMouseEnter={() => setChipHovered(true)}
        onMouseLeave={() => setChipHovered(false)}
        role="button"
        tabIndex={0}
        aria-label="Enter the MicroVerse interactive learning platform"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerEnter();
          }
        }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 cursor-pointer group focus:outline-none"
      >
        {/* Central Precision Animated Microprocessor Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: 1,
            scale: entering ? 1.14 : chipHovered ? 1.025 : 1,
          }}
          transition={{ duration: entering ? 0.65 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center mb-6 sm:mb-8"
        >
          {/* Soft Breathing Silver Specular Halo Behind Chip */}
          <div
            className="absolute inset-4 rounded-full pointer-events-none animate-chip-breathe transition-all duration-500"
            style={{
              background: entering
                ? 'radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(216,221,227,0.18) 45%, transparent 72%)'
                : 'radial-gradient(circle, rgba(216,221,227,0.22) 0%, rgba(191,198,206,0.08) 48%, transparent 72%)',
            }}
          />

          <svg
            viewBox="0 0 260 260"
            className="w-full h-full relative z-10 drop-shadow-[0_18px_40px_rgba(0,0,0,0.65)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="chipBodyGrad" x1="40" y1="36" x2="220" y2="224" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1A2B45" />
                <stop offset="48%" stopColor="#101B2D" />
                <stop offset="100%" stopColor="#0A1424" />
              </linearGradient>
              <linearGradient id="chipBorderSilver" x1="48" y1="48" x2="212" y2="212" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#BFC6CE" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="innerCoreGrad" x1="85" y1="85" x2="175" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={entering ? '#FFFFFF' : '#F5F3EE'} />
                <stop offset="100%" stopColor="#BFC6CE" />
              </linearGradient>
            </defs>

            {/* Outer Subtle Concentric Calibration Ring */}
            <circle
              cx="130"
              cy="130"
              r="118"
              fill="none"
              stroke="#BFC6CE"
              strokeOpacity={entering ? '0.55' : '0.16'}
              strokeWidth="0.9"
              strokeDasharray="3 7"
            />

            {/* 4-Side Metallic Silver Pin Arrays + Animated Signal Pulses */}
            {[86, 102, 118, 134, 150, 166, 182].map((pos, i) => (
              <g key={`pins-${i}`}>
                {/* Top Pins */}
                <line x1={pos - 4} y1="22" x2={pos - 4} y2="54" stroke="#BFC6CE" strokeOpacity="0.45" strokeWidth="2" />
                <line
                  x1={pos - 4}
                  y1="22"
                  x2={pos - 4}
                  y2="54"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  className={i % 2 === 0 ? 'animate-signal-flow' : 'animate-silver-trace'}
                  opacity={entering ? 1 : chipHovered ? 0.9 : 0.55}
                />
                {/* Bottom Pins */}
                <line x1={pos - 4} y1="206" x2={pos - 4} y2="238" stroke="#BFC6CE" strokeOpacity="0.45" strokeWidth="2" />
                <line
                  x1={pos - 4}
                  y1="206"
                  x2={pos - 4}
                  y2="238"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  className={i % 2 === 1 ? 'animate-signal-flow' : 'animate-silver-trace'}
                  opacity={entering ? 1 : chipHovered ? 0.9 : 0.55}
                />
                {/* Left Pins */}
                <line x1="22" y1={pos - 4} x2="54" y2={pos - 4} stroke="#BFC6CE" strokeOpacity="0.45" strokeWidth="2" />
                <line
                  x1="22"
                  y1={pos - 4}
                  x2="54"
                  y2={pos - 4}
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  className={i % 2 === 0 ? 'animate-silver-trace' : 'animate-signal-flow'}
                  opacity={entering ? 1 : chipHovered ? 0.9 : 0.55}
                />
                {/* Right Pins */}
                <line x1="206" y1={pos - 4} x2="238" y2={pos - 4} stroke="#BFC6CE" strokeOpacity="0.45" strokeWidth="2" />
                <line
                  x1="206"
                  y1={pos - 4}
                  x2="238"
                  y2={pos - 4}
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  className={i % 2 === 1 ? 'animate-silver-trace' : 'animate-signal-flow'}
                  opacity={entering ? 1 : chipHovered ? 0.9 : 0.55}
                />
              </g>
            ))}

            {/* Outer Chamfered Ceramic Package */}
            <path
              d="M68 54H192L206 68V192L192 206H68L54 192V68L68 54Z"
              fill="url(#chipBodyGrad)"
              stroke="url(#chipBorderSilver)"
              strokeWidth={entering ? '2.4' : '1.6'}
            />

            {/* Pin-1 Orientation Dot (Aerospace Hardware Detail) */}
            <circle cx="72" cy="72" r="2.8" fill="#D8DDE3" opacity="0.8" />

            {/* Subtle Internal Die Substrate Frame */}
            <rect
              x="76"
              y="76"
              width="108"
              height="108"
              rx="8"
              fill={entering ? 'rgba(245, 243, 238, 0.14)' : 'rgba(16, 27, 45, 0.9)'}
              stroke="#BFC6CE"
              strokeOpacity={entering ? '0.9' : '0.42'}
              strokeWidth="1.2"
            />

            {/* Internal Wafer Micro-Grid */}
            <g stroke="#BFC6CE" strokeOpacity="0.16" strokeWidth="0.8">
              <line x1="98" y1="76" x2="98" y2="184" />
              <line x1="130" y1="76" x2="130" y2="184" />
              <line x1="162" y1="76" x2="162" y2="184" />
              <line x1="76" y1="98" x2="184" y2="98" />
              <line x1="76" y1="130" x2="184" y2="130" />
              <line x1="76" y1="162" x2="184" y2="162" />
            </g>

            {/* Illuminated Abstract "M" Silicon Core Trace */}
            <path
              d="M98 158V104L130 136L162 104V158"
              fill="none"
              stroke="url(#innerCoreGrad)"
              strokeWidth={entering ? '4.8' : '3.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: entering
                  ? 'drop-shadow(0 0 14px rgba(255,255,255,0.95))'
                  : 'drop-shadow(0 0 8px rgba(216,221,227,0.4))',
              }}
            />
            <circle cx="98" cy="158" r="3.6" fill="#FFFFFF" />
            <circle cx="162" cy="158" r="3.6" fill="#FFFFFF" />
            <circle cx="130" cy="136" r="3.6" fill="#FFFFFF" />
            <circle cx="98" cy="104" r="2.8" fill="#D8DDE3" />
            <circle cx="162" cy="104" r="2.8" fill="#D8DDE3" />
          </svg>
        </motion.div>

        {/* Central Typography & Brand Identity */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: entering ? 0 : 1, y: entering ? -12 : 0 }}
          transition={{ duration: 0.65, delay: entering ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3.5"
        >
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-none"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F3EE 58%, #BFC6CE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MicroVerse
          </h1>

          <p className="text-xs sm:text-sm font-mono tracking-[0.24em] text-[#D8DDE3] pt-1">
            EXPLORE THE INTELLIGENCE BEHIND EVERY CIRCUIT.
          </p>

          <p className="text-sm sm:text-base text-[#BFC6CE] leading-relaxed max-w-xl mx-auto font-normal pt-1">
            Discover microprocessors, microcontrollers, and the fascinating world of digital systems through interactive visual learning.
          </p>
        </motion.div>
      </main>

      {/* Bottom Entry Interaction */}
      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: entering ? 0 : 1, y: entering ? 10 : 0 }}
        transition={{ duration: 0.65, delay: entering ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 pb-8 sm:pb-12 px-6 flex flex-col items-center gap-3.5"
      >
        <button
          type="button"
          onClick={triggerEnter}
          disabled={entering}
          className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-[#BFC6CE]/75 bg-[#101B2D]/70 backdrop-blur-md text-[#F5F3EE] hover:border-[#FFFFFF] hover:bg-[#16253D]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F3EE]/80 whitespace-nowrap"
          style={{
            boxShadow: '0 10px 34px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
          }}
        >
          {/* Metallic Silver Hover Sheen */}
          <span
            aria-hidden="true"
            className="silver-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#FFFFFF]/20 to-transparent -translate-x-full"
          />
          <span className="relative z-10 text-xs sm:text-sm font-mono tracking-[0.2em] font-medium">
            {entering ? 'INITIALIZING WORKSPACE' : 'ENTER THE MICROVERSE'}
          </span>
          <ArrowRight className="relative z-10 w-4 h-4 text-[#D8DDE3] transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <span className="text-[11px] font-mono tracking-[0.28em] text-[#BFC6CE]/65">
          TAP TO EXPLORE
        </span>
      </motion.footer>
    </motion.div>
  );
};
