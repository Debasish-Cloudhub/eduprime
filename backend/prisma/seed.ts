import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduPrime database...');

  // ─── SYSTEM CONFIG ───────────────────────────────
  await prisma.systemConfig.upsert({
    where: { key: 'DEFAULT_INCENTIVE_PCT' },
    update: {},
    create: { key: 'DEFAULT_INCENTIVE_PCT', value: '5', description: 'Default incentive % of fees' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'SLA_INITIATED_DAYS' },
    update: {},
    create: { key: 'SLA_INITIATED_DAYS', value: '7', description: 'SLA days for INITIATED status' },
  });
  await prisma.systemConfig.upsert({
    where: { key: 'SLA_IN_PROGRESS_DAYS' },
    update: {},
    create: { key: 'SLA_IN_PROGRESS_DAYS', value: '15', description: 'SLA days for IN_PROGRESS status' },
  });

  // ─── USERS ───────────────────────────────────────
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      phone: '9000000001',
      passwordHash: await hash('Admin@123'),
      role: 'ADMIN',
    },
  });

  const sales1 = await prisma.user.upsert({
    where: { email: 'sales@test.com' },
    update: {},
    create: {
      email: 'sales@test.com',
      name: 'Rahul Verma',
      phone: '9000000002',
      passwordHash: await hash('Sales@123'),
      role: 'SALES_AGENT',
    },
  });

  const sales2 = await prisma.user.upsert({
    where: { email: 'sales2@test.com' },
    update: {},
    create: {
      email: 'sales2@test.com',
      name: 'Priya Sharma',
      phone: '9000000003',
      passwordHash: await hash('Sales@123'),
      role: 'SALES_AGENT',
    },
  });

  const finance = await prisma.user.upsert({
    where: { email: 'finance@test.com' },
    update: {},
    create: {
      email: 'finance@test.com',
      name: 'Finance User',
      phone: '9000000004',
      passwordHash: await hash('Finance@123'),
      role: 'FINANCE',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      name: 'Arjun Mehta',
      phone: '9000000005',
      passwordHash: await hash('Student@123'),
      role: 'STUDENT',
    },
  });

  // Create student profile
  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      city: 'Hyderabad',
      state: 'Telangana',
      qualification: '12th Grade',
      targetYear: 2025,
      preferredCountries: ['India', 'Canada'],
    },
  });

  console.log('✅ Users seeded');

  // ─── COLLEGES ────────────────────────────────────
  const colleges = [
    { name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'Government', ranking: 1 },
    { name: 'IIT Delhi', city: 'New Delhi', state: 'Delhi', country: 'India', type: 'Government', ranking: 2 },
    { name: 'IIM Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', country: 'India', type: 'Government', ranking: 1 },
    { name: 'Manipal University', city: 'Manipal', state: 'Karnataka', country: 'India', type: 'Private', ranking: 25 },
    { name: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu', country: 'India', type: 'Private', ranking: 15 },
    { name: 'University of Toronto', city: 'Toronto', state: 'Ontario', country: 'Canada', type: 'Government', ranking: 1 },
    { name: 'University of Melbourne', city: 'Melbourne', state: 'Victoria', country: 'Australia', type: 'Government', ranking: 1 },
    { name: 'SRM Institute', city: 'Chennai', state: 'Tamil Nadu', country: 'India', type: 'Private', ranking: 20 },
  ];

  const createdColleges: Record<string, any> = {};
  for (const col of colleges) {
    const c = await prisma.college.upsert({
      where: { id: (await prisma.college.findFirst({ where: { name: col.name } }))?.id || 'none' },
      update: {},
      create: col,
    });
    createdColleges[col.name] = c;
  }

  console.log('✅ Colleges seeded');

  // ─── COURSES ─────────────────────────────────────
  const courseData = [
    {
      college: 'IIT Bombay', name: 'B.Tech Computer Science', stream: 'Engineering',
      degree: 'B.Tech', duration: '4 years', fees: 220000, totalFees: 880000,
      incentiveFixed: 20000, seats: 100, eligibility: 'JEE Advanced',
    },
    {
      college: 'IIT Bombay', name: 'B.Tech Electrical Engineering', stream: 'Engineering',
      degree: 'B.Tech', duration: '4 years', fees: 220000, totalFees: 880000,
      incentiveFixed: 18000, seats: 80, eligibility: 'JEE Advanced',
    },
    {
      college: 'IIT Delhi', name: 'M.Tech Data Science', stream: 'Engineering',
      degree: 'M.Tech', duration: '2 years', fees: 120000, totalFees: 240000,
      incentiveFixed: 12000, seats: 60, eligibility: 'GATE',
    },
    {
      college: 'IIM Ahmedabad', name: 'MBA', stream: 'Management',
      degree: 'MBA', duration: '2 years', fees: 1100000, totalFees: 2200000,
      incentiveFixed: 80000, seats: 385, eligibility: 'CAT',
    },
    {
      college: 'Manipal University', name: 'B.Tech Computer Science', stream: 'Engineering',
      degree: 'B.Tech', duration: '4 years', fees: 350000, totalFees: 1400000,
      incentivePct: 6, seats: 180, eligibility: '10+2 with PCM',
    },
    {
      college: 'Manipal University', name: 'MBA Healthcare', stream: 'Management',
      degree: 'MBA', duration: '2 years', fees: 450000, totalFees: 900000,
      incentivePct: 7, seats: 60, eligibility: 'Any Graduate',
    },
    {
      college: 'VIT Vellore', name: 'B.Tech Information Technology', stream: 'Engineering',
      degree: 'B.Tech', duration: '4 years', fees: 198000, totalFees: 792000,
      incentiveFixed: 15000, seats: 240, eligibility: 'VITEEE',
    },
    {
      college: 'VIT Vellore', name: 'M.Sc Data Science', stream: 'Science',
      degree: 'M.Sc', duration: '2 years', fees: 130000, totalFees: 260000,
      incentivePct: 5, seats: 60, eligibility: 'B.Sc with Statistics',
    },
    {
      college: 'University of Toronto', name: 'MSc Computer Science', stream: 'Engineering',
      degree: 'MSc', duration: '2 years', fees: 1800000, totalFees: 3600000,
      incentiveFixed: 150000, seats: 80, eligibility: 'Bachelor\'s + GRE/IELTS',
    },
    {
      college: 'University of Melbourne', name: 'Master of Business Administration', stream: 'Management',
      degree: 'MBA', duration: '2 years', fees: 2200000, totalFees: 4400000,
      incentiveFixed: 200000, seats: 120, eligibility: 'Bachelor\'s + GMAT/IELTS',
    },
    {
      college: 'SRM Institute', name: 'B.Tech AI & Machine Learning', stream: 'Engineering',
      degree: 'B.Tech', duration: '4 years', fees: 250000, totalFees: 1000000,
      incentiveFixed: 20000, seats: 120, eligibility: 'SRMJEEE',
    },
  ];

  const createdCourses: Record<string, any> = {};
  for (const course of courseData) {
    const college = createdColleges[course.college];
    if (!college) continue;
    const existing = await prisma.course.findFirst({
      where: { name: course.name, collegeId: college.id },
    });
    const c = existing
      ? existing
      : await prisma.course.create({
          data: {
            name: course.name,
            collegeId: college.id,
            stream: course.stream,
            degree: course.degree,
            duration: course.duration,
            fees: course.fees,
            totalFees: course.totalFees || null,
            incentiveFixed: (course as any).incentiveFixed || null,
            incentivePct: (course as any).incentivePct || null,
            seats: course.seats,
            eligibility: course.eligibility,
          },
        });
    createdCourses[`${course.college}_${course.name}`] = c;
  }

  console.log('✅ Courses seeded');

  // ─── LEADS ───────────────────────────────────────
  const leadsData = [
    {
      studentName: 'Ananya Krishnan', studentPhone: '9811100001', studentEmail: 'ananya@example.com',
      city: 'Hyderabad', state: 'Telangana', qualification: '12th Grade',
      source: 'SULEKHA', status: 'IN_PROGRESS', agentId: sales1.id,
      collegeKey: 'IIT Bombay', courseKey: 'IIT Bombay_B.Tech Computer Science', priority: 3,
    },
    {
      studentName: 'Vikram Singh', studentPhone: '9811100002', studentEmail: 'vikram@example.com',
      city: 'Pune', state: 'Maharashtra', qualification: 'B.Tech',
      source: 'WEBSITE', status: 'WON', agentId: sales1.id,
      collegeKey: 'IIM Ahmedabad', courseKey: 'IIM Ahmedabad_MBA', priority: 3,
      wonAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      studentName: 'Shreya Patel', studentPhone: '9811100003', studentEmail: 'shreya@example.com',
      city: 'Ahmedabad', state: 'Gujarat', qualification: '12th Grade',
      source: 'REFERRAL', status: 'INITIATED', agentId: sales2.id,
      collegeKey: 'Manipal University', courseKey: 'Manipal University_B.Tech Computer Science', priority: 2,
    },
    {
      studentName: 'Rohan Desai', studentPhone: '9811100004', studentEmail: 'rohan@example.com',
      city: 'Mumbai', state: 'Maharashtra', qualification: 'B.Com',
      source: 'WALK_IN', status: 'DOCS_SUBMITTED', agentId: sales1.id,
      collegeKey: 'University of Toronto', courseKey: 'University of Toronto_MSc Computer Science', priority: 3,
    },
    {
      studentName: 'Kavya Reddy', studentPhone: '9811100005', studentEmail: 'kavya@example.com',
      city: 'Bangalore', state: 'Karnataka', qualification: '12th Grade',
      source: 'SOCIAL_MEDIA', status: 'NEW', agentId: null, priority: 1,
    },
    {
      studentName: 'Arjun Nair', studentPhone: '9811100006', studentEmail: 'arjun2@example.com',
      city: 'Chennai', state: 'Tamil Nadu', qualification: 'B.Sc',
      source: 'SULEKHA', status: 'OFFER_RECEIVED', agentId: sales2.id,
      collegeKey: 'University of Melbourne', courseKey: 'University of Melbourne_Master of Business Administration', priority: 3,
    },
    {
      studentName: 'Deepika Rao', studentPhone: '9811100007', studentEmail: 'deepika@example.com',
      city: 'Delhi', state: 'Delhi', qualification: 'B.Tech',
      source: 'WEBSITE', status: 'LOST', agentId: sales1.id, priority: 2,
    },
    {
      studentName: 'Siddharth Kumar', studentPhone: '9811100008',
      city: 'Jaipur', state: 'Rajasthan', qualification: '12th Grade',
      source: 'REFERRAL', status: 'NEW', agentId: sales2.id, priority: 1,
    },
  ];

  for (const ld of leadsData) {
    const existing = await prisma.lead.findFirst({ where: { studentPhone: ld.studentPhone } });
    if (existing) continue;

    const college = ld.collegeKey ? createdColleges[ld.collegeKey] : null;
    const course = ld.courseKey ? createdCourses[ld.courseKey] : null;

    const lead = await prisma.lead.create({
      data: {
        studentName: ld.studentName,
        studentPhone: ld.studentPhone,
        studentEmail: (ld as any).studentEmail || null,
        city: ld.city,
        state: ld.state,
        qualification: ld.qualification,
        source: ld.source as any,
        status: ld.status as any,
        priority: ld.priority,
        agentId: ld.agentId,
        collegeId: college?.id || null,
        courseId: course?.id || null,
        wonAt: (ld as any).wonAt || null,
        lastActivityAt: new Date(),
      },
    });

    // Lock incentive for WON leads
    if (ld.status === 'WON' && course && ld.agentId) {
      const fees = Number(course.fees);
      const incentiveAmount = course.incentiveFixed
        ? Number(course.incentiveFixed)
        : fees * 0.05;
      const incentiveSource = course.incentiveFixed ? 'EXCEL_FIXED' : 'PERCENTAGE_OF_FEES';

      await prisma.incentiveRecord.create({
        data: {
          leadId: lead.id,
          agentId: ld.agentId,
          courseId: course.id,
          feesAtClosure: fees,
          incentiveAmount,
          incentiveSource: incentiveSource as any,
          isLocked: true,
          lockedAt: (ld as any).wonAt || new Date(),
        },
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { feesAtClosure: fees, incentiveAmount, incentiveSource: incentiveSource as any, incentiveLockedAt: new Date() },
      });
    }

    // Add sample activity
    await prisma.leadActivity.create({
      data: { leadId: lead.id, actorId: ld.agentId || admin.id, action: 'LEAD_CREATED', toValue: ld.status, note: 'Lead seeded' },
    });
  }

  console.log('✅ Leads seeded');

  // ─── EXPENSES ─────────────────────────────────────
  const expensesData = [
    { agentId: sales1.id, category: 'TRAVEL', amount: 2500, description: 'Client visit - Pune', status: 'APPROVED', month: 3, year: 2025 },
    { agentId: sales1.id, category: 'MARKETING', amount: 5000, description: 'Facebook ads - March', status: 'APPROVED', month: 3, year: 2025 },
    { agentId: sales1.id, category: 'MEALS', amount: 1200, description: 'Client lunch meeting', status: 'PENDING', month: 4, year: 2025 },
    { agentId: sales2.id, category: 'TRAVEL', amount: 3200, description: 'Chennai college visit', status: 'APPROVED', month: 3, year: 2025 },
    { agentId: sales2.id, category: 'COMMUNICATION', amount: 800, description: 'Phone recharge for calls', status: 'PENDING', month: 4, year: 2025 },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp as any });
  }

  console.log('✅ Expenses seeded');

  // ─── NOTIFICATIONS ────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: sales1.id, type: 'SLA_BREACH', title: 'SLA Breached', body: 'Lead "Ananya Krishnan" SLA is overdue', isRead: false },
      { userId: admin.id, type: 'ADMIN_REPORT', title: 'Daily Summary', body: 'Breached: 1 | At Risk: 2 | On Track: 4', isRead: false },
      { userId: sales1.id, type: 'INCENTIVE_LOCKED', title: 'Incentive Locked!', body: 'Incentive of ₹80,000 locked for Vikram Singh', isRead: true },
    ],
  });

  console.log('✅ Notifications seeded');

  console.log('\n✅ ====== SEEDING COMPLETE ======');
  console.log('👤 Test Accounts:');
  console.log('   admin@test.com    / Admin@123');
  console.log('   sales@test.com    / Sales@123');
  console.log('   sales2@test.com   / Sales@123');
  console.log('   finance@test.com  / Finance@123');
  console.log('   student@test.com  / Student@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
