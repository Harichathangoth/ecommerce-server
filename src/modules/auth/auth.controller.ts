import { Controller, Post, Get, Body, Res, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AUTH_COOKIES, AUTH_TOKEN_EXPIRATION } from './constants/auth.constants';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(response: FastifyReply, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';

    // Access Token Cookie (15 minutes)
    response.setCookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_TOKEN_EXPIRATION.ACCESS_TOKEN_SECONDS,
    });

    // Refresh Token Cookie (7 days)
    response.setCookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_TOKEN_EXPIRATION.REFRESH_TOKEN_SECONDS,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user & set secure HTTP-Only JWT cookies (access & refresh)' })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }
    const authResult = await this.authService.login(user);

    this.setAuthCookies(response, authResult.access_token, authResult.refresh_token);

    return {
      user: authResult.user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access_token using HTTP-Only refresh_token cookie' })
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const refreshToken = request.cookies?.[AUTH_COOKIES.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const authResult = await this.authService.refreshTokens(refreshToken);

    this.setAuthCookies(response, authResult.access_token, authResult.refresh_token);

    return {
      user: authResult.user,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user & clear HTTP-Only JWT cookies' })
  async logout(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie(AUTH_COOKIES.ACCESS_TOKEN, { path: '/' });
    response.clearCookie(AUTH_COOKIES.REFRESH_TOKEN, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user session' })
  async getProfile(@Req() req: FastifyRequest) {
    return { user: (req as any).user };
  }
}
