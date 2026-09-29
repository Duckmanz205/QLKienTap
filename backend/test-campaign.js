const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { KhoaService } = require('./dist/khoa/shared/khoa.service');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const khoaService = app.get(KhoaService);
  try {
    const res = await khoaService.createCampaign({
      ten_dot: 'Test Dot Kien Tap',
      hoc_ky_id: 1, // Make sure these exist in DB
      khoa_hoc_id: 1,
      ngay_bat_dau: new Date('2026-09-01'),
      ngay_ket_thuc: new Date('2026-10-01'),
    });
    console.log('Success:', res);
  } catch (error) {
    console.error('Error creating campaign:', error);
  }
  await app.close();
}
bootstrap();
