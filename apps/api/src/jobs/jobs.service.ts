import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { AuditService } from '../audit/audit.service';
import { JobStatus, UserRole } from '@prisma/client';
import { TestersService } from '../testers/testers.service';
import { JwtUser } from '../common/types/jwt-user.type';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly testersService: TestersService,
  ) {}

  async create(dto: CreateJobDto, user: JwtUser) {
    const device = await this.prisma.device.findFirst({
      where: { id: dto.deviceId, deletedAt: null },
      select: { id: true },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await this.testersService.ensureTesterIsActive(dto.assignedTesterId);

    const job = await this.prisma.job.create({
      data: {
        jobId: dto.jobId.trim(),
        deviceId: dto.deviceId,
        scheduledDate: new Date(dto.scheduledDate),
        assignedTesterId: dto.assignedTesterId,
        assignedById: user.sub,
        status: JobStatus.PENDING,
      },
      include: {
        device: true,
        assignedTester: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    await this.auditService.log({
      userId: user.sub,
      actionType: 'job.create',
      entityType: 'job',
      entityId: job.id,
      metadata: {
        jobId: job.jobId,
        deviceId: job.deviceId,
        assignedTesterId: job.assignedTesterId,
      },
    });

    return job;
  }

  async findAll(user: JwtUser) {
    if (user.role === UserRole.TESTER) {
      return this.prisma.job.findMany({
        where: {
          deletedAt: null,
          assignedTester: {
            userId: user.sub,
          },
        },
        include: {
          device: true,
          assignedTester: true,
        },
        orderBy: {
          scheduledDate: 'asc',
        },
      });
    }

    return this.prisma.job.findMany({
      where: { deletedAt: null },
      include: {
        device: true,
        assignedTester: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
  }

  async findOne(id: string, user: JwtUser) {
    const job = await this.prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: {
        device: true,
        assignedTester: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (
      user.role === UserRole.TESTER &&
      job.assignedTester.userId !== user.sub
    ) {
      throw new ForbiddenException('You are not assigned to this job');
    }

    return job;
  }
}
