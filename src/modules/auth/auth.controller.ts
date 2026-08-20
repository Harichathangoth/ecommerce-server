import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user & set secure HTTP-Only JWT Cookie' })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }
    const authResult = await this.authService.login(user);

    // Set HTTP-Only Cookie
    response.setCookie('access_token', authResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return {
      user: authResult.user,
      access_token: authResult.access_token,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user & clear HTTP-Only JWT Cookie' })
  async logout(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
