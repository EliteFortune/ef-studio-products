import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { systemHealth } from '../../../packages/diagnostics/src/health.js';
import { classifyHealth } from '../../../packages/diagnostics/src/issues.js';
import { createSupportBundle } from '../../../packages/diagnostics/src/support-bundle.js';
import { safeRemoveCache } from '../../../packages/diagnostics/src/recovery.js';
import { LocalStore } from '../../../packages/core/src/store.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, '../public');
const port = Number(process.env.EF_PORT || 4178);
const repo = process.env.EF_REPOSITORY || process.cwd();
const dataDir = path.resolve(process.env.EF_DATA_DIR || path.join(process.cwd(), '.ef-data'));
const store = new LocalStore(path.join(dataDir, 'state.json')).init();

function send(res, status, body, type='application/json') {
  res.writeHead(status, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' });
  res.end(body);
}

function healthSnapshot() {
  const health = systemHealth(repo);
  health.store = { status:'HEALTHY', detail:store.filePath };
  health.github = process.env.GITHUB_TOKEN
    ? { status:'HEALTHY', detail:'GitHub credential configured locally' }
    : { status:'NOT_CONFIGURED', detail:'GitHub is optional; local verification remains available' };
  return { health, issues: classifyHealth(health), repository: repo };
}

function runSummary() {
  const runs = store.listRunHistory();
  const counts = { total:runs.length, verified:0, attention:0, failed:0, unknown:0 };
  for (const r of runs) {
    const status = r.verdict?.verifiedStatus ?? r.verifiedStatus ?? 'UNKNOWN';
    if (status === 'VERIFIED') counts.verified++;
    else if (status === 'FAILED') counts.failed++;
    else if (status === 'INCOMPLETE') counts.attention++;
    else counts.unknown++;
  }
  return { runs, counts };
}

async function readBody(req) {
  const chunks=[];
  for await (const chunk of req) chunks.push(chunk);
  const raw=Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/api/health' && req.method === 'GET') return send(res, 200, JSON.stringify(healthSnapshot(), null, 2));
    if (req.url === '/api/runs' && req.method === 'GET') return send(res, 200, JSON.stringify(runSummary(), null, 2));
    if (req.url === '/api/support-bundle' && req.method === 'GET') {
      const snapshot = healthSnapshot();
      const bundle = createSupportBundle({ health: snapshot.health, appVersion: '0.1.0', os: process.platform, recentErrors: snapshot.issues });
      res.setHeader('content-disposition', 'attachment; filename="ef-agent-reliability-diagnostics.json"');
      return send(res, 200, JSON.stringify(bundle, null, 2));
    }
    if (req.url === '/api/recovery/clear-cache' && req.method === 'POST') {
      await readBody(req);
      return send(res, 200, JSON.stringify(safeRemoveCache(path.join(dataDir, 'cache'))));
    }
    if (req.url === '/api/recovery/restore-state' && req.method === 'POST') {
      await readBody(req);
      return send(res, 200, JSON.stringify(store.restoreLastGood()));
    }
    if (req.url === '/' || req.url === '/index.html') {
      const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
      return send(res, 200, html, 'text/html');
    }
    send(res, 404, JSON.stringify({ error: 'not found' }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error:'internal_error', message:error.message }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`EF Agent Reliability console: http://127.0.0.1:${port}`);
});
