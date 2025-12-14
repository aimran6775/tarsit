import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * AdminGuard - Ensures the user has admin or super_admin role
 * Must be used after JwtAuthGuard
 */
@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        const adminRoles = ['ADMIN', 'SUPER_ADMIN'];

        if (!adminRoles.includes(user.role)) {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}
