import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { AuditModule } from '../audit/audit.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { TestersModule } from '../testers/testers.module';
import { PdfModule } from '../pdf/pdf.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    AuditModule,
    ComplianceModule,
    TestersModule,
    PdfModule,
    StorageModule,
  ],
  controllers: [TestsController],
  providers: [TestsService],
})
export class TestsModule {}
