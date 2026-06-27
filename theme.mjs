// halcyon-theme v1.0.0
// Astro integration — Hexo-style INFO/WARN/ERROR formatted output

import { createRequire } from 'node:module';

const TAG = {
  INFO:  '\x1b[32mINFO \x1b[0m',
  WARN:  '\x1b[33mWARN \x1b[0m',
  ERROR: '\x1b[31mERROR\x1b[0m',
};

const BANNER = [
  '\x1b[36m██╗  ██╗ █████╗ ██╗      ██████╗██╗   ██╗ ██████╗ ███╗   ██╗',
  '██║  ██║██╔══██╗██║     ██╔════╝╚██╗ ██╔╝██╔═══██╗████╗  ██║',
  '███████║███████║██║     ██║      ╚████╔╝ ██║   ██║██╔██╗ ██║',
  '██╔══██║██╔══██║██║     ██║       ╚██╔╝  ██║   ██║██║╚██╗██║',
  '██║  ██║██║  ██║███████╗╚██████╗   ██║   ╚██████╔╝██║ ╚████║',
  '╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝\x1b[0m',
].join('\n');

const SEP = '\x1b[36m================================================================\x1b[0m';

function info(msg)  { console.log(`${TAG.INFO} ${msg}`); }
function warn(msg)  { console.log(`${TAG.WARN} ${msg}`); }
function error(msg) { console.log(`${TAG.ERROR} ${msg}`); }

// ── Console intercept ──────────────────────────────────

function wrapConsole() {
  const original = console.log;
  let bannerShown = false;

  console.log = function (...args) {
    const line = args.join(' ').trim();
    if (!line) return original('');

    // Pass through our own formatted messages
    if (line.includes('\x1b') && (line.includes('INFO') || line.includes('WARN') || line.includes('ERROR') || line.includes('█'))) {
      return original(line);
    }

    // Banner separator
    if (line === SEP && !bannerShown) return original(line);

    // Astro startup
    if (/ready in \d+ ms/i.test(line)) return info(line);
    if (/^\│\s+Local/i.test(line))  return info(line.trim());
    if (/^\│\s+Network/i.test(line)) return info(line.trim());

    // Vite messages
    if (line.startsWith('[vite]')) {
      const msg = line.slice(7).trim();
      if (/error/i.test(msg)) return error(msg);
      return info(msg);
    }

    // Errors
    if (/error/i.test(line)) return error(line);

    // Skip noise: timestamps, content sync, types, watching, request logs
    if (/^\d{2}:\d{2}:\d{2}/.test(line)) return;
    if (/Generated \d+ms/i.test(line)) return;
    if (/Syncing content/i.test(line)) return;
    if (/Synced content/i.test(line)) return;
    if (/watching for file/i.test(line)) return;
    if (/^\[/.test(line) && /\d+ms$/.test(line)) return; // [200] / 14ms
  };
}

// ── Dependency check ────────────────────────────────────

function validateDeps() {
  const require = createRequire(import.meta.url);
  const required = ['@astrojs/mdx', '@astrojs/sitemap'];
  const missing = [];

  for (const dep of required) {
    try {
      require.resolve(dep, { paths: [process.cwd()] });
    } catch {
      missing.push(dep);
    }
  }

  if (missing.length) {
    warn(`Missing dependencies: ${missing.join(', ')}`);
  }
}

// ── Integration ─────────────────────────────────────────

export default function halcyonTheme() {
  return {
    name: 'halcyon-theme',
    hooks: {
      'astro:config:setup'({ updateConfig }) {
        // Intercept all console output
        wrapConsole();

        // Also intercept Vite's built-in logger
        updateConfig({
          vite: {
            customLogger: {
              info(msg) {
                const m = typeof msg === 'string' ? msg : msg?.message || '';
                if (m && !/watching|Syncing|Generated|\[/.test(m)) {
                  info(m);
                }
              },
              warn(msg) {
                const m = typeof msg === 'string' ? msg : msg?.message || '';
                if (m) warn(m);
              },
              error(msg) {
                const m = typeof msg === 'string' ? msg : msg?.message || '';
                if (m) error(m);
              },
              infoOnce() {},
              warnOnce() {},
              errorOnce(msg) {
                const m = typeof msg === 'string' ? msg : msg?.message || '';
                if (m) error(m);
              },
              clearScreen() {},
              hasErrorLogged() { return false; },
              hasWarned: false,
            },
          },
        });
      },

      'astro:server:setup'() {
        validateDeps();
        info('Validating config');
        info(`Astro theme Halcyon v1.0.0`);
        console.log(SEP);
        console.log(BANNER);
        console.log(SEP);
        info('Start processing');
      },

      'astro:server:start'({ address }) {
        const url = typeof address === 'string'
          ? address
          : `http://localhost:${address.port}/`;
        info(`Halcyon is running at ${url} . Press Ctrl+C to stop.`);
      },
    },
  };
}
