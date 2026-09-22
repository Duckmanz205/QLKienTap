import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTripRegistrationStatus() {
    try {
      await this.dataSource.query('EXEC sp_TuDongDongMoDangKyLich');
      this.logger.log('Executed sp_TuDongDongMoDangKyLich successfully.');
    } catch (error) {
      // It will throw an error if the procedure doesn't exist yet, 
      // but once the user adds it to their SQL it will work.
      this.logger.error('Failed to execute sp_TuDongDongMoDangKyLich', error.stack);
    }
  }
}
