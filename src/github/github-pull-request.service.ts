import { Injectable } from '@nestjs/common';
import { GitHubHttpService } from './github-http.service';
import { PullRequestEvent } from '@octokit/webhooks-types';
import * as assert from 'node:assert';
import {
  GetGitHubIssueComments,
  GetGitHubIssueLabels,
  PullRequestRest,
} from './types/github.types';

@Injectable()
export class GithubPullRequestService {
  private readonly _gitHubHttpService: GitHubHttpService;

  constructor(gitHubHttpService: GitHubHttpService) {
    this._gitHubHttpService = gitHubHttpService;
  }

  private checkIfPullRequestTitleIsValid(title: string) {
    if (title.slice(0, 8) === 'feature:' || title.slice(0, 9) === 'feature!:') {
      return true;
    }

    if (title.slice(0, 4) === 'fix:' || title.slice(0, 5) === 'fix!:') {
      return true;
    }

    return false;
  }

  private async checkIfLastPullRequestBotCommentEqualsTo(
    params: PullRequestRest,
    comment: string
  ) {
    const response = await this._gitHubHttpService.get<GetGitHubIssueComments>(
      params.installationId,
      `repos/${params.ownerLogin}/${params.repositoryName}/issues/${params.pullRequestNumber}/comments`
    );

    const filteredComments = response.data.filter(
      x => x.performed_via_github_app?.name === 'UrlShortenerBot'
    );

    const lastBotComment = filteredComments.pop();
    return lastBotComment?.body === comment;
  }

  private async checkIfPullRequestContainsLabels(
    params: PullRequestRest,
    labels: string[]
  ) {
    const response = await this._gitHubHttpService.get<GetGitHubIssueLabels>(
      params.installationId,
      `repos/${params.ownerLogin}/${params.repositoryName}/issues/${params.pullRequestNumber}/labels`
    );

    return response.data.some(x => labels.includes(x.name));
  }

  private commentInPullRequest(params: PullRequestRest, comment: string) {
    return this._gitHubHttpService.post(
      params.installationId,
      `repos/${params.ownerLogin}/${params.repositoryName}/issues/${params.pullRequestNumber}/comments`,
      { body: comment }
    );
  }

  private addPullRequestLabels(params: PullRequestRest, labels: string[]) {
    return this._gitHubHttpService.post(
      params.installationId,
      `repos/${params.ownerLogin}/${params.repositoryName}/issues/${params.pullRequestNumber}/labels`,
      { labels: labels }
    );
  }

  private removePullRequestLabel(params: PullRequestRest, labelName: string) {
    return this._gitHubHttpService.delete(
      params.installationId,
      `repos/${params.ownerLogin}/${params.repositoryName}/issues/${params.pullRequestNumber}/labels/${labelName}`
    );
  }

  public async handleEvent(body: PullRequestEvent, actions: string[]) {
    assert.ok(body.installation?.id, 'Missing installation id');
    assert.strictEqual(actions.length > 0, true, 'Missing actions');

    if (!actions.includes(body.action)) return body.action;

    const restProperties: PullRequestRest = {
      installationId: body.installation.id,
      ownerLogin: body.repository.owner.login,
      repositoryName: body.repository.name,
      pullRequestNumber: body.pull_request.number,
    };

    const isTitleValid = this.checkIfPullRequestTitleIsValid(
      body.pull_request.title
    );

    if (isTitleValid) {
      const validTitleComment = 'Pull request ready for review.';
      const containsValidTitleComment =
        await this.checkIfLastPullRequestBotCommentEqualsTo(
          restProperties,
          validTitleComment
        );
      if (!containsValidTitleComment) {
        await this.commentInPullRequest(restProperties, validTitleComment);
      }

      const containsInvalidLabels = await this.checkIfPullRequestContainsLabels(
        restProperties,
        ['invalid']
      );
      if (containsInvalidLabels) {
        await this.removePullRequestLabel(restProperties, 'invalid');
      }

      return;
    } else {
      const invalidTitleComment = 'Invalid title, please fix.';
      const containsInvalidTitleComment =
        await this.checkIfLastPullRequestBotCommentEqualsTo(
          restProperties,
          invalidTitleComment
        );
      if (!containsInvalidTitleComment) {
        await this.commentInPullRequest(restProperties, invalidTitleComment);
      }
    }

    const containsInvalidLabels = await this.checkIfPullRequestContainsLabels(
      restProperties,
      ['invalid']
    );
    if (!containsInvalidLabels) {
      await this.addPullRequestLabels(restProperties, ['invalid']);
    }
  }
}
