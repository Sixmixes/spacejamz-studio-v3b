const fs = require('fs');
const content = fs.readFileSync('app/(gated)/ai/page.tsx', 'utf8');

const opens = (content.match(/<div(\s|>)/g) || []).length;
const closes = (content.match(/<\/div>/g) || []).length;

console.log(`<div: ${opens}`);
console.log(`</div>: ${closes}`);
