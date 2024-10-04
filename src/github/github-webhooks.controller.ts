import { Body, Controller, Post, Headers, Logger } from '@nestjs/common';
import { WebhookEvent, WebhookEventName } from '@octokit/webhooks-types';
import { GitHubWebhooksService } from './github-webhooks.service';

@Controller({ version: '1', path: 'github/webhooks' })
export class GitHubWebhooksController {
  private readonly _logger = new Logger();
  private readonly _gitHubHttpService: GitHubWebhooksService;

  constructor(gitHubHttpService: GitHubWebhooksService) {
    this._gitHubHttpService = gitHubHttpService;
  }

  @Post()
  async handleGitHubEvent(
    @Headers('X-GitHub-Event') webhookEventName: WebhookEventName,
    @Body() body: WebhookEvent
  ) {
    //TODO: Implement logic for github app
    if (webhookEventName === 'issues' && 'action' in body && 'issue' in body) {
      switch (body.action) {
        case 'created':
        case 'edited':
        case 'opened':
        case 'reopened':
          // const owner = body.repository.owner.login;
          // const repository = body.repository.name;
          // const issue = body.issue.id;

          const isTitleValid = this._gitHubHttpService.checkIssueTitle(body);
          // todo: check if contains bot comment
          if (!isTitleValid) {
            await this._gitHubHttpService.createIssueComment(
              body,
              'Invalid title, please fix.'
            );
          }
          break;

        default:
          this._logger.debug(`Unhandled action: ${body.action}`);
          break;
      }
    } else {
      this._logger.debug(`Unhandled event: ${webhookEventName}`);
    }
  }
}
