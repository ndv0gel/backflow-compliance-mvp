import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { DevicesModule } from './devices/devices.module';
import { TestersModule } from './testers/testers.module';
import { JobsModule } from './jobs/jobs.module';
import { TestsModule } from './tests/tests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ComplianceModule } from './compliance/compliance.module';
import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';
import { PdfModule } from './pdf/pdf.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    DevicesModule,
    TestersModule,
    JobsModule,
    TestsModule,
    DashboardModule,
    ComplianceModule,
    StorageModule,
    UploadsModule,
    PdfModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
