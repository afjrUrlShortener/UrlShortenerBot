import { Module } from '@nestjs/common';
import { GitHubWebhooksService } from './github-webhooks.service';
import { HttpModule } from '@nestjs/axios';
import { GitHubWebhooksController } from './github-webhooks.controller';
import { GitHubHttpFactory } from './github-http.factory';
import { JwtModule } from '@nestjs/jwt';
import { GitHubJwtFactory } from './github-jwt.factory';

@Module({
  imports: [
    JwtModule.registerAsync({ useClass: GitHubJwtFactory }),
    HttpModule.registerAsync({ useClass: GitHubHttpFactory }),
  ],
  providers: [GitHubWebhooksService],
  controllers: [GitHubWebhooksController],
})
export class GitHubModule {}
