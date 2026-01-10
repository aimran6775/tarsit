import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DisableTwoFactorDto, EnableTwoFactorDto, VerifyTwoFactorDto } from './dto';
import { TwoFactorService } from './two-factor.service';

@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('status')
  async getStatus(@Req() req: any) {
    return this.twoFactorService.getStatus(req.user.id);
  }

  @Post('setup')
  async setup(@Req() req: any) {
    return this.twoFactorService.setup(req.user.id);
  }

  @Post('enable')
  async enable(@Body() dto: EnableTwoFactorDto, @Req() req: any) {
    return this.twoFactorService.enable(req.user.id, dto.code);
  }

  @Post('verify')
  async verify(@Body() dto: VerifyTwoFactorDto, @Req() req: any) {
    return this.twoFactorService.verify(req.user.id, dto.code, dto.isBackupCode);
  }

  @Delete('disable')
  async disable(@Body() dto: DisableTwoFactorDto, @Req() req: any) {
    await this.twoFactorService.disable(req.user.id, dto.code);
    return { message: 'Two-factor authentication disabled' };
  }

  @Post('regenerate-backup-codes')
  async regenerateBackupCodes(@Body() dto: EnableTwoFactorDto, @Req() req: any) {
    return this.twoFactorService.regenerateBackupCodes(req.user.id, dto.code);
  }
}
