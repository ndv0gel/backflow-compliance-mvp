import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { AuditService } from '../audit/audit.service';
import { DeviceStatus } from '@prisma/client';
import { JwtUser } from '../common/types/jwt-user.type';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateDeviceDto, user: JwtUser) {
    const device = await this.prisma.device.create({
      data: {
        deviceId: dto.deviceId.trim(),
        serialNumber: dto.serialNumber.trim(),
        deviceType: dto.deviceType.trim(),
        manufacturer: dto.manufacturer.trim(),
        model: dto.model.trim(),
        installationDate: new Date(dto.installationDate),
        locationAddress: dto.locationAddress.trim(),
        city: dto.city.trim(),
        state: dto.state.trim().toUpperCase(),
        zip: dto.zip.trim(),
        customerName: dto.customerName.trim(),
        customerContact: dto.customerContact?.trim(),
        status: dto.status ?? DeviceStatus.ACTIVE,
      },
    });

    await this.auditService.log({
      userId: user.sub,
      actionType: 'device.create',
      entityType: 'device',
      entityId: device.id,
      metadata: {
        deviceId: device.deviceId,
      },
    });

    return device;
  }

  async findAll() {
    return this.prisma.device.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }
}
