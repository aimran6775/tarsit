import {
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TeamRole {
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export class InviteTeamMemberDto {
  @ApiProperty({ description: 'Email of the team member to invite' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: TeamRole, description: 'Role of the team member' })
  @IsEnum(TeamRole)
  role!: TeamRole;

  @ApiPropertyOptional({ description: 'Permission to manage chat' })
  @IsBoolean()
  @IsOptional()
  canManageChat?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage business hours' })
  @IsBoolean()
  @IsOptional()
  canManageHours?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage description' })
  @IsBoolean()
  @IsOptional()
  canManageDescription?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage photos' })
  @IsBoolean()
  @IsOptional()
  canManagePhotos?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage services' })
  @IsBoolean()
  @IsOptional()
  canManageServices?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage appointments' })
  @IsBoolean()
  @IsOptional()
  canManageAppointments?: boolean;

  @ApiPropertyOptional({ description: 'Permission to view analytics' })
  @IsBoolean()
  @IsOptional()
  canViewAnalytics?: boolean;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ enum: TeamRole, description: 'Role of the team member' })
  @IsEnum(TeamRole)
  @IsOptional()
  role?: TeamRole;

  @ApiPropertyOptional({ description: 'Permission to manage chat' })
  @IsBoolean()
  @IsOptional()
  canManageChat?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage business hours' })
  @IsBoolean()
  @IsOptional()
  canManageHours?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage description' })
  @IsBoolean()
  @IsOptional()
  canManageDescription?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage photos' })
  @IsBoolean()
  @IsOptional()
  canManagePhotos?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage services' })
  @IsBoolean()
  @IsOptional()
  canManageServices?: boolean;

  @ApiPropertyOptional({ description: 'Permission to manage appointments' })
  @IsBoolean()
  @IsOptional()
  canManageAppointments?: boolean;

  @ApiPropertyOptional({ description: 'Permission to view analytics' })
  @IsBoolean()
  @IsOptional()
  canViewAnalytics?: boolean;

  @ApiPropertyOptional({ description: 'Whether team member is active' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
