#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const cmd = argv[0];
const rest = argv.slice(1);

function help() {
  console.log(`
  ${'\x1b[36m'}ast${'\x1b[0m'} — Astro shortcut CLI

  ${'\x1b[33m'}Usage:${'\x1b[0m'}
    ast <command> [args]

  ${'\x1b[33m'}Commands:${'\x1b[0m'}
    s, server      Start dev server          (astro dev)
    g, generate    Build static site         (astro build)
    d, deploy      Build & deploy
    n, new <title> Create a new blog post

  ${'\x1b[33m'}Examples:${'\x1b[0m'}
    ast s                Start dev server
    ast g                Build for production
    ast d                Build and deploy
    ast n "Hello World"  Create new post
`);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  return result.status;
}

function runDev() {
  const child = spawn('npx', ['astro', 'dev', '--port', '54485', ...rest], { stdio: 'pipe' });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      // Pass through: INFO/WARN/ERROR lines, banner, and errors
      if (/(INFO |WARN |ERROR|error|Error|fail|500|█)/.test(line)) {
        const clean = line
          .replace(/^\d{2}:\d{2}:\d{2}\s*/, '')   // strip timestamp
          .trim();
        if (clean) console.log(clean);
      }
    }
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  child.on('close', (code) => process.exit(code));
}

function newPost(title) {
  if (!title) {
    console.error('Usage: ast n <title>');
    process.exit(1);
  }
  const date = new Date().toISOString().slice(0, 10);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-|-$/g, '');
  const dir = path.join('src', 'content', 'blog', slug);
  const file = path.join(dir, 'index.md');

  if (fs.existsSync(file)) {
    console.error(`Post already exists: ${file}`);
    process.exit(1);
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `---
title: ${title}
description: ''
date: ${date}
---

Start writing here.
`);
  console.log(`Created: ${file}`);
}

function deploy() {
  let pkg;
  try { pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); } catch {}

  if (pkg?.scripts?.deploy) {
    console.log('→ Running npm run deploy...');
    process.exit(run('npm', ['run', 'deploy']));
  }

  console.log('→ Building...');
  if (run('npx', ['astro', 'build']) !== 0) {
    console.error('Build failed');
    process.exit(1);
  }

  const dist = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(dist)) {
    console.error('No dist/ directory found');
    process.exit(1);
  }

  const astroConfig = findAstroConfig();
  const site = astroConfig?.site || '';

  if (site.includes('github.io') || site.includes('github.com')) {
    console.log('→ Deploying to GitHub Pages...');
    process.exit(run('npx', ['gh-pages', '-d', 'dist']));
  }

  console.log('→ Deploying with gh-pages...');
  process.exit(run('npx', ['gh-pages', '-d', 'dist']));
}

function findAstroConfig() {
  for (const f of ['astro.config.mjs', 'astro.config.ts']) {
    if (fs.existsSync(f)) {
      try {
        const content = fs.readFileSync(f, 'utf8');
        const m = content.match(/site:\s*['"]([^'"]+)['"]/);
        if (m) return { site: m[1] };
      } catch {}
    }
  }
  return null;
}

// ── Route commands ──────────────────────────────────

switch (cmd) {
  case 's':
  case 'server':
    runDev();
    break;

  case 'g':
  case 'generate':
    process.exit(run('npx', ['astro', 'build', ...rest]));
    break;

  case 'd':
  case 'deploy':
    deploy();
    break;

  case 'n':
  case 'new':
    newPost(rest.join(' '));
    break;

  case '-v':
  case '--version':
    console.log(require('./package.json').version);
    break;

  case '-h':
  case '--help':
  default:
    help();
    if (!cmd) process.exit(0);
    process.exit(run('npx', ['astro', cmd, ...rest]));
}
