const fs = require('fs');
const src = fs.readFileSync('src/App.jsx', 'utf8');

// Extract all defined identifiers more broadly
const defined = new Set();

// useState destructuring
for (const m of src.matchAll(/const \[(\w+),\s*(\w+)\] = use/g)) {
  defined.add(m[1]); defined.add(m[2]);
}
// const/let/var/function declarations
for (const m of src.matchAll(/(?:const|let|var|function) (\w+)[\s=(]/g)) {
  defined.add(m[1]);
}
// Also add common React globals and imported names
['React','useState','useEffect','useCallback','useMemo','useRef','createRoot',
 'true','false','null','undefined','Math','Date','Array','Object','String',
 'parseInt','parseFloat','JSON','console','window','document','setTimeout',
 'clearTimeout','setInterval','clearInterval'].forEach(v => defined.add(v));

// Find all JSX prop value usages: propName={X} or propName={X.y} or propName={X()}
const lines = src.split('\n');
const issues = [];

// Find component sections (lines with <ComponentName)
let inComponent = false;
lines.forEach((line, idx) => {
  // Match ={identifier} - the identifier directly used as a value
  const matches = [...line.matchAll(/(?<!=)=\{([a-zA-Z_]\w*)(?=[\}\(\.[])/g)];
  for (const m of matches) {
    const v = m[1];
    if (!defined.has(v)) {
      issues.push(`Line ${idx+1}: '${v}' is not defined -- ${line.trim().slice(0,90)}`);
    }
  }
});

if (issues.length === 0) {
  console.log('No issues found!');
} else {
  // Deduplicate by variable name
  const seen = new Set();
  issues.forEach(issue => {
    const varName = issue.match(/'(\w+)'/)[1];
    if (!seen.has(varName)) {
      seen.add(varName);
      console.log(issue);
    }
  });
}
