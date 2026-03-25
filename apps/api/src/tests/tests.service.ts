import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestReportDto } from './dto/create-test-report.dto';
import { AuditService } from '../audit/audit.service';
import { ComplianceService } from '../compliance/compliance.service';
import { FileAssetKind, JobStatus, UserRole } from '@prisma/client';
import { TestersService } from '../testers/testers.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { JwtUser } from '../common/types/jwt-user.type';

@Injectable()
export class TestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly complianceService: ComplianceService,
    private readonly testersService: TestersService,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateTestReportDto, user: JwtUser) {
    const device = await this.prisma.device.findFirst({
      where: { id: dto.deviceId, deletedAt: null },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    let testerId = dto.testerId;
    if (user.role === UserRole.TESTER) {
      const tester = await this.testersService.findByUserId(user.sub);
      if (!tester) {
        throw new NotFoundException(
          'Tester profile not found for current user',
        );
      }

      testerId = tester.id;
    }

    if (!testerId) {
      throw new BadRequestException(
        'testerId is required for admin-created test reports',
      );
    }

    await this.testersService.ensureTesterIsActive(testerId);

    const tester = await this.prisma.tester.findFirst({
      where: { id: testerId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!tester) {
      throw new NotFoundException('Tester not found');
    }

    if (dto.jobId) {
      const job = await this.prisma.job.findFirst({
        where: {
          id: dto.jobId,
          deletedAt: null,
        },
        include: {
          assignedTester: true,
        },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.deviceId !== dto.deviceId) {
        throw new BadRequestException(
          'Job does not belong to the supplied device',
        );
      }

      if (
        user.role === UserRole.TESTER &&
        job.assignedTester.userId !== user.sub
      ) {
        throw new ForbiddenException('You are not assigned to this job');
      }
    }

    if (dto.photoFileIds && dto.photoFileIds.length > 0) {
      const photoFiles = await this.prisma.fileAsset.findMany({
        where: {
          id: { in: dto.photoFileIds },
          kind: FileAssetKind.PHOTO,
          deletedAt: null,
        },
      });

      if (photoFiles.length !== dto.photoFileIds.length) {
        throw new BadRequestException('One or more photo files are invalid');
      }
    }

    let signatureFileUrl: string | undefined;
    if (dto.signatureFileId) {
      const signatureFile = await this.prisma.fileAsset.findFirst({
        where: {
          id: dto.signatureFileId,
          kind: FileAssetKind.SIGNATURE,
          deletedAt: null,
        },
      });

      if (!signatureFile) {
        throw new BadRequestException('Signature file is invalid');
      }

      signatureFileUrl = signatureFile.url;
    }

    const testDate = new Date(dto.testDate);
    const nextDueDate = this.complianceService.calculateNextDueDate(testDate);
    const complianceStatus =
      this.complianceService.calculateStatus(nextDueDate);

    const createdReport = await this.prisma.testReport.create({
      data: {
        testId: dto.testId.trim(),
        deviceId: dto.deviceId,
        testerId,
        jobId: dto.jobId,
        testDate,
        checkValve1: dto.checkValve1,
        checkValve2: dto.checkValve2,
        reliefValve: dto.reliefValve,
        testResult: dto.testResult,
        notes: dto.notes?.trim(),
        lastTestDate: testDate,
        nextDueDate,
        complianceStatus,
        signatureFileId: dto.signatureFileId,
      },
    });

    if (dto.photoFileIds && dto.photoFileIds.length > 0) {
      await this.prisma.fileAsset.updateMany({
        where: {
          id: { in: dto.photoFileIds },
        },
        data: {
          testReportId: createdReport.id,
        },
      });
    }

    if (dto.signatureFileId) {
      await this.prisma.fileAsset.update({
        where: { id: dto.signatureFileId },
        data: {
          testReportId: createdReport.id,
        },
      });
    }

    const pdfBytes = await this.pdfService.generateTestReportPdf({
      testId: createdReport.testId,
      timestamp: new Date(),
      device: {
        deviceId: device.deviceId,
        serialNumber: device.serialNumber,
        deviceType: device.deviceType,
        manufacturer: device.manufacturer,
        model: device.model,
        locationAddress: device.locationAddress,
        city: device.city,
        state: device.state,
        zip: device.zip,
      },
      tester: {
        name: tester.name,
        certificationNumber: tester.certificationNumber,
        certificationExpiration: tester.certificationExpiration,
      },
      readings: {
        checkValve1: dto.checkValve1,
        checkValve2: dto.checkValve2,
        reliefValve: dto.reliefValve,
      },
      result: dto.testResult,
      notes: dto.notes,
      signatureUrl: signatureFileUrl,
    });

    const pdfObject = await this.storageService.uploadBuffer({
      objectKey: `pdf/${createdReport.testId}-${Date.now()}.pdf`,
      body: Buffer.from(pdfBytes),
      contentType: 'application/pdf',
    });

    const pdfFile = await this.prisma.fileAsset.create({
      data: {
        objectKey: pdfObject.objectKey,
        url: pdfObject.url,
        contentType: pdfObject.contentType,
        sizeBytes: pdfObject.sizeBytes,
        kind: FileAssetKind.PDF,
        testReportId: createdReport.id,
        createdById: user.sub,
      },
    });

    const finalizedReport = await this.prisma.testReport.update({
      where: { id: createdReport.id },
      data: {
        pdfFileId: pdfFile.id,
      },
      include: {
        device: true,
        tester: true,
        files: true,
        pdfFile: true,
        signatureFile: true,
      },
    });

    if (dto.jobId) {
      await this.prisma.job.update({
        where: { id: dto.jobId },
        data: { status: JobStatus.COMPLETED },
      });
    }

    await this.auditService.log({
      userId: user.sub,
      actionType: 'test_report.create',
      entityType: 'test_report',
      entityId: finalizedReport.id,
      metadata: {
        testId: finalizedReport.testId,
        deviceId: finalizedReport.deviceId,
        testerId: finalizedReport.testerId,
      },
    });

    return finalizedReport;
  }

  async findOne(id: string, user: JwtUser) {
    const report = await this.prisma.testReport.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        device: true,
        tester: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        files: true,
        pdfFile: true,
        signatureFile: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Test report not found');
    }

    if (user.role === UserRole.TESTER && report.tester.userId !== user.sub) {
      throw new ForbiddenException('You are not allowed to view this report');
    }

    return report;
  }
}
