import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers["authorization"];

    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing token");
    }

    const token = header.slice(7);
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>("JWT_SECRET", "dev_secret"),
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
