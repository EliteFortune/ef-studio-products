import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { systemHealth } from '../../../packages/diagnostics/src/health.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, '../public');
const port = Number(process.env.EF_PORT || 4178);

function send(res, status, body, type='application/json') {
  res.writeHead(status, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') return send(res, 200, JSON.stringify(systemHealth(process.cwd()), null, 2));
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
    return send(res, 200, html, 'text/html');
  }
  send(res, 404, JSON.stringify({ error: 'not found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`EF Agent Reliability console: http://127.0.0.1:${port}`);
});
