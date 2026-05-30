const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(file, 'utf8');
let replacements = 0;

function replace(from, to, label) {
  const idx = src.indexOf(from);
  if (idx === -1) {
    console.error(`\u274c PATTERN NOT FOUND: ${label}\n  -> "${from.slice(0, 100)}"`);
    process.exit(1);
  }
  src = src.slice(0, idx) + to + src.slice(idx + from.length);
  console.log(`\u2705 ${label}`);
  replacements++;
}

// Blank lines in this file are "\n      \n" (with 6-space trailing whitespace)
const NL6 = '\n      \n';

// ─────────────────────────────────────────────────────────────────────────────
// 1. WIS damage reduction + DEX dodge — two main combat curse blocks (replaceAll)
// ─────────────────────────────────────────────────────────────────────────────
const curseOld = `} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}`;

const curseNew = `} else if (curseLevel === 3) {
  bossDamage = Math.floor(bossDamage * 1.4); // 40% harder
}
// WIS damage reduction (2% per modifier point above 10)
const _wisMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;
if (_wisMod > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod * 0.02)));
// DEX dodge (3% per modifier point, cap 20%) \u2014 exits enemy turn early
const _dexMod = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;
if (_dexMod > 0 && Math.random() < Math.min(0.20, _dexMod * 0.03)) {
  addLog(\`\u26a1 You dodge the attack! (DEX)\`);
  return;
}`;

const before = (src.match(new RegExp(curseOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
src = src.replaceAll(curseOld, curseNew);
const after = (src.match(new RegExp(curseNew.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`\u2705 WIS+DEX (main combat): replaced ${after} curse block(s) (found ${before}, expected 2)`);
replacements += after;

// ─────────────────────────────────────────────────────────────────────────────
// 2. WIS + DEX for Knight counter-attack
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `      let bossDamage = Math.max(1, Math.floor(\n        baseAttack - getBaseDefense()\n      ));\n      \n      // Phase 2 ramping damage`,
  `      let bossDamage = Math.max(1, Math.floor(\n        baseAttack - getBaseDefense()\n      ));\n      // WIS damage reduction\n      const _wisMod2 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;\n      if (_wisMod2 > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod2 * 0.02)));\n      // DEX dodge\n      const _dexMod2 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;\n      if (_dexMod2 > 0 && Math.random() < Math.min(0.20, _dexMod2 * 0.03)) {\n        addLog(\`\u26a1 You dodge the attack! (DEX)\`);\n        return;\n      }\n      \n      // Phase 2 ramping damage`,
  'Knight counter WIS+DEX'
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. WIS + DEX for Crusader counter-attack (single-line bossDamage)
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `      let bossDamage = Math.max(1, Math.floor(baseAttack - getBaseDefense()));\n      \n      // Bastion of Faith: +20% defense (reduce incoming damage)`,
  `      let bossDamage = Math.max(1, Math.floor(baseAttack - getBaseDefense()));\n      // WIS damage reduction\n      const _wisMod3 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;\n      if (_wisMod3 > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod3 * 0.02)));\n      // DEX dodge\n      const _dexMod3 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;\n      if (_dexMod3 > 0 && Math.random() < Math.min(0.20, _dexMod3 * 0.03)) {\n        addLog(\`\u26a1 You dodge the attack! (DEX)\`);\n        return;\n      }\n      \n      // Bastion of Faith: +20% defense (reduce incoming damage)`,
  'Crusader counter WIS+DEX'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. WIS + DEX for tactical skill retaliation
// ─────────────────────────────────────────────────────────────────────────────
replace(
  `      let bossDamage = Math.max(1, Math.floor(\n        baseAttack - getBaseDefense()\n      ));\n      \n      // Apply Knight defense modifiers (same as attack function)`,
  `      let bossDamage = Math.max(1, Math.floor(\n        baseAttack - getBaseDefense()\n      ));\n      // WIS damage reduction\n      const _wisMod4 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.wis - 10) / 2)) : 0;\n      if (_wisMod4 > 0) bossDamage = Math.max(1, Math.floor(bossDamage * (1 - _wisMod4 * 0.02)));\n      // DEX dodge\n      const _dexMod4 = hero?.abilities ? Math.max(0, Math.floor((hero.abilities.dex - 10) / 2)) : 0;\n      if (_dexMod4 > 0 && Math.random() < Math.min(0.20, _dexMod4 * 0.03)) {\n        addLog(\`\u26a1 You dodge the attack! (DEX)\`);\n        return;\n      }\n      \n      // Apply Knight defense modifiers (same as attack function)`,
  'Tactical retaliation WIS+DEX'
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Day XP multiplier on all combat victories
// ─────────────────────────────────────────────────────────────────────────────
const xpBefore = (src.match(/setXp\(x => x \+ xpGain\);/g) || []).length;
src = src.replaceAll(
  'setXp(x => x + xpGain);',
  'setXp(x => x + Math.round(xpGain * dayBonuses.xpMultiplier));'
);
const xpAfter = (src.match(/setXp\(x => x \+ Math\.round\(xpGain/g) || []).length;
console.log(`\u2705 Day XP multiplier: patched ${xpAfter} calls (was ${xpBefore})`);
replacements += xpAfter;

// ─────────────────────────────────────────────────────────────────────────────
// 6. CHA gold bonus on all combat victories (5% per CHA modifier point)
// ─────────────────────────────────────────────────────────────────────────────
const goldBefore = (src.match(/setGold\(e => e \+ goldGain\);/g) || []).length;
src = src.replaceAll(
  'setGold(e => e + goldGain);',
  'setGold(e => e + Math.round(goldGain * (1 + Math.max(0, Math.floor(((hero?.abilities?.cha || 10) - 10) / 2)) * 0.05)));'
);
const goldAfter = (src.match(/setGold\(e => e \+ Math\.round/g) || []).length;
console.log(`\u2705 CHA gold bonus: patched ${goldAfter} calls (was ${goldBefore})`);
replacements += goldAfter;

// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(file, src, 'utf8');
console.log(`\n\u2728 Done! Total replacements: ${replacements}`);
