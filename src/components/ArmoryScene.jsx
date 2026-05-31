import React, { useState, useEffect } from 'react';

const BLACKSMITH_QUOTES = [
  "Finest steel in the realm. Don't chip it on a goblin.",
  "A dull blade insults the ore that made it.",
  "Every weapon here was forged in fire. Like its owner should be.",
  "Sharpness fades. Craftsmanship doesn't.",
  "That armor's seen more battles than most men twice your age.",
  "Come back when ye've got gold worth spending.",
  "I don't make weapons for cowards. Good thing ye're still breathin'.",
  "A warrior without proper steel is just a fool with bad odds.",
];

const WEAPON_SPRITES = [
  '/weapons/sword1.png', '/weapons/sword2.png', '/weapons/sword3.png',
  '/weapons/dagger1.png', '/weapons/dagger2.png',
  '/weapons/mace1.png', '/weapons/staff.png', '/weapons/bow1.png',
];
const HOOK_X = [135, 210, 285, 360, 435];

const getSprite = (wpn, idx) => {
  let seed = idx;
  if (wpn?.id != null) seed = typeof wpn.id === 'number' ? wpn.id : String(wpn.id).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  else if (wpn?.name) seed = wpn.name.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return WEAPON_SPRITES[Math.abs(seed) % WEAPON_SPRITES.length];
};

const ArmoryScene = ({ weapons = [], equippedWeaponId }) => {
  const displayWeapons = weapons.slice(0, HOOK_X.length);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * BLACKSMITH_QUOTES.length));

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % BLACKSMITH_QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100%', background: 'linear-gradient(160deg, #1a1628 0%, #0d0b18 60%, #080610 100%)' }}>
      <style>{`
        @keyframes ar_bladeGleam {
          0%,80%,100%{opacity:.88}
          87%{opacity:1}
          93%{opacity:.85}
        }
        @keyframes ar_equippedGlow { 0%,100%{opacity:.35} 50%{opacity:.7} }
      `}</style>

      <svg viewBox="0 0 600 220" width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <radialGradient id="ar_rackGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(192,160,80,.10)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>
          <radialGradient id="ar_equip" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,.55)"/>
            <stop offset="100%" stopColor="rgba(212,175,55,0)"/>
          </radialGradient>
          <filter id="ar_b8"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>

        {/* Subtle warm glow behind rack */}
        <ellipse cx="300" cy="115" rx="300" ry="100" fill="url(#ar_rackGlow)"/>

        {/* Rack wall mounts */}
        <rect x="88" y="62" width="9" height="24" rx="1" fill="#3C3C4E"/>
        <rect x="471" y="62" width="9" height="24" rx="1" fill="#3C3C4E"/>

        {/* Horizontal bar — dark wood */}
        <rect x="90" y="74" width="390" height="11" rx="2" fill="#5C3A1E"/>
        <rect x="90" y="74" width="390" height="3.5" rx="1" fill="#7B5228"/>
        <rect x="90" y="83" width="390" height="2" rx="1" fill="rgba(0,0,0,.3)"/>

        {/* Iron ring hooks */}
        {HOOK_X.map(x => (
          <g key={x}>
            <path d={`M${x-3},84 L${x-3},94 Q${x},99 ${x+3},94 L${x+3},84`}
              fill="none" stroke="#5A5A70" strokeWidth="2.8"/>
            <path d={`M${x-3},84 L${x-3},94 Q${x},99 ${x+3},94 L${x+3},84`}
              fill="none" stroke="#8080A0" strokeWidth="1" opacity=".5"/>
          </g>
        ))}

        {/* Weapon PNGs */}
        {displayWeapons.map((wpn, i) => {
          const hx = HOOK_X[i];
          const isEquipped = wpn.id === equippedWeaponId;
          return (
            <g key={wpn.id ?? i}>
              {isEquipped && (
                <ellipse cx={hx} cy="130" rx="46" ry="46"
                  fill="url(#ar_equip)" filter="url(#ar_b8)"
                  style={{ animation: 'ar_equippedGlow 2.4s ease-in-out infinite' }}/>
              )}
              <image
                href={getSprite(wpn, i)}
                x={hx - 34} y={94}
                width="68" height="68"
                transform={`rotate(-45, ${hx}, 128)`}
                style={{ animation: `ar_bladeGleam 9s ease-in-out infinite ${i * 1.5}s` }}
              />
            </g>
          );
        })}

        {/* Empty state message */}
        {displayWeapons.length === 0 && (
          <text x="300" y="138" textAnchor="middle"
            fontFamily="Cinzel, serif" fontSize="13"
            fill="rgba(192,192,216,0.22)" fontStyle="italic">
            No weapons collected yet
          </text>
        )}

        {/* Subtle bottom fade */}
        <defs>
          <linearGradient id="ar_fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(8,6,16,.85)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="150" width="600" height="70" fill="url(#ar_fade)"/>
      </svg>

      {/* Blacksmith dialogue */}
      <div style={{
        position: 'absolute', bottom: '10px', left: '10px', right: '10px',
        display: 'flex', alignItems: 'flex-end', gap: '10px',
        pointerEvents: 'none',
      }}>
        <img src="/npcs/blacksmith.png" alt="Blacksmith"
          style={{
            width: 62, height: 62, borderRadius: '50%', flexShrink: 0,
            objectFit: 'cover', objectPosition: 'top center',
            border: '2px solid rgba(192,160,80,0.7)',
            boxShadow: '0 0 14px rgba(255,140,0,0.4)',
            background: '#1a0f05',
          }}/>
        <div style={{
          flex: 1, background: 'rgba(8,6,14,0.92)',
          border: '1px solid rgba(192,160,80,0.45)',
          borderRadius: '8px', padding: '7px 12px 8px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: -7, bottom: 18,
            width: 0, height: 0,
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderRight: '7px solid rgba(192,160,80,0.45)',
          }}/>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '10px',
            color: '#D4AF37', fontWeight: 700,
            letterSpacing: '0.1em', margin: '0 0 4px',
          }}>GRIMDAR IRONFORGE</p>
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: '11px',
            color: 'rgba(225,215,195,0.92)', fontStyle: 'italic',
            lineHeight: 1.45, margin: 0,
          }}>"{BLACKSMITH_QUOTES[quoteIdx]}"</p>
        </div>
      </div>
    </div>
  );
};

export default ArmoryScene;
