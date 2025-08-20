import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');

export async function createSession(userId: string) {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);

  return jwt;
}

export async function verifySession(jwt: string) {
  try {
    const { payload } = await jwtVerify(jwt, secret);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}