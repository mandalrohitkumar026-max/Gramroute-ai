import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getCookieOptions
} from '../utils/jwt';

describe('JWT Utility Service', () => {
  const testPayload = {
    userId: '65f123456789abcdef012345',
    role: 'FARMER',
    phoneNumber: '+919876543210'
  };

  it('signs and verifies a valid access token', () => {
    const token = signAccessToken(testPayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(testPayload.userId);
    expect(decoded.role).toBe(testPayload.role);
    expect(decoded.phoneNumber).toBe(testPayload.phoneNumber);
  });

  it('signs and verifies a valid refresh token', () => {
    const refreshToken = signRefreshToken({ userId: testPayload.userId });
    expect(typeof refreshToken).toBe('string');

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(testPayload.userId);
  });

  it('generates consistent SHA-256 hash for raw token', () => {
    const rawToken = 'my_secure_random_refresh_token_string';
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 produces 64 hex characters
  });

  it('fails verification on tampered access token', () => {
    const token = signAccessToken(testPayload);
    const tampered = token.slice(0, -5) + 'abcde';

    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('configures secure cookie attributes correctly', () => {
    const options = getCookieOptions(3600000);
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe('/');
    expect(options.maxAge).toBe(3600000);
  });
});
