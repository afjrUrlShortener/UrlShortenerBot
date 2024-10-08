import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from '../../app.config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class GitHubJwtFactory implements JwtOptionsFactory {
  private readonly _configService: ConfigService<IAppConfig>;

  constructor(configService: ConfigService<IAppConfig>) {
    this._configService = configService;
  }

  createJwtOptions(): JwtModuleOptions {
    const rsaPrivateKey = this._configService.get<string>('gitHubPrivateKey');
    const applicationId = this._configService.get<string>('gitHubAppId');

    return {
      privateKey: rsaPrivateKey,
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '10m',
        issuer: applicationId,
      },
    };
  }
}
