import { Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';

@Injectable()
export class GitHubHttpFactory implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: 'https://api.github.com/',
      timeout: 5000,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
  }
}
