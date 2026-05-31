import React from 'react';

const ShopScene = ({ dialogue, gold }) => (
  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(212,175,55,0.28)' }}>
    <style>{`
      @keyframes sg_flameOuter {
        0%,100%{opacity:.88;transform:scaleY(1)    scaleX(1)    rotate(0deg)}
        18%{opacity:.80;transform:scaleY(.92)  scaleX(1.10) rotate(-3.5deg)}
        42%{opacity:.86;transform:scaleY(1.10) scaleX(.91)  rotate(2.5deg)}
        65%{opacity:.76;transform:scaleY(.87)  scaleX(1.12) rotate(-2deg)}
        84%{opacity:.84;transform:scaleY(1.06) scaleX(.95)  rotate(1.5deg)}
      }
      @keyframes sg_flameMid {
        0%,100%{opacity:.86;transform:scaleY(1)    scaleX(1)    rotate(0deg)}
        22%{opacity:.78;transform:scaleY(.89)  scaleX(1.12) rotate(3.2deg)}
        52%{opacity:.84;transform:scaleY(1.12) scaleX(.90)  rotate(-2.5deg)}
        78%{opacity:.72;transform:scaleY(.91)  scaleX(1.09) rotate(2deg)}
      }
      @keyframes sg_flameTip {
        0%,100%{opacity:.90;transform:scaleY(1)    scaleX(1)    rotate(0deg)}
        28%{opacity:.80;transform:scaleY(.86)  scaleX(1.15) rotate(-4.5deg)}
        62%{opacity:.86;transform:scaleY(1.14) scaleX(.88)  rotate(3.8deg)}
      }
      @keyframes sg_glow { 0%,100%{opacity:.48} 50%{opacity:.9} }
      @keyframes sg_float {
        0%,100%{transform:translateY(0) rotate(0deg)}
        33%{transform:translateY(-2.5px) rotate(.45deg)}
        66%{transform:translateY(-1px)   rotate(-.3deg)}
      }
      @keyframes sg_eye { 0%,100%{opacity:.6} 50%{opacity:1} }
      @keyframes sg_candleGlow { 0%,100%{opacity:.08} 50%{opacity:.18} }
      @keyframes sg_ember1 {
        0%{opacity:0;transform:translate(0,0)}
        14%{opacity:.75}
        100%{opacity:0;transform:translate(5px,-82px)}
      }
      @keyframes sg_ember2 {
        0%{opacity:0;transform:translate(0,0)}
        18%{opacity:.62}
        100%{opacity:0;transform:translate(-4px,-74px)}
      }
      @keyframes sg_ember3 {
        0%{opacity:0;transform:translate(0,0)}
        11%{opacity:.82}
        100%{opacity:0;transform:translate(7px,-68px)}
      }
      @keyframes sg_smoke {
        0%{opacity:0;transform:translateY(0) scale(.4)}
        22%{opacity:.13;transform:translateY(-14px) scale(.85) translateX(-3px)}
        70%{opacity:.05;transform:translateY(-38px) scale(1.55) translateX(5px)}
        100%{opacity:0;transform:translateY(-60px) scale(2)}
      }
      @keyframes sg_bladeGleam {
        0%,80%,100%{opacity:.9}
        87%{opacity:1}
        93%{opacity:.86}
      }
    `}</style>

    <svg viewBox="0 0 600 224" width="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="sg_wall" cx="50%" cy="18%" r="72%">
          <stop offset="0%" stopColor="#3a1c0a"/>
          <stop offset="100%" stopColor="#0b0401"/>
        </radialGradient>
        <radialGradient id="sg_tL" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,140,0,.62)"/>
          <stop offset="100%" stopColor="rgba(255,80,0,0)"/>
        </radialGradient>
        <radialGradient id="sg_tR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,140,0,.62)"/>
          <stop offset="100%" stopColor="rgba(255,80,0,0)"/>
        </radialGradient>
        <radialGradient id="sg_vig" cx="50%" cy="38%" r="56%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,.74)"/>
        </radialGradient>
        <linearGradient id="sg_fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(8,5,2,.92)"/>
        </linearGradient>
        <filter id="sg_b2"><feGaussianBlur stdDeviation="2"/></filter>
        <filter id="sg_b5"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="sg_b8"><feGaussianBlur stdDeviation="8"/></filter>
      </defs>

      {/* ── BACKGROUND WALL ── */}
      <rect x="0" y="0" width="600" height="224" fill="url(#sg_wall)"/>
      {/* Horizontal wood plank lines */}
      {[30,60,90,118].map(y=>(
        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(0,0,0,.11)" strokeWidth="1.5"/>
      ))}
      {/* Subtle vertical seams */}
      {[100,200,300,400,500].map(x=>(
        <line key={x} x1={x} y1="0" x2={x} y2="148" stroke="rgba(0,0,0,.06)" strokeWidth="1"/>
      ))}

      {/* ── TORCH AMBIENT GLOW ── */}
      <ellipse cx="76" cy="54" rx="100" ry="82" fill="url(#sg_tL)"
        style={{animation:'sg_glow 2.3s ease-in-out infinite'}}/>
      <ellipse cx="524" cy="54" rx="100" ry="82" fill="url(#sg_tR)"
        style={{animation:'sg_glow 2s ease-in-out infinite .75s'}}/>

      {/* ═══════════ LEFT SHELF ═══════════ */}
      <rect x="6" y="65" width="140" height="8" rx="2" fill="#5C3A1E"/>
      <rect x="6" y="71" width="140" height="5" rx="1" fill="#3B2210"/>
      {/* Shelf brackets */}
      <path d="M17,73 L17,98 L35,73" fill="#3B2210"/>
      <path d="M133,73 L133,98 L115,73" fill="#3B2210"/>

      {/* Red potion */}
      <rect x="22" y="54" width="6" height="9" rx="1" fill="#7B1010"/>
      <ellipse cx="25" cy="63" rx="8" ry="9.5" fill="#CC2222"/>
      <circle cx="25" cy="50" r="3" fill="#3A0808"/>
      <ellipse cx="23" cy="59" rx="2.2" ry="3.2" fill="rgba(255,100,100,.38)"/>

      {/* Blue potion */}
      <rect x="42" y="52" width="6" height="9" rx="1" fill="#0a1e66"/>
      <ellipse cx="45" cy="61.5" rx="8" ry="10.5" fill="#1E3FAA"/>
      <circle cx="45" cy="48" r="3" fill="#060E2E"/>
      <ellipse cx="43" cy="57" rx="2.2" ry="3.5" fill="rgba(100,140,255,.38)"/>

      {/* Green small vial */}
      <rect x="61" y="56" width="5" height="7" rx="1" fill="#0d440d"/>
      <ellipse cx="63.5" cy="63" rx="6" ry="8" fill="#1A7A1A"/>
      <circle cx="63.5" cy="51" r="2.2" fill="#062006"/>
      <ellipse cx="62" cy="59" rx="1.8" ry="2.8" fill="rgba(80,220,80,.38)"/>

      {/* Tall purple vial */}
      <rect x="74" y="50" width="6" height="9" rx="1" fill="#48087A"/>
      <ellipse cx="77" cy="60" rx="7.5" ry="11.5" fill="#7C22CC"/>
      <circle cx="77" cy="46" r="3" fill="#220444"/>
      <ellipse cx="75" cy="56" rx="2" ry="3.8" fill="rgba(190,90,255,.38)"/>

      {/* Two books */}
      <rect x="88" y="45" width="10" height="21" rx="1" fill="#7B3B00"/>
      <rect x="89" y="46" width="8" height="19" rx="1" fill="#963D00"/>
      <rect x="88" y="45" width="10" height="3" fill="#D4AF37" opacity=".48"/>
      <rect x="100" y="47" width="9" height="19" rx="1" fill="#5A2E00"/>
      <rect x="100" y="47" width="9" height="3" fill="#D4AF37" opacity=".38"/>

      {/* Skull */}
      <circle cx="122" cy="57" r="8.5" fill="#D4C4A0"/>
      <circle cx="119" cy="59" r="2.6" fill="#1a1a1a"/>
      <circle cx="125" cy="59" r="2.6" fill="#1a1a1a"/>
      <rect x="117" y="64" width="10" height="4" rx="1" fill="#C4B490"/>
      <line x1="122" y1="64" x2="122" y2="68" stroke="#B0A080" strokeWidth="1"/>
      <path d="M117,64 L122,68 L127,64" fill="none" stroke="#B0A080" strokeWidth="1"/>

      {/* ═══════════ RIGHT SHELF ═══════════ */}
      <rect x="454" y="65" width="140" height="8" rx="2" fill="#5C3A1E"/>
      <rect x="454" y="71" width="140" height="5" rx="1" fill="#3B2210"/>
      <path d="M464,73 L464,98 L482,73" fill="#3B2210"/>
      <path d="M580,73 L580,98 L562,73" fill="#3B2210"/>

      {/* Amber potion */}
      <rect x="461" y="53" width="6" height="9" rx="1" fill="#7B5500"/>
      <ellipse cx="464" cy="62.5" rx="8" ry="10" fill="#C87C0C"/>
      <circle cx="464" cy="49" r="3" fill="#3A2800"/>
      <ellipse cx="462" cy="58" rx="2.2" ry="3.2" fill="rgba(255,185,0,.38)"/>

      {/* Teal flask */}
      <rect x="480" y="54" width="6" height="8" rx="1" fill="#075050"/>
      <ellipse cx="483" cy="62.5" rx="7.5" ry="9.5" fill="#0A8585"/>
      <circle cx="483" cy="50" r="2.5" fill="#032828"/>
      <ellipse cx="481" cy="58" rx="2" ry="3" fill="rgba(0,220,200,.32)"/>

      {/* Sword for sale — real PNG */}
      <image href="/weapons/sword3.png" x="488" y="30" width="52" height="52"
        style={{animation:'sg_bladeGleam 9s ease-in-out infinite 1.5s'}}/>

      {/* Scroll */}
      <rect x="516" y="48" width="26" height="20" rx="3" fill="#D4B896"/>
      <circle cx="516" cy="58" r="5.5" fill="#C4A882"/>
      <circle cx="542" cy="58" r="5.5" fill="#C4A882"/>
      <line x1="521" y1="53" x2="537" y2="53" stroke="#8B6B4A" strokeWidth="1"/>
      <line x1="521" y1="58" x2="537" y2="58" stroke="#8B6B4A" strokeWidth="1"/>
      <line x1="521" y1="63" x2="537" y2="63" stroke="#8B6B4A" strokeWidth="1"/>

      {/* Green flask */}
      <rect x="550" y="53" width="6" height="8" rx="1" fill="#1A4A1A"/>
      <ellipse cx="553" cy="62.5" rx="8" ry="9.5" fill="#1A7A1A"/>
      <rect x="551" y="49" width="4" height="6" rx="1" fill="#0D300D"/>
      <ellipse cx="553" cy="58" rx="3" ry="3.8" fill="rgba(80,255,80,.25)"/>

      {/* Small red vial */}
      <rect x="565" y="56" width="5" height="7" rx="1" fill="#5A0010"/>
      <ellipse cx="567.5" cy="63" rx="6" ry="8" fill="#990020"/>
      <circle cx="567.5" cy="52" r="2.2" fill="#300008"/>

      {/* ═══════════ LEFT TORCH ═══════════ */}
      {/* Wall bracket */}
      <rect x="60" y="26" width="26" height="6" rx="2" fill="#4A2E12"/>
      <rect x="71" y="21" width="8" height="12" rx="1" fill="#3B2210"/>
      {/* Torch shaft */}
      <rect x="72" y="10" width="6" height="16" rx="1" fill="#7B5228"/>
      <line x1="72" y1="12" x2="78" y2="12" stroke="#9B7248" strokeWidth="1.2"/>
      <line x1="72" y1="15.5" x2="78" y2="15.5" stroke="#9B7248" strokeWidth="1.2"/>
      <line x1="72" y1="19" x2="78" y2="19" stroke="#9B7248" strokeWidth="1.2"/>
      {/* Flame — three independent layers */}
      <g style={{transformOrigin:'75px 10px', animation:'sg_flameOuter 2s ease-in-out infinite'}}>
        <ellipse cx="75" cy="5.5" rx="7.5" ry="10" fill="#FF5500" opacity=".88"/>
      </g>
      <g style={{transformOrigin:'75px 10px', animation:'sg_flameMid 1.45s ease-in-out infinite .18s'}}>
        <ellipse cx="74.5" cy="3.5" rx="5" ry="8" fill="#FFAA00" opacity=".86"/>
      </g>
      <g style={{transformOrigin:'75px 10px', animation:'sg_flameTip 1.05s ease-in-out infinite .08s'}}>
        <ellipse cx="75" cy="2" rx="3" ry="6" fill="#FFEE44" opacity=".9"/>
        <ellipse cx="75" cy="1" rx="1.4" ry="3" fill="#FFFFFF" opacity=".72"/>
      </g>
      {/* Embers */}
      <circle cx="73" cy="2" r="1.4" fill="#FF9900" style={{animation:'sg_ember1 2.6s ease-out infinite'}}/>
      <circle cx="78.5" cy="0" r="1.1" fill="#FFCC00" style={{animation:'sg_ember2 3.1s ease-out infinite .9s'}}/>
      <circle cx="71.5" cy="1.5" r="1.2" fill="#FF7700" style={{animation:'sg_ember3 2.4s ease-out infinite 1.7s'}}/>
      {/* Smoke */}
      <circle cx="75" cy="0" r="5" fill="rgba(90,70,50,.2)" style={{animation:'sg_smoke 3.8s ease-out infinite .5s'}}/>

      {/* ═══════════ RIGHT TORCH ═══════════ */}
      <rect x="514" y="26" width="26" height="6" rx="2" fill="#4A2E12"/>
      <rect x="521" y="21" width="8" height="12" rx="1" fill="#3B2210"/>
      <rect x="522" y="10" width="6" height="16" rx="1" fill="#7B5228"/>
      <line x1="522" y1="12" x2="528" y2="12" stroke="#9B7248" strokeWidth="1.2"/>
      <line x1="522" y1="15.5" x2="528" y2="15.5" stroke="#9B7248" strokeWidth="1.2"/>
      <line x1="522" y1="19" x2="528" y2="19" stroke="#9B7248" strokeWidth="1.2"/>
      <g style={{transformOrigin:'525px 10px', animation:'sg_flameOuter 1.88s ease-in-out infinite .35s'}}>
        <ellipse cx="525" cy="5.5" rx="7.5" ry="10" fill="#FF5500" opacity=".88"/>
      </g>
      <g style={{transformOrigin:'525px 10px', animation:'sg_flameMid 1.38s ease-in-out infinite .52s'}}>
        <ellipse cx="524.5" cy="3.5" rx="5" ry="8" fill="#FFAA00" opacity=".86"/>
      </g>
      <g style={{transformOrigin:'525px 10px', animation:'sg_flameTip 1.0s ease-in-out infinite .22s'}}>
        <ellipse cx="525" cy="2" rx="3" ry="6" fill="#FFEE44" opacity=".9"/>
        <ellipse cx="525" cy="1" rx="1.4" ry="3" fill="#FFFFFF" opacity=".72"/>
      </g>
      {/* Embers */}
      <circle cx="522.5" cy="2" r="1.4" fill="#FF9900" style={{animation:'sg_ember1 2.7s ease-out infinite .42s'}}/>
      <circle cx="528" cy="0" r="1.1" fill="#FFCC00" style={{animation:'sg_ember2 3.0s ease-out infinite 1.25s'}}/>
      <circle cx="521" cy="1.5" r="1.2" fill="#FF7700" style={{animation:'sg_ember3 2.5s ease-out infinite 2.1s'}}/>
      {/* Smoke */}
      <circle cx="525" cy="0" r="5" fill="rgba(90,70,50,.2)" style={{animation:'sg_smoke 4s ease-out infinite 1.1s'}}/>

      {/* ═══════════ MERCHANT ═══════════ */}
      <g style={{transformOrigin:'300px 118px', animation:'sg_float 4.6s ease-in-out infinite'}}>
        {/* Robe body */}
        <path d="M260,68 L340,68 L380,154 L220,154 Z" fill="#130602"/>
        {/* Inner robe crease shadow */}
        <path d="M283,68 L300,100 L317,68" fill="#0a0301" opacity=".82"/>
        {/* Belt strap */}
        <rect x="240" y="117" width="119" height="10" rx="3" fill="#3B2210" opacity=".78"/>
        <rect x="295" y="114" width="10" height="16" rx="2" fill="#5C3A1E" opacity=".88"/>
        {/* Buckle */}
        <rect x="297.5" y="117" width="5" height="5" rx="1" fill="#D4AF37" opacity=".55"/>

        {/* Shoulders */}
        <ellipse cx="260" cy="79" rx="25" ry="13" fill="#130602"/>
        <ellipse cx="340" cy="79" rx="25" ry="13" fill="#130602"/>

        {/* Neck */}
        <ellipse cx="300" cy="69" rx="23" ry="13" fill="#0f0501"/>

        {/* Head */}
        <ellipse cx="300" cy="56" rx="32" ry="30" fill="#100502"/>

        {/* Hood peak */}
        <path d="M266,65 C268,37 283,9 300,2 C317,9 332,37 334,65 Z" fill="#0A0301"/>
        {/* Hood interior shadow */}
        <path d="M276,70 C278,48 290,24 300,16 C310,24 322,48 324,70 Z" fill="#060200" opacity=".78"/>

        {/* Face void */}
        <ellipse cx="300" cy="64" rx="23" ry="21" fill="#080201"/>

        {/* Eye glow — blur halo */}
        <circle cx="290" cy="61" r="9" fill="rgba(212,175,55,.16)"
          filter="url(#sg_b8)" style={{animation:'sg_eye 3.9s ease-in-out infinite'}}/>
        <circle cx="310" cy="61" r="9" fill="rgba(212,175,55,.16)"
          filter="url(#sg_b8)" style={{animation:'sg_eye 3.9s ease-in-out infinite .9s'}}/>
        {/* Eye iris */}
        <circle cx="290" cy="61" r="3.5" fill="#D4AF37"
          style={{animation:'sg_eye 3.9s ease-in-out infinite'}}/>
        <circle cx="310" cy="61" r="3.5" fill="#D4AF37"
          style={{animation:'sg_eye 3.9s ease-in-out infinite .9s'}}/>
        {/* Pupil */}
        <circle cx="290" cy="61" r="1.5" fill="#7B4A00"/>
        <circle cx="310" cy="61" r="1.5" fill="#7B4A00"/>
        {/* Highlight */}
        <circle cx="288.5" cy="59.5" r="1.1" fill="#FFE066"/>
        <circle cx="308.5" cy="59.5" r="1.1" fill="#FFE066"/>

        {/* Arms */}
        <path d="M224,132 L243,154 L172,154 L158,134 Z" fill="#130602"/>
        <path d="M376,132 L357,154 L428,154 L442,134 Z" fill="#130602"/>

        {/* Hands */}
        <ellipse cx="192" cy="154" rx="34" ry="11" fill="#321C08"/>
        <ellipse cx="408" cy="154" rx="34" ry="11" fill="#321C08"/>

        {/* Finger lines */}
        {[175,187,199,211].map((x,i)=>(
          <line key={i} x1={x} y1="150" x2={x+3} y2="161" stroke="rgba(0,0,0,.22)" strokeWidth="1.5"/>
        ))}
        {[391,403,415,427].map((x,i)=>(
          <line key={i} x1={x} y1="150" x2={x+3} y2="161" stroke="rgba(0,0,0,.22)" strokeWidth="1.5"/>
        ))}
      </g>

      {/* ═══════════ COUNTER ═══════════ */}
      {/* Top surface */}
      <rect x="64" y="154" width="472" height="15" rx="3" fill="#8B5E3C"/>
      <rect x="64" y="154" width="472" height="4" rx="1" fill="#A87040"/>
      {/* Front face */}
      <rect x="64" y="167" width="472" height="57" fill="#3E2410"/>
      {/* Plank seams */}
      <line x1="221" y1="169" x2="221" y2="224" stroke="rgba(0,0,0,.24)" strokeWidth="2.5"/>
      <line x1="379" y1="169" x2="379" y2="224" stroke="rgba(0,0,0,.24)" strokeWidth="2.5"/>
      {/* Edge highlight */}
      <rect x="64" y="167" width="472" height="3.5" fill="#4A2C14"/>
      {/* Base strip */}
      <rect x="64" y="218" width="472" height="6" rx="1" fill="#2E1808"/>

      {/* ═══════════ COUNTER ITEMS ═══════════ */}
      {/* Coin pile */}
      <ellipse cx="153" cy="159" rx="24" ry="9" fill="#926400" opacity=".9"/>
      <ellipse cx="157" cy="156" rx="11" ry="4.5" fill="#D4AF37"/>
      <ellipse cx="147" cy="154.5" rx="10" ry="4" fill="#C8960C"/>
      <ellipse cx="153" cy="150.5" rx="9" ry="3.5" fill="#D4AF37"/>
      <ellipse cx="149" cy="147" rx="7" ry="3" fill="#E8C547"/>

      {/* Candle */}
      <rect x="292" y="139" width="14" height="19" rx="1.5" fill="#EEE0C0"/>
      <rect x="291" y="138" width="16" height="4" fill="#E0D0A0" opacity=".72"/>
      {/* Wax drip */}
      <path d="M292,150 Q288,156 290,162" stroke="#E8D8B0" strokeWidth="2.5" fill="none" opacity=".6"/>
      {/* Wick */}
      <rect x="298" y="134" width="2.5" height="7" fill="#2a2a2a" opacity=".88"/>
      {/* Candle flame — three independent layers */}
      <g style={{transformOrigin:'299px 136px', animation:'sg_flameOuter 2.5s ease-in-out infinite 1.1s'}}>
        <ellipse cx="299" cy="129.5" rx="5" ry="6.5" fill="#FF7700" opacity=".92"/>
      </g>
      <g style={{transformOrigin:'299px 136px', animation:'sg_flameMid 1.8s ease-in-out infinite 1.3s'}}>
        <ellipse cx="299" cy="128" rx="3.2" ry="5" fill="#FFCC00" opacity=".9"/>
      </g>
      <g style={{transformOrigin:'299px 136px', animation:'sg_flameTip 1.15s ease-in-out infinite 1.18s'}}>
        <ellipse cx="299" cy="127" rx="1.8" ry="3.2" fill="#FFFFFF" opacity=".82"/>
      </g>
      {/* Candle ambient glow */}
      <ellipse cx="299" cy="142" rx="32" ry="22" fill="rgba(255,140,0,.12)"
        filter="url(#sg_b5)" style={{animation:'sg_candleGlow 2.2s ease-in-out infinite 1.1s'}}/>

      {/* Ledger / open book */}
      <rect x="398" y="143" width="58" height="15" rx="2" fill="#3E2410"/>
      <rect x="399" y="144" width="56" height="13" rx="1" fill="#5C3A1E"/>
      <rect x="425" y="143" width="3" height="15" fill="#2E1808"/>
      {/* Page lines left */}
      {[147,151].map(y=>(
        <line key={y} x1="401" y1={y} x2="423" y2={y} stroke="rgba(255,255,255,.11)" strokeWidth="1"/>
      ))}
      {/* Page lines right */}
      {[147,151].map(y=>(
        <line key={y} x1="429" y1={y} x2="454" y2={y} stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      ))}

      {/* ── VIGNETTE ── */}
      <rect x="0" y="0" width="600" height="224" fill="url(#sg_vig)" pointerEvents="none"/>
      {/* Bottom fade into modal */}
      <rect x="0" y="172" width="600" height="52" fill="url(#sg_fade)" pointerEvents="none"/>
    </svg>

    {/* Gold display — top right overlay */}
    <div style={{
      position: 'absolute', top: '10px', right: '12px',
      background: 'rgba(0,0,0,.7)',
      border: '1px solid rgba(212,175,55,.55)',
      borderRadius: '8px',
      padding: '4px 12px',
      display: 'flex', alignItems: 'center', gap: '6px',
      backdropFilter: 'blur(2px)',
    }}>
      <span style={{ fontSize: '15px', lineHeight: 1 }}>🪙</span>
      <span style={{ fontFamily: 'Cinzel, serif', color: '#D4AF37', fontWeight: 700, fontSize: '14px' }}>
        {gold}g
      </span>
    </div>

    {/* Merchant dialogue — bottom overlay */}
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '72%',
      textAlign: 'center',
      fontFamily: 'Cinzel, serif',
      color: 'rgba(212,175,55,.82)',
      fontSize: '11px',
      fontStyle: 'italic',
      lineHeight: 1.4,
      textShadow: '0 0 10px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,1)',
      pointerEvents: 'none',
      whiteSpace: 'normal',
    }}>
      "{dialogue}"
    </div>
  </div>
);

export default ShopScene;
