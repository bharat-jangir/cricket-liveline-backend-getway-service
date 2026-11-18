import { HttpException, Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class MainAppService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;
  private readonly logger = new Logger(MainAppService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get('MAIN_APP_HOST') || '127.0.0.1';
    const port = parseInt(this.configService.get('MAIN_APP_TCP_PORT') || '3001');
    
    this.logger.log(`Initializing TCP client for main-app at ${host}:${port}`);
    
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    });
  }

  async onModuleInit() {
    // Don't block gateway start-up on the main app: it may still be booting (watch mode,
    // docker-compose, etc). Keep retrying in the background until it is reachable.
    void this.connectWithRetry();
  }

  private async connectWithRetry(maxAttempts = 30, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.client.connect();
        this.logger.log('Successfully connected to main-app TCP service');
        return;
      } catch (error: any) {
        if (attempt === 1 || attempt % 5 === 0) {
          this.logger.warn(`main-app not reachable yet (attempt ${attempt}/${maxAttempts}): ${error?.message || error}`);
        }
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    this.logger.error('Giving up on eager main-app connection; it will be retried on the next request');
  }

  async onModuleDestroy() {
    this.client.close();
  }

  /** Like send(), but converts a { status:false, statusCode } failure envelope into a real HTTP error. */
  async sendOrThrow(pattern: string, data: any): Promise<any> {
    const res = await this.send(pattern, data);
    if (res && res.status === false) {
      throw new HttpException(res.userMessage || res.message || 'Request failed', res.statusCode || 400);
    }
    return res;
  }

  getClient(): ClientProxy {
    return this.client;
  }

  async send(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(this.client.send(pattern, data).pipe(timeout(20000)));
    } catch (error: any) {
      this.logger.error(`Error sending message to main-app - Pattern: ${pattern}`);
      this.logger.error(`Data: ${JSON.stringify(data)}`);
      this.logger.error(`Error Message: ${error?.message || error}`);
      throw error;
    }
  }
}

