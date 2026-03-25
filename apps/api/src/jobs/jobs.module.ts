import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AuditModule } from '../audit/audit.module';
import { TestersModule } from '../testers/testers.module';

@Module({
  imports: [AuditModule, TestersModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
