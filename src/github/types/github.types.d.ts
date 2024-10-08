export type GetGitHubIssueComments = {
  body: string;
  updated_at: string;
  performed_via_github_app?: {
    name: string;
  };
}[];

export type GetGitHubIssueLabels = {
  name: string;
}[];

export type PullRequestRest = {
  installationId: number;
  ownerLogin: string;
  repositoryName: string;
  pullRequestNumber: number;
};
