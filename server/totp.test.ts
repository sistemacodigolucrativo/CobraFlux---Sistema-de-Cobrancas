import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { base32Encode, createTotpSecret, decryptTotpSecret, encryptTotpSecret, matchTotpStep, totpCode } from './totp';

test('TOTP matches RFC 6238 SHA1 vector (six digits) and rejects wrong codes',()=>{
  const secret=base32Encode(Buffer.from('12345678901234567890'));
  assert.equal(totpCode(secret,1),'287082');
  assert.equal(matchTotpStep(secret,'287082',59000),1);
  assert.equal(matchTotpStep(secret,'000000',59000),null);
  assert.equal(matchTotpStep(secret,'287082',300000),null);
});
test('TOTP secrets are encrypted with authenticated encryption',()=>{
  process.env.MFA_ENCRYPTION_KEY=randomBytes(32).toString('hex');
  const original=createTotpSecret();
  const encrypted=encryptTotpSecret(original);
  assert.notEqual(encrypted,original);
  assert.equal(decryptTotpSecret(encrypted),original);
  assert.throws(()=>decryptTotpSecret(encrypted.slice(0,-2)+'xx'));
});
