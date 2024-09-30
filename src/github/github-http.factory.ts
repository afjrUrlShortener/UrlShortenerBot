import { Inject, Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from '../app.config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class GitHubHttpFactory implements HttpModuleOptionsFactory {
  private readonly _configService: ConfigService<IAppConfig>;
  private readonly _cache: Cache;
  private readonly _jwtService: JwtService;

  constructor(
    configService: ConfigService<IAppConfig>,
    @Inject(CACHE_MANAGER) cache: Cache,
    jwtService: JwtService,
  ) {
    this._jwtService = jwtService;
    this._cache = cache;
    this._configService = configService;
  }

  private readonly _baseUrl = 'https://api.github.com/';
  private readonly _defaultHeader = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  async createHttpOptions(): Promise<HttpModuleOptions> {
    let installationAccessToken = await this._cache.get<string>(
      'INSTALLATION_ACCESS_TOKEN',
    );
    if (!installationAccessToken) {
      const installationId = this._configService.get('gitHubAppInstallationId');
      const rsaSignedToken = this._jwtService.sign('');
      const response = await axios.post<{ token: string }>(
        `app/installations/${installationId}/access_tokens`,
        '',
        {
          baseURL: this._baseUrl,
          headers: {
            ...this._defaultHeader,
            Authorization: `Bearer ${rsaSignedToken}`,
          },
        },
      );

      installationAccessToken = response.data.token;
      await this._cache.set(
        'INSTALLATION_ACCESS_TOKEN',
        installationAccessToken,
        3_600_000,
      );
    }

    return {
      baseURL: this._baseUrl,
      timeout: 5000,
      headers: {
        ...this._defaultHeader,
        Authorization: `Bearer ${installationAccessToken}`,
      },
    };
  }
}
