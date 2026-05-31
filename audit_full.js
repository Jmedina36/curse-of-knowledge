const fs = require('fs');
const path = require('path');

const appSrc = fs.readFileSync('src/App.jsx', 'utf8');
const compDir = 'src/components';
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.jsx'));

// Extract all state vars and functions defined in App.jsx
const appDefined = new Set();
for (const m of appSrc.matchAll(/const \[(\w+),\s*(\w+)\] = use/g)) {
  appDefined.add(m[1]); appDefined.add(m[2]);
}
for (const m of appSrc.matchAll(/(?:const|let|var|function) (\w+)[\s=(]/g)) {
  appDefined.add(m[1]);
}

// For each component, find what's passed from App.jsx and what's used
for (const file of files) {
  const compName = file.replace('.jsx', '');
  const src = fs.readFileSync(path.join(compDir, file), 'utf8');

  // Extract props declared in the component
  const propsMatch = src.match(/const \w+ = \(\{([\s\S]*?)\}\) =>/);
  if (!propsMatch) continue;

  const propsBlock = propsMatch[1];
  const declaredProps = new Set();
  for (const m of propsBlock.matchAll(/\b([a-zA-Z_]\w*)\b/g)) {
    if (!/^\/\//.test(m[0])) declaredProps.add(m[1]);
  }

  // Find what App.jsx passes to this component
  const compCallRegex = new RegExp(`<${compName}([\\s\\S]*?)/>`, 'g');
  // Also handle multi-line component with closing tag
  const compCallRegex2 = new RegExp(`<${compName}\\b([\\s\\S]*?)<\\/${compName}>`, 'g');

  let callBlock = '';
  for (const m of appSrc.matchAll(new RegExp(`<${compName}[\\s\\n]([\\s\\S]*?)(?:\\/>|<\\/${compName}>)`, 'g'))) {
    callBlock = m[1];
    break;
  }

  const passedProps = new Set();
  for (const m of callBlock.matchAll(/(\w+)=\{/g)) {
    passedProps.add(m[1]);
  }

  // Find props used in the component body but not declared
  const bodyStart = src.indexOf('}) =>');
  const body = bodyStart > -1 ? src.slice(bodyStart) : src;

  // Look for identifiers used in JSX expressions and function calls
  // that aren't in declared props or local variables
  const localVars = new Set();
  for (const m of body.matchAll(/(?:const|let|var) (\w+)/g)) localVars.add(m[1]);
  // Also add loop variables and common patterns
  for (const m of body.matchAll(/\((\w+)(?:,\s*\w+)?\)\s*=>/g)) localVars.add(m[1]);
  for (const m of body.matchAll(/\.map\(\((\w+)(?:,\s*(\w+))?\)/g)) {
    localVars.add(m[1]);
    if (m[2]) localVars.add(m[2]);
  }

  const allKnown = new Set([...declaredProps, ...localVars,
    'React', 'true', 'false', 'null', 'undefined', 'Math', 'Date',
    'Object', 'Array', 'String', 'parseInt', 'JSON', 'console',
    'window', 'document', 'e', 'i', 'idx', 'prev', 'setTimeout',
    'clearTimeout', 'alert', 'confirm']);

  // Find all {identifier} usages in the body
  const used = new Set();
  for (const m of body.matchAll(/\{([a-zA-Z_]\w*)(?=[\s\}\.(\[])/g)) {
    used.add(m[1]);
  }

  const missing = [...used].filter(v => !allKnown.has(v) && v.length > 1);

  // Check if missing items are in App.jsx state (meaning they should be passed as props)
  const shouldBeProps = missing.filter(v => appDefined.has(v) && !passedProps.has(v));

  if (shouldBeProps.length > 0) {
    console.log(`\n${file}: Missing props (used in component, defined in App.jsx, not passed):`);
    shouldBeProps.forEach(v => console.log(`  - ${v}`));
  }
}

console.log('\nDone.');
