import React from 'react';

// Shared decorative elements — illuminated-manuscript flourishes in the
// app's gold palette. All purely presentational (pointerEvents: none).

const GOLD = 'rgba(212,175,55,';

// A single L-shaped corner filigree. `rotate` orients it to each corner.
const CornerMark = ({ rotate, size = 26, opacity = 0.5, offset = 6 }) => {
  const pos = {
    0:   { top: offset,    left: offset },
    90:  { top: offset,    right: offset },
    180: { bottom: offset, right: offset },
    270: { bottom: offset, left: offset },
  }[rotate];
  return (
    <svg
      width={size} height={size} viewBox="0 0 26 26" aria-hidden="true"
      style={{ position: 'absolute', ...pos, transform: `rotate(${rotate}deg)`, pointerEvents: 'none', opacity }}
    >
      <path d="M1 1 L1 14 M1 1 L14 1" stroke={GOLD + '0.85)'} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M4 4 Q4 9 9 9 M4 4 Q9 4 9 9" stroke={GOLD + '0.5)'} strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="2.5" cy="2.5" r="1.4" fill={GOLD + '0.9)'} />
    </svg>
  );
};

// Drops four corner marks into a position:relative parent.
export const CornerFrame = ({ size, opacity, offset }) => (
  <>
    <CornerMark rotate={0}   size={size} opacity={opacity} offset={offset} />
    <CornerMark rotate={90}  size={size} opacity={opacity} offset={offset} />
    <CornerMark rotate={180} size={size} opacity={opacity} offset={offset} />
    <CornerMark rotate={270} size={size} opacity={opacity} offset={offset} />
  </>
);

// An ornamented horizontal divider: tapered rules flanking a triple-diamond
// centerpiece. `width` controls each flanking rule.
export const FlourishDivider = ({ width = '90px', opacity = 1, margin = '0 auto' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin, opacity }}>
    <div style={{ width, height: '1px', background: `linear-gradient(to right, transparent, ${GOLD}0.4))` }} />
    <span style={{ color: GOLD + '0.35)', fontSize: '6px', transform: 'translateY(-1px)' }}>◆</span>
    <span style={{ color: GOLD + '0.7)', fontSize: '9px' }}>◆</span>
    <span style={{ color: GOLD + '0.35)', fontSize: '6px', transform: 'translateY(-1px)' }}>◆</span>
    <div style={{ width, height: '1px', background: `linear-gradient(to left, transparent, ${GOLD}0.4))` }} />
  </div>
);

export default CornerFrame;
