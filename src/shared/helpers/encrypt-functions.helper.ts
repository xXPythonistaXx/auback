import * as crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

export function encrypt(plainText: string, secret: string) {
  const secretBuffer = crypto
    .createHash('sha256')
    .update(String(secret))
    .digest('base64')
    .substring(0, 32);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretBuffer),
    iv,
  );
  let encrypted = cipher.update(plainText);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string, secret: string) {
  const secretBuffer = crypto
    .createHash('sha256')
    .update(String(secret))
    .digest('base64')
    .substring(0, 32);
  const textParts = encryptedText.split(':');
  const decIv = Buffer.from(textParts.shift(), 'hex');
  const encryptedTextBuffer = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretBuffer),
    decIv,
  );
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function compare(
  plainText: string,
  encryptedText: string,
  secret: string,
) {
  const decrypted = decrypt(encryptedText, secret);
  return plainText === decrypted;
}
