import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskQueueService } from './task-queue.service';
import { CronService } from './cron.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TaskQueueService, CronService],
  exports: [TaskQueueService, CronService],
})
export class QueueModule {}
