import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';
import { AppService } from './app.service';

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
    };
  }
}

