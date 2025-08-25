import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
const { Strategy } = require('passport-keycloak-bearer');

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(private configService: ConfigService) {
    super({
      realm: configService.get<string>('KEYCLOAK_REALM'),
      url: configService.get<string>('KEYCLOAK_URL'),
      clientID: configService.get<string>('KEYCLOAK_CLIENT_ID'),
      clientSecret: configService.get<string>('KEYCLOAK_CLIENT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: payload.realm_access?.roles || [],
      groups: payload.groups || [],
      clientRoles: payload.resource_access || {},
    };
  }
}