import { signAccessToken, verifyAccessToken } from './jwt.util';

describe('JWT access tokens', () => {
  const originalSecret = process.env.JWT_SECRET;
  beforeEach(() => { process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long'; });
  afterAll(() => { if (originalSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = originalSecret; });

  it('signs and verifies a one-hour token', () => {
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' }, 1000);
    expect(verifyAccessToken(token, 1001)).toMatchObject({ sub: 'user-1', username: 'tester', role: 'USER', exp: 4600 });
  });

  it('rejects a modified token', () => {
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' }, 1000);
    expect(verifyAccessToken(token.replace('USER', 'ADMIN'))).toBeNull();
  });

  it('rejects expired tokens', () => {
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' }, 1000);
    expect(verifyAccessToken(token, 4600)).toBeNull();
  });

  it('fails closed when the signing secret is missing or too short', () => {
    process.env.JWT_SECRET = 'short';
    expect(() => signAccessToken({ id: 'u', username: 'u', role: 'USER' })).toThrow('JWT_SECRET');
  });
});
