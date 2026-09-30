import crypto from 'node:crypto';
import fs from 'node:fs';

export function sha256File(filePath) {
  const hash=crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

export function verifyArtifact(filePath, expectedSha256) {
  const actual=sha256File(filePath);
  return { ok:actual === expectedSha256, actual, expected:expectedSha256 };
}

export function verifyManifestSignature(manifestJson, signatureBase64, publicKeyPem) {
  try {
    const signature=Buffer.from(signatureBase64,'base64');
    return crypto.verify(null, Buffer.from(manifestJson,'utf8'), publicKeyPem, signature);
  } catch {
    return false;
  }
}
