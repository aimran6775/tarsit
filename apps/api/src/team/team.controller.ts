import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { TeamService } from './team.service';
import { InviteTeamMemberDto, UpdateTeamMemberDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('team')
@Controller('team')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('business/:businessId/invite')
  @ApiOperation({ summary: 'Invite a team member to a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async inviteTeamMember(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Body() dto: InviteTeamMemberDto,
  ) {
    return this.teamService.inviteTeamMember(req.user.id, businessId, dto);
  }

  @Get('business/:businessId/members')
  @ApiOperation({ summary: 'Get all team members for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getTeamMembers(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
  ) {
    return this.teamService.getTeamMembers(req.user.id, businessId);
  }

  @Put('business/:businessId/members/:memberId')
  @ApiOperation({ summary: 'Update a team member\'s permissions' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  async updateTeamMember(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamService.updateTeamMember(req.user.id, businessId, memberId, dto);
  }

  @Delete('business/:businessId/members/:memberId')
  @ApiOperation({ summary: 'Remove a team member from a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  async removeTeamMember(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamService.removeTeamMember(req.user.id, businessId, memberId);
  }

  @Post('business/:businessId/accept')
  @ApiOperation({ summary: 'Accept a team invitation' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async acceptInvitation(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: string,
  ) {
    return this.teamService.acceptInvitation(req.user.id, businessId);
  }

  @Get('my-memberships')
  @ApiOperation({ summary: 'Get businesses where current user is a team member' })
  async getMyTeamMemberships(@Request() req: AuthenticatedRequest) {
    return this.teamService.getMyTeamMemberships(req.user.id);
  }
}
