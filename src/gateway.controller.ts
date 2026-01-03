import { Controller, All, Req } from '@nestjs/common';
import { Request } from 'express';
import { GatewayService } from './gateway.service';

@Controller('*')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async proxy(@Req() req: Request) {
    // Remove @Res() to allow ResponseInterceptor to work
    return this.gatewayService.proxyRequest(req);
  }
}

