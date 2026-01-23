import { Module } from '@nestjs/common';
import { QcTasksService } from './qc-tasks.service';
import { QcTasksController } from './qc-tasks.controller';

@Module({
  controllers: [QcTasksController],
  providers: [QcTasksService],
})
export class QcTasksModule {}
