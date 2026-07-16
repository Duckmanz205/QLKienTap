import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TaskQueueService } from './task-queue.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TaskQueueService],
  exports: [TaskQueueService],
})
export class QueueModule {}
