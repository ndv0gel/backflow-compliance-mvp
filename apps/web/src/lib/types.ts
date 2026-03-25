export type UserRole = 'ADMIN' | 'TESTER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Device {
  id: string;
  deviceId: string;
  serialNumber: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  installationDate: string;
  locationAddress: string;
  city: string;
  state: string;
  zip: string;
  customerName: string;
  customerContact?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Tester {
  id: string;
  userId: string;
  name: string;
  certificationNumber: string;
  certificationExpiration: string;
  isActive: boolean;
}

export interface Job {
  id: string;
  jobId: string;
  deviceId: string;
  assignedTesterId: string;
  scheduledDate: string;
  status: 'PENDING' | 'COMPLETED';
  device: Device;
  assignedTester: Tester;
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
    result: 'PASS' | 'FAIL';
  }>;
  upcomingDueTests: Array<{
    deviceId: string;
    customerName: string;
    nextDueDate: string;
    complianceStatus: 'COMPLIANT' | 'DUE_SOON' | 'OVERDUE';
  }>;
}

export interface UploadedAsset {
  id: string;
  url: string;
  kind: 'PHOTO' | 'SIGNATURE' | 'PDF';
}
