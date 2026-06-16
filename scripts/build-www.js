/**
 * scripts/build-www.js
 *
 * 把根目录的 index.html + src/ 复制到 www/，
 * 下载 CDN 依赖（React/Babel/Tailwind）到 www/vendor/，
 * 修补 HTML 中的远程链接为本地路径。
 *
 * 这样 Capacitor 打出来的 APK 完全离线可用，不依赖网络。
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// ---------- CDN 依赖清单 ----------
const VENDOR = {
  'react.production.min.js':     'https://unpkg.com/react@18/umd/react.production.min.js',
  'react-dom.production.min.js': 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'babel.min.js':                'https://unpkg.com/@babel/standalone@7/babel.min.js',
  'tailwind.js':                 'https://cdn.tailwindcss.com'
};

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const VENDOR_DIR = path.join(WWW, 'vendor');

// ---------- helpers ----------
function rimraf(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const full = path.join(p, entry);
    if (fs.lstatSync(full).isDirectory()) rimraf(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(p);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function download(url, dest, redirects = 5) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'miaomiao-app-build' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (redirects <= 0) return reject(new Error('Too many redirects: ' + url));
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        return download(next, dest, redirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(() => resolve()));
      out.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('Timeout: ' + url)));
  });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyTree(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, entry);
    const d = path.join(destDir, entry);
    if (fs.statSync(s).isDirectory()) copyTree(s, d);
    else copyFile(s, d);
  }
}

// ---------- main ----------
async function main() {
  console.log('▶ 清理 www/');
  rimraf(WWW);
  ensureDir(VENDOR_DIR);
  ensureDir(path.join(WWW, 'src'));

  console.log('▶ 复制 index.html + src/');
  copyFile(path.join(ROOT, 'index.html'), path.join(WWW, 'index.html'));
  copyTree(path.join(ROOT, 'src'), path.join(WWW, 'src'));

  console.log('▶ 下载 vendor 依赖');
  for (const [name, url] of Object.entries(VENDOR)) {
    const dest = path.join(VENDOR_DIR, name);
    process.stdout.write(`  ⬇ ${name} ... `);
    try {
      await download(url, dest);
      const size = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`✓ ${size} KB`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
      throw e;
    }
  }

  console.log('▶ 修补 index.html 引用为本地路径');
  let html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf-8');
  const replacements = [
    [/https:\/\/cdn\.tailwindcss\.com/g, 'vendor/tailwind.js'],
    [/https:\/\/unpkg\.com\/react@18\/umd\/react\.production\.min\.js/g, 'vendor/react.production.min.js'],
    [/https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.production\.min\.js/g, 'vendor/react-dom.production.min.js'],
    [/https:\/\/unpkg\.com\/@babel\/standalone@7\/babel\.min\.js/g, 'vendor/babel.min.js']
  ];
  for (const [pat, rep] of replacements) html = html.replace(pat, rep);
  fs.writeFileSync(path.join(WWW, 'index.html'), html);

  console.log('✅ 构建完成 → www/');
  console.log(`   www/ size = ${(folderSize(WWW) / 1024 / 1024).toFixed(2)} MB`);
}

function folderSize(p) {
  let total = 0;
  for (const entry of fs.readdirSync(p)) {
    const full = path.join(p, entry);
    const st = fs.statSync(full);
    if (st.isDirectory()) total += folderSize(full);
    else total += st.size;
  }
  return total;
}

main().catch(err => {
  console.error('❌ 构建失败：', err);
  process.exit(1);
});
