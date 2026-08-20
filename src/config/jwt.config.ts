import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'enterprise_super_secret_jwt_key_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));
