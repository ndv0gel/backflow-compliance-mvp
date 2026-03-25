export enum UserRole {
  ADMIN = 'ADMIN',
  TESTER = 'TESTER',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum JobStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum TestResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  DUE_SOON = 'DUE_SOON',
  OVERDUE = 'OVERDUE',
}

export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
}

export interface DashboardStats {
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
