import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as allEntities from '../entities/qlkt.entity';

export function createRoleTypeOrmOptions(
  configService: ConfigService,
  role?: 'KHOA' | 'CLB' | 'GV' | 'SV' | 'ADMIN',
  connectionName?: string,
): TypeOrmModuleOptions {
  const host = configService.get<string>('DB_HOST', '127.0.0.1');
  const port = Number(configService.get('DB_PORT', 1433));
  const database = configService.get<string>('DB_DATABASE', 'QLKienTap');
  const fallbackUser = configService.get<string>('DB_USERNAME', 'sa');
  const fallbackPassword = configService.get<string>('DB_PASSWORD', '');

  let username = fallbackUser;
  let password = fallbackPassword;

  if (role === 'KHOA') {
    username = configService.get<string>('DB_USER_KHOA', fallbackUser);
    password = configService.get<string>('DB_PASS_KHOA', fallbackPassword);
  } else if (role === 'CLB') {
    username = configService.get<string>('DB_USER_CLB', fallbackUser);
    password = configService.get<string>('DB_PASS_CLB', fallbackPassword);
  } else if (role === 'GV') {
    username = configService.get<string>('DB_USER_GV', fallbackUser);
    password = configService.get<string>('DB_PASS_GV', fallbackPassword);
  } else if (role === 'SV') {
    username = configService.get<string>('DB_USER_SV', fallbackUser);
    password = configService.get<string>('DB_PASS_SV', fallbackPassword);
  } else if (role === 'ADMIN') {
    username = configService.get<string>('DB_USER_ADMIN', fallbackUser);
    password = configService.get<string>('DB_PASS_ADMIN', fallbackPassword);
  }

  const entities = Object.values(allEntities).filter(
    (val) => typeof val === 'function',
  );

  const opts: TypeOrmModuleOptions = {
    type: 'mssql',
    host,
    port,
    username,
    password,
    database,
    entities,
    autoLoadEntities: true,
    synchronize: false,
    dropSchema: false,
    pool: {
      max: role === 'SV' ? 20 : 10,
      min: 2,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
    },
    extra: {
      validateConnection: false,
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 30000,
    },
  };

  if (connectionName) {
    opts.name = connectionName;
  }

  return opts;
}
