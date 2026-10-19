import { Module } from '@nestjs/common';
import * as allEntities from './entities/qlkt.entity';
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

@Module({
  imports: [
    // Load bien moi truong tu file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cau hinh dat lich trinh tu dong
    ScheduleModule.forRoot(),

    // Cau hinh ket noi SQL Server
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(configService.get('DB_PORT', 1433)),
        username: configService.get<string>('DB_USERNAME', 'sa'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'QLKienTap'),
        entities: Object.values(allEntities).filter(
          (val) => typeof val === 'function',
        ),
        autoLoadEntities: true,
        synchronize: false, // TAT trong production, dung migrations thay the
        dropSchema: false,
        pool: {
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 30000,
        },
        extra: {
          validateConnection: false,
        },
        options: {
          encrypt: false, // Tat encrypt cho local development
          trustServerCertificate: true,
          connectTimeout: 30000,
          requestTimeout: 30000,
        },
      }),
    }),

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
export class AppModule {}
