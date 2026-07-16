import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

    // Cau hinh ket noi SQL Server
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', 1433)),
        username: configService.get<string>('DB_USERNAME', 'sa'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'QLKienTap'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // TAT trong production, dung migrations thay the
        options: {
          encrypt: false, // Tat encrypt cho local development
          trustServerCertificate: true,
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
