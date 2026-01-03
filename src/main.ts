import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, ConsoleLogger } from '@nestjs/common';
import { AppModule } from './app.module';

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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  const logger = new Logger('Bootstrap');
  logger.log(`🚪 Gateway Service is running on: http://localhost:${port}/api`);
}

bootstrap();

