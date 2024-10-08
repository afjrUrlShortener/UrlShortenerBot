import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GitHubModule } from './github/github.module';
import { ConfigModule } from '@nestjs/config';
import { config, configValidation } from './app.config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: configValidation,
    }),
    CacheModule.register({ isGlobal: true, store: 'memory' }),
    GitHubModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
