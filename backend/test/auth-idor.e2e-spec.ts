import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth & IDOR Security Checks (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/auth/profile mà không có Token phải trả về HTTP 401', () => {
    return request(app.getHttpServer()).get('/api/auth/profile').expect(401);
  });

  it('GET /api/sinh-vien/registered-trips không có Token phải trả về HTTP 401', () => {
    return request(app.getHttpServer())
      .get('/api/sinh-vien/registered-trips')
      .expect(401);
  });

  it('GET /api/upload/file/reports/secret.pdf không có Token phải trả về HTTP 401', () => {
    return request(app.getHttpServer())
      .get('/api/upload/file/reports/secret.pdf')
      .expect(401);
  });
});
