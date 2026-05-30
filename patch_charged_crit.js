const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(file, 'utf8');
let count = 0;

function replace(from, to, label) {
  const idx = src.indexOf(from);
  if (idx === -1) {
    console.error(`\u274c NOT FOUND: ${label}\n  -> "${from.slice(0, 100)}"`);
    process.exit(1);
  }
  src = src.slice(0, idx) + to + src.slice(idx + from.length);
  console.log(`\u2705 ${label}`);
  count++;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Import ChargedCritModal
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `import ASIModal from './components/ASIModal';`,
  `import ASIModal from './components/ASIModal';\nimport ChargedCritModal from './components/ChargedCritModal';`,
  'Add ChargedCritModal import'
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Add chargedCritRoll state after asiPending
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `const [asiPending, setAsiPending] = useState(null); // { newLevel }`,
  `const [asiPending, setAsiPending] = useState(null); // { newLevel }
  const [chargedCritRoll, setChargedCritRoll] = useState(null); // { roll, multiplier, attackName }`,
  'Add chargedCritRoll state'
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Replace crit + charge block in special attack handler
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `    // Crit system (specials can crit too!)
    const critRoll = Math.random() * 100;
    let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;

    // Crusader Sanctified: +10% crit chance
    if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
      critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.sanctifiedCrit;
    }

    const isCrit = critRoll < critChance;
    const critMultiplier = isCrit ? GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier : 1.0;

    const rawDamage = (baseDamage * critMultiplier) * special.damageMultiplier;
    let damage = Math.max(1, Math.floor(rawDamage - enemyDef));

    // Apply charge bonus if at max charges
    if (chargeStacks === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges) {
      const chargeBonus = Math.floor(damage * GAME_CONSTANTS.CHARGE_SYSTEM.chargeBonus);
      damage += chargeBonus;
      addLog(\`⚡ CHARGED SPECIAL! +\${chargeBonus} damage (+25%)\`);
      setChargeStacks(0); // Consume charges
    } else {
      setChargeStacks(0); // Still consume any partial charges
    }

    if (isCrit) {
      addLog(\`💥 CRITICAL \${special.name.toUpperCase()}!\`);
    }`,
  `    // Crit system — charged specials roll D20 for crit tier; uncharged use random chance
    const isCharged = chargeStacks === GAME_CONSTANTS.CHARGE_SYSTEM.maxCharges;
    let isCrit, critMultiplier, chargedD20 = null;

    if (isCharged) {
      chargedD20 = Math.ceil(Math.random() * 20);
      isCrit = true;
      if      (chargedD20 === 1)  critMultiplier = 1.5;
      else if (chargedD20 <= 9)   critMultiplier = 2.0;
      else if (chargedD20 <= 17)  critMultiplier = 2.5;
      else if (chargedD20 <= 19)  critMultiplier = 3.0;
      else                         critMultiplier = 4.0; // nat 20 = LEGENDARY
      setChargedCritRoll({ roll: chargedD20, multiplier: critMultiplier, attackName: special.name });
    } else {
      let critChance = GAME_CONSTANTS.CRIT_SYSTEM.baseCritChance;
      if (crusaderHolyEmpowerment > 0 && hero?.class?.name === 'Crusader') {
        critChance += GAME_CONSTANTS.SPECIAL_ATTACKS.Crusader.sanctifiedCrit;
      }
      isCrit = (Math.random() * 100) < critChance;
      critMultiplier = isCrit ? GAME_CONSTANTS.CRIT_SYSTEM.baseCritMultiplier : 1.0;
    }
    setChargeStacks(0);

    const rawDamage = (baseDamage * critMultiplier) * special.damageMultiplier;
    let damage = Math.max(1, Math.floor(rawDamage - enemyDef));

    if (isCrit && !chargedD20) {
      addLog(\`💥 CRITICAL \${special.name.toUpperCase()}!\`);
    }`,
  'Replace charge/crit block with D20 charged crit system'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Add ChargedCritModal render to JSX
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `      {asiPending && (
        <ASIModal
          hero={hero}
          newLevel={asiPending.newLevel}
          onClose={handleASIConfirm}
        />
      )}`,
  `      {chargedCritRoll && (
        <ChargedCritModal data={chargedCritRoll} onClose={() => setChargedCritRoll(null)} />
      )}
      {asiPending && (
        <ASIModal
          hero={hero}
          newLevel={asiPending.newLevel}
          onClose={handleASIConfirm}
        />
      )}`,
  'Add ChargedCritModal render to JSX'
);

// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(file, src, 'utf8');
console.log(`\n\u2728 Done! Total operations: ${count}`);
