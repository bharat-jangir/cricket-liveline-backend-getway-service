import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { MainAppService } from '../services/main-app.service';
import { Public } from './public.decorator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password: string;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;

@Controller('auth')
export class AuthController {
  private readonly attempts = new Map<string, { count: number; reset: number }>();

  constructor(private readonly mainApp: MainAppService) {}

  private throttle(ip: string) {
    const now = Date.now();
    const rec = this.attempts.get(ip);
    if (!rec || rec.reset < now) {
      this.attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
      return;
    }
    rec.count++;
    if (rec.count > MAX_PER_IP) {
      throw new HttpException('Too many login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    this.throttle(req.ip || 'unknown');
    const result = await this.mainApp.send('auth.login', { email: dto.email, password: dto.password });
    if (!result?.ok) {
      throw new HttpException(result?.message || 'Login failed', result?.statusCode || HttpStatus.UNAUTHORIZED);
    }
    return { status: true, statusCode: 200, userMessage: 'Login successful', data: { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user } };
  }

  /** Returns the authenticated user (validates the token end to end). */
  @Get('me')
  me(@Req() req: any) {
    return { status: true, statusCode: 200, data: { user: req.user } };
  }
}
