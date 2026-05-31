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

const ArmoryScene = () => {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * BLACKSMITH_QUOTES.length));

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % BLACKSMITH_QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px 20px',
    }}>
      {/* Portrait */}
      <img
        src="/npcs/blacksmith.png"
        alt="Grimdar Ironforge"
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          objectFit: 'cover',
          objectPosition: 'top center',
          border: '3px solid rgba(192,160,80,0.75)',
          boxShadow: '0 0 28px rgba(255,140,0,0.45), 0 0 70px rgba(200,120,0,0.15)',
          flexShrink: 0,
        }}
      />

      {/* Name + dialogue */}
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          fontWeight: 700,
          color: '#D4AF37',
          letterSpacing: '0.16em',
          margin: '0 0 10px',
        }}>
          GRIMDAR IRONFORGE
        </p>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          color: 'rgba(225,215,195,0.88)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          margin: 0,
        }}>
          "{BLACKSMITH_QUOTES[quoteIdx]}"
        </p>
      </div>
    </div>
  );
};

export default ArmoryScene;
