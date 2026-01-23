import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QcTasksService } from './qc-tasks.service';
import { CreateQcTaskDto } from './dto/create-qc-task.dto';
import { UpdateQcTaskDto } from './dto/update-qc-task.dto';

@Controller('qc/tasks')
export class QcTasksController {
  constructor(private readonly qcTasksService: QcTasksService) { }

  @Post()
  create(@Body() createQcTaskDto: CreateQcTaskDto) {
    return this.qcTasksService.create(createQcTaskDto);
  }

  @Get()
  findAll() {
    return this.qcTasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qcTasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQcTaskDto: UpdateQcTaskDto) {
    return this.qcTasksService.update(id, updateQcTaskDto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body('userId') userId: string) {
    return this.qcTasksService.assign(id, userId);
  }

  @Post(':id/unassign')
  unassign(@Param('id') id: string) {
    return this.qcTasksService.unassign(id);
  }

  @Post(':id/checklists')
  addChecklist(@Param('id') id: string, @Body('title') title: string) {
    return this.qcTasksService.addChecklist(id, title);
  }

  @Delete('checklists/:id')
  deleteChecklist(@Param('id') id: string) {
    return this.qcTasksService.deleteChecklist(id);
  }

  @Post(':id/submit')
  submitChecklist(
    @Body()
    body: {
      checklistId: string;
      status: 'APPROVED' | 'REJECTED';
      comment: string;
      imageUrl: string;
    },
  ) {
    // Note: In a real app, we might submit all at once or individually. Here we support individual submission.
    return this.qcTasksService.submitChecklist(body.checklistId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qcTasksService.remove(id);
  }
}
