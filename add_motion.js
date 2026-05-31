const fs = require('fs');

const ANIM = `initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}`;

function patch(file, classNameSnippet) {
  let src = fs.readFileSync(file, 'utf8');

  if (!src.includes("from 'framer-motion'")) {
    src = src.replace("import React from 'react';", "import React from 'react';\nimport { motion } from 'framer-motion';");
  }

  // Find <div className="...classNameSnippet..." and replace with motion.div + anim props before style={{
  // Pattern: <div className="...snippet..." style={{
  const regex = new RegExp(`(<div (className="[^"]*${classNameSnippet}[^"]*"))(\\s*style={{)`, 'g');
  if (!regex.test(src)) {
    console.log(`✗ ${file}: pattern not found for '${classNameSnippet}'`);
    fs.writeFileSync(file, src);
    return;
  }

  src = src.replace(
    new RegExp(`(<div (className="[^"]*${classNameSnippet}[^"]*"))(\\s*style={{)`, 'g'),
    `<motion.div $2 ${ANIM}$3`
  );

  // Replace matching closing tag — last </div> right before ");\n};\n\nexport default"
  src = src.replace(/(<\/div>)(\s*\);\s*\n\};\s*\nexport default)/, '</motion.div>$2');

  fs.writeFileSync(file, src);
  console.log(`✓ ${file}`);
}

patch('src/components/ImportModal.jsx', 'rounded-xl p-6 max-w-md w-full border-2 relative');
patch('src/components/CustomizeModal.jsx', 'rounded-xl p-6 max-w-md w-full border-2 my-8');
patch('src/components/PlanModal.jsx', 'rounded-xl p-6 max-w-md w-full border-2"');
patch('src/components/CalendarModal.jsx', 'rounded-xl p-6 max-w-md w-full border-2 my-8');
patch('src/components/PomodoroModal.jsx', 'rounded-xl p-12 max-w-2xl w-full border-2 relative my-8');
patch('src/components/InventoryModal.jsx', 'rounded-xl p-6 max-w-lg w-full border-2 relative my-8');
patch('src/components/CraftingModal.jsx', 'rounded-xl p-6 max-w-2xl w-full border-2 my-8 relative');

// BattleModal uses template literal className, handle separately
{
  const file = 'src/components/BattleModal.jsx';
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes("from 'framer-motion'")) {
    src = src.replace("import React from 'react';", "import React from 'react';\nimport { motion } from 'framer-motion';");
  }
  // Already has motion.div from previous run, just check
  if (src.includes('<motion.div className={`rounded-2xl')) {
    console.log('✓ BattleModal: already has motion.div');
  } else {
    const open = `<div className={\`rounded-2xl p-4 max-w-3xl w-full relative boss-enter my-1`;
    if (src.includes(open)) {
      src = src.replace(open, open.replace('<div ', '<motion.div '));
      // insert ANIM before style={{
      src = src.replace(
        /(<motion\.div className=\{`rounded-2xl[^`]*`\})\s*(style={{)/,
        `$1 ${ANIM} $2`
      );
      src = src.replace(/(<\/div>)(\s*<\/div>\s*\);\s*\n\};\s*\nexport default)/, '</motion.div>$2');
      console.log('✓ BattleModal');
    } else {
      console.log('? BattleModal: checking current state');
    }
  }
  fs.writeFileSync(file, src);
}
