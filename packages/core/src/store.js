import fs from 'node:fs';
import path from 'node:path';

export class LocalStore {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
  }

  init() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    if (!fs.existsSync(this.filePath)) this.#write({ version: 1, repositories: {}, missions: {}, runs: {}, evidence: {}, verdicts: {} });
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
    data.verdicts[verdict.missionId] = verdict;
    this.#write(data);
    return verdict;
  }

  #write(data) {
    const temp = `${this.filePath}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2));
    fs.renameSync(temp, this.filePath);
  }
}
