import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TestersService } from './testers.service';
import { CreateTesterDto } from './dto/create-tester.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { JwtUser } from '../common/types/jwt-user.type';

@Controller('testers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestersController {
  constructor(private readonly testersService: TestersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTesterDto, @CurrentUser() user: JwtUser) {
    return this.testersService.create(dto, user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.testersService.findAll();
  }

  @Get('me')
  @Roles(UserRole.TESTER)
  async me(@CurrentUser() user: JwtUser) {
    return this.testersService.findByUserId(user.sub);
  }
}
