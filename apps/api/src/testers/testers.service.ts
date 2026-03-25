import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTesterDto } from './dto/create-tester.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TestersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateTesterDto, actorUserId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
      select: { id: true },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const existingCertification = await this.prisma.tester.findFirst({
      where: { certificationNumber: dto.certificationNumber, deletedAt: null },
      select: { id: true },
    });
    if (existingCertification) {
      throw new BadRequestException('Certification number already exists');
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const tester = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          role: UserRole.TESTER,
          isActive: dto.isActive ?? true,
        },
      });

      return tx.tester.create({
        data: {
          userId: user.id,
          name: dto.name.trim(),
          certificationNumber: dto.certificationNumber.trim(),
          certificationExpiration: new Date(dto.certificationExpiration),
          isActive: dto.isActive ?? true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });
    });

    await this.auditService.log({
      userId: actorUserId,
      actionType: 'tester.create',
      entityType: 'tester',
      entityId: tester.id,
      metadata: {
        email: dto.email.toLowerCase(),
      },
    });

    return tester;
  }

  async findAll() {
    return this.prisma.tester.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.tester.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async ensureTesterIsActive(testerId: string): Promise<void> {
    const tester = await this.prisma.tester.findFirst({
      where: { id: testerId, deletedAt: null },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!tester) {
      throw new NotFoundException('Tester not found');
    }

    if (!tester.isActive || !tester.user.isActive) {
      throw new BadRequestException('Tester is not active');
    }

    if (tester.certificationExpiration.getTime() <= Date.now()) {
      throw new BadRequestException('Tester certification has expired');
    }
  }
}
