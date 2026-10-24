import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as sql from 'mssql';

@Injectable()
export class BackupService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Lấy thông tin tổng quan về cơ sở dữ liệu: tên CSDL, phiên bản SQL Server,
   * tổng dung lượng Data/Log, số bảng và thời gian sao lưu gần nhất.
   */
  async getDatabaseOverview() {
    const dbName = process.env.DB_DATABASE || 'QLKienTap';

    try {
      // 1. Thông tin phiên bản SQL Server
      const versionInfo = await this.dataSource.query(`
        SELECT 
          DB_NAME() AS db_name,
          SERVERPROPERTY('ProductVersion') AS product_version,
          SERVERPROPERTY('ProductLevel') AS product_level,
          SERVERPROPERTY('Edition') AS edition;
      `);

      // 2. Dung lượng Data, Log và tổng số bảng do người dùng tạo
      const spaceInfo = await this.dataSource.query(`
        SELECT 
          (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS table_count,
          (SELECT SUM(size * 8 / 1024) FROM sys.database_files WHERE type_desc = 'ROWS') AS data_size_mb,
          (SELECT SUM(size * 8 / 1024) FROM sys.database_files WHERE type_desc = 'LOG') AS log_size_mb;
      `);

      // 3. Thời gian sao lưu gần nhất từ msdb (nếu tài khoản có quyền truy cập)
      let lastBackupDate: string | null = null;
      try {
        const backupHistory = await this.dataSource.query(`
          SELECT TOP 1 backup_finish_date
          FROM msdb.dbo.backupset
          WHERE database_name = DB_NAME() AND type = 'D'
          ORDER BY backup_finish_date DESC;
        `);
        if (
          backupHistory &&
          backupHistory.length > 0 &&
          backupHistory[0].backup_finish_date
        ) {
          lastBackupDate = new Date(
            backupHistory[0].backup_finish_date,
          ).toISOString();
        }
      } catch {
        // Bỏ qua nếu không có quyền đọc msdb
      }

      const v = versionInfo?.[0] || {};
      const s = spaceInfo?.[0] || {};

      const dataSize = Number(s.data_size_mb || 0);
      const logSize = Number(s.log_size_mb || 0);

      return {
        databaseName: dbName,
        serverVersion: `${v.product_version || 'SQL Server'} (${v.product_level || ''})`,
        edition: v.edition || 'Microsoft SQL Server',
        status: 'ONLINE',
        tableCount: Number(s.table_count || 0),
        dataSizeMb: dataSize,
        logSizeMb: logSize,
        totalSizeMb: dataSize + logSize,
        lastBackupDate,
      };
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin tổng quan CSDL:', error);
      throw new BadRequestException(
        `Không thể lấy thông tin CSDL: ${error.message || 'Lỗi hệ thống'}`,
      );
    }
  }

  /**
   * Sao lưu CSDL và truyền trực tiếp tệp .bak về máy khách (Direct Download).
   * Tệp sao lưu tạm sẽ được tự động xóa sau khi stream kết thúc.
   */
  async streamDatabaseBackup(res: Response) {
    const dbName = process.env.DB_DATABASE || 'QLKienTap';
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const downloadFileName = `${dbName}_Backup_${timestampStr}.bak`;

    const tempDir = path.resolve(process.cwd(), 'temp_backups');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, downloadFileName);

    try {
      const escapedPath = tempFilePath.replace(/'/g, "''");
      const backupSql = `BACKUP DATABASE [${dbName}] TO DISK = N'${escapedPath}' WITH COPY_ONLY, FORMAT, INIT, CHECKSUM;`;
      await this.dataSource.query(backupSql);

      if (!fs.existsSync(tempFilePath)) {
        throw new BadRequestException(
          'Không tìm thấy tệp sao lưu sau khi hoàn thành lệnh trích xuất',
        );
      }

      res.download(tempFilePath, downloadFileName, (err) => {
        if (err) {
          console.error('Lỗi trong quá trình truyền file sao lưu:', err);
        }
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          if (fs.existsSync(tempDir)) {
            const remaining = fs.readdirSync(tempDir);
            if (remaining.length === 0) {
              fs.rmSync(tempDir, { recursive: true, force: true });
            }
          }
        } catch (cleanupErr) {
          console.error('Lỗi dọn dẹp tệp sao lưu tạm:', cleanupErr);
        }
      });
    } catch (error: any) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch {}

      console.error('LỖI KHI SAO LƯU CƠ SỞ DỮ LIỆU:', error);
      throw new BadRequestException(
        `Không thể sao lưu cơ sở dữ liệu: ${error.message || 'Lỗi hệ thống'}`,
      );
    }
  }

  /**
   * Tạo bản sao lưu toàn phần lưu trữ trên máy chủ trong thư mục backups/.
   */
  async createBackupOnServer() {
    const dbName = process.env.DB_DATABASE || 'QLKienTap';
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName = `${dbName}_Backup_${timestampStr}.bak`;

    const backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const filePath = path.join(backupDir, fileName);

    try {
      const escapedPath = filePath.replace(/'/g, "''");
      const backupSql = `BACKUP DATABASE [${dbName}] TO DISK = N'${escapedPath}' WITH COPY_ONLY, FORMAT, INIT, CHECKSUM;`;
      await this.dataSource.query(backupSql);

      if (!fs.existsSync(filePath)) {
        throw new BadRequestException(
          'Không tìm thấy tệp sao lưu trên máy chủ sau khi thực thi',
        );
      }

      const stat = fs.statSync(filePath);
      return {
        message: 'Tạo bản sao lưu trên máy chủ thành công',
        backup: {
          fileName,
          sizeBytes: stat.size,
          sizeFormatted: this.formatBytes(stat.size),
          createdAt: stat.birthtime || stat.mtime,
        },
      };
    } catch (error: any) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {}

      console.error('LỖI KHI TẠO BẢN SAO LƯU SERVER:', error);
      throw new BadRequestException(
        `Không thể tạo bản sao lưu trên máy chủ: ${error.message || 'Lỗi hệ thống'}`,
      );
    }
  }

  /**
   * Lấy danh sách tất cả các bản sao lưu đang lưu trữ trong thư mục backups/ trên máy chủ.
   */
  async listServerBackups() {
    const backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    try {
      const files = fs.readdirSync(backupDir);
      const bakFiles = files.filter((f) => f.toLowerCase().endsWith('.bak'));

      const result = bakFiles.map((fileName) => {
        const filePath = path.join(backupDir, fileName);
        const stat = fs.statSync(filePath);
        return {
          fileName,
          sizeBytes: stat.size,
          sizeFormatted: this.formatBytes(stat.size),
          createdAt: stat.birthtime || stat.mtime,
        };
      });

      return result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách bản sao lưu server:', error);
      throw new BadRequestException(
        `Không thể lấy danh sách bản sao lưu: ${error.message || 'Lỗi hệ thống'}`,
      );
    }
  }

  /**
   * Tải về một bản sao lưu cụ thể từ thư mục backups/ của máy chủ.
   */
  async downloadServerBackup(fileName: string, res: Response) {
    const sanitized = path.basename(fileName);
    if (!sanitized.toLowerCase().endsWith('.bak')) {
      throw new BadRequestException('Tên tệp sao lưu không hợp lệ');
    }

    const backupDir = path.resolve(process.cwd(), 'backups');
    const filePath = path.join(backupDir, sanitized);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Không tìm thấy tệp sao lưu trên máy chủ');
    }

    return res.download(filePath, sanitized);
  }

  /**
   * Xóa một bản sao lưu khỏi thư mục backups/ của máy chủ.
   */
  async deleteServerBackup(fileName: string) {
    const sanitized = path.basename(fileName);
    if (!sanitized.toLowerCase().endsWith('.bak')) {
      throw new BadRequestException('Tên tệp sao lưu không hợp lệ');
    }

    const backupDir = path.resolve(process.cwd(), 'backups');
    const filePath = path.join(backupDir, sanitized);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Không tìm thấy tệp sao lưu để xóa');
    }

    try {
      fs.unlinkSync(filePath);
      return { message: `Đã xóa bản sao lưu ${sanitized} thành công` };
    } catch (error: any) {
      console.error('Lỗi khi xóa file sao lưu:', error);
      throw new BadRequestException(
        `Không thể xóa bản sao lưu: ${error.message || 'Lỗi hệ thống'}`,
      );
    }
  }

  /**
   * Phục hồi cơ sở dữ liệu từ file .bak trên đĩa một cách an toàn.
   * Kết nối độc lập vào database master, kiểm tra tính toàn vẹn (VERIFYONLY),
   * ánh xạ tên tệp vật lý (RESTORE FILELISTONLY & MOVE), ngắt kết nối các session cũ (SINGLE_USER),
   * và luôn đảm bảo đưa database về trạng thái MULTI_USER trong khối finally.
   */
  async restoreDatabase(bakFilePath: string) {
    if (!fs.existsSync(bakFilePath)) {
      throw new BadRequestException('Tệp sao lưu không tồn tại trên hệ thống');
    }

    const dbName = process.env.DB_DATABASE || 'QLKienTap';
    const escapedPath = bakFilePath.replace(/'/g, "''");

    const config: sql.config = {
      user: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '',
      server: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 1433),
      database: 'master', // Bắt buộc kết nối trực tiếp vào master
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 30000,
      requestTimeout: 180000, // 3 phút để phục hồi
    };

    let pool: sql.ConnectionPool | null = null;
    try {
      pool = await new sql.ConnectionPool(config).connect();

      // 1. Kiểm tra tính toàn vẹn của tệp .bak
      try {
        await pool
          .request()
          .query(`RESTORE VERIFYONLY FROM DISK = N'${escapedPath}';`);
      } catch (verifyErr: any) {
        throw new BadRequestException(
          `Tệp sao lưu không hợp lệ hoặc bị lỗi: ${verifyErr.message || 'Kiểm tra VERIFYONLY thất bại'}`,
        );
      }

      // 2. Lấy thông tin Logical Name bên trong tệp .bak
      const fileListResult = await pool
        .request()
        .query(`RESTORE FILELISTONLY FROM DISK = N'${escapedPath}';`);
      const dataFile = fileListResult.recordset?.find((r: any) => r.Type === 'D');
      const logFile = fileListResult.recordset?.find((r: any) => r.Type === 'L');

      // 3. Lấy đường dẫn file vật lý hiện tại của Database
      const currentFilesResult = await pool.request().query(`
        SELECT name, physical_name, type_desc
        FROM sys.master_files
        WHERE database_id = DB_ID('${dbName}');
      `);
      const currentData = currentFilesResult.recordset?.find(
        (r: any) => r.type_desc === 'ROWS',
      );
      const currentLog = currentFilesResult.recordset?.find(
        (r: any) => r.type_desc === 'LOG',
      );

      let moveClause = '';
      if (dataFile && currentData && logFile && currentLog) {
        const logicalData = String(dataFile.LogicalName).replace(/'/g, "''");
        const logicalLog = String(logFile.LogicalName).replace(/'/g, "''");
        const physicalData = String(currentData.physical_name).replace(
          /'/g,
          "''",
        );
        const physicalLog = String(currentLog.physical_name).replace(
          /'/g,
          "''",
        );
        moveClause = `, MOVE N'${logicalData}' TO N'${physicalData}', MOVE N'${logicalLog}' TO N'${physicalLog}'`;
      }

      // 4. Ngắt kết nối các session đang làm việc trên QLKienTap
      await pool.request().query(`
        ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
      `);

      // 5. Tiến hành khôi phục CSDL
      const restoreSql = `
        RESTORE DATABASE [${dbName}]
        FROM DISK = N'${escapedPath}'
        WITH REPLACE${moveClause};
      `;
      await pool.request().query(restoreSql);

      return {
        success: true,
        message: 'Khôi phục cơ sở dữ liệu thành công!',
      };
    } catch (restoreErr: any) {
      console.error('LỖI KHÔI PHỤC CƠ SỞ DỮ LIỆU:', restoreErr);
      throw new BadRequestException(
        `Khôi phục cơ sở dữ liệu thất bại: ${restoreErr.message || 'Lỗi hệ thống'}`,
      );
    } finally {
      if (pool) {
        try {
          // Luôn đảm bảo CSDL trở về trạng thái MULTI_USER
          await pool.request().query(`
            ALTER DATABASE [${dbName}] SET MULTI_USER;
          `);
        } catch (multiUserErr) {
          console.error('Lỗi khi đưa database về MULTI_USER:', multiUserErr);
        }
        try {
          await pool.close();
        } catch {}
      }
    }
  }

  /**
   * Helper định dạng dung lượng byte sang KB, MB, GB dễ đọc.
   */
  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
