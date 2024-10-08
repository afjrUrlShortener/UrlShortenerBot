import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GitHubWebhooksController } from './github-webhooks.controller';
import { GitHubHttpFactory } from './option-factories/github-http.factory';
import { JwtModule } from '@nestjs/jwt';
import { GitHubJwtFactory } from './option-factories/github-jwt.factory';
import { GitHubHttpService } from './github-http.service';
import { GithubPullRequestService } from './github-pull-request.service';

@Module({
  imports: [
    JwtModule.registerAsync({ useClass: GitHubJwtFactory }),
    HttpModule.registerAsync({ useClass: GitHubHttpFactory }),
  ],
  providers: [GitHubHttpService, GithubPullRequestService],
  controllers: [GitHubWebhooksController],
})
export class GitHubModule {}
