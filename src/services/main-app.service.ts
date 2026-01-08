import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MainAppService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;
  private readonly logger = new Logger(MainAppService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get('MAIN_APP_HOST') || 'localhost';
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
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to main-app TCP service');
    } catch (error) {
      this.logger.error(`Failed to connect to main-app: ${error?.message || error}`);
    }
  }

  async onModuleDestroy() {
    this.client.close();
  }

  getClient(): ClientProxy {
    return this.client;
  }

  async send(pattern: string, data: any): Promise<any> {
    try {
      return await this.client.send(pattern, data).pipe().toPromise();
    } catch (error: any) {
      this.logger.error(`Error sending message to main-app - Pattern: ${pattern}`);
      this.logger.error(`Data: ${JSON.stringify(data)}`);
      this.logger.error(`Error Message: ${error?.message || error}`);
      throw error;
    }
  }
}

