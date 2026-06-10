const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/Projects/steamstore/app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  
  // Find lines starting with 'use client' and export const runtime = 'edge'
  let clientLineIndex = -1;
  let edgeLineIndex = -1;
  
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '"use client";' || trimmed === "'use client';" || trimmed === '"use client"' || trimmed === "'use client'") {
      clientLineIndex = i;
    }
    if (trimmed.includes("export const runtime = 'edge'")) {
      edgeLineIndex = i;
    }
  }

  // If both exist and 'edge' is before 'use client'
  if (clientLineIndex !== -1 && edgeLineIndex !== -1 && edgeLineIndex < clientLineIndex) {
    const clientLine = lines[clientLineIndex];
    lines.splice(clientLineIndex, 1);
    lines.splice(0, 0, clientLine);
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Fixed ' + file);
  }
});
