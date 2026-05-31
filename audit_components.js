const fs = require('fs');
const path = require('path');

const componentDir = 'src/components';
const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(componentDir, file), 'utf8');
  const issues = [];

  // Check constants imports vs usage
  const constantsImport = content.match(/import \{([^}]+)\} from ['"]\.\.\/constants['"]/);
  const importedConstants = constantsImport ? constantsImport[1].split(',').map(s => s.trim()) : [];

  for (const c of ['COLORS', 'VISUAL_STYLES', 'GAME_CONSTANTS', 'HERO_TITLES', 'HERO_CLASSES']) {
    const used = new RegExp(`\\b${c}\\b`).test(content);
    const imported = importedConstants.includes(c);
    if (used && !imported) issues.push(`MISSING IMPORT: ${c}`);
  }

  // Check lucide imports vs usage
  const lucideImport = content.match(/import \{([^}]+)\} from ['"]lucide-react['"]/);
  const importedIcons = lucideImport ? lucideImport[1].split(',').map(s => s.trim()) : [];
  // Find JSX tags like <IconName or <IconName>
  const iconUsages = [...content.matchAll(/<([A-Z][a-zA-Z]+)[\s/>]/g)].map(m => m[1]);
  const uniqueIcons = [...new Set(iconUsages)];
  for (const icon of uniqueIcons) {
    // Skip known React component patterns (PlannerTab, QuestTab etc - component names)
    if (!importedIcons.includes(icon) && !content.includes(`import ${icon}`)) {
      // Check if it's a local component ref or icon
      if (icon.length <= 20 && !['React', 'Fragment'].includes(icon)) {
        issues.push(`POSSIBLY MISSING: <${icon}> (not in lucide imports)`);
      }
    }
  }

  // Extract props list from component definition
  const propsMatch = content.match(/const \w+ = \(\{([\s\S]*?)\}\) =>/);
  if (propsMatch) {
    const propsBlock = propsMatch[1];
    const props = propsBlock.match(/^\s+(\w+)[,\s]?(?:\/\/.*)?$/gm)
      ?.map(l => l.trim().replace(/[,\/].*/, '').trim())
      .filter(p => p && /^[a-z]/.test(p)) || [];

    // Check body for identifiers that look like they should be props
    // Extract the component body (after props)
    const bodyStart = content.indexOf('}) =>');
    const body = content.slice(bodyStart);

    // Find identifiers used in JSX expressions {identifier} or identifier.
    // that start with lowercase and aren't in props or common React/JS globals
    const jsxExprs = [...body.matchAll(/\{([a-z][a-zA-Z0-9]*)\b/g)].map(m => m[1]);
    const globals = new Set(['true', 'false', 'null', 'undefined', 'window', 'console', 'Math', 'Date', 'Array', 'Object', 'String', 'parseInt', 'parseFloat', 'setTimeout', 'clearTimeout', 'alert', 'confirm', 'e', 'i', 'idx', 'prev', 'd', 'c', 'k', 'v', 'n', 'item', 'deck', 'card', 'site', 'fallen', 'hero', 'task', 'event', 'day']);

    const propSet = new Set(props);
    const undefinedVars = [...new Set(jsxExprs)].filter(v =>
      !propSet.has(v) &&
      !globals.has(v) &&
      v.length > 2 &&
      !importedConstants.includes(v)
    );

    if (undefinedVars.length > 0 && undefinedVars.length < 20) {
      issues.push(`Potential undefined vars in JSX: ${undefinedVars.slice(0, 10).join(', ')}`);
    }
  }

  if (issues.length > 0) {
    console.log(`\n${file}:`);
    issues.forEach(i => console.log(`  - ${i}`));
  } else {
    console.log(`${file}: OK`);
  }
}
