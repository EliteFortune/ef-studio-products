import fs from 'node:fs';
import path from 'node:path';

export class LocalStore {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.backupPath = `${this.filePath}.bak`;
  }

  init() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    if (!fs.existsSync(this.filePath)) this.#write({ version: 1, repositories: {}, missions: {}, runs: {}, evidence: {}, verdicts: {} }, false);
    return this;
  }

  read() {
    const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    if (data.version !== 1) throw new Error(`unsupported store version: ${data.version}`);
    return data;
  }

  registerRepository(id, repositoryPath) {
    const data = this.read();
    data.repositories[id] = { id, path: path.resolve(repositoryPath), updatedAt: new Date().toISOString() };
    this.#write(data);
    return data.repositories[id];
  }

  putMission(mission) {
    const data = this.read();
    data.missions[mission.id] = { ...mission, updatedAt: new Date().toISOString() };
    this.#write(data);
    return data.missions[mission.id];
  }

  putRun(run) {
    const data = this.read();
    data.runs[run.id] = { ...run, updatedAt: new Date().toISOString() };
    this.#write(data);
    return data.runs[run.id];
  }

  putVerdict(verdict) {
    const data = this.read();
    const key = verdict.runId ?? verdict.id ?? `${verdict.missionId}:${verdict.createdAt ?? new Date().toISOString()}`;
    data.verdicts[key] = verdict;
    this.#write(data);
    return verdict;
  }

  listRuns() {
    const data = this.read();
    return Object.values(data.runs).sort((a,b) => String(b.createdAt ?? b.updatedAt ?? '').localeCompare(String(a.createdAt ?? a.updatedAt ?? '')));
  }

  listRunHistory() {
    const data = this.read();
    const verdictsByRun = Object.values(data.verdicts).reduce((acc,v) => {
      if (v.runId) acc[v.runId] = v;
      return acc;
    }, {});
    return Object.values(data.runs)
      .map(run => ({ ...run, mission: data.missions[run.missionId] ?? null, verdict: verdictsByRun[run.id] ?? null }))
      .sort((a,b) => String(b.createdAt ?? b.updatedAt ?? '').localeCompare(String(a.createdAt ?? a.updatedAt ?? '')));
  }

  restoreLastGood() {
    if (!fs.existsSync(this.backupPath)) return { ok:false, code:'EF-STORE-404', message:'No last-known-good state backup is available' };
    fs.copyFileSync(this.backupPath, this.filePath);
    try {
      this.read();
      return { ok:true, code:'EF-STORE-000', message:'Last-known-good state restored' };
    } catch (error) {
      return { ok:false, code:'EF-STORE-500', message:error.message };
    }
  }

  #write(data, backup = true) {
    if (backup && fs.existsSync(this.filePath)) fs.copyFileSync(this.filePath, this.backupPath);
    const temp = `${this.filePath}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2));
    fs.renameSync(temp, this.filePath);
  }
}
