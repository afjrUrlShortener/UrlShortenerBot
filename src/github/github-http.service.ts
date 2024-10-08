import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GitHubHttpService {
  private readonly _logger = new Logger();
  private readonly _cache: Cache;
  private readonly _jwtService: JwtService;
  private readonly _httpService: HttpService;

  constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    jwtService: JwtService,
    httpService: HttpService
  ) {
    this._cache = cache;
    this._jwtService = jwtService;
    this._httpService = httpService;
  }

  private async getInstallationAccessToken(installationId: number) {
    let installationAccessToken = await this._cache.get<string>(
      `INSTALLATION_ACCESS_TOKEN_${installationId}`
    );
    if (installationAccessToken) return installationAccessToken;

    const rsaSignedToken = this._jwtService.sign({});
    const response = await this._httpService.axiosRef.post<{ token: string }>(
      `app/installations/${installationId}/access_tokens`,
      null,
      {
        headers: {
          Authorization: `Bearer ${rsaSignedToken}`,
        },
      }
    );

    installationAccessToken = response.data.token;
    await this._cache.set(
      `INSTALLATION_ACCESS_TOKEN_${installationId}`,
      installationAccessToken,
      3_600_000
    );

    return installationAccessToken;
  }

  private async request<Request, Response>(
    installationId: number,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: Request
  ) {
    const installationAccessToken =
      await this.getInstallationAccessToken(installationId);
    const config: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${installationAccessToken}` },
    };
    switch (method) {
      case 'GET':
        this._logger.debug(`Processing GET on ${url}`);
        return this._httpService.axiosRef.get<Response>(url, config);
      case 'POST':
        this._logger.debug(`Processing POST on ${url} with ${data}`);
        return this._httpService.axiosRef.post<Response>(url, data, config);
      case 'PUT':
        this._logger.debug(`Processing PUT on ${url} with ${data}`);
        return this._httpService.axiosRef.put<Response>(url, data, config);
      case 'DELETE':
        this._logger.debug(`Processing DELETE on ${url}`);
        return this._httpService.axiosRef.delete<Response>(url, config);
    }
  }

  public get<Response>(installationId: number, url: string) {
    return this.request<undefined, Response>(installationId, 'GET', url);
  }

  public post<Request, Response>(
    installationId: number,
    url: string,
    data?: Request
  ) {
    return this.request<Request, Response>(installationId, 'POST', url, data);
  }

  public put<Request, Response>(
    installationId: number,
    url: string,
    data?: Request
  ) {
    return this.request<Request, Response>(installationId, 'PUT', url, data);
  }

  public delete<Response>(installationId: number, url: string) {
    return this.request<undefined, Response>(installationId, 'DELETE', url);
  }
}
