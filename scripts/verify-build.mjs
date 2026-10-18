import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`Error: ${indexPath} does not exist. Run "npm run build" first.`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');

// Ensure there are no incorrect lowercase /jotjson/ references
if (html.includes('/jotjson/')) {
  console.error('Error: index.html contains incorrect lowercase "/jotjson/" reference.');
  process.exit(1);
}

// Find all /JotJSON/assets/ references
const assetRegex = /(?:src|href)="(\/JotJSON\/assets\/[^"]+)"/g;
const matches = [...html.matchAll(assetRegex)].map((m) => m[1]);

if (matches.length === 0) {
  console.error('Error: No assets under "/JotJSON/assets/" were found in index.html.');
  process.exit(1);
}

console.log(`Found ${matches.length} asset reference(s) under /JotJSON/assets/ in index.html:`);

let hasJs = false;
let hasCss = false;

for (const assetPath of matches) {
  console.log(`  - ${assetPath}`);
  if (assetPath.endsWith('.js')) {
    hasJs = true;
  }
  if (assetPath.endsWith('.css')) {
    hasCss = true;
  }

  // Strip prefix and resolve path inside dist
  const relativePath = assetPath.replace(/^\/JotJSON\//, '');
  const filePath = path.join(distDir, relativePath);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Referenced asset does not exist on disk: ${filePath}`);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    console.error(`Error: Referenced asset file is empty: ${filePath}`);
    process.exit(1);
  }
}

if (!hasJs) {
  console.error('Error: No JavaScript bundle under /JotJSON/assets/ was found.');
  process.exit(1);
}

if (!hasCss) {
  console.error('Error: No stylesheet bundle under /JotJSON/assets/ was found.');
  process.exit(1);
}

console.log('✓ Build verification passed: index.html correctly references /JotJSON/assets/ and all assets exist in dist.');
