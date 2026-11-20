import React from 'react';

interface MicroVerseLogoProps {
  size?: number;
  className?: string;
}

/**
 * Bespoke MicroVerse Emblem:
 * Minimal geometric microprocessor package with metallic silver pins,
 * precision circuit nodes, and a sculpted abstract "M" trace core.
 */
export const MicroVerseLogo: React.FC<MicroVerseLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="MicroVerse Logo"
    >
      <defs>
        <linearGradient id="mvSilverStroke" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="48%" stopColor="#D8DDE3" />
          <stop offset="100%" stopColor="#8F9AA6" />
        </linearGradient>
        <linearGradient id="mvDieFill" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16253D" />
          <stop offset="100%" stopColor="#0A1424" />
        </linearGradient>
        <linearGradient id="mvMCore" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#BFC6CE" />
        </linearGradient>
      </defs>

      {/* Top & Bottom IC Lead Pins */}
      <g stroke="#BFC6CE" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <line x1="22" y1="4" x2="22" y2="11" />
        <line x1="32" y1="4" x2="32" y2="11" />
        <line x1="42" y1="4" x2="42" y2="11" />
        <line x1="22" y1="53" x2="22" y2="60" />
        <line x1="32" y1="53" x2="32" y2="60" />
        <line x1="42" y1="53" x2="42" y2="60" />
      </g>

      {/* Left & Right IC Lead Pins */}
      <g stroke="#BFC6CE" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <line x1="4" y1="22" x2="11" y2="22" />
        <line x1="4" y1="32" x2="11" y2="32" />
        <line x1="4" y1="42" x2="11" y2="42" />
        <line x1="53" y1="22" x2="60" y2="22" />
        <line x1="53" y1="32" x2="60" y2="32" />
        <line x1="53" y1="42" x2="60" y2="42" />
      </g>

      {/* Outer Chamfered Microprocessor Frame */}
      <path
        d="M17 11H47L53 17V47L47 53H17L11 47V17L17 11Z"
        fill="url(#mvDieFill)"
        stroke="url(#mvSilverStroke)"
        strokeWidth="1.75"
      />

      {/* Inner Precision Wafer Hairline */}
      <rect
        x="16"
        y="16"
        width="32"
        height="32"
        rx="3"
        stroke="#BFC6CE"
        strokeOpacity="0.32"
        strokeWidth="1"
      />

      {/* Abstract Sculpted Circuit "M" Core */}
      <path
        d="M21 43V23L32 34L43 23V43"
        stroke="url(#mvMCore)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Precision Circuit Vias / Nodes on the "M" */}
      <circle cx="21" cy="43" r="2.2" fill="#F5F3EE" />
      <circle cx="43" cy="43" r="2.2" fill="#F5F3EE" />
      <circle cx="32" cy="34" r="2.2" fill="#FFFFFF" />
      <circle cx="21" cy="23" r="1.8" fill="#D8DDE3" />
      <circle cx="43" cy="23" r="1.8" fill="#D8DDE3" />
    </svg>
  );
};
