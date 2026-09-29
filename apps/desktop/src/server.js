import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { systemHealth } from '../../../packages/diagnostics/src/health.js';
import { classifyHealth } from '../../../packages/diagnostics/src/issues.js';
import { createSupportBundle } from '../../../packages/diagnostics/src/support-bundle.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, '../public');
const port = Number(process.env.EF_PORT || 4178);
const repo = process.env.EF_REPOSITORY || process.cwd();

function send(res, status, body, type='application/json') {
  res.writeHead(status, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
  res.end(body);
}

function healthSnapshot() {
  const health = systemHealth(repo);
  return { health, issues: classifyHealth(health), repository: repo };
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') return send(res, 200, JSON.stringify(healthSnapshot(), null, 2));
  if (req.url === '/api/support-bundle') {
    const snapshot = healthSnapshot();
    const bundle = createSupportBundle({ health: snapshot.health, appVersion: '0.1.0', os: process.platform, recentErrors: snapshot.issues });
    res.setHeader('content-disposition', 'attachment; filename="ef-agent-reliability-diagnostics.json"');
    return send(res, 200, JSON.stringify(bundle, null, 2));
  }
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
    return send(res, 200, html, 'text/html');
  }
  send(res, 404, JSON.stringify({ error: 'not found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`EF Agent Reliability console: http://127.0.0.1:${port}`);
});
