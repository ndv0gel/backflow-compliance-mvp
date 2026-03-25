import { Injectable } from '@nestjs/common';
import { ComplianceStatus, TestResult } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceService } from '../compliance/compliance.service';

export interface DashboardStatsDto {
  totalDevices: number;
  compliantDevices: number;
  dueSoonDevices: number;
  overdueDevices: number;
  recentSubmissions: Array<{
    id: string;
    deviceId: string;
    testerName: string;
    testDate: string;
    result: TestResult;
  }>;
  upcomingDueTests: Array<{
    deviceId: string;
    customerName: string;
    nextDueDate: string;
    complianceStatus: ComplianceStatus;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly complianceService: ComplianceService,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const devices = await this.prisma.device.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        deviceId: true,
        customerName: true,
        installationDate: true,
        testReports: {
          where: { deletedAt: null },
          orderBy: { testDate: 'desc' },
          take: 1,
          select: {
            complianceStatus: true,
            nextDueDate: true,
          },
        },
      },
    });

    let compliantDevices = 0;
    let dueSoonDevices = 0;
    let overdueDevices = 0;

    const upcomingDueTests: DashboardStatsDto['upcomingDueTests'] = [];

    for (const device of devices) {
      let status: ComplianceStatus;
      let nextDueDate: Date;

      if (device.testReports.length > 0) {
        status = device.testReports[0].complianceStatus;
        nextDueDate = device.testReports[0].nextDueDate;
      } else {
        const fallbackNextDueDate = this.complianceService.calculateNextDueDate(
          device.installationDate,
        );
        status = this.complianceService.calculateStatus(fallbackNextDueDate);
        nextDueDate = fallbackNextDueDate;
      }

      if (status === ComplianceStatus.COMPLIANT) {
        compliantDevices += 1;
      }

      if (status === ComplianceStatus.DUE_SOON) {
        dueSoonDevices += 1;
      }

      if (status === ComplianceStatus.OVERDUE) {
        overdueDevices += 1;
      }

      if (
        status === ComplianceStatus.DUE_SOON ||
        status === ComplianceStatus.OVERDUE
      ) {
        upcomingDueTests.push({
          deviceId: device.deviceId,
          customerName: device.customerName,
          nextDueDate: nextDueDate.toISOString(),
          complianceStatus: status,
        });
      }
    }

    const recentReports = await this.prisma.testReport.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        device: {
          select: {
            deviceId: true,
          },
        },
        tester: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      totalDevices: devices.length,
      compliantDevices,
      dueSoonDevices,
      overdueDevices,
      recentSubmissions: recentReports.map(
        (report: (typeof recentReports)[number]) => ({
          id: report.id,
          deviceId: report.device.deviceId,
          testerName: report.tester.name,
          testDate: report.testDate.toISOString(),
          result: report.testResult,
        }),
      ),
      upcomingDueTests: upcomingDueTests
        .sort(
          (
            a: DashboardStatsDto['upcomingDueTests'][number],
            b: DashboardStatsDto['upcomingDueTests'][number],
          ) => a.nextDueDate.localeCompare(b.nextDueDate),
        )
        .slice(0, 20),
    };
  }
}
