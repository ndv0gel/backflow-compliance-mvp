import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { JwtUser } from '../common/types/jwt-user.type';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateJobDto, @CurrentUser() user: JwtUser) {
    return this.jobsService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TESTER)
  findAll(@CurrentUser() user: JwtUser) {
    return this.jobsService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TESTER)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.jobsService.findOne(id, user);
  }
}
