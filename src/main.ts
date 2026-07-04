import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
    const logLevels = configService.get<LogLevel[]>(
    'logging.levels',
    ['log', 'warn', 'error'],
  );
  app.useLogger(logLevels);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(
    `Application started on port:${configService.get<number>('app.port')}`,
  );
}
bootstrap();
