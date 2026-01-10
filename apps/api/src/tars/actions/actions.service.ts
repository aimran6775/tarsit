import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TarsActionStatus } from '@prisma/client';

export interface ActionRequest {
    actionType: string;
    actionData: Record<string, unknown>;
    description: string;
    userId?: string;
    businessId?: string;
    priority?: number;
}

export interface ActionResult {
    success: boolean;
    message: string;
    data?: unknown;
    requiresApproval?: boolean;
    queueId?: string;
}

// Actions TARS can perform directly without approval
const DIRECT_ACTIONS = [
    'search_businesses',
    'get_business_details',
    'get_business_hours',
    'get_business_reviews',
    'check_availability',
    'get_user_profile',
    'update_own_profile',
    'get_categories',
    'get_services',
];

// Actions that require admin approval
const APPROVAL_REQUIRED_ACTIONS = [
    'create_appointment',
    'cancel_appointment',
    'modify_appointment',
    'update_business_info',
    'delete_review',
    'issue_refund',
    'modify_user_data',
    'bulk_update',
];

@Injectable()
export class TarsActionsService {
    private readonly logger = new Logger(TarsActionsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Check if an action can be performed directly
     */
    canPerformDirectly(actionType: string): boolean {
        return DIRECT_ACTIONS.includes(actionType);
    }

    /**
     * Check if an action requires admin approval
     */
    requiresApproval(actionType: string): boolean {
        return APPROVAL_REQUIRED_ACTIONS.includes(actionType);
    }

    /**
     * Submit an action request to the approval queue
     */
    async submitForApproval(request: ActionRequest): Promise<string> {
        const action = await this.prisma.tarsActionQueue.create({
            data: {
                userId: request.userId,
                businessId: request.businessId,
                actionType: request.actionType,
                actionData: JSON.parse(JSON.stringify(request.actionData)),
                description: request.description,
                priority: request.priority || 0,
                status: TarsActionStatus.PENDING,
            },
        });

        this.logger.log(`Action submitted for approval: ${action.id} - ${request.actionType}`);
        return action.id;
    }

    /**
     * Get pending actions for admin review
     */
    async getPendingActions(options?: {
        businessId?: string;
        limit?: number;
        offset?: number;
    }) {
        const { businessId, limit = 50, offset = 0 } = options || {};

        const [actions, total] = await Promise.all([
            this.prisma.tarsActionQueue.findMany({
                where: {
                    status: TarsActionStatus.PENDING,
                    ...(businessId && { businessId }),
                },
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'asc' },
                ],
                take: limit,
                skip: offset,
            }),
            this.prisma.tarsActionQueue.count({
                where: {
                    status: TarsActionStatus.PENDING,
                    ...(businessId && { businessId }),
                },
            }),
        ]);

        return { actions, total };
    }

    /**
     * Approve an action (admin only)
     */
    async approveAction(
        actionId: string,
        adminId: string,
        notes?: string,
    ): Promise<ActionResult> {
        const action = await this.prisma.tarsActionQueue.update({
            where: { id: actionId },
            data: {
                status: TarsActionStatus.APPROVED,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNotes: notes,
            },
        });

        // Execute the approved action
        try {
            const result = await this.executeAction(action.actionType, action.actionData as Record<string, unknown>);

            await this.prisma.tarsActionQueue.update({
                where: { id: actionId },
                data: { status: TarsActionStatus.EXECUTED },
            });

            return {
                success: true,
                message: 'Action approved and executed',
                data: result,
            };
        } catch (error) {
            await this.prisma.tarsActionQueue.update({
                where: { id: actionId },
                data: { status: TarsActionStatus.FAILED },
            });

            return {
                success: false,
                message: `Action approved but execution failed: ${error}`,
            };
        }
    }

    /**
     * Reject an action (admin only)
     */
    async rejectAction(
        actionId: string,
        adminId: string,
        reason: string,
    ): Promise<void> {
        await this.prisma.tarsActionQueue.update({
            where: { id: actionId },
            data: {
                status: TarsActionStatus.REJECTED,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNotes: reason,
            },
        });

        this.logger.log(`Action rejected: ${actionId} - ${reason}`);
    }

    /**
     * Bulk approve/reject actions
     */
    async bulkReview(
        actionIds: string[],
        decision: 'approve' | 'reject',
        adminId: string,
        notes?: string,
    ): Promise<{ processed: number; failed: string[] }> {
        const failed: string[] = [];
        let processed = 0;

        for (const actionId of actionIds) {
            try {
                if (decision === 'approve') {
                    await this.approveAction(actionId, adminId, notes);
                } else {
                    await this.rejectAction(actionId, adminId, notes || 'Bulk rejected');
                }
                processed++;
            } catch (error) {
                failed.push(actionId);
                this.logger.error(`Failed to process action ${actionId}: ${error}`);
            }
        }

        return { processed, failed };
    }

    /**
     * Execute an action (internal use after approval)
     */
    private async executeAction(
        actionType: string,
        data: Record<string, unknown>,
    ): Promise<unknown> {
        switch (actionType) {
            case 'create_appointment':
                return this.executeCreateAppointment(data);
            case 'cancel_appointment':
                return this.executeCancelAppointment(data);
            case 'update_business_info':
                return this.executeUpdateBusiness(data);
            default:
                throw new Error(`Unknown action type: ${actionType}`);
        }
    }

    private async executeCreateAppointment(data: Record<string, unknown>) {
        return this.prisma.appointment.create({
            data: {
                businessId: data.businessId as string,
                userId: data.userId as string,
                serviceId: data.serviceId as string || undefined,
                date: new Date(data.appointmentDate as string || data.date as string),
                duration: (data.duration as number) || 60,
                status: 'PENDING',
                notes: data.notes as string || undefined,
            },
        });
    }

    private async executeCancelAppointment(data: Record<string, unknown>) {
        return this.prisma.appointment.update({
            where: { id: data.appointmentId as string },
            data: {
                status: 'CANCELED',
                cancelReason: data.reason as string,
            },
        });
    }

    private async executeUpdateBusiness(data: Record<string, unknown>) {
        const { businessId, ...updateData } = data;
        return this.prisma.business.update({
            where: { id: businessId as string },
            data: updateData,
        });
    }

    /**
     * Get action history
     */
    async getActionHistory(options: {
        userId?: string;
        businessId?: string;
        status?: TarsActionStatus;
        limit?: number;
    }) {
        const { userId, businessId, status, limit = 50 } = options;

        return this.prisma.tarsActionQueue.findMany({
            where: {
                ...(userId && { userId }),
                ...(businessId && { businessId }),
                ...(status && { status }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
