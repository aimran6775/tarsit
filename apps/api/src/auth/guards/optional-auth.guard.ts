import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalAuthGuard - Allows both authenticated and unauthenticated requests
 * If a valid JWT is provided, req.user will be populated
 * If no JWT or invalid JWT, req.user will be undefined (not an error)
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Call the parent AuthGuard but catch any errors
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any) {
        // Don't throw an error for unauthenticated requests
        // Just return null/undefined for user
        if (err || !user) {
            return null;
        }
        return user;
    }
}
