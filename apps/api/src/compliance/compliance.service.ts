import { Injectable } from '@nestjs/common';
import { ComplianceStatus } from '@prisma/client';

@Injectable()
export class ComplianceService {
  calculateNextDueDate(lastTestDate: Date): Date {
    const nextDueDate = new Date(lastTestDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
    return nextDueDate;
  }

  calculateStatus(
    nextDueDate: Date,
    referenceDate = new Date(),
  ): ComplianceStatus {
    const diffMs = nextDueDate.getTime() - referenceDate.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return ComplianceStatus.OVERDUE;
    }

    if (daysUntilDue <= 30) {
      return ComplianceStatus.DUE_SOON;
    }

    return ComplianceStatus.COMPLIANT;
  }
}
