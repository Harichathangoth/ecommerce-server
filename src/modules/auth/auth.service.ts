import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && user.password === pass) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating credentials for email "${email}": ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error validating authentication credentials');
    }
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.slug || 'super_admin',
      branchId: user.branchId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'enterprise_super_secret_jwt_key_2026',
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'opera_super_secret_refresh_jwt_key_2026',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(user: any) {
    try {
      const tokens = await this.generateTokens(user);
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          branchId: user.branchId,
        },
      };
    } catch (error) {
      this.logger.error(`Error generating login JWT session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate user session token');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'opera_super_secret_refresh_jwt_key_2026',
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      const tokens = await this.generateTokens(user);
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          branchId: user.branchId,
        },
      };
    } catch (error) {
      this.logger.error(`Invalid or expired refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh session token');
    }
  }
}
