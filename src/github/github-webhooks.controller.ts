import { Body, Controller, Post, Headers, Logger } from '@nestjs/common';
import {
  PullRequestEvent,
  WebhookEvent,
  WebhookEventName,
} from '@octokit/webhooks-types';
import { GithubPullRequestService } from './github-pull-request.service';

@Controller({ version: '1', path: 'github/webhooks' })
export class GitHubWebhooksController {
  private readonly _logger = new Logger();
  private readonly _githubPullRequestService: GithubPullRequestService;

  constructor(githubPullRequestService: GithubPullRequestService) {
    this._githubPullRequestService = githubPullRequestService;
  }

  @Post()
  async handleEvent(
    @Headers('X-GitHub-Event') webhookEventName: WebhookEventName,
    @Body() eventBody: WebhookEvent
  ) {
    if (webhookEventName === 'pull_request') {
      const body = eventBody as PullRequestEvent;
      const unhandledAction = await this._githubPullRequestService.handleEvent(
        body,
        ['created', 'edited', 'opened', 'reopened']
      );

      if (!unhandledAction) return;
      this._logger.debug(`Unhandled action: ${unhandledAction}`);
    }

    this._logger.debug(`Unhandled event: ${webhookEventName}`);
  }
}
