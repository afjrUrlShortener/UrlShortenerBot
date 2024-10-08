import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  const configuration = app.get(ConfigService<IAppConfig>);
  const logLevel = configuration.get<LogLevel[]>('logLevel')!;
  app.useLogger(logLevel);

  const port = configuration.get<number>('port')!;
  await app.listen(port);
  const logger = new Logger();
  logger.log(`Application running at ${await app.getUrl()}`);
}

bootstrap().finally();
