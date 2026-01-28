import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RequestMagicLinkDto, ResetPasswordDto, SignupDto, UpdateProfileDto, VerifyMagicLinkDto } from './dto';
import { SignupBusinessDto } from './dto/signup-business.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: process.env.NODE_ENV === 'production' ? 3 : 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user (customer)' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signup-business')
  @Throttle({ default: { limit: process.env.NODE_ENV === 'production' ? 3 : 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new business owner with their business' })
  @ApiResponse({ status: 201, description: 'User and business successfully registered' })
  @ApiResponse({ status: 409, description: 'Email, phone, or username already exists' })
  @ApiResponse({ status: 400, description: 'Invalid category or validation error' })
  async signupBusiness(@Body() dto: SignupBusinessDto) {
    return this.authService.signupBusiness(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: process.env.NODE_ENV === 'production' ? 5 : 100, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@Req() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user!.id);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user!.id);
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 409, description: 'Username or phone already taken' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user!.id, dto);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent if email exists' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }

  @Post('magic-link/request')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a magic link for passwordless login' })
  @ApiResponse({ status: 200, description: 'Magic link sent if email exists' })
  async requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @Post('magic-link/verify')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify magic link token and get session' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired magic link' })
  async verifyMagicLink(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.handleOAuthLogin(req.user);

    // Redirect to frontend with tokens in URL
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://improved-memory-p6vxppj655p37pgw-3001.app.github.dev';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;

    return res.redirect(redirectUrl);
  }

  @Post('oauth/sync')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync OAuth user from Supabase to local database' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Valid Supabase token required' })
  async syncOAuthUser(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      supabaseUserId: string;
      email: string;
      fullName?: string;
      avatarUrl?: string;
      provider?: string;
    }
  ) {
    // Verify the requesting user matches the sync request (prevent hijacking)
    if (req.user?.email && req.user.email !== body.email) {
      throw new UnauthorizedException('Cannot sync account for different email');
    }

    // Parse full name into first/last
    const nameParts = (body.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    return this.authService.handleOAuthLogin({
      providerId: body.supabaseUserId,
      provider: body.provider || 'google',
      email: body.email,
      firstName,
      lastName,
      avatar: body.avatarUrl,
    });
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user!.id);
  }

  @Delete('account')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user account (GDPR compliance)' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with active business' })
  async deleteAccount(
    @Req() req: AuthenticatedRequest,
    @Body() body: { confirmEmail: string; reason?: string }
  ) {
    return this.authService.deleteAccount(req.user!.id, body.confirmEmail, body.reason);
  }
}
