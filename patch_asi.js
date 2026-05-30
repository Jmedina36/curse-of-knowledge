const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(file, 'utf8');
let count = 0;

function replace(from, to, label) {
  const idx = src.indexOf(from);
  if (idx === -1) {
    console.error(`\u274c NOT FOUND: ${label}\n  -> "${from.slice(0, 90)}"`);
    process.exit(1);
  }
  src = src.slice(0, idx) + to + src.slice(idx + from.length);
  console.log(`\u2705 ${label}`);
  count++;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Add ASIModal import
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `import DeathSaveModal from './components/DeathSaveModal';`,
  `import DeathSaveModal from './components/DeathSaveModal';\nimport ASIModal from './components/ASIModal';`,
  'Add ASIModal import'
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Add asiPending state after isDying
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `const [isDying, setIsDying] = useState(false);`,
  `const [isDying, setIsDying] = useState(false);\n  const [asiPending, setAsiPending] = useState(null); // { newLevel }`,
  'Add asiPending state'
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Replace auto ability-score block with ASI-aware version
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `      // Grow ability scores
      if (hero?.class?.name) {
        const primary = PRIMARY_ABILITY[hero.class.name];
        const secondary = SECONDARY_ABILITY[hero.class.name];
        setHero(prev => {
          const ab = { ...(prev.abilities || STARTING_ABILITIES[hero.class.name] || STARTING_ABILITIES.Knight) };
          ab[primary] = (ab[primary] || 10) + 1;
          if (newLevel % 2 === 0) ab[secondary] = (ab[secondary] || 10) + 1;
          return { ...prev, abilities: ab };
        });
        addLog(\`\${PRIMARY_ABILITY[hero.class.name].toUpperCase()} increased!\${newLevel % 2 === 0 ? \` \${SECONDARY_ABILITY[hero.class.name].toUpperCase()} increased!\` : ''}\`);
      }`,
  `      // Grow ability scores — primary auto-increments; even levels open ASI choice modal
      if (hero?.class?.name) {
        const primary = PRIMARY_ABILITY[hero.class.name];
        setHero(prev => {
          const ab = { ...(prev.abilities || STARTING_ABILITIES[hero.class.name] || STARTING_ABILITIES.Knight) };
          ab[primary] = (ab[primary] || 10) + 1;
          return { ...prev, abilities: ab };
        });
        addLog(\`\${PRIMARY_ABILITY[hero.class.name].toUpperCase()} increased!\`);
        if (newLevel % 2 === 0) setAsiPending({ newLevel });
      }`,
  'Replace auto ASI with player-choice trigger'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Add handleASIConfirm before advance()
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `  const advance = () => {`,
  `  const handleASIConfirm = (updatedAbilities) => {
    setHero(prev => ({ ...prev, abilities: updatedAbilities }));
    const gained = Object.entries(updatedAbilities)
      .filter(([k, v]) => v > (asiPending?.prevAbilities?.[k] ?? 0))
      .map(([k]) => k.toUpperCase()).join(' & ');
    addLog(\`\u2b06\ufe0f ASI: \${gained || 'stat'} increased!\`);
    setAsiPending(null);
  };

  const advance = () => {`,
  'Add handleASIConfirm'
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Add ASIModal render in JSX before closing div
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `      {isDying && (
        <DeathSaveModal
          conMod={hero?.abilities ? Math.floor((hero.abilities.con - 10) / 2) : 0}
          onClose={handleDeathSaveClose}
        />
      )}

    </div>
  );
};

export default FantasyStudyQuest;`,
  `      {isDying && (
        <DeathSaveModal
          conMod={hero?.abilities ? Math.floor((hero.abilities.con - 10) / 2) : 0}
          onClose={handleDeathSaveClose}
        />
      )}
      {asiPending && (
        <ASIModal
          hero={hero}
          newLevel={asiPending.newLevel}
          onClose={handleASIConfirm}
        />
      )}

    </div>
  );
};

export default FantasyStudyQuest;`,
  'Add ASIModal render to JSX'
);

// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(file, src, 'utf8');
console.log(`\n\u2728 Done! Total operations: ${count}`);
