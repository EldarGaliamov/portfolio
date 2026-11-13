import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [sourcePath, imagesDirectory] = process.argv.slice(2);
if (!sourcePath || !imagesDirectory) {
  throw new Error('Usage: node scripts/encrypt-office-case.mjs <case.html> <image-directory> < password-file');
}

const password = readFileSync(0, 'utf8').replace(/\r?\n$/, '');
if (!password) throw new Error('Enter a password on stdin.');

const imageData = (filename) =>
  'data:image/png;base64,' + readFileSync(join(imagesDirectory, filename)).toString('base64');

const source = readFileSync(sourcePath, 'utf8');
const resultCardStyle = `<style>
  .office-result-card {
    background: linear-gradient(#fff, #fff) padding-box,
      url("${imageData('result-border.png')}") center / cover border-box;
  }
</style>`;
const html = source
  .replace(/^ *<script src="\.\.\/scripts\/analytics\.js" defer><\/script>\r?\n/m, '')
  .replace('<script src="../scripts/smoothscroll.js"></script>', '')
  .replace('<main class="case-page', '<div class="case-scroll" data-scroll-surface>\n    <main class="case-page')
  .replace('</footer>', '</footer>\n    </div>')
  .replace(/<iframe([^>]*src="(https:\/\/embed\.figma\.com\/[^"]+)"[^>]*)><\/iframe>\s*<\/div>/g, (_, attributes, embedUrl) => {
    const fileUrl = new URL(embedUrl);
    fileUrl.hostname = 'www.figma.com';
    fileUrl.searchParams.delete('embed-host');
    return `<iframe title="Проработка сценария в Figma" loading="lazy"${attributes}></iframe>` +
      `\n            </div>\n            <a class="office-embed-link" href="${fileUrl.href.replaceAll('&', '&amp;')}" target="_blank" rel="noopener noreferrer">Открыть в Figma ↗</a>`;
  })
  .replace(/src="\.\.\/assets\/office-case\/([a-z0-9-]+\.png)"/g, (_, filename) => `src="${imageData(filename)}"`)
  .replace('</head>', `<link rel="stylesheet" href="../scripts/vendor/lenis.css" />
    <link rel="stylesheet" href="../styles/site-motion.css" />
    <script src="../scripts/vendor/lenis.min.js" defer></script>
    <script src="../scripts/scroll-motion.js" defer></script>
    <script src="../scripts/site-motion.js" type="module"></script>
    ${resultCardStyle}
  </head>`);

if (!html.includes('<head>') || html.includes('assets/office-case/')) {
  throw new Error('The case HTML contains unsupported asset references.');
}

// Keep the format and PBKDF2 settings in sync with office-access.js.
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, 600_000, 32, 'sha256');
const cipher = createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([salt, iv, cipher.update(html, 'utf8'), cipher.final(), cipher.getAuthTag()]);

writeFileSync(new URL('../cases/office-assignment.bin', import.meta.url), encrypted);
