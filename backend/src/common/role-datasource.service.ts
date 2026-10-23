import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestRoleContext {
  role?: string;
  userId?: number;
}

@Injectable()
export class RoleDataSourceService {
  private readonly logger = new Logger(RoleDataSourceService.name);
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestRoleContext>();

  constructor(
    @InjectDataSource()
    private readonly defaultDataSource: DataSource,

    @InjectDataSource('KHOA_CONNECTION')
    private readonly khoaDataSource: DataSource,

    @InjectDataSource('CLB_CONNECTION')
    private readonly clbDataSource: DataSource,

    @InjectDataSource('GV_CONNECTION')
    private readonly gvDataSource: DataSource,

    @InjectDataSource('SV_CONNECTION')
    private readonly svDataSource: DataSource,
  ) {}

  /**
   * Chạy một đoạn mã (callback) bên trong ngữ cảnh role của request hiện tại
   */
  runWithContext<R>(context: RequestRoleContext, callback: () => R): R {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Lấy Role hiện tại từ AsyncLocalStorage
   */
  getActiveRole(): string | undefined {
    return this.asyncLocalStorage.getStore()?.role;
  }

  /**
   * Lấy DataSource tương ứng với Role của request hiện tại
   * Nếu không có context (cronjob, background worker, startup): Fallback sang defaultDataSource (Admin)
   */
  getActiveDataSource(): DataSource {
    const role = this.getActiveRole();
    if (!role) {
      return this.defaultDataSource;
    }

    switch (role) {
      case 'QuanLyKhoa':
        return this.khoaDataSource;
      case 'QuanLyCLB':
        return this.clbDataSource;
      case 'GiangVien':
        return this.gvDataSource;
      case 'SinhVien':
        return this.svDataSource;
      case 'QuanTriVienHeThong':
      default:
        return this.defaultDataSource;
    }
  }

  /**
   * Tạo Proxy cho một Repository: Mọi lệnh gọi (.find, .save, .update, .delete...)
   * sẽ tự động lấy Repository từ DataSource của Role trong request hiện tại
   */
  createRepositoryProxy<T extends ObjectLiteral>(
    entityTarget: EntityTarget<T>,
    defaultRepo: Repository<T>,
  ): Repository<T> {
    const self = this;
    return new Proxy(defaultRepo, {
      get(target, prop, receiver) {
        const activeDs = self.getActiveDataSource();
        const activeRepo = activeDs ? activeDs.getRepository(entityTarget) : defaultRepo;
        const value = Reflect.get(activeRepo, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(activeRepo);
        }
        return value;
      },
    });
  }

  /**
   * Tạo Proxy cho DataSource: Lời gọi .transaction(...), .query(...)
   * sẽ tự động định tuyến sang DataSource của Role trong request hiện tại
   */
  createDataSourceProxy(defaultDataSource: DataSource): DataSource {
    const self = this;
    return new Proxy(defaultDataSource, {
      get(target, prop, receiver) {
        const activeDs = self.getActiveDataSource() || defaultDataSource;
        const value = Reflect.get(activeDs, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(activeDs);
        }
        return value;
      },
    });
  }
}
