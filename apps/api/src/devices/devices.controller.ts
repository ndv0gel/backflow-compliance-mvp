import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { JwtUser } from '../common/types/jwt-user.type';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDeviceDto, @CurrentUser() user: JwtUser) {
    return this.devicesService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TESTER)
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TESTER)
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }
}
