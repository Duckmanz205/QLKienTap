import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawCorsOrigin = process.env.CORS_ORIGIN?.trim();

  let corsOrigins: string[];

  if (isProduction) {
    if (!rawCorsOrigin) {
      throw new Error(
        'Lỗi cấu hình bảo mật Production: Thiếu biến môi trường CORS_ORIGIN.',
      );
    }
    const parsedOrigins = rawCorsOrigin
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (parsedOrigins.length === 0) {
      throw new Error(
        'Lỗi cấu hình bảo mật Production: CORS_ORIGIN không hợp lệ hoặc rỗng.',
      );
    }

    if (parsedOrigins.includes('*')) {
      throw new Error(
        'Lỗi cấu hình bảo mật Production: Không được phép sử dụng wildcard "*" cho CORS_ORIGIN khi credentials: true.',
      );
    }

    corsOrigins = parsedOrigins;
  } else {
    corsOrigins = rawCorsOrigin
      ? rawCorsOrigin
          .split(',')
          .map((o) => o.trim())
          .filter((o) => o.length > 0)
      : ['http://localhost:5173'];
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Dat prefix cho tat ca API routes: /api/...
  app.setGlobalPrefix('api');

  // Bat validation pipe de validate DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`🚀 Backend đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
