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
    } else if (file.endsWith('page.tsx') || file.endsWith('layout.tsx') || file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/Projects/steamstore/app');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes("export const runtime = 'edge'")) {
    // Determine if we need to insert after 'use client'
    if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
        const parts = content.split('\n');
        parts.splice(1, 0, "export const runtime = 'edge';");
        fs.writeFileSync(file, parts.join('\n'));
    } else {
        fs.writeFileSync(file, "export const runtime = 'edge';\n" + content);
    }
    console.log('Updated ' + file);
  }
});
