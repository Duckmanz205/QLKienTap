import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SinhVienModule } from './sinh-vien/sinh-vien.module';
import { GiangVienModule } from './giang-vien/giang-vien.module';
import { KhoaModule } from './khoa/khoa.module';
import { UploadModule } from './upload/upload.module';
import { QueueModule } from './queue/queue.module';
import { createRoleTypeOrmOptions } from './common/database-connections.util';
import { RoleDataSourceModule } from './common/role-datasource.module';
import { RoleContextMiddleware } from './common/role-context.middleware';

@Module({
  imports: [
    // Load bien moi truong tu file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cau hinh dat lich trinh tu dong
    ScheduleModule.forRoot(),

    // 1. KẾT NỐI MẶC ĐỊNH (DEFAULT / ADMIN): Dùng cho AuthModule, CronService, QtvController, BackupService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createRoleTypeOrmOptions(configService, 'ADMIN'),
    }),

    // 2. KẾT NỐI ROLE QUẢN LÝ KHOA
    TypeOrmModule.forRootAsync({
      name: 'KHOA_CONNECTION',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createRoleTypeOrmOptions(configService, 'KHOA', 'KHOA_CONNECTION'),
    }),

    // 3. KẾT NỐI ROLE QUẢN LÝ CÂU LẠC BỘ
    TypeOrmModule.forRootAsync({
      name: 'CLB_CONNECTION',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createRoleTypeOrmOptions(configService, 'CLB', 'CLB_CONNECTION'),
    }),

    // 4. KẾT NỐI ROLE GIẢNG VIÊN
    TypeOrmModule.forRootAsync({
      name: 'GV_CONNECTION',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createRoleTypeOrmOptions(configService, 'GV', 'GV_CONNECTION'),
    }),

    // 5. KẾT NỐI ROLE SINH VIÊN
    TypeOrmModule.forRootAsync({
      name: 'SV_CONNECTION',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createRoleTypeOrmOptions(configService, 'SV', 'SV_CONNECTION'),
    }),

    // Global Module quản lý điều phối DataSource động theo Role
    RoleDataSourceModule,

    // Dang ky cac phan he nghiep vu
    AuthModule,
    SinhVienModule,
    GiangVienModule,
    KhoaModule,
    UploadModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoleContextMiddleware).forRoutes('*');
  }
}
