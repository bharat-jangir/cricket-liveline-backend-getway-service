import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, ConsoleLogger } from '@nestjs/common';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

class CustomLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    // Suppress route mapping and dependency initialization logs
    if (
      context === 'RoutesResolver' ||
      context === 'RouterExplorer' ||
      context === 'InstanceLoader' ||
      message.includes('Mapped {') ||
      message.includes('dependencies initialized')
    ) {
      return;
    }
    super.log(message, context);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Add WebSocket Proxy routing to the dedicated Socket Service
  const socketProxy = createProxyMiddleware({
    target: process.env.SOCKET_SERVICE_URL || 'http://localhost:5002',
    changeOrigin: true,
    ws: true, // Proxy WebSockets
  });
  
  app.use('/socket.io', socketProxy);

  // Triggering Hot Reload manually
  const port = process.env.PORT || 5000;
  
  // Actually start the server and keep reference
  await app.listen(port, '0.0.0.0');
  
  // Attach the websocket upgrade handler from the proxy to the raw http server
  const server = app.getHttpServer();
  server.on('upgrade', (req, socket, head) => {
    const logger = new Logger('WebSocketProxy');
    logger.log(`Incoming WS upgrade request for: ${req.url}`);
    socketProxy.upgrade(req, socket, head);
  });

  
  const logger = new Logger('Bootstrap');
  logger.log(`🚪 Gateway Service is running on: http://localhost:${port}/api`);
}

bootstrap();
