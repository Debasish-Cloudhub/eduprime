import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { CoursesModule } from './courses/courses.module';
import { IncentivesModule } from './incentives/incentives.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExcelModule } from './excel/excel.module';
import { SulekhaModule } from './sulekha/sulekha.module';
import { SlaModule } from './sla/sla.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    CoursesModule,
    IncentivesModule,
    ExpensesModule,
    AnalyticsModule,
    ExcelModule,
    SulekhaModule,
    SlaModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
