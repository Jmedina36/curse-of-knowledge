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
// 1. Add new component imports after EncounterModal import
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `import EncounterModal from './components/EncounterModal';`,
  `import EncounterModal from './components/EncounterModal';
import InitiativeModal from './components/InitiativeModal';
import DeathSaveModal from './components/DeathSaveModal';`,
  'Add InitiativeModal + DeathSaveModal imports'
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Add enterDyingRef after introTimers ref
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `const introTimers = useRef([]);`,
  `const introTimers = useRef([]);
  const enterDyingRef = useRef(false); // guard against re-entry during death saves`,
  'Add enterDyingRef'
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Add new state vars after dayBonuses
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `const [dayBonuses, setDayBonuses] = useState({ xpMultiplier: 1.0 });`,
  `const [dayBonuses, setDayBonuses] = useState({ xpMultiplier: 1.0 });
  const [initiativeRoll, setInitiativeRoll] = useState(null); // { roll, dexMod, total, playerFirst }
  const [isDying, setIsDying] = useState(false);`,
  'Add initiativeRoll + isDying state'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Fix double dayBonuses.xpMultiplier in task complete() — xpGain already
//    includes the multiplier from xpMultiplier at line 1892
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `let xpGain = Math.floor(baseXp * xpMultiplier);\n    \n    setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));\n    sounds.taskComplete();`,
  `let xpGain = Math.floor(baseXp * xpMultiplier);\n    \n    setXp(x => x + xpGain);\n    // D20 task completion roll\n    const _d20 = Math.ceil(Math.random() * 20);\n    let _bonusXP = 0, _bonusGold = 0;\n    if (_d20 === 20)      { _bonusXP = Math.round(xpGain * 0.5);  _bonusGold = 10; }\n    else if (_d20 >= 15) { _bonusXP = Math.round(xpGain * 0.20); _bonusGold = 5; }\n    else if (_d20 >= 10) { _bonusXP = Math.round(xpGain * 0.10); }\n    if (_bonusXP > 0)   setXp(x => x + _bonusXP);\n    if (_bonusGold > 0) setGold(g => g + _bonusGold);\n    setDiceRoll({ roll: _d20, bonusXP: _bonusXP, bonusGold: _bonusGold });\n    sounds.taskComplete();`,
  'Fix double XP multiplier + add D20 task roll'
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Add initiative roll to spawnRegularEnemy (before the closing deps array)
// ─────────────────────────────────────────────────────────────────────────────
const initiativeBlock = `\n  // Initiative roll — DEX modifier adds to the D20
  const _dexMod_init = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
  const _initRoll = Math.ceil(Math.random() * 20);
  const _initTotal = Math.max(1, Math.min(20, _initRoll + _dexMod_init));
  const _playerFirst = _initTotal >= 11;
  setInitiativeRoll({ roll: _initRoll, dexMod: _dexMod_init, total: _initTotal, playerFirst: _playerFirst });
  if (!_playerFirst) {
    setTimeout(() => {
      const _rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
      const _wis_init = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      const _openDmg = Math.max(3, Math.floor(_rawAtk * 0.40 * (1 - _wis_init * 0.02)));
      setHp(h => Math.max(1, h - _openDmg)); // Opening strike never kills (min 1 HP)
      addLog(\`\u2694\ufe0f AMBUSHED! Enemy strikes first! -\${_openDmg} HP\`);
    }, 2600);
  }`;

replace(
  `}, [currentDay, canCustomize, addLog]);`,
  `${initiativeBlock}\n}, [currentDay, canCustomize, addLog, hero]);`,
  'Initiative roll in spawnRegularEnemy'
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Add initiative roll to spawnRandomMiniBoss (regular function, no deps array)
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `addLog(\`AMBUSH! \${bossNameGenerated} emerges from the shadows!\`);\n  };`,
  `addLog(\`AMBUSH! \${bossNameGenerated} emerges from the shadows!\`);
  // Initiative roll
  const _dexMod_mb = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
  const _mbRoll = Math.ceil(Math.random() * 20);
  const _mbTotal = Math.max(1, Math.min(20, _mbRoll + _dexMod_mb));
  setInitiativeRoll({ roll: _mbRoll, dexMod: _dexMod_mb, total: _mbTotal, playerFirst: _mbTotal >= 11 });
  if (_mbTotal < 11) {
    setTimeout(() => {
      const _rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
      const _wis_mb = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      const _openDmg = Math.max(3, Math.floor(_rawAtk * 0.40 * (1 - _wis_mb * 0.02)));
      setHp(h => Math.max(1, h - _openDmg));
      addLog(\`\u2694\ufe0f Enemy seizes initiative! -\${_openDmg} HP\`);
    }, 2600);
  }
  };`,
  'Initiative roll in spawnRandomMiniBoss'
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. Add initiative roll to final boss spawn (Gauntlet)
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `addLog(\`\ud83d\udc79 \${bossNameGenerated.toUpperCase()} - THE GAUNTLET!\`);\n  };`,
  `addLog(\`\ud83d\udc79 \${bossNameGenerated.toUpperCase()} - THE GAUNTLET!\`);
  // Initiative roll
  const _dexMod_fb = hero?.abilities ? Math.floor((hero.abilities.dex - 10) / 2) : 0;
  const _fbRoll = Math.ceil(Math.random() * 20);
  const _fbTotal = Math.max(1, Math.min(20, _fbRoll + _dexMod_fb));
  setInitiativeRoll({ roll: _fbRoll, dexMod: _dexMod_fb, total: _fbTotal, playerFirst: _fbTotal >= 11 });
  if (_fbTotal < 11) {
    setTimeout(() => {
      const _rawAtk = GAME_CONSTANTS.BOSS_ATTACK_BASE + currentDay * GAME_CONSTANTS.BOSS_ATTACK_DAY_SCALING;
      const _wis_fb = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
      const _openDmg = Math.max(3, Math.floor(_rawAtk * 0.50 * (1 - _wis_fb * 0.02)));
      setHp(h => Math.max(1, h - _openDmg));
      addLog(\`\u2694\ufe0f THE GAUNTLET STRIKES FIRST! -\${_openDmg} HP\`);
    }, 2600);
  }
  };`,
  'Initiative roll in final boss spawn'
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. Add enterDyingState + handleDeathSaveClose after die() function.
//    Anchor: the "const advance = ()" that follows die().
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `\n  const advance = () => {`,
  `
  // Death save entry point — guards against re-entry with a ref
  const enterDyingState = () => {
    if (enterDyingRef.current) return;
    enterDyingRef.current = true;
    setIsDying(true);
  };

  const handleDeathSaveClose = (survived) => {
    enterDyingRef.current = false;
    setIsDying(false);
    if (survived) {
      setHp(1);
      addLog('\ud83d\udcaa You stabilize at 1 HP! Fight on!');
    } else {
      die();
    }
  };

  const advance = () => {`,
  'Add enterDyingState + handleDeathSaveClose'
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. Replace all "You have been defeated!" die() calls → enterDyingState()
//    There are two indentation variants (12 and 14 spaces before die())
// ─────────────────────────────────────────────────────────────────────────────
const defeated12 = `addLog('\ud83d\udc80 You have been defeated!');\n            die();`;
const replaced12 = `addLog('\ud83d\udc80 You fall! Roll for death!');\n            enterDyingState();`;
const before12 = (src.match(new RegExp(defeated12.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
src = src.replaceAll(defeated12, replaced12);
const after12 = (src.match(new RegExp(replaced12.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`\u2705 Replace death (12-space): ${after12} instances (was ${before12})`);
count += after12;

const defeated14 = `addLog('\ud83d\udc80 You have been defeated!');\n              die();`;
const replaced14 = `addLog('\ud83d\udc80 You fall! Roll for death!');\n              enterDyingState();`;
const before14 = (src.match(new RegExp(defeated14.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
src = src.replaceAll(defeated14, replaced14);
const after14 = (src.match(new RegExp(replaced14.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`\u2705 Replace death (14-space): ${after14} instances (was ${before14})`);
count += after14;

// AOE death
replace(
  `addLog('\ud83d\udc80 You have been defeated by the AOE!');\n                die();`,
  `addLog('\ud83d\udc80 AOE slams you down! Roll for death!');\n                enterDyingState();`,
  'Replace AOE death call'
);

// ─────────────────────────────────────────────────────────────────────────────
// 10. Add modal renders to JSX — just before the outer closing </div>
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `\n    </div>\n  );\n};\n\nexport default FantasyStudyQuest;`,
  `
      {/* D&D modals — fixed overlays */}
      {diceRoll && introPhase === 'done' && (
        <DiceRollModal
          roll={diceRoll.roll} bonusXP={diceRoll.bonusXP} bonusGold={diceRoll.bonusGold}
          onClose={() => setDiceRoll(null)}
        />
      )}
      {currentEncounter && introPhase === 'done' && (
        <EncounterModal
          encounter={currentEncounter}
          onAccept={() => applyEncounter(currentEncounter)}
        />
      )}
      {initiativeRoll && (
        <InitiativeModal data={initiativeRoll} onClose={() => setInitiativeRoll(null)} />
      )}
      {isDying && (
        <DeathSaveModal
          conMod={hero?.abilities ? Math.floor((hero.abilities.con - 10) / 2) : 0}
          onClose={handleDeathSaveClose}
        />
      )}

    </div>
  );
};

export default FantasyStudyQuest;`,
  'Add modal renders to JSX'
);

// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(file, src, 'utf8');
console.log(`\n\u2728 Done! Total operations: ${count}`);
