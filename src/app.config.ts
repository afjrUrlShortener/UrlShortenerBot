import * as process from 'node:process';
import { LogLevel } from '@nestjs/common';

export interface IAppConfig {
  port: number;
  logLevel: LogLevel[];
  gitHubAppId: string;
  gitHubAppInstallationId: number;
  gitHubPrivateKey: string;
  gitHubAppSecret: string;
}

export function config(): IAppConfig {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: (process.env.LOG_LEVEL?.toLowerCase().split(';') || [
      'error',
      'fatal',
    ]) as LogLevel[],
    gitHubAppId: process.env.GITHUB_APP_ID || '',
    gitHubAppInstallationId: parseInt(
      process.env.GITHUB_APP_INSTALLATION_ID || '0',
      10,
    ),
    gitHubPrivateKey: process.env.GITHUB_PRIVATE_KEY || '',
    gitHubAppSecret: process.env.GITHUB_APP_SECRET || '',
  };
}

export function configValidation(config: Record<string, any>) {
  const errors: string[] = [];

  if (!config['GITHUB_APP_ID']) {
    errors.push('Missing GITHUB_APP_ID');
  }

  if (!config['GITHUB_APP_INSTALLATION_ID']) {
    errors.push('Missing GITHUB_APP_INSTALLATION_ID');
  }

  if (!config['GITHUB_PRIVATE_KEY']) {
    errors.push('Missing GITHUB_PRIVATE_KEY');
  }

  if (!config['GITHUB_APP_SECRET']) {
    errors.push('Missing GITHUB_APP_SECRET');
  }

  if (errors.length > 0) {
    const formatedError = errors.join('\n');
    throw new Error('\n' + formatedError + '\n');
  }

  return config;
}
