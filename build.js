#!/usr/bin/env node
/**
 * Cross-platform Node.js build script for JASOOS
 * Bundles jasoos/src chunks into outputs/jasoos.html, outputs/index.html, and index.html
 * Copies static assets to outputs/ and root for universal static hosting (Vercel, Netlify, etc.)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const JASOOS_DIR = path.join(ROOT, 'jasoos');
const SRC_DIR = path.join(JASOOS_DIR, 'src');
const ASSETS_DIR = path.join(JASOOS_DIR, 'assets');
const OUTPUTS_DIR = path.join(ROOT, 'outputs');

if (!fs.existsSync(OUTPUTS_DIR)) {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

console.log('📦 Building JASOOS...');

// Read and sort src files
const files = fs.readdirSync(SRC_DIR).filter(f => !f.startsWith('.') && fs.statSync(path.join(SRC_DIR, f)).isFile()).sort();

const parts = [];
for (const f of files) {
  const ext = path.extname(f);
  const content = fs.readFileSync(path.join(SRC_DIR, f), 'utf-8');
  if (ext === '.html') {
    parts.push({ kind: 'html', name: f, content });
  } else if (ext === '.css') {
    parts.push({ kind: 'css', name: f, content });
  } else if (ext === '.js') {
    parts.push({ kind: 'js', name: f, content });
  }
}

let cssDone = false;
let jsDone = false;
const cssAll = parts.filter(p => p.kind === 'css').map(p => p.content).join('\n');
const jsAll = parts.filter(p => p.kind === 'js').map(p => p.content).join('\n');

const out = [];
for (const part of parts) {
  if (part.kind === 'html') {
    out.push(part.content);
  } else if (part.kind === 'css' && !cssDone) {
    out.push(`<style>\n${cssAll}\n</style>`);
    cssDone = true;
  } else if (part.kind === 'js' && !jsDone) {
    out.push(`<script>\n${jsAll}\n</script>\n</body>\n</html>`);
    jsDone = true;
  }
}

let html = out.join('\n');
html = html.replace(/\n{3,}/g, '\n\n');

// Validate JS syntax
try {
  new Function(jsAll);
  console.log('✅ JavaScript syntax check passed');
} catch (err) {
  console.error('❌ JS syntax check failed:', err.message);
  process.exit(1);
}

// Write outputs
const targetOutputsHtml = path.join(OUTPUTS_DIR, 'jasoos.html');
const targetOutputsIndex = path.join(OUTPUTS_DIR, 'index.html');
const targetRootIndex = path.join(ROOT, 'index.html');

fs.writeFileSync(targetOutputsHtml, html, 'utf-8');
fs.writeFileSync(targetOutputsIndex, html, 'utf-8');
fs.writeFileSync(targetRootIndex, html, 'utf-8');

const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
console.log(`✅ Built bundle: ${sizeKb} KB`);

// Copy assets to outputs/ and root
if (fs.existsSync(ASSETS_DIR)) {
  const assetFiles = fs.readdirSync(ASSETS_DIR).filter(f => fs.statSync(path.join(ASSETS_DIR, f)).isFile());
  for (const file of assetFiles) {
    const srcFile = path.join(ASSETS_DIR, file);
    fs.copyFileSync(srcFile, path.join(OUTPUTS_DIR, file));
    fs.copyFileSync(srcFile, path.join(ROOT, file));
    console.log(`  -> Copied asset: ${file}`);
  }
}

// Copy og.png
const ogFile = path.join(JASOOS_DIR, 'og.png');
if (fs.existsSync(ogFile)) {
  fs.copyFileSync(ogFile, path.join(OUTPUTS_DIR, 'og.png'));
  fs.copyFileSync(ogFile, path.join(ROOT, 'og.png'));
  console.log('  -> Copied og.png');
}

console.log('✨ Build completed successfully!');
