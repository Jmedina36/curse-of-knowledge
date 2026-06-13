import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { COLORS, VISUAL_STYLES } from '../constants';
import { CREATURE_INDEX } from '../creatures';
import { sounds } from '../sounds';

const KAEL_QUOTES = {
  early: [
    "Every beast in here was defeated by your hand. Remember that.",
    "Study them well. A hunter who knows her prey never loses.",
    "They're contained... for now. Don't get sentimental.",
    "Each one tells a story. Most of them end with you winning.",
    "I've tracked creatures across a hundred realms. These are worthy trophies.",
    "The weak hunter fears the monster. The strong one collects it.",
    "Capture enough and the wilds themselves will fear your name.",
  ],
  mid: [
    "These aren't animals. They're weapons. Someone left them here.",
    "You're past the point where most expeditions turned back. Keep going.",
    "The deeper you go, the less the creatures fight like animals. Notice that.",
    "Half of tracking is knowing what not to fight. You're still learning that half.",
    "Every creature past zone two is someone's insurance policy. Ask yourself who's paying.",
    "Don't let the pattern comfort you. The pattern is what they want you to see.",
    "Something in zone three isn't hunting for food. It's hunting for a reason.",
  ],
  late: [
    "This is where the records stop. Every tracker I knew who came this far didn't come back.",
    "These aren't creatures. They're guardians. There's a difference.",
    "You're in the part of the map that used to say 'here there be nothing.' That was a lie.",
    "The order didn't leave these things here by accident. Everything in zone five has a purpose.",
    "Most things this deep don't have names in any record I've found. You're the record now.",
    "Whatever's at the end of this — it knows you're coming. It's been waiting.",
    "I've seen what these do to unprepared hunters. You're not unprepared. Be careful anyway.",
  ],
};
const _getKaelPool = (zone) => zone >= 5 ? KAEL_QUOTES.late : zone >= 3 ? KAEL_QUOTES.mid : KAEL_QUOTES.early;

// ── Elite + Order roster data ────────────────────────────────────────────────
const ELITE_ROSTER = [
  { img: '/bosses/orc-warrior.png',         name: 'Korruk the Merciless',           title: 'The Deployed Guard — Zone I', lore: 'Has never offered quarter and never asked for it. His battlefield record spans forty years of war. The order found someone already doing their work for them.' },
  { img: '/bosses/orc-lady.png',            name: 'Gryvara, Ironblood Matriarch',   title: 'The Deployed Guard — Zone II', lore: 'Commander of a dozen warbands. She leads from the front and leaves nothing standing. Deployed specifically in response to your progress.' },
  { img: '/bosses/orc-chief.png',           name: 'Grakthar the Unbroken',          title: 'The Ancient Guardian — Zone III', lore: 'No blade has ever drawn his blood. He has crushed every challenger beneath his fists. Not order-made. Older. Found at the nexus, already waiting.' },
  { img: '/bosses/frozen-zombie.png',       name: 'Morvane, the Frozen Condemned',  title: 'The Inherited Guard — Zone V', lore: 'A warrior executed in winter and cursed to walk forever. His rage has not thawed in three centuries. Not recruited by the order — inherited from what Malachar was before it existed.' },
  { img: '/bosses/undead-vampire-woman.png',name: 'Seraphine the Bloodless',        title: 'The Inherited Guard — Zone V', lore: 'Once a high priestess, now an undying predator. She drains life with a whisper. Like Morvane, she predates the order. She was here when Malachar arrived.' },
];

const ORDER_ROSTER = [
  { img: '/bosses/dark-elf-queen.png', name: 'Sylvaris, Queen of Ruin',   title: 'The Custodian', lore: "She dismantled an empire from within. Didn't join the order — recognized Malachar as someone doing what she'd been doing, just longer. Every time Malachar died, Sylvaris held the structure together until he returned." },
  { img: '/undead-king.png',           name: 'Malachar, the Eternal Lich', title: 'The Architect', lore: 'Built the order over decades under a title, not a name. Has died seventeen times. His phylactery has never been found. C is not a person. C is what he became. The order was always his.' },
  { img: '/main bad.png',              name: 'The Omen',                   title: 'The Creditor',  lore: "It was not created by the order. It predates it. The deal Malachar made in his first life — the one that let him return seventeen times — this is who he made it with. The order was the payment. Five zones of preparation, building the path for something sealed and waiting long before any record existed." },
];

// ── Cursed member → mercy contract mapping ──────────────────────────────────
const CURSED_MERCY_MAP = {
  '/cursed/young-paladin.png':       { id: 'mc_aldric_sela',  req: [] },
  '/cursed/young-princess.png':      { id: 'mc_aldric_sela',  req: [] },
  '/cursed/elven-girl.png':          { id: 'mc_lysse_kira',   req: ['lc_whisper_forest'] },
  '/cursed/mongolian-princess.png':  { id: 'mc_lysse_kira',   req: ['lc_whisper_forest'] },
  '/cursed/mercenary.png':           { id: 'mc_conn_dar',     req: ['lc_ivy_crossing'] },
  '/cursed/robber.png':              { id: 'mc_conn_dar',     req: ['lc_ivy_crossing'] },
  '/cursed/warrior-lady.png':        { id: 'mc_bryn_solveig', req: ['mc_maren_sunwen'] },
  '/cursed/viking-woman.png':        { id: 'mc_bryn_solveig', req: ['mc_maren_sunwen'] },
  '/cursed/young-lady.png':          { id: 'mc_maren_sunwen', req: ['lc_stonehenge'] },
  '/cursed/young-korean-prince.png': { id: 'mc_maren_sunwen', req: ['lc_stonehenge'] },
  '/cursed/viking-warrior.png':      { id: 'mc_sigrun',       req: ['order_cutter'] },
  '/cursed/viking-noble-man.png':    { id: 'mc_halvard',      req: ['lc_stone_cavern'] },
  '/cursed/warrior-queen.png':       { id: 'mc_sera_edric',   req: ['lc_the_melt'] },
  '/cursed/old-noble-man.png':       { id: 'mc_sera_edric',   req: ['lc_the_melt'] },
  '/cursed/gladiator.png':           { id: 'mc_brek',         req: [] },
};

const TIER_LABELS = { 1: 'Grunt', 2: 'Predator', 3: 'Dire', 4: 'Elite', 5: 'Legendary' };
const TIER_COLORS = { 1: '#A8A8A8', 2: '#CD7F32', 3: '#DC2626', 4: '#A855F7', 5: '#F59E0B' };
const TIER_BORDER = { 1: 'rgba(168,168,168,0.35)', 2: 'rgba(205,127,50,0.45)', 3: 'rgba(220,38,38,0.45)', 4: 'rgba(168,85,247,0.45)', 5: 'rgba(245,158,11,0.55)' };
const TIER_GLOW   = { 1: 'rgba(168,168,168,0.08)', 2: 'rgba(205,127,50,0.1)', 3: 'rgba(220,38,38,0.1)', 4: 'rgba(168,85,247,0.12)', 5: 'rgba(245,158,11,0.15)' };

const FACTION_ROSTER = {
  bandits: {
    name: 'The Broken Blade',
    tagline: 'A mercenary company turned criminal syndicate. Military discipline, controlled territory, and orders from above.',
    color: '#C0392B',
    glow: 'rgba(192,57,43,0.15)',
    border: 'rgba(192,57,43,0.4)',
    members: [
      { img: '/bandits/bandit-1.png',   name: 'Rook',   title: 'The Lookout',   lore: 'Deserted from a border garrison three years ago. Never explains why. Fights like a man who knows exactly where the exits are.' },
      { img: '/bandits/bandit-2.png',   name: 'Slag',   title: 'The Breaker',   lore: 'Former blacksmith. Traded the forge for the blade when the city burned his shop for unpaid taxes. Holds a grudge like a vice.' },
      { img: '/bandits/bandit-3.png',   name: 'Finn',   title: 'The Quick',     lore: 'Youngest in the crew. Too fast to be untrained, too reckless to be disciplined. Joined the Blade to prove something to someone who probably doesn\'t care.' },
      { img: '/bandits/bandit-4.png',   name: 'Gorse',  title: 'The Collector', lore: 'Takes something from everyone he beats. Not for value — for memory. His coat is covered in other people\'s buttons and clasps.' },
      { img: '/bandits/bandit-5.png',   name: 'Mace',   title: 'The Wall',      lore: 'Barely speaks. Rarely moves until he has to. When he does, things break.' },
      { img: '/bandits/bandit-6.png',   name: 'Dray',   title: 'The Fixer',     lore: 'Handles logistics — supply lines, safe houses, bribes. Deadlier with information than with a blade, but handles both fine.' },
      { img: '/bandits/bandit-7.png',   name: 'Vetch',  title: 'The Grudge',    lore: 'Was wronged by someone with a title once. Now everyone with clean hands is the enemy. Cutter found him useful.' },
    ],
    captains: [
      { img: '/bandits/captain-1.png',  name: 'Harrow', title: 'Blade Captain', lore: 'Cutter\'s longest-serving officer. Runs the western territory with cold efficiency. Doesn\'t question orders — not because he\'s loyal, but because he stopped caring about reasons.' },
      { img: '/bandits/captain-2.png',  name: 'Sable',  title: 'Blade Captain', lore: 'The only one in the Blade who reads. Keeps a ledger of every contract, every name, every debt. If Cutter falls, Sable already knows who gets what.' },
      { img: '/bandits/captain-3.png',  name: 'Vorn',   title: 'Blade Captain', lore: 'Recruited personally by Cutter after Vorn burned down a lord\'s estate over a stolen horse. Cutter called it "proportionate." They\'ve understood each other ever since.' },
    ],
    leader: { img: '/bandits/leader.png', name: 'Cutter', title: 'Lord of the Broken Blade', lore: 'Nobody knows his real name. Cutter is what he does and what he\'s become. He built the Broken Blade from eight men and a grudge into a force that controls three trade routes and answers to exactly one authority — an order whose name he doesn\'t say out loud. He\'s not a bandit. He\'s a contractor. And someone very dangerous is his client.' },
  },
  daughters: {
    name: 'Daughters of Dusk',
    tagline: 'A sisterhood of shadow-workers — part assassins, part ritualists, part cult. They move at night, leave no witnesses, and believe the world deserves what\'s coming.',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.4)',
    members: [
      { img: '/daughters-of-dusk/member-1.png',  name: 'Vael',  title: 'The Whisper', lore: 'Rarely seen before she strikes. Specializes in extraction — people, objects, secrets. Has never failed a contract.' },
      { img: '/daughters-of-dusk/member-2.png',  name: 'Zira',  title: 'The Hollow',  lore: 'Lost something in a ritual gone wrong. Won\'t say what. Fights with the calm of someone who has already accepted the worst outcome.' },
      { img: '/daughters-of-dusk/member-3.png',  name: 'Ash',   title: 'The Marked',  lore: 'Bears ritual scars across both arms — voluntary, each one earned. The older sisters stopped asking what they\'re for.' },
      { img: '/daughters-of-dusk/member-4.png',  name: 'Briar', title: 'The Patient', lore: 'Surveillance specialist. Has spent up to three weeks watching a single target before acting. Believes every fight is already over before it starts.' },
      { img: '/daughters-of-dusk/member-5.png',  name: 'Knell', title: 'The Last Sound', lore: 'Named by Mira herself. No one remembers her life before the Daughters. That might be the point.' },
    ],
    captains: [
      { img: '/daughters-of-dusk/captain-1.png', name: 'Lyra',  title: 'Dusk Captain', lore: 'Commands field operations. Precise, controlled, and deeply loyal to Mira — not out of fear, but conviction. She believes in what the order is building.' },
      { img: '/daughters-of-dusk/captain-2.png', name: 'Seris', title: 'Dusk Captain', lore: 'The enforcer. Where Lyra plans, Seris executes. She has ended more Daughters for betrayal than enemies in the field. Mira trusts her above all others.' },
      { img: '/daughters-of-dusk/captain-3.png', name: 'Vayne', title: 'Dusk Captain', lore: 'The newest captain. Elevated after the previous holder disappeared under unclear circumstances. Vayne doesn\'t ask questions. That\'s probably why she was chosen.' },
    ],
    leader: { img: '/daughters-of-dusk/leader.png', name: 'Mira', title: 'Queen of Dusk', lore: 'Mira doesn\'t lead through fear or force — she leads through belief. Every Daughter chose her. That\'s what makes her dangerous. She serves an order that promises the world will be remade, and she has decided that\'s worth any cost. She is gracious, patient, and completely without mercy.' },
  },
};

const THE_CURSED = [
  {
    zone: 1,
    zoneLabel: 'Zone I — The First Fallen',
    groups: [
      {
        groupName: 'The Oath and the Runaway',
        solo: false,
        members: [
          {
            img: '/cursed/young-paladin.png',
            name: 'Aldric',
            title: 'Knight-Aspirant of the Crown',
            lore: 'He received his oath the week before the expedition left. He asked to prove himself in the field. They said yes.',
          },
          {
            img: '/cursed/young-princess.png',
            name: 'Sela',
            title: 'Third Daughter of House Veyne',
            lore: "She wasn't in the manifest. She had followed the column for two days before anyone noticed. By then the road back was already wrong.",
          },
        ],
      },
    ],
  },
  {
    zone: 2,
    zoneLabel: 'Zone II — The Advance',
    groups: [
      {
        groupName: 'The Scouts',
        solo: false,
        members: [
          {
            img: '/cursed/elven-girl.png',
            name: 'Lysse of the Old Wood',
            title: 'Pathfinder of the Verdant Court',
            lore: 'She knew these lands before the curse took hold. She said she could find the source. She was right. That was the problem.',
          },
          {
            img: '/cursed/mongolian-princess.png',
            name: 'Kira Sondal',
            title: 'Horsemistress of the Eastern March',
            lore: 'She was tasked with keeping Lysse alive. Her last report ends mid-sentence.',
          },
        ],
      },
      {
        groupName: 'The Hired Blades',
        solo: false,
        members: [
          {
            img: '/cursed/mercenary.png',
            name: 'Conn the Scarred',
            title: 'Company Sergeant, Ironbell Company',
            lore: "His company took the contract because the pay was good. They were the only professionals in the column. Also the first ones lost.",
          },
          {
            img: '/cursed/robber.png',
            name: 'Dar the Fortunate',
            title: 'No allegiance',
            lore: "He wasn't hired. He followed the wagons. Stayed when everyone else ran. Doesn't seem to know why.",
          },
        ],
      },
    ],
  },
  {
    zone: 3,
    zoneLabel: 'Zone III — The Deep Push',
    groups: [
      {
        groupName: 'The Shield Wall',
        solo: false,
        members: [
          {
            img: '/cursed/warrior-lady.png',
            name: 'Bryn Ashvale',
            title: 'Shield-Captain of the Northern Reach',
            lore: 'She had seen three wars. Said this was worse than all of them combined. Said it calmly.',
          },
          {
            img: '/cursed/viking-woman.png',
            name: 'Solveig the Unbent',
            title: 'Skjaldmær of Clan Halvard',
            lore: 'She never stopped moving forward. Her clan considers that a point of pride. It isn\'t.',
          },
        ],
      },
      {
        groupName: 'The Unlikely Champions',
        solo: false,
        members: [
          {
            img: '/cursed/young-lady.png',
            name: 'Maren',
            title: 'Survivor of the Second Expedition',
            lore: 'She survived. Came back. Gave her report. Refused to speak afterward. Six months later she walked back in. Sun Wen found her on the road.',
          },
          {
            img: '/cursed/young-korean-prince.png',
            name: 'Sun Wen',
            title: 'Third Prince of the Eastern Sovereignty',
            lore: 'He left his court without a word. His attendants followed at a distance. They turned back. He did not.',
          },
        ],
      },
    ],
  },
  {
    zone: 4,
    zoneLabel: 'Zone IV — The Northern Lords',
    groups: [
      {
        groupName: 'The Northern Lords',
        solo: false,
        members: [
          {
            img: '/cursed/viking-warrior.png',
            name: 'Jarl Sigrun',
            title: 'Jarl of Frost Hold',
            lore: 'He came with two hundred men. Sent them home when the road became what it became. Continued alone. Said it wasn\'t their fight.',
          },
          {
            img: '/cursed/viking-noble-man.png',
            name: 'Lord Halvard the Gray',
            title: 'High Steward of the Northern Conclave',
            lore: 'He managed the politics of three expeditions. On the fourth he stopped managing and started walking. Nobody could talk him out of it.',
          },
        ],
      },
    ],
  },
  {
    zone: 5,
    zoneLabel: 'Zone V — The Last Mandate',
    groups: [
      {
        groupName: 'The Last Mandate',
        solo: false,
        members: [
          {
            img: '/cursed/warrior-queen.png',
            name: 'Queen Sera Vaine',
            title: 'Sovereign of the Western Reaches',
            lore: 'She dissolved her council, abdicated in writing, and walked in alone. Her honor guard made it to zone 4. She made it further.',
          },
          {
            img: '/cursed/old-noble-man.png',
            name: 'Edric the Elder',
            title: 'Grand Lorekeeper, Royal Academy',
            lore: 'He spent forty years mapping the curse. Walked into it at seventy-three. His final letter read: "Someone who understands it should face it."',
          },
        ],
      },
      {
        groupName: 'The Last Man',
        solo: true,
        members: [
          {
            img: '/cursed/gladiator.png',
            name: 'Brek the Undefeated',
            title: 'Champion of the Western Pits',
            lore: "Sixty-one fights. Undefeated. He volunteered because he said the arena had grown boring. That was three expeditions ago. He's still here. Still standing. The curse hasn't finished him — and he hasn't finished it.",
          },
        ],
      },
    ],
  },
];

const BestiaryTab = ({ defeatedFactionMembers = [], restedCursed = [], intelUnlocked = [], completedLocationContracts = [], pendingLocationRewards = [], highestZoneReached = 1, discoveredCreatures = [], onClose }) => {
  const [kaelQuote, setKaelQuote] = useState(() => { const p = _getKaelPool(highestZoneReached); return p[Math.floor(Math.random() * p.length)]; });
  const [activeTab, setActiveTab] = useState('index');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const pool = _getKaelPool(highestZoneReached);
    setKaelQuote(pool[Math.floor(Math.random() * pool.length)]);
    const t = setInterval(() => {
      setKaelQuote(pool[Math.floor(Math.random() * pool.length)]);
    }, 8000);
    return () => clearInterval(t);
  }, [highestZoneReached]);

  const showNPC = windowWidth >= 1150;

  return (
    <div style={{ position: 'relative' }}>
      {showNPC && (
        <div style={{
          position: 'fixed',
          left: 'calc(25% - min(15vw, 225px) - clamp(70px, 7.5vw, 120px))',
          top: 'calc(40% + 48px)',
          transform: 'translateY(-50%)',
          width: 'clamp(140px, 15vw, 240px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <img
            src="/npcs/female-warrior.png"
            alt="Kael"
            style={{
              width: 'clamp(120px, 13vw, 210px)',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'top',
              filter: 'drop-shadow(0 0 40px rgba(34,197,94,0.5)) drop-shadow(0 0 100px rgba(34,197,94,0.15))',
            }}
          />
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: COLORS.gold, letterSpacing: '0.1em', margin: 0 }}>KAEL</p>
          <p style={{ fontSize: '11px', color: COLORS.silver, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>Beast Warden</p>
          <div style={{
            position: 'relative',
            background: 'rgba(10,8,4,0.85)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginTop: '4px',
            width: '100%',
          }}>
            <div style={{
              position: 'absolute',
              right: '-9px',
              top: '16px',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '9px solid rgba(212,175,55,0.3)',
            }} />
            <div style={{
              position: 'absolute',
              right: '-7px',
              top: '17px',
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: '8px solid rgba(10,8,4,0.85)',
            }} />
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#F5F5DC', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
              "{kaelQuote}"
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          width: showNPC ? 'min(60vw, 900px)' : 'min(90vw, calc(100vw - 32px))',
          margin: '0 auto',
          height: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '12px',
          backgroundImage: 'url(/Stonewall1.png)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        {/* Tab bar */}
        <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid rgba(212,175,55,0.2)', background: 'rgba(10,9,6,0.65)', position: 'relative' }}>
          {onClose && (
            <button
              onClick={() => { sounds.click(); onClose(); }}
              style={{
                position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: '8px', padding: '8px', color: COLORS.gold,
                cursor: 'pointer', display: 'flex', alignItems: 'center', zIndex: 1,
              }}
            ><X size={18}/></button>
          )}
          {[{ key: 'index', label: 'Creature Index' }, { key: 'factions', label: 'Factions' }, { key: 'cursed', label: 'The Cursed' }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '12px', fontFamily: 'Cinzel, serif', fontWeight: 700,
                fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: activeTab === t.key ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: activeTab === t.key ? '#D4AF37' : 'rgba(212,175,55,0.4)',
                borderBottom: `2px solid ${activeTab === t.key ? '#D4AF37' : 'transparent'}`,
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px', background: 'rgba(15,13,8,0.65)' }}>
          {/* ── CREATURE INDEX TAB ── */}
          {activeTab === 'index' && (() => {
            const ZONE_GROUPS = [
              { label: 'Zone I — II',  tiers: [1], minZone: 1, color: TIER_COLORS[1], border: TIER_BORDER[1], glow: TIER_GLOW[1], tierName: 'Grunt' },
              { label: 'Zone III — IV', tiers: [2], minZone: 3, color: TIER_COLORS[2], border: TIER_BORDER[2], glow: TIER_GLOW[2], tierName: 'Predator' },
              { label: 'Zone V',        tiers: [3], minZone: 5, color: TIER_COLORS[3], border: TIER_BORDER[3], glow: TIER_GLOW[3], tierName: 'Dire' },
            ];
            return (
              <div>
                {ZONE_GROUPS.map(group => {
                  const unlocked = highestZoneReached >= group.minZone;
                  const entries = CREATURE_INDEX.filter(c => group.tiers.includes(c.tier));
                  return (
                    <div key={group.label} style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${unlocked ? group.border : 'rgba(60,55,45,0.2)'})` }}/>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: unlocked ? group.color : 'rgba(90,80,65,0.4)' }}>
                          ◆ {group.label}
                        </span>
                        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${unlocked ? group.border : 'rgba(60,55,45,0.2)'})` }}/>
                      </div>
                      <p style={{ textAlign: 'center', fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', textTransform: 'uppercase', color: unlocked ? `${group.color}88` : 'rgba(80,70,55,0.35)', margin: '0 0 4px' }}>
                        {group.tierName}
                      </p>
                      {unlocked && (() => {
                        const discoveredCount = entries.filter(c => discoveredCreatures.includes(c.img)).length;
                        const full = discoveredCount === entries.length;
                        return (
                          <p style={{ textAlign: 'center', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: full ? `${group.color}bb` : `${group.color}44`, margin: '0 0 14px' }}>
                            {discoveredCount}/{entries.length} Discovered
                          </p>
                        );
                      })()}

                      {!unlocked ? (
                        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(90,80,65,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: '8px 0 0' }}>
                          Not yet encountered. Advance further to learn what awaits.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                          {entries.map((creature, idx) => {
                            const known = discoveredCreatures.includes(creature.img);
                            return known ? (
                              <div key={creature.id} style={{
                                borderRadius: '12px', padding: '22px 14px 18px', textAlign: 'center',
                                background: VISUAL_STYLES.card.default,
                                border: `1px solid ${TIER_BORDER[creature.tier]}`,
                                boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 24px ${TIER_GLOW[creature.tier]}`,
                                position: 'relative',
                              }}>
                                <div style={{ position: 'absolute', top: '8px', left: '10px', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 700, color: TIER_COLORS[creature.tier], opacity: 0.7 }}>
                                  #{idx + 1}
                                </div>
                                <img
                                  src={creature.img} alt={creature.name}
                                  style={{ width: 110, height: 110, objectFit: 'contain', margin: '0 auto 14px', display: 'block', filter: `drop-shadow(0 0 10px ${TIER_COLORS[creature.tier]}55)` }}
                                />
                                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.88rem', color: TIER_COLORS[creature.tier], lineHeight: 1.35, marginBottom: '10px' }}>{creature.name}</p>
                                {creature.desc && (
                                  <p style={{ fontSize: '0.82rem', color: 'rgba(245,245,220,0.65)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{creature.desc}</p>
                                )}
                              </div>
                            ) : (
                              <div key={creature.id} style={{
                                borderRadius: '12px', padding: '22px 14px 18px', textAlign: 'center',
                                background: 'rgba(8,8,10,0.7)',
                                border: '1px solid rgba(60,55,45,0.25)',
                                position: 'relative',
                              }}>
                                <div style={{ position: 'absolute', top: '8px', left: '10px', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(80,70,55,0.7)', opacity: 0.7 }}>
                                  #{idx + 1}
                                </div>
                                <img
                                  src={creature.img} alt="unknown"
                                  style={{ width: 110, height: 110, objectFit: 'contain', margin: '0 auto 14px', display: 'block', filter: 'brightness(0) contrast(0.55)' }}
                                />
                                <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.88rem', color: 'rgba(80,70,55,0.78)', lineHeight: 1.35, marginBottom: '10px' }}>???</p>
                                <p style={{ fontSize: '0.82rem', color: 'rgba(80,70,55,0.7)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>Not yet encountered.</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── FACTIONS TAB ── */}
          {activeTab === 'factions' && (
            <div>
              {Object.values(FACTION_ROSTER).map(faction => {
                const allEntries = [...faction.members, ...faction.captains, faction.leader];
                const defeatedCount = allEntries.filter(e => defeatedFactionMembers.includes(e.img)).length;
                const anyKnown = allEntries.some(e => intelUnlocked.includes(e.img) || defeatedFactionMembers.includes(e.img));

                // Faction entirely unknown — show locked placeholder
                if (!anyKnown) {
                  return (
                    <div key={faction.name} style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(100,90,70,0.25))' }} />
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(120,110,90,0.7)' }}>
                          ??? Unknown Faction
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(100,90,70,0.25))' }} />
                      </div>
                      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(120,110,90,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                        No information recovered. Continue investigating.
                      </p>
                    </div>
                  );
                }

                const FactionCard = ({ entry, isLeader, isCapt }) => {
                  const defeated = defeatedFactionMembers.includes(entry.img);
                  const revealed = intelUnlocked.includes(entry.img) || defeated;
                  const rankLabel = isLeader ? 'Leader' : isCapt ? 'Captain' : 'Member';

                  // Unknown — silhouette
                  if (!revealed) {
                    return (
                      <div style={{
                        borderRadius: '10px', padding: '16px 14px', textAlign: 'center',
                        background: 'rgba(8,8,10,0.7)',
                        border: '1px solid rgba(60,55,45,0.3)',
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', top: '8px', left: '8px',
                          fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                          padding: '2px 6px', borderRadius: '3px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(80,70,50,0.3)',
                          color: 'rgba(100,90,70,0.78)',
                        }}>{rankLabel}</div>
                        <div style={{ position: 'relative', width: 90, margin: '14px auto 12px' }}>
                          <img
                            src={entry.img} alt="unknown"
                            style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'brightness(0) contrast(0.6)' }}
                          />
                        </div>
                        <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(80,75,60,0.78)', marginBottom: '6px' }}>???</p>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(80,75,60,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>No information recovered.</p>
                      </div>
                    );
                  }

                  // At Large — portrait visible, amber badge
                  if (!defeated) {
                    return (
                      <div style={{
                        borderRadius: '10px', padding: '16px 14px', textAlign: 'center',
                        background: VISUAL_STYLES.card.default,
                        border: `1px solid ${faction.border}`,
                        boxShadow: `0 0 16px ${faction.glow}`,
                        position: 'relative',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{
                          position: 'absolute', top: '8px', right: '8px',
                          fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                          padding: '2px 7px', borderRadius: '3px',
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(212,160,30,0.5)',
                          color: 'rgba(230,180,40,0.9)',
                        }}>At Large</div>
                        <div style={{
                          position: 'absolute', top: '8px', left: '8px',
                          fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                          padding: '2px 6px', borderRadius: '3px',
                          background: 'rgba(0,0,0,0.5)',
                          border: `1px solid ${faction.border}`,
                          color: faction.color,
                        }}>{rankLabel}</div>
                        <div style={{ position: 'relative', width: 90, margin: '14px auto 12px' }}>
                          <img
                            src={entry.img} alt={entry.name}
                            style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: `drop-shadow(0 0 10px ${faction.color}66)` }}
                          />
                        </div>
                        <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', color: faction.color, marginBottom: '2px', lineHeight: 1.3 }}>{entry.name}</p>
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(200,185,150,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{entry.title}</p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(220,210,185,0.78)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{entry.lore}</p>
                      </div>
                    );
                  }

                  // Defeated — greyed + SLAIN
                  return (
                    <div style={{
                      borderRadius: '10px', padding: '16px 14px', textAlign: 'center',
                      background: VISUAL_STYLES.card.default,
                      border: '1px solid rgba(80,80,80,0.3)',
                      opacity: 0.6,
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                        padding: '2px 7px', borderRadius: '3px',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(80,200,80,0.4)',
                        color: 'rgba(100,220,100,0.9)',
                      }}>Defeated</div>
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
                        padding: '2px 6px', borderRadius: '3px',
                        background: 'rgba(0,0,0,0.5)',
                        border: `1px solid ${faction.border}`,
                        color: faction.color,
                      }}>{rankLabel}</div>
                      <div style={{ position: 'relative', width: 90, margin: '14px auto 12px' }}>
                        <img
                          src={entry.img} alt={entry.name}
                          style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'grayscale(1) brightness(0.45)' }}
                        />
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%) rotate(-18deg)',
                          fontFamily: 'Cinzel, serif', fontWeight: 900,
                          fontSize: '1.35rem', letterSpacing: '0.2em',
                          color: 'rgba(200,30,30,0.92)',
                          border: '3px solid rgba(200,30,30,0.85)',
                          padding: '2px 8px', borderRadius: '3px',
                          textShadow: '0 0 8px rgba(200,30,30,0.6)',
                          boxShadow: '0 0 10px rgba(200,30,30,0.3), inset 0 0 6px rgba(0,0,0,0.4)',
                          background: 'rgba(0,0,0,0.35)',
                          whiteSpace: 'nowrap', pointerEvents: 'none',
                        }}>SLAIN</div>
                      </div>
                      <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(140,130,110,0.78)', marginBottom: '2px', lineHeight: 1.3 }}>{entry.name}</p>
                      <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(120,110,90,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{entry.title}</p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(120,110,90,0.7)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{entry.lore}</p>
                    </div>
                  );
                };

                return (
                  <div key={faction.name} style={{ marginBottom: '40px' }}>
                    {/* Faction header */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${faction.border})` }} />
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: faction.color }}>
                          {faction.name}
                        </span>
                        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${faction.border})` }} />
                      </div>
                      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(200,185,150,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 4px' }}>
                        {faction.tagline}
                      </p>
                      <p style={{ textAlign: 'center', fontSize: '0.72rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: `${faction.color}88`, margin: 0 }}>
                        {defeatedCount}/{allEntries.length} Defeated
                      </p>
                    </div>

                    {/* Members */}
                    {faction.members.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', color: 'rgba(200,185,150,0.7)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '10px' }}>◆ Members</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                          {faction.members.map(e => <FactionCard key={e.img} entry={e} isLeader={false} isCapt={false} />)}
                        </div>
                      </div>
                    )}

                    {/* Captains */}
                    {faction.captains.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', color: 'rgba(200,185,150,0.7)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '10px' }}>◆ Captains</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                          {faction.captains.map(e => <FactionCard key={e.img} entry={e} isLeader={false} isCapt={true} />)}
                        </div>
                      </div>
                    )}

                    {/* Leader */}
                    <div>
                      <p style={{ fontSize: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', color: 'rgba(200,185,150,0.7)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '10px' }}>◆ Leader</p>
                      <div style={{ maxWidth: '340px', margin: '0 auto' }}>
                        <FactionCard entry={faction.leader} isLeader={true} isCapt={false} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── ELITE ENEMIES ── */}
              {(() => {
                const anyKnown = ELITE_ROSTER.some(e => intelUnlocked.includes(e.img) || defeatedFactionMembers.includes(e.img));
                if (!anyKnown) return null;
                return (
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.35))' }} />
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#A855F7' }}>Elite Enemies</span>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(168,85,247,0.35))' }} />
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(200,185,150,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 16px' }}>
                      Exceptional warriors deployed or awakened against you. Each one is a statement.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                      {ELITE_ROSTER.map(e => {
                        const defeated = defeatedFactionMembers.includes(e.img);
                        const revealed = intelUnlocked.includes(e.img) || defeated;
                        if (!revealed) return null;
                        if (defeated) return (
                          <div key={e.img} style={{ borderRadius: '10px', padding: '16px 14px', textAlign: 'center', background: VISUAL_STYLES.card.default, border: '1px solid rgba(80,80,80,0.3)', opacity: 0.6, position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(80,200,80,0.4)', color: 'rgba(100,220,100,0.9)' }}>Defeated</div>
                            <div style={{ position: 'relative', width: 90, margin: '14px auto 12px' }}>
                              <img src={e.img} alt={e.name} style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'grayscale(1) brightness(0.45)' }} />
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-18deg)', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '1.35rem', letterSpacing: '0.2em', color: 'rgba(200,30,30,0.92)', border: '3px solid rgba(200,30,30,0.85)', padding: '2px 8px', borderRadius: '3px', textShadow: '0 0 8px rgba(200,30,30,0.6)', boxShadow: '0 0 10px rgba(200,30,30,0.3), inset 0 0 6px rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>SLAIN</div>
                            </div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', color: 'rgba(140,130,110,0.78)', marginBottom: '2px', lineHeight: 1.3 }}>{e.name}</p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(120,110,90,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{e.title}</p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(120,110,90,0.7)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{e.lore}</p>
                          </div>
                        );
                        return (
                          <div key={e.img} style={{ borderRadius: '10px', padding: '16px 14px', textAlign: 'center', background: VISUAL_STYLES.card.default, border: '1px solid rgba(168,85,247,0.4)', boxShadow: '0 0 16px rgba(168,85,247,0.1)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,160,30,0.5)', color: 'rgba(230,180,40,0.9)' }}>At Large</div>
                            <div style={{ width: 90, margin: '14px auto 12px' }}>
                              <img src={e.img} alt={e.name} style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.55))' }} />
                            </div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.95rem', color: '#A855F7', marginBottom: '2px', lineHeight: 1.3 }}>{e.name}</p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(200,185,150,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{e.title}</p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(220,210,185,0.78)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{e.lore}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── THE ORDER ── */}
              {(() => {
                const anyKnown = ORDER_ROSTER.some(e => intelUnlocked.includes(e.img) || defeatedFactionMembers.includes(e.img));
                if (!anyKnown) return null;
                return (
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4))' }} />
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37' }}>The Order</span>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.4))' }} />
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(200,185,150,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 16px' }}>
                      The architects behind everything. They move through shadows and speak through others.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {ORDER_ROSTER.map(e => {
                        const defeated = defeatedFactionMembers.includes(e.img);
                        const revealed = intelUnlocked.includes(e.img) || defeated;
                        if (!revealed) return (
                          <div key={e.img} style={{ borderRadius: '10px', padding: '16px 14px', textAlign: 'center', background: 'rgba(8,8,10,0.7)', border: '1px solid rgba(100,85,40,0.2)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(100,85,40,0.25)', color: 'rgba(140,120,60,0.78)' }}>Unknown</div>
                            <div style={{ width: 90, margin: '14px auto 12px' }}>
                              <img src={e.img} alt="unknown" style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'brightness(0) contrast(0.5)' }} />
                            </div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: 'rgba(100,85,40,0.7)', marginBottom: '2px', lineHeight: 1.3 }}>???</p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(100,85,40,0.7)', textTransform: 'uppercase', marginBottom: '10px' }}>{e.title}</p>
                            <p style={{ fontSize: '0.82rem', color: 'rgba(100,85,40,0.7)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>The order keeps its own hidden. Find out more.</p>
                          </div>
                        );
                        if (defeated) return (
                          <div key={e.img} style={{ borderRadius: '10px', padding: '16px 14px', textAlign: 'center', background: VISUAL_STYLES.card.default, border: '1px solid rgba(80,80,80,0.3)', opacity: 0.6, position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(80,200,80,0.4)', color: 'rgba(100,220,100,0.9)' }}>Defeated</div>
                            <div style={{ position: 'relative', width: 90, margin: '14px auto 12px' }}>
                              <img src={e.img} alt={e.name} style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'grayscale(1) brightness(0.45)' }} />
                              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-18deg)', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: e.img === '/main bad.png' ? '1.1rem' : '1.35rem', letterSpacing: '0.2em', color: e.img === '/main bad.png' ? 'rgba(100,80,200,0.92)' : 'rgba(200,30,30,0.92)', border: `3px solid ${e.img === '/main bad.png' ? 'rgba(100,80,200,0.85)' : 'rgba(200,30,30,0.85)'}`, padding: '2px 8px', borderRadius: '3px', textShadow: `0 0 8px ${e.img === '/main bad.png' ? 'rgba(100,80,200,0.6)' : 'rgba(200,30,30,0.6)'}`, boxShadow: `0 0 10px ${e.img === '/main bad.png' ? 'rgba(100,80,200,0.3)' : 'rgba(200,30,30,0.3)'}, inset 0 0 6px rgba(0,0,0,0.4)`, background: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{e.img === '/main bad.png' ? 'SEALED' : 'SLAIN'}</div>
                            </div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: 'rgba(140,130,110,0.78)', marginBottom: '2px', lineHeight: 1.3 }}>{e.name}</p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(120,110,90,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{e.title}</p>
                            <p style={{ fontSize: '0.82rem', color: 'rgba(120,110,90,0.7)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{e.lore}</p>
                          </div>
                        );
                        return (
                          <div key={e.img} style={{ borderRadius: '10px', padding: '16px 14px', textAlign: 'center', background: VISUAL_STYLES.card.default, border: '1px solid rgba(212,175,55,0.45)', boxShadow: '0 0 20px rgba(212,175,55,0.08)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,160,30,0.5)', color: 'rgba(230,180,40,0.9)' }}>At Large</div>
                            <div style={{ width: 90, margin: '14px auto 12px' }}>
                              <img src={e.img} alt={e.name} style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.5))' }} />
                            </div>
                            <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: '#D4AF37', marginBottom: '2px', lineHeight: 1.3 }}>{e.name}</p>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(200,185,150,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{e.title}</p>
                            <p style={{ fontSize: '0.82rem', color: 'rgba(220,210,185,0.78)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{e.lore}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* ── THE CURSED TAB ── */}
          {activeTab === 'cursed' && (() => {
            const totalCursed = THE_CURSED.reduce((acc, z) => acc + z.groups.reduce((a, g) => a + g.members.length, 0), 0);
            const restedCount = THE_CURSED.reduce((acc, z) => acc + z.groups.reduce((a, g) => a + g.members.filter(m => restedCursed.includes(m.img)).length, 0), 0);

            // Four-state card: hidden | silhouette | wandering (full) | at rest
            const CursedCard = ({ member, solo }) => {
              const atRest = restedCursed.includes(member.img);
              const mercyInfo = CURSED_MERCY_MAP[member.img] || { id: null, req: [] };
              const contractFought = completedLocationContracts.includes(mercyInfo.id) || pendingLocationRewards.includes(mercyInfo.id);
              const reqMet = mercyInfo.req.every(r => completedLocationContracts.includes(r));

              // Hidden — prerequisites not yet met
              if (!reqMet && !contractFought && !atRest) return null;

              // Silhouette — req met but mercy contract not yet encountered
              if (reqMet && !contractFought && !atRest) return (
                <div style={{ borderRadius: '10px', padding: solo ? '20px 18px' : '16px 14px', textAlign: 'center', background: 'rgba(8,8,10,0.7)', border: '1px solid rgba(80,65,100,0.3)', position: 'relative', maxWidth: solo ? '300px' : undefined, margin: solo ? '0 auto' : undefined }}>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(80,65,100,0.3)', color: 'rgba(120,100,150,0.78)' }}>Wandering</div>
                  <div style={{ position: 'relative', width: solo ? 110 : 90, margin: '14px auto 12px' }}>
                    <img src={member.img} alt="unknown" style={{ width: solo ? 110 : 90, height: solo ? 110 : 90, objectFit: 'contain', display: 'block', filter: 'brightness(0) contrast(0.5)' }} />
                  </div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: solo ? '1.05rem' : '0.95rem', color: 'rgba(80,65,100,0.78)', marginBottom: '6px' }}>???</p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(80,65,100,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>A soul still wandering. Find them.</p>
                </div>
              );

              // At Rest — faded card with stamp
              if (atRest) return (
                <div style={{ borderRadius: '10px', padding: solo ? '20px 18px' : '16px 14px', textAlign: 'center', background: VISUAL_STYLES.card.default, border: '1px solid rgba(120,130,160,0.25)', boxShadow: 'none', opacity: 0.65, position: 'relative', transition: 'all 0.2s', maxWidth: solo ? '300px' : undefined, margin: solo ? '0 auto' : undefined }}>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(150,170,220,0.4)', color: 'rgba(170,190,240,0.85)' }}>At Rest</div>
                  <div style={{ position: 'relative', width: solo ? 110 : 90, margin: '14px auto 12px' }}>
                    <img src={member.img} alt={member.name} style={{ width: solo ? 110 : 90, height: solo ? 110 : 90, objectFit: 'contain', display: 'block', filter: 'grayscale(1) brightness(0.4)' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.15em', color: 'rgba(160,180,230,0.88)', border: '2px solid rgba(160,180,230,0.75)', padding: '2px 8px', borderRadius: '3px', textShadow: '0 0 8px rgba(140,160,220,0.5)', boxShadow: '0 0 10px rgba(140,160,220,0.2), inset 0 0 6px rgba(0,0,0,0.4)', background: 'rgba(0,0,0,0.4)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>AT REST</div>
                  </div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: solo ? '1.05rem' : '0.95rem', color: 'rgba(130,120,150,0.78)', marginBottom: '2px', lineHeight: 1.3 }}>{member.name}</p>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(100,95,115,0.7)', textTransform: 'uppercase', marginBottom: '10px' }}>{member.title}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(100,95,115,0.7)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{member.lore}</p>
                </div>
              );

              // Wandering — mercy contract encountered, soul identified
              return (
                <div style={{ borderRadius: '10px', padding: solo ? '20px 18px' : '16px 14px', textAlign: 'center', background: VISUAL_STYLES.card.default, border: '1px solid rgba(140,100,200,0.35)', boxShadow: '0 0 16px rgba(120,80,180,0.12)', position: 'relative', transition: 'all 0.2s', maxWidth: solo ? '300px' : undefined, margin: solo ? '0 auto' : undefined }}>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.65rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(160,130,200,0.4)', color: 'rgba(190,160,230,0.85)' }}>Wandering</div>
                  <div style={{ width: solo ? 110 : 90, margin: '14px auto 12px' }}>
                    <img src={member.img} alt={member.name} style={{ width: solo ? 110 : 90, height: solo ? 110 : 90, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 10px rgba(150,100,220,0.5))' }} />
                  </div>
                  <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: solo ? '1.05rem' : '0.95rem', color: 'rgba(210,185,240,0.9)', marginBottom: '2px', lineHeight: 1.3 }}>{member.name}</p>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(180,160,200,0.78)', textTransform: 'uppercase', marginBottom: '10px' }}>{member.title}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(210,200,225,0.78)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{member.lore}</p>
                </div>
              );
            };

            return (
              <div>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(190,170,220,0.7)', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 6px' }}>
                    Heroes who came before you. Every one of them failed. Some are still out there.
                  </p>
                  <p style={{ fontSize: '0.72rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: 'rgba(170,150,210,0.7)', margin: 0 }}>
                    {restedCount}/{totalCursed} At Rest
                  </p>
                </div>

                {THE_CURSED.map(zone => {
                  const isMemberVisible = (member) => {
                    if (restedCursed.includes(member.img)) return true;
                    const mi = CURSED_MERCY_MAP[member.img] || { id: null, req: [] };
                    const fought = completedLocationContracts.includes(mi.id) || pendingLocationRewards.includes(mi.id);
                    const reqMet = mi.req.every(r => completedLocationContracts.includes(r));
                    return fought || reqMet;
                  };
                  const zoneVisible = zone.groups.some(g => g.members.some(isMemberVisible));
                  if (!zoneVisible) return null;

                  return (
                    <div key={zone.zone} style={{ marginBottom: '36px' }}>
                      {/* Zone header */}
                      {(() => {
                        const zoneTotal = zone.groups.reduce((a, g) => a + g.members.length, 0);
                        const zoneRested = zone.groups.reduce((a, g) => a + g.members.filter(m => restedCursed.includes(m.img)).length, 0);
                        return (
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(140,110,180,0.3))' }} />
                              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(180,150,220,0.7)' }}>{zone.zoneLabel}</span>
                              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(140,110,180,0.3))' }} />
                            </div>
                            <p style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.1em', color: zoneRested === zoneTotal ? 'rgba(160,180,230,0.6)' : 'rgba(140,110,180,0.35)', margin: 0 }}>
                              {zoneRested}/{zoneTotal} At Rest
                            </p>
                          </div>
                        );
                      })()}

                      {zone.groups.map(group => {
                        const groupVisible = group.members.some(isMemberVisible);
                        if (!groupVisible) return null;
                        return (
                          <div key={group.groupName} style={{ marginBottom: '24px' }}>
                            <p style={{
                              fontSize: '0.7rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.2em',
                              color: 'rgba(180,160,210,0.55)', textTransform: 'uppercase',
                              textAlign: 'center', marginBottom: '10px',
                            }}>◆ {group.groupName}</p>

                            {group.solo ? (
                              <CursedCard member={group.members[0]} solo={true} />
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {group.members.map(m => <CursedCard key={m.img} member={m} solo={false} />)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

export default BestiaryTab;
