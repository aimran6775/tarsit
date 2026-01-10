import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VerificationRequestsService } from './verification-requests.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import {
  UpdateVerificationRequestDto,
  VerificationStatus,
} from './dto/update-verification-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('verification-requests')
@Controller('verification-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VerificationRequestsController {
  constructor(
    private readonly verificationRequestsService: VerificationRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a business verification request' })
  @ApiResponse({
    status: 201,
    description: 'Verification request submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Business already verified or request already pending',
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  create(
    @GetUser('id') userId: string,
    @Body() createDto: CreateVerificationRequestDto,
  ) {
    return this.verificationRequestsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all verification requests (admin sees all, users see only their own)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: VerificationStatus,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of verification requests',
  })
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Query('status') status?: VerificationStatus,
  ) {
    const isAdmin = role === 'ADMIN';
    return this.verificationRequestsService.findAll(userId, isAdmin, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification request details',
  })
  @ApiResponse({ status: 404, description: 'Request not found' })
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
  ) {
    const isAdmin = role === 'ADMIN';
    return this.verificationRequestsService.findOne(id, userId, isAdmin);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve a verification request (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification request approved',
  })
  @ApiResponse({ status: 404, description: 'Request not found' })
  approve(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.verificationRequestsService.approve(id, adminId, adminNotes);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject a verification request (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification request rejected',
  })
  @ApiResponse({ status: 404, description: 'Request not found' })
  reject(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
    @Body('adminNotes') adminNotes?: string,
  ) {
    return this.verificationRequestsService.reject(id, adminId, adminNotes);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a verification request (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Verification request updated',
  })
  @ApiResponse({ status: 404, description: 'Request not found' })
  update(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
    @Body() updateDto: UpdateVerificationRequestDto,
  ) {
    return this.verificationRequestsService.update(id, adminId, updateDto);
  }
}
