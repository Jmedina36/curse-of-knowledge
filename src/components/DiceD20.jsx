import React from 'react';
import { motion } from 'framer-motion';

/**
 * DiceD20 — a proper 7-sided D20 polygon with internal facet lines.
 *
 * Props:
 *   roll     — number to display (1-20)
 *   color    — stroke / text colour  e.g. '#F59E0B'
 *   glow     — rgba glow colour      e.g. 'rgba(245,158,11,0.7)'
 *   size     — pixel size (width = height)
 *   rolling  — true = dramatic multi-spin; false = simple pop-in
 */
const DiceD20 = ({ roll, color, glow, size = 96, rolling = false }) => {
  const fillColor  = glow.replace(/[\d.]+\)$/, '0.12)');
  const lineColor  = glow.replace(/[\d.]+\)$/, '0.50)');
  const fontSize   = String(roll).length > 1 ? 22 : 27;

  // Classic D20 front-face: 7-vertex polygon
  const poly = '50,4 91,27 96,63 74,93 26,93 4,63 9,27';

  // 6 internal facet lines connecting opposite vertices
  const facets = [
    [50, 4,  4,  63],
    [50, 4,  96, 63],
    [9,  27, 74, 93],
    [91, 27, 26, 93],
    [4,  63, 91, 27],
    [96, 63, 9,  27],
  ];

  return (
    <motion.div
      initial={{ rotate: rolling ? -540 : -90, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={
        rolling
          ? { duration: 0.78, type: 'spring', bounce: 0.28, stiffness: 70 }
          : { duration: 0.50, type: 'spring', bounce: 0.50 }
      }
      style={{ width: size, height: size, display: 'inline-block' }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        {/* Die body */}
        <polygon
          points={poly}
          fill={fillColor}
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 7px ${glow})` }}
        />

        {/* Facet lines */}
        <g stroke={lineColor} strokeWidth="0.9" fill="none">
          {facets.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>

        {/* Roll number */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontFamily="Cinzel, serif"
          fontWeight="900"
          fontSize={fontSize}
          style={{ filter: `drop-shadow(0 0 5px ${glow})` }}
        >
          {roll}
        </text>
      </svg>
    </motion.div>
  );
};

export default DiceD20;
