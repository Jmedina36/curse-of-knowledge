const fs = require('fs');
const src = fs.readFileSync('src/App.jsx', 'utf8');

// Extract all defined identifiers
const defined = new Set();

// useState: const [x, setX] = useState(...)
for (const m of src.matchAll(/const \[(\w+),\s*(\w+)\] = use/g)) {
  defined.add(m[1]); defined.add(m[2]);
}
// const x = ... or function x(
for (const m of src.matchAll(/(?:const|let|var|function) (\w+)[\s=(]/g)) {
  defined.add(m[1]);
}

// Find all JSX prop assignments like propName={identifier}
const lines = src.split('\n');
const issues = [];

lines.forEach((line, idx) => {
  // Match ={identifier} patterns (not ={identifier. or ={identifier( to avoid method calls on known objects)
  const matches = [...line.matchAll(/=\{([a-zA-Z_]\w*)\}/g)];
  for (const m of matches) {
    const v = m[1];
    if (!defined.has(v) && !['true','false','null','undefined'].includes(v)) {
      issues.push(`Line ${idx+1}: ${v} -- ${line.trim().slice(0,80)}`);
    }
  }
});

if (issues.length === 0) {
  console.log('No issues found!');
} else {
  console.log('Potentially undefined prop values:');
  issues.forEach(i => console.log('  ' + i));
}
