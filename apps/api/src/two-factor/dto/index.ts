import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class EnableTwoFactorDto {
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class VerifyTwoFactorDto {
  @IsString()
  @Length(6, 8) // 6 for TOTP, 8 for backup codes
  code!: string;

  @IsOptional()
  @IsBoolean()
  isBackupCode?: boolean;
}

export class DisableTwoFactorDto {
  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  password!: string;
}
