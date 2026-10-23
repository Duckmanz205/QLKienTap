import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoleDataSourceService } from './role-datasource.service';
import { RoleContextMiddleware } from './role-context.middleware';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key_123456',
    }),
  ],
  providers: [RoleDataSourceService, RoleContextMiddleware],
  exports: [RoleDataSourceService, RoleContextMiddleware],
})
export class RoleDataSourceModule {}
