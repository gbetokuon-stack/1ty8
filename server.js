// ponytail: minimal zero-dep server for 1in8b.life reproduction
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // API mocks for offline play
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (pathname === '/api/e') {
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (pathname === '/api/posts' || pathname === '/api/memorials' || pathname === '/api/villages') {
      res.end(JSON.stringify({ ok: true, posts: [], list: [] }));
      return;
    }
    if (pathname === '/api/sky') {
      res.end(JSON.stringify({ ok: true, lt: [] }));
      return;
    }
    if (pathname === '/api/post') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        res.end(JSON.stringify({ ok: true, id: Date.now(), tok: 'local_' + Math.random().toString(36).slice(2) }));
      });
      return;
    }
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Route mapping
  if (pathname === '/' || pathname === '/vi' || pathname === '/vi/') {
    serveFile(res, path.join(ROOT, 'index.html'));
    return;
  }
  if (pathname === '/vi/c' || pathname === '/vi/c/') {
    serveFile(res, path.join(ROOT, 'c.html'));
    return;
  }
  if (pathname === '/vi/about' || pathname === '/vi/about/') {
    serveFile(res, path.join(ROOT, 'about.html'));
    return;
  }
  if (pathname === '/vi/edu' || pathname === '/vi/edu/') {
    serveFile(res, path.join(ROOT, 'edu.html'));
    return;
  }
  if (pathname === '/vi/privacy' || pathname === '/vi/privacy/') {
    serveFile(res, path.join(ROOT, 'privacy.html'));
    return;
  }
  if (pathname === '/vi/terms' || pathname === '/vi/terms/') {
    serveFile(res, path.join(ROOT, 'terms.html'));
    return;
  }
  if (pathname === '/vi/manifest.webmanifest') {
    serveFile(res, path.join(ROOT, 'vi-manifest.webmanifest'));
    return;
  }

  // Static files
  let filePath = path.join(ROOT, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(res, filePath);
    return;
  }

  // Not found
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
});

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('Error reading file');
      return;
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.end(data);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`1 in 8 Billion (1 trong 8 tỷ) server running: http://localhost:${PORT}/vi/`);
});
