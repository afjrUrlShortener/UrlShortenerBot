import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WebhookEvent } from '@octokit/webhooks-types';

@Injectable()
export class GitHubWebhooksService {
  private readonly _logger = new Logger();
  private readonly _httpService: HttpService;

  constructor(httpService: HttpService) {
    this._httpService = httpService;
  }

  checkIssueTitle(body: WebhookEvent): boolean {
    if (!('issue' in body)) return false;
    return new RegExp(/^(feature!?:|fix!?:)\b/g).test(body.issue.title);
  }

  async checkIssueComment(
    body: WebhookEvent,
    comment: string,
  ): Promise<boolean> {
    if (!('issue' in body)) return false;
    const owner = body.repository.owner.login;
    const repository = body.repository.name;
    const issue = body.issue.id;

    const response = await this._httpService.axiosRef.get<{ body: string }[]>(
      `repos/${owner}/${repository}/issues/${issue}/comments`,
    );

    const { status } = response;
    if (status !== 200 && status !== 201 && status !== 204) {
      this._logger.error('Failed to get issue comment', body);
      return false;
    }

    return response.data.some((x) => x.body === comment);
  }

  async createIssueComment(body: WebhookEvent, comment: string) {
    if (!('issue' in body)) return;
    const owner = body.repository.owner.login;
    const repository = body.repository.name;
    const issue = body.issue.id;

    await this._httpService.axiosRef.post(
      `repos/${owner}/${repository}/issues/${issue}/comments`,
      { body: comment },
    );
  }

  async addIssueLabels(body: WebhookEvent, labels: string[]) {
    if (!('issue' in body)) return;
    const owner = body.repository.owner.login;
    const repository = body.repository.name;
    const issue = body.issue.id;

    await this._httpService.axiosRef.post(
      `repos/${owner}/${repository}/issues/${issue}/labels`,
      { labels: labels },
    );
  }
}
