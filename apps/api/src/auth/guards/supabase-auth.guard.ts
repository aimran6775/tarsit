import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Fetch user from local DB using email
    // In a production app, we should sync IDs, but email is a good fallback for migration
    const dbUser = await this.prisma.user.findFirst({
        where: { 
            OR: [
                { email: user.email },
                { id: user.id } // Check if ID matches (if already synced)
            ]
        }
    });
    
    if (!dbUser) {
        // Optional: Create user if not exists (JIT provisioning)
        // This is useful if users sign up via Supabase directly
        // For now, we'll throw, but we could implement JIT creation here.
        throw new UnauthorizedException('User not found in local database');
    }

    request.user = dbUser;
    return true;
  }
}
