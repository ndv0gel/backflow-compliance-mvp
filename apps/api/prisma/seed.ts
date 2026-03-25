import { PrismaClient, DeviceStatus, JobStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  const adminPasswordHash = await bcrypt.hash('Admin123!', saltRounds);
  const testerPasswordHash = await bcrypt.hash('Tester123!', saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@city.gov' },
    update: {
      role: UserRole.ADMIN,
      isActive: true,
      deletedAt: null,
    },
    create: {
      email: 'admin@city.gov',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const testerUser = await prisma.user.upsert({
    where: { email: 'tester@city.gov' },
    update: {
      role: UserRole.TESTER,
      isActive: true,
      deletedAt: null,
    },
    create: {
      email: 'tester@city.gov',
      passwordHash: testerPasswordHash,
      role: UserRole.TESTER,
      isActive: true,
    },
  });

  const tester = await prisma.tester.upsert({
    where: { userId: testerUser.id },
    update: {
      name: 'Demo Field Technician',
      certificationNumber: 'CA-BF-10001',
      certificationExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true,
      deletedAt: null,
    },
    create: {
      userId: testerUser.id,
      name: 'Demo Field Technician',
      certificationNumber: 'CA-BF-10001',
      certificationExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true,
    },
  });

  const device = await prisma.device.upsert({
    where: { deviceId: 'DEV-10001' },
    update: {
      status: DeviceStatus.ACTIVE,
      deletedAt: null,
    },
    create: {
      deviceId: 'DEV-10001',
      serialNumber: 'SN-CA-10001',
      deviceType: 'Reduced Pressure Principle Assembly',
      manufacturer: 'Watts',
      model: '909-QT',
      installationDate: new Date('2022-03-20T00:00:00.000Z'),
      locationAddress: '123 Main St',
      city: 'Riverside',
      state: 'CA',
      zip: '92501',
      customerName: 'City Facility Demo',
      customerContact: 'facilities@city.gov',
      status: DeviceStatus.ACTIVE,
    },
  });

  const today = new Date();
  await prisma.job.upsert({
    where: { jobId: 'JOB-10001' },
    update: {
      assignedTesterId: tester.id,
      scheduledDate: today,
      status: JobStatus.PENDING,
      deletedAt: null,
    },
    create: {
      jobId: 'JOB-10001',
      deviceId: device.id,
      scheduledDate: today,
      assignedTesterId: tester.id,
      assignedById: adminUser.id,
      status: JobStatus.PENDING,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      actionType: 'seed.run',
      entityType: 'system',
      entityId: 'seed',
      metadata: {
        adminEmail: adminUser.email,
        testerEmail: testerUser.email,
      },
    },
  });

  console.log('Seed complete.');
  console.log('Admin: admin@city.gov / Admin123!');
  console.log('Tester: tester@city.gov / Tester123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
