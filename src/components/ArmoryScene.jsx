import React from 'react';

const ArmoryScene = () => (
  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(192,192,192,0.22)' }}>
    <style>{`
      @keyframes ar_flameOuter {
        0%,100%{opacity:.88;transform:scaleY(1)    scaleX(1)    rotate(0deg)}
        20%{opacity:.80;transform:scaleY(.91)  scaleX(1.10) rotate(-3deg)}
        45%{opacity:.86;transform:scaleY(1.10) scaleX(.92)  rotate(2.5deg)}
        68%{opacity:.75;transform:scaleY(.87)  scaleX(1.12) rotate(-2.2deg)}
        85%{opacity:.84;transform:scaleY(1.06) scaleX(.95)  rotate(1.5deg)}
      }
      @keyframes ar_flameMid {
        0%,100%{opacity:.86;transform:scaleY(1)    scaleX(1)    rotate(0deg)}
        24%{opacity:.77;transform:scaleY(.89)  scaleX(1.12) rotate(3deg)}
        55%{opacity:.83;transform:scaleY(1.12) scaleX(.90)  rotate(-2.5deg)}
        80%{opacity:.71;transform:scaleY(.91)  scaleX(1.09) rotate(2deg)}
      }
      @keyframes ar_flameTip {
        0%,100%{opacity:.90;transform:scaleY(1)    scaleX(1)    rotate(0deg)}
        30%{opacity:.80;transform:scaleY(.86)  scaleX(1.15) rotate(-4deg)}
        65%{opacity:.86;transform:scaleY(1.14) scaleX(.88)  rotate(3.5deg)}
      }
      @keyframes ar_glow { 0%,100%{opacity:.4} 50%{opacity:.8} }
      @keyframes ar_ember1 {
        0%{opacity:0;transform:translate(0,0)}
        13%{opacity:.72}
        100%{opacity:0;transform:translate(5px,-80px)}
      }
      @keyframes ar_ember2 {
        0%{opacity:0;transform:translate(0,0)}
        17%{opacity:.60}
        100%{opacity:0;transform:translate(-4px,-72px)}
      }
      @keyframes ar_ember3 {
        0%{opacity:0;transform:translate(0,0)}
        10%{opacity:.80}
        100%{opacity:0;transform:translate(7px,-66px)}
      }
      @keyframes ar_smoke {
        0%{opacity:0;transform:translateY(0) scale(.4)}
        20%{opacity:.12;transform:translateY(-13px) scale(.82) translateX(-3px)}
        68%{opacity:.04;transform:translateY(-36px) scale(1.52) translateX(5px)}
        100%{opacity:0;transform:translateY(-58px) scale(1.95)}
      }
      @keyframes ar_gleam {
        0%,78%,100%{opacity:0;transform:translateX(-90px) rotate(-18deg)}
        84%{opacity:.38;transform:translateX(0)    rotate(-18deg)}
        92%{opacity:0;  transform:translateX(90px) rotate(-18deg)}
      }
    `}</style>

    <svg viewBox="0 0 600 220" width="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="ar_wall" cx="50%" cy="18%" r="76%">
          <stop offset="0%" stopColor="#24212e"/>
          <stop offset="100%" stopColor="#0e0c13"/>
        </radialGradient>
        <radialGradient id="ar_tL" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,155,55,.52)"/>
          <stop offset="100%" stopColor="rgba(255,80,0,0)"/>
        </radialGradient>
        <radialGradient id="ar_tR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,155,55,.52)"/>
          <stop offset="100%" stopColor="rgba(255,80,0,0)"/>
        </radialGradient>
        <radialGradient id="ar_vig" cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,.76)"/>
        </radialGradient>
        <linearGradient id="ar_fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(10,8,14,.95)"/>
        </linearGradient>
        <linearGradient id="ar_floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1a24"/>
          <stop offset="100%" stopColor="#0e0c14"/>
        </linearGradient>
        <filter id="ar_b4"><feGaussianBlur stdDeviation="4"/></filter>
        <filter id="ar_b7"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>

      {/* ── STONE WALL ── */}
      <rect x="0" y="0" width="600" height="220" fill="url(#ar_wall)"/>
      {/* Horizontal mortar lines */}
      {[27,54,81,108,135].map(y => (
        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(0,0,0,.28)" strokeWidth="2.5"/>
      ))}
      {/* Staggered vertical block seams */}
      {[0,54,108].map(rowY => [90,180,270,360,450,540].map(x => (
        <line key={`${rowY}-${x}`} x1={x} y1={rowY} x2={x} y2={rowY+27} stroke="rgba(0,0,0,.2)" strokeWidth="2"/>
      )))}
      {[27,81,135].map(rowY => [45,135,225,315,405,495].map(x => (
        <line key={`${rowY}-${x}`} x1={x} y1={rowY} x2={x} y2={rowY+27} stroke="rgba(0,0,0,.2)" strokeWidth="2"/>
      )))}

      {/* ── TORCH AMBIENT GLOW ── */}
      <ellipse cx="72" cy="52" rx="98" ry="82" fill="url(#ar_tL)"
        style={{animation:'ar_glow 2.2s ease-in-out infinite'}}/>
      <ellipse cx="528" cy="52" rx="98" ry="82" fill="url(#ar_tR)"
        style={{animation:'ar_glow 2s ease-in-out infinite .72s'}}/>

      {/* ── HERALDIC CREST (back wall center) ── */}
      {/* Crest shadow glow */}
      <path d="M275,12 L325,12 L325,38 L300,52 L275,38 Z"
        fill="rgba(212,175,55,.12)" filter="url(#ar_b4)"/>
      {/* Shield body */}
      <path d="M277,13 L323,13 L323,38 L300,51 L277,38 Z" fill="#3a1010"/>
      <path d="M277,13 L323,13 L323,38 L300,51 L277,38 Z"
        fill="none" stroke="rgba(212,175,55,.65)" strokeWidth="1.6"/>
      {/* Inner detail */}
      <path d="M283,17 L317,17 L317,36 L300,46 L283,36 Z"
        fill="none" stroke="rgba(212,175,55,.28)" strokeWidth="1"/>
      {/* Crossed swords */}
      <line x1="283" y1="17" x2="317" y2="45" stroke="#D4AF37" strokeWidth="1.6" opacity=".68"/>
      <line x1="317" y1="17" x2="283" y2="45" stroke="#D4AF37" strokeWidth="1.6" opacity=".68"/>
      <circle cx="300" cy="31" r="5.5" fill="none" stroke="rgba(212,175,55,.55)" strokeWidth="1.3"/>
      <circle cx="300" cy="31" r="2" fill="rgba(212,175,55,.4)"/>

      {/* ═══════════ LEFT WEAPON RACK ═══════════ */}
      {/* Wall mounts */}
      <rect x="26" y="68" width="9" height="22" rx="1" fill="#3C3C4E"/>
      <rect x="154" y="68" width="9" height="22" rx="1" fill="#3C3C4E"/>
      {/* Horizontal bar */}
      <rect x="20" y="79" width="152" height="9" rx="2" fill="#5C3A1E"/>
      <rect x="20" y="79" width="152" height="3" rx="1" fill="#7B5228"/>
      {/* Iron ring hooks */}
      {[52,96,140].map(x => (
        <path key={x} d={`M${x-3},87 L${x-3},96 Q${x},100 ${x+3},96 L${x+3},87`}
          fill="none" stroke="#6A6A7E" strokeWidth="2.5"/>
      ))}

      {/* Sword 1 — x=52 */}
      <circle cx="52" cy="104" r="5.5" fill="#8888A8"/>
      <circle cx="52" cy="104" r="3" fill="#6868A0"/>
      <rect x="49" y="104" width="6" height="22" rx="1" fill="#7B5228"/>
      <rect x="40" y="124" width="24" height="5" rx="1" fill="#9292B2"/>
      <path d="M50,128 L54,128 L53.2,170 L52,173 L50.8,170 Z" fill="#C0C8D8"/>
      <line x1="52" y1="128" x2="52" y2="173" stroke="rgba(255,255,255,.28)" strokeWidth="1"/>
      <line x1="40" y1="126.5" x2="64" y2="126.5" stroke="#B0B0C8" strokeWidth=".6" opacity=".5"/>

      {/* Sword 2 — x=96 */}
      <circle cx="96" cy="102" r="5.5" fill="#9898A8"/>
      <circle cx="96" cy="102" r="3" fill="#7878A0"/>
      <rect x="93" y="102" width="6" height="18" rx="1" fill="#5C3A1E"/>
      <rect x="85" y="118" width="22" height="5" rx="1" fill="#A8A8C0"/>
      <path d="M94,122 L98,122 L97.2,160 L96,163 L94.8,160 Z" fill="#B8C0D0"/>
      <line x1="96" y1="122" x2="96" y2="163" stroke="rgba(255,255,255,.25)" strokeWidth="1"/>

      {/* Axe — x=140 */}
      <path key="hook140" d="M137,87 L137,96 Q140,100 143,96 L143,87"
        fill="none" stroke="#6A6A7E" strokeWidth="2.5"/>
      <rect x="138" y="96" width="4" height="62" rx="1" fill="#6B4226"/>
      <line x1="138" y1="100" x2="142" y2="100" stroke="#9B7248" strokeWidth="1.2"/>
      <line x1="138" y1="110" x2="142" y2="110" stroke="#9B7248" strokeWidth="1.2"/>
      <line x1="138" y1="120" x2="142" y2="120" stroke="#9B7248" strokeWidth="1.2"/>
      {/* Axe head */}
      <path d="M131,96 L148,100 L144,120 L131,118 Z" fill="#9292B2"/>
      <path d="M131,96 L148,100 L147,97 L131,93 Z" fill="#A8A8C0"/>
      <line x1="131" y1="96" x2="131" y2="118" stroke="#C0C8D8" strokeWidth="1" opacity=".5"/>
      <line x1="133" y1="96" x2="133" y2="118" stroke="rgba(255,255,255,.15)" strokeWidth="1"/>

      {/* ═══════════ RIGHT — SHIELD + SPEAR ═══════════ */}
      {/* Shield wall hook */}
      <rect x="511" y="36" width="9" height="14" rx="1" fill="#3C3C4E"/>
      {/* Shield outer rim */}
      <circle cx="515" cy="86" r="44" fill="#3a2808" stroke="#6B4226" strokeWidth="2.8"/>
      {/* Shield face */}
      <circle cx="515" cy="86" r="37" fill="#4a3010" stroke="rgba(212,175,55,.38)" strokeWidth="1.5"/>
      {/* Quadrant lines */}
      <line x1="515" y1="49" x2="515" y2="123" stroke="rgba(212,175,55,.42)" strokeWidth="1.6"/>
      <line x1="478" y1="86" x2="552" y2="86" stroke="rgba(212,175,55,.42)" strokeWidth="1.6"/>
      {/* Inner ring */}
      <circle cx="515" cy="86" r="20" fill="none" stroke="rgba(212,175,55,.28)" strokeWidth="1.2"/>
      {/* Boss */}
      <circle cx="515" cy="86" r="10.5" fill="#6B4226" stroke="rgba(212,175,55,.6)" strokeWidth="1.6"/>
      <circle cx="515" cy="86" r="5.5" fill="#8B6B3A"/>
      <circle cx="512" cy="83" r="2" fill="rgba(255,255,255,.18)"/>
      {/* Rim rivets */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = deg * Math.PI / 180;
        return <circle key={i} cx={515 + 38 * Math.cos(r)} cy={86 + 38 * Math.sin(r)} r="2.2" fill="rgba(212,175,55,.48)"/>;
      })}

      {/* Spear leaning against right wall */}
      {/* Shadow */}
      <line x1="577" y1="20" x2="554" y2="163" stroke="rgba(0,0,0,.35)" strokeWidth="8"/>
      {/* Shaft */}
      <line x1="575" y1="20" x2="552" y2="163" stroke="#7B5228" strokeWidth="5"/>
      <line x1="575" y1="20" x2="552" y2="163" stroke="#9B7248" strokeWidth="2"/>
      {/* Spearhead */}
      <path d="M569,13 L581,14 L583,22 L575,32 L567,22 Z" fill="#C0C8D8"/>
      <path d="M569,13 L581,14 L575,13 Z" fill="#D8E0F0"/>
      <line x1="575" y1="13" x2="575" y2="32" stroke="rgba(255,255,255,.28)" strokeWidth="1"/>
      {/* Butt cap */}
      <ellipse cx="551.5" cy="165" rx="4.5" ry="3.5" fill="#8888A8"/>

      {/* ═══════════ LEFT TORCH ═══════════ */}
      <rect x="54" y="26" width="27" height="7" rx="2" fill="#3C3C50"/>
      <rect x="64" y="21" width="8" height="14" rx="1" fill="#303048"/>
      <rect x="65" y="10" width="6" height="16" rx="1" fill="#7B5228"/>
      <line x1="65" y1="12" x2="71" y2="12" stroke="#9B7248" strokeWidth="1.3"/>
      <line x1="65" y1="16" x2="71" y2="16" stroke="#9B7248" strokeWidth="1.3"/>
      <line x1="65" y1="20" x2="71" y2="20" stroke="#9B7248" strokeWidth="1.3"/>
      <g style={{transformOrigin:'68px 10px', animation:'ar_flameOuter 2.05s ease-in-out infinite'}}>
        <ellipse cx="68" cy="5.5" rx="7.5" ry="10" fill="#FF5500" opacity=".88"/>
      </g>
      <g style={{transformOrigin:'68px 10px', animation:'ar_flameMid 1.48s ease-in-out infinite .2s'}}>
        <ellipse cx="67.5" cy="3.5" rx="5" ry="8" fill="#FFAA00" opacity=".86"/>
      </g>
      <g style={{transformOrigin:'68px 10px', animation:'ar_flameTip 1.08s ease-in-out infinite .1s'}}>
        <ellipse cx="68" cy="2" rx="3" ry="6" fill="#FFEE44" opacity=".9"/>
        <ellipse cx="68" cy="1" rx="1.5" ry="3.2" fill="#FFFFFF" opacity=".72"/>
      </g>
      {/* Embers */}
      <circle cx="65.5" cy="2" r="1.4" fill="#FF9900" style={{animation:'ar_ember1 2.65s ease-out infinite'}}/>
      <circle cx="71" cy="0" r="1.1" fill="#FFCC00" style={{animation:'ar_ember2 3.05s ease-out infinite .88s'}}/>
      <circle cx="64" cy="1.5" r="1.2" fill="#FF7700" style={{animation:'ar_ember3 2.45s ease-out infinite 1.75s'}}/>
      {/* Smoke */}
      <circle cx="68" cy="0" r="5" fill="rgba(80,75,90,.22)" style={{animation:'ar_smoke 3.9s ease-out infinite .55s'}}/>

      {/* ═══════════ RIGHT TORCH ═══════════ */}
      <rect x="519" y="26" width="27" height="7" rx="2" fill="#3C3C50"/>
      <rect x="529" y="21" width="8" height="14" rx="1" fill="#303048"/>
      <rect x="530" y="10" width="6" height="16" rx="1" fill="#7B5228"/>
      <line x1="530" y1="12" x2="536" y2="12" stroke="#9B7248" strokeWidth="1.3"/>
      <line x1="530" y1="16" x2="536" y2="16" stroke="#9B7248" strokeWidth="1.3"/>
      <line x1="530" y1="20" x2="536" y2="20" stroke="#9B7248" strokeWidth="1.3"/>
      <g style={{transformOrigin:'533px 10px', animation:'ar_flameOuter 1.92s ease-in-out infinite .38s'}}>
        <ellipse cx="533" cy="5.5" rx="7.5" ry="10" fill="#FF5500" opacity=".88"/>
      </g>
      <g style={{transformOrigin:'533px 10px', animation:'ar_flameMid 1.38s ease-in-out infinite .55s'}}>
        <ellipse cx="532.5" cy="3.5" rx="5" ry="8" fill="#FFAA00" opacity=".86"/>
      </g>
      <g style={{transformOrigin:'533px 10px', animation:'ar_flameTip 1.0s ease-in-out infinite .25s'}}>
        <ellipse cx="533" cy="2" rx="3" ry="6" fill="#FFEE44" opacity=".9"/>
        <ellipse cx="533" cy="1" rx="1.5" ry="3.2" fill="#FFFFFF" opacity=".72"/>
      </g>
      {/* Embers */}
      <circle cx="530.5" cy="2" r="1.4" fill="#FF9900" style={{animation:'ar_ember1 2.72s ease-out infinite .45s'}}/>
      <circle cx="536" cy="0" r="1.1" fill="#FFCC00" style={{animation:'ar_ember2 3.1s ease-out infinite 1.3s'}}/>
      <circle cx="529" cy="1.5" r="1.2" fill="#FF7700" style={{animation:'ar_ember3 2.55s ease-out infinite 2.15s'}}/>
      {/* Smoke */}
      <circle cx="533" cy="0" r="5" fill="rgba(80,75,90,.22)" style={{animation:'ar_smoke 4.1s ease-out infinite 1.2s'}}/>

      {/* ═══════════ ARMOR STAND ═══════════ */}
      {/* Stand base */}
      <rect x="260" y="209" width="80" height="7" rx="3" fill="#3B2210"/>
      <rect x="268" y="201" width="64" height="10" rx="2" fill="#4A2E12"/>
      <rect x="296" y="168" width="8" height="35" fill="#5C3A1E"/>

      {/* Greaves */}
      <rect x="274" y="163" width="22" height="36" rx="3" fill="#8888A8"/>
      <rect x="304" y="163" width="22" height="36" rx="3" fill="#8888A8"/>
      <rect x="276" y="164" width="9" height="34" rx="2" fill="#9898B8" opacity=".65"/>
      <rect x="306" y="164" width="9" height="34" rx="2" fill="#9898B8" opacity=".65"/>
      {/* Greave highlight edge */}
      <line x1="274" y1="163" x2="274" y2="199" stroke="#C0C8D8" strokeWidth="1" opacity=".55"/>
      <line x1="326" y1="163" x2="326" y2="199" stroke="#C0C8D8" strokeWidth="1" opacity=".55"/>
      {/* Knee cops */}
      <ellipse cx="285" cy="163" rx="11" ry="6.5" fill="#9898B8"/>
      <ellipse cx="315" cy="163" rx="11" ry="6.5" fill="#9898B8"/>
      <ellipse cx="284" cy="162" rx="7" ry="4" fill="#B0B8C8" opacity=".5"/>
      <ellipse cx="314" cy="162" rx="7" ry="4" fill="#B0B8C8" opacity=".5"/>

      {/* Fauld / waist skirt */}
      <path d="M271,145 L329,145 L323,165 L277,165 Z" fill="#8080A0"/>
      <line x1="300" y1="145" x2="300" y2="165" stroke="#A0A8B8" strokeWidth="1" opacity=".48"/>
      <line x1="286" y1="145" x2="284" y2="165" stroke="#9090B0" strokeWidth="1" opacity=".38"/>
      <line x1="314" y1="145" x2="316" y2="165" stroke="#9090B0" strokeWidth="1" opacity=".38"/>

      {/* Breastplate */}
      <path d="M263,95 L337,95 L331,148 L269,148 Z" fill="#9090B0"/>
      {/* Center ridge */}
      <line x1="300" y1="95" x2="300" y2="148" stroke="#C0C8D8" strokeWidth="2.2"/>
      {/* Horizontal bands */}
      <line x1="269" y1="112" x2="331" y2="112" stroke="#A8B0C0" strokeWidth="1" opacity=".52"/>
      <line x1="271" y1="128" x2="329" y2="128" stroke="#A8B0C0" strokeWidth="1" opacity=".52"/>
      <line x1="270" y1="142" x2="330" y2="142" stroke="#A8B0C0" strokeWidth="1" opacity=".38"/>
      {/* Breastplate highlight */}
      <path d="M278,97 L298,97 L295,124 L279,121 Z" fill="#B0B8C8" opacity=".42"/>
      {/* Gleam sweep — periodic shine across the armor */}
      <rect x="282" y="58" width="16" height="150" rx="8"
        fill="rgba(255,255,255,.3)"
        style={{transformOrigin:'300px 132px', animation:'ar_gleam 7s ease-in-out infinite 3.5s'}}/>

      {/* Pauldrons */}
      <ellipse cx="256" cy="101" rx="24" ry="14" fill="#8080A0"/>
      <ellipse cx="344" cy="101" rx="24" ry="14" fill="#8080A0"/>
      <ellipse cx="256" cy="99" rx="17" ry="9" fill="#9292B2"/>
      <ellipse cx="344" cy="99" rx="17" ry="9" fill="#9292B2"/>
      <ellipse cx="253" cy="98" rx="9" ry="5" fill="#B0B8C8" opacity=".38"/>
      <ellipse cx="341" cy="98" rx="9" ry="5" fill="#B0B8C8" opacity=".38"/>

      {/* Upper arms */}
      <rect x="235" y="109" width="17" height="30" rx="4" fill="#8080A0"/>
      <rect x="348" y="109" width="17" height="30" rx="4" fill="#8080A0"/>
      <rect x="237" y="110" width="9" height="28" rx="3" fill="#9090B0" opacity=".65"/>
      <rect x="350" y="110" width="9" height="28" rx="3" fill="#9090B0" opacity=".65"/>

      {/* Gauntlets */}
      <rect x="231" y="137" width="23" height="18" rx="3" fill="#7070A0"/>
      <rect x="346" y="137" width="23" height="18" rx="3" fill="#7070A0"/>
      <rect x="233" y="138" width="11" height="16" rx="2" fill="#8080B0" opacity=".6"/>
      <rect x="348" y="138" width="11" height="16" rx="2" fill="#8080B0" opacity=".6"/>
      {/* Finger lines left */}
      {[235,240,245,250].map(x => (
        <line key={x} x1={x} y1="150" x2={x+2} y2="155" stroke="rgba(192,200,216,.45)" strokeWidth="1.2"/>
      ))}
      {/* Finger lines right */}
      {[350,355,360,365].map(x => (
        <line key={x} x1={x} y1="150" x2={x+2} y2="155" stroke="rgba(192,200,216,.45)" strokeWidth="1.2"/>
      ))}

      {/* Gorget */}
      <rect x="285" y="89" width="30" height="10" rx="2" fill="#8080A0"/>
      <line x1="300" y1="89" x2="300" y2="99" stroke="#B0B8C8" strokeWidth="1.8" opacity=".58"/>

      {/* Helmet */}
      <ellipse cx="300" cy="76" rx="27" ry="21" fill="#8888A8"/>
      <rect x="278" y="76" width="44" height="17" rx="2" fill="#8888A8"/>
      {/* Visor slit */}
      <rect x="284" y="80" width="32" height="5.5" rx="1" fill="#14121c"/>
      <line x1="300" y1="80" x2="300" y2="85.5" stroke="#1e1c28" strokeWidth="1.5"/>
      {/* Ventilation holes */}
      {[288,293,298,303,308].map(x => (
        <circle key={x} cx={x} cy="88" r="1.2" fill="rgba(0,0,0,.6)"/>
      ))}
      {/* Crest ridge */}
      <line x1="300" y1="57" x2="300" y2="77" stroke="#C0C8D8" strokeWidth="2.5"/>
      <ellipse cx="300" cy="57" rx="6.5" ry="4.5" fill="#9898B8"/>
      {/* Cheek pieces */}
      <rect x="277" y="80" width="8" height="14" rx="2" fill="#8080A0"/>
      <rect x="315" y="80" width="8" height="14" rx="2" fill="#8080A0"/>
      {/* Helmet highlight */}
      <ellipse cx="291" cy="67" rx="9" ry="7" fill="#B0B8C8" opacity=".36"/>
      <ellipse cx="289" cy="65" rx="4" ry="3" fill="#D0D8E8" opacity=".22"/>

      {/* ═══════════ IRON CHEST ═══════════ */}
      {/* Chest body */}
      <rect x="156" y="170" width="70" height="44" rx="3" fill="#282636"/>
      <rect x="156" y="170" width="70" height="44" rx="3" fill="none" stroke="#48485E" strokeWidth="2"/>
      {/* Chest lid */}
      <rect x="154" y="166" width="74" height="13" rx="2" fill="#323048"/>
      <rect x="154" y="166" width="74" height="4" rx="1" fill="#3e3c58"/>
      {/* Iron bands */}
      <rect x="154" y="184" width="74" height="5" fill="#20202E"/>
      <rect x="154" y="199" width="74" height="5" fill="#20202E"/>
      {/* Corner brackets */}
      {[[156,166],[224,166],[156,210],[224,210]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#48485E"/>
      ))}
      {/* Lock hasp */}
      <rect x="184" y="175" width="18" height="13" rx="2" fill="#3A3A4C"/>
      <rect x="184" y="175" width="18" height="13" rx="2" fill="none" stroke="#5A5A72" strokeWidth="1"/>
      <path d="M187.5,175 A5.5,5.5 0 0,1 198.5,175" fill="none" stroke="#6868A0" strokeWidth="2.5"/>
      <circle cx="193" cy="181.5" r="2.8" fill="#6868A0"/>
      <rect x="191" y="181" width="4" height="5" rx="1" fill="#3A3A4C"/>

      {/* ═══════════ STONE FLOOR ═══════════ */}
      <rect x="0" y="162" width="600" height="58" fill="url(#ar_floor)"/>
      <line x1="0" y1="162" x2="600" y2="162" stroke="rgba(0,0,0,.45)" strokeWidth="3"/>
      <line x1="0" y1="183" x2="600" y2="183" stroke="rgba(0,0,0,.28)" strokeWidth="1.8"/>
      <line x1="0" y1="202" x2="600" y2="202" stroke="rgba(0,0,0,.2)" strokeWidth="1.5"/>
      {[80,180,300,420,520].map(x => (
        <line key={x} x1={x} y1="162" x2={x} y2="220" stroke="rgba(0,0,0,.2)" strokeWidth="1.5"/>
      ))}

      {/* ── VIGNETTE ── */}
      <rect x="0" y="0" width="600" height="220" fill="url(#ar_vig)" pointerEvents="none"/>
      {/* Bottom fade into modal */}
      <rect x="0" y="168" width="600" height="52" fill="url(#ar_fade)" pointerEvents="none"/>
    </svg>

    {/* Title overlay */}
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontWeight: 900,
        fontSize: '20px',
        letterSpacing: '0.18em',
        color: '#C0C8D8',
        textShadow: '0 0 16px rgba(140,160,200,.55), 0 2px 4px rgba(0,0,0,.95)',
      }}>
        THE ARMORY
      </div>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: 'rgba(180,192,216,.52)',
        fontStyle: 'italic',
        marginTop: '3px',
        letterSpacing: '0.07em',
      }}>
        "What keeps you alive in the darkness..."
      </div>
    </div>
  </div>
);

export default ArmoryScene;
