import { Module } from '@nestjs/common';
import { TestersController } from './testers.controller';
import { TestersService } from './testers.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [TestersController],
  providers: [TestersService],
  exports: [TestersService],
})
export class TestersModule {}
