import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Unauthorized - No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach user to socket for later use
      client.data.user = payload;

      return true;
    } catch (error) {
      throw new WsException('Unauthorized - Invalid token');
    }
  }

  private extractToken(client: Socket): string | undefined {
    // Check for token in handshake auth
    const token =
      client.handshake?.auth?.token || client.handshake?.headers?.authorization;

    if (token && token.startsWith('Bearer ')) {
      return token.substring(7);
    }

    return token;
  }
}
