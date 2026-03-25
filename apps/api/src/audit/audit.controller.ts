import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query('limit') limit = '100') {
    const parsedLimit = Number(limit);

    return this.prisma.auditLog.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: Number.isNaN(parsedLimit) ? 100 : Math.min(parsedLimit, 500),
    });
  }
}
