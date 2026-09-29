import test from 'node:test';
import assert from 'node:assert/strict';
import { GitHubClient } from '../packages/integrations-github/src/client.js';
import { verifyMission } from '../packages/verification/src/engine.js';

function fakeFetch(routes) {
  return async url => {
    const key = new URL(url).pathname;
    const body = routes[key];
    if (!body) return { ok:false, status:404, async json(){ return {}; } };
    return { ok:true, status:200, async json(){ return body; } };
  };
}

test('merged GitHub PR can satisfy configured criterion', async () => {
  const client = new GitHubClient({ token:'test', fetchImpl:fakeFetch({
    '/repos/acme/app/pulls/7': { state:'closed', merged:true, merge_commit_sha:'abc' }
  })});
  const result = await verifyMission({ id:'gh1', repository:'.', criteria:[
    { id:'pr', type:'githubPrMerged', owner:'acme', repo:'app', pullNumber:7 }
  ]}, { githubClient:client });
  assert.equal(result.verifiedStatus,'VERIFIED');
});

test('GitHub unavailable never silently passes', async () => {
  const result = await verifyMission({ id:'gh2', repository:'.', criteria:[
    { id:'pr', type:'githubPrMerged', owner:'acme', repo:'app', pullNumber:7 }
  ]});
  assert.equal(result.verifiedStatus,'INCOMPLETE');
});

test('successful combined status passes', async () => {
  const client = new GitHubClient({ token:'test', fetchImpl:fakeFetch({
    '/repos/acme/app/commits/abc/status': { state:'success', total_count:3 }
  })});
  const result = await verifyMission({ id:'gh3', repository:'.', criteria:[
    { id:'ci', type:'githubStatusSuccess', owner:'acme', repo:'app', sha:'abc' }
  ]}, { githubClient:client });
  assert.equal(result.verifiedStatus,'VERIFIED');
});
