import test from 'node:test';
import assert from 'node:assert/strict';
import { csrfForSession, getCookie, normalizeEmail, passwordHash, passwordMatches, randomSecret, secureEquals, sha256 } from './security';

test('passwords use a verifiable slow hash, not plaintext', async () => {
  const hash = await passwordHash('senhaforte123!');
  assert.notEqual(hash, 'senhaforte123!');
  assert.equal(await passwordMatches('senhaforte123!', hash), true);
  assert.equal(await passwordMatches('senhaerrada', hash), false);
});
test('CSRF binds to its own session and cookie extraction is exact', () => {
  const secret = randomSecret();
  assert.equal(secureEquals(csrfForSession('a', secret), csrfForSession('a', secret)), true);
  assert.equal(secureEquals(csrfForSession('a', secret), csrfForSession('b', secret)), false);
  assert.equal(getCookie('other=abc; cf_session=xyz; foo=a', 'cf_session'), 'xyz');
  assert.equal(getCookie('cf_session_bad=xyz', 'cf_session'), null);
});
test('tokens are cryptographic and emails are normalized', () => {
  const a = randomSecret();
  const b = randomSecret();
  assert.notEqual(a,b);
  assert.equal(sha256(a).length, 64);
  assert.equal(normalizeEmail(' TEST@Example.COM '), 'test@example.com');
});
