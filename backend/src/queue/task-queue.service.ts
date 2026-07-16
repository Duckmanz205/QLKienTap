import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

@Injectable()
export class TaskQueueService implements OnModuleInit {
  private readonly logger = new Logger(TaskQueueService.name);
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private useInMemory = true;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    this.logger.log(`Checking Redis connection at ${host}:${port}...`);
    
    const isRedisReady = await this.testRedisConnection(host, port);
    if (isRedisReady) {
      this.logger.log(`Redis server is online! Initializing BullMQ...`);
      try {
        const connection = { host, port };
        
        // Define queue
        this.queue = new Queue('task-queue', { connection });
        
        // Define worker
        this.worker = new Worker('task-queue', async (job) => {
          await this.processJob(job.name, job.data);
        }, { connection });

        this.worker.on('completed', (job) => {
          this.logger.log(`Job [${job.id}] of type [${job.name}] completed successfully.`);
        });

        this.worker.on('failed', (job, err) => {
          this.logger.warn(`Job [${job?.id}] of type [${job?.name}] failed: ${err.message}`);
        });

        this.useInMemory = false;
        this.logger.log(`BullMQ initialized successfully.`);
      } catch (err) {
        this.logger.error(`Failed to initialize BullMQ. Falling back to in-memory queue. Error: ${err.message}`);
        this.useInMemory = true;
      }
    } else {
      this.logger.warn(`Redis is offline or unreachable. Falling back to In-Memory Task Processor.`);
      this.useInMemory = true;
    }
  }

  private testRedisConnection(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500); // 1.5s timeout

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  async addJob(name: string, data: any) {
    if (!this.useInMemory && this.queue) {
      this.logger.log(`Queueing BullMQ job: [${name}]`);
      await this.queue.add(name, data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    } else {
      this.logger.log(`Processing in-memory background task immediately: [${name}]`);
      setTimeout(async () => {
        try {
          await this.processJob(name, data);
        } catch (err) {
          this.logger.error(`In-Memory job [${name}] execution failed: ${err.message}`);
        }
      }, 500);
    }
  }

  private async processJob(name: string, data: any) {
    this.logger.log(`Processing task [${name}] with data: ${JSON.stringify(data)}`);
    
    switch (name) {
      case 'send-email':
        await this.handleSendEmail(data);
        break;
      case 'send-reminder':
        await this.handleSendReminder(data);
        break;
      case 'export-file':
        await this.handleExportFile(data);
        break;
      default:
        this.logger.warn(`Unknown job type: ${name}`);
    }
  }

  private async handleSendEmail(data: { to: string; subject: string; body: string }) {
    this.logger.log(`[Email Queue] Sending email to ${data.to}...`);
    await new Promise((r) => setTimeout(r, 1000));
    this.logger.log(`[Email Queue] Email sent successfully to ${data.to}.`);
  }

  private async handleSendReminder(data: { studentId: number; title: string; message: string }) {
    this.logger.log(`[Reminder Queue] Sending reminder to student ID ${data.studentId}...`);
    await new Promise((r) => setTimeout(r, 1000));
    this.logger.log(`[Reminder Queue] Reminder sent successfully to student ID ${data.studentId}.`);
  }

  private async handleExportFile(data: { type: string; filter: any; outputFileName: string }) {
    this.logger.log(`[Export Queue] Generating export for ${data.type} with filters...`);
    await new Promise((r) => setTimeout(r, 2000));
    this.logger.log(`[Export Queue] File exported successfully: ${data.outputFileName}`);
  }
}
