import { hasValidImageSignature } from './upload.controller';

describe('hasValidImageSignature', () => {
  it('accepts JPEG bytes only for the JPEG MIME type', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    expect(hasValidImageSignature(jpeg, 'image/jpeg')).toBe(true);
    expect(hasValidImageSignature(jpeg, 'image/png')).toBe(false);
  });

  it('accepts the PNG file signature', () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    expect(hasValidImageSignature(png, 'image/png')).toBe(true);
    expect(hasValidImageSignature(png.subarray(0, 5), 'image/png')).toBe(false);
  });

  it('accepts RIFF/WEBP bytes for WebP uploads', () => {
    const webp = Buffer.from('RIFF0000WEBP', 'ascii');
    expect(hasValidImageSignature(webp, 'image/webp')).toBe(true);
    expect(hasValidImageSignature(webp, 'image/jpeg')).toBe(false);
  });

  it('rejects unsupported MIME types and empty content', () => {
    expect(hasValidImageSignature(Buffer.alloc(0), 'image/jpeg')).toBe(false);
    expect(hasValidImageSignature(Buffer.from('not an image'), 'text/plain')).toBe(
      false,
    );
  });
});
