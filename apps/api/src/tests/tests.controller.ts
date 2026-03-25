import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestReportDto } from './dto/create-test-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { JwtUser } from '../common/types/jwt-user.type';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TESTER)
  create(@Body() dto: CreateTestReportDto, @CurrentUser() user: JwtUser) {
    return this.testsService.create(dto, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TESTER)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.testsService.findOne(id, user);
  }
}
