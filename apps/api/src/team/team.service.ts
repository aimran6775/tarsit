import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InviteTeamMemberDto, UpdateTeamMemberDto } from './dto';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Invite a team member to a business
   */
  async inviteTeamMember(
    ownerId: string,
    businessId: string,
    dto: InviteTeamMemberDto,
  ) {
    // Verify the user is the business owner
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== ownerId) {
      throw new ForbiddenException('Only the business owner can invite team members');
    }

    // Find the user to invite
    const invitee = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!invitee) {
      throw new NotFoundException('User with this email not found. They must register first.');
    }

    // Check if user is already a team member
    const existingMember = await this.prisma.teamMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: invitee.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a team member');
    }

    // Cannot invite the owner as a team member
    if (invitee.id === ownerId) {
      throw new BadRequestException('Cannot invite yourself as a team member');
    }

    // Create the team member
    const teamMember = await this.prisma.teamMember.create({
      data: {
        businessId,
        userId: invitee.id,
        role: dto.role,
        canManageChat: dto.canManageChat ?? false,
        canManageHours: dto.canManageHours ?? false,
        canManageDescription: dto.canManageDescription ?? false,
        canManagePhotos: dto.canManagePhotos ?? false,
        canManageServices: dto.canManageServices ?? false,
        canManageAppointments: dto.canManageAppointments ?? false,
        canViewAnalytics: dto.canViewAnalytics ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get the list of permissions for the email
    const permissions: string[] = [];
    if (dto.canManageChat) permissions.push('Manage Chat');
    if (dto.canManageHours) permissions.push('Manage Business Hours');
    if (dto.canManageDescription) permissions.push('Manage Description');
    if (dto.canManagePhotos) permissions.push('Manage Photos');
    if (dto.canManageServices) permissions.push('Manage Services');
    if (dto.canManageAppointments) permissions.push('Manage Appointments');
    if (dto.canViewAnalytics) permissions.push('View Analytics');

    // Send invitation email
    try {
      await this.mailService.sendTeamInvitation(
        invitee.email,
        invitee.firstName,
        business.name,
        `${business.owner.firstName} ${business.owner.lastName}`,
        dto.role,
        permissions.length > 0 ? permissions : ['Limited Access'],
      );
    } catch (error) {
      console.error('Failed to send team invitation email:', error);
    }

    return teamMember;
  }

  /**
   * Get all team members for a business
   */
  async getTeamMembers(userId: string, businessId: string) {
    // Verify access (owner or team member with any permission)
    const hasAccess = await this.verifyBusinessAccess(userId, businessId);
    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to view team members');
    }

    const teamMembers = await this.prisma.teamMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return teamMembers;
  }

  /**
   * Update a team member's permissions
   */
  async updateTeamMember(
    ownerId: string,
    businessId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
  ) {
    // Verify the user is the business owner
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== ownerId) {
      throw new ForbiddenException('Only the business owner can update team members');
    }

    // Find the team member
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.businessId !== businessId) {
      throw new NotFoundException('Team member not found');
    }

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Remove a team member from a business
   */
  async removeTeamMember(ownerId: string, businessId: string, memberId: string) {
    // Verify the user is the business owner
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== ownerId) {
      throw new ForbiddenException('Only the business owner can remove team members');
    }

    // Find the team member
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.businessId !== businessId) {
      throw new NotFoundException('Team member not found');
    }

    await this.prisma.teamMember.delete({
      where: { id: memberId },
    });

    return { message: 'Team member removed successfully' };
  }

  /**
   * Accept a team invitation (update acceptedAt timestamp)
   */
  async acceptInvitation(userId: string, businessId: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
    });

    if (!teamMember) {
      throw new NotFoundException('Team invitation not found');
    }

    if (teamMember.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }

    return this.prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { acceptedAt: new Date() },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Get businesses where user is a team member
   */
  async getMyTeamMemberships(userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships;
  }

  /**
   * Verify if a user has access to a business (owner or team member)
   */
  async verifyBusinessAccess(userId: string, businessId: string): Promise<boolean> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) return false;

    // Owner always has access
    if (business.ownerId === userId) return true;

    // Check if user is an active team member
    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
    });

    return teamMember?.active ?? false;
  }

  /**
   * Check if user has specific permission for a business
   */
  async hasPermission(
    userId: string,
    businessId: string,
    permission: 'canManageChat' | 'canManageHours' | 'canManageDescription' | 
      'canManagePhotos' | 'canManageServices' | 'canManageAppointments' | 'canViewAnalytics',
  ): Promise<boolean> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) return false;

    // Owner has all permissions
    if (business.ownerId === userId) return true;

    // Check team member's specific permission
    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
    });

    if (!teamMember || !teamMember.active) return false;

    // Manager role has all permissions
    if (teamMember.role === 'MANAGER') return true;

    // Check specific permission
    return teamMember[permission] ?? false;
  }
}
