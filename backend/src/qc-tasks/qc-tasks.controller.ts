import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QcTasksService } from './qc-tasks.service';
import { CreateQcTaskDto } from './dto/create-qc-task.dto';
import { UpdateQcTaskDto } from './dto/update-qc-task.dto';
import { Roles } from '../auth/auth.decorators';

@Controller('qc/tasks')
export class QcTasksController {
  constructor(private readonly qcTasksService: QcTasksService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateQcTaskDto) { return this.qcTasksService.create(dto); }

  @Get()
  findAll() { return this.qcTasksService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.qcTasksService.findOne(id); }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQcTaskDto) { return this.qcTasksService.update(id, dto); }

  @Roles('ADMIN')
  @Post(':id/assign')
  assign(@Param('id') id: string, @Body('userId') userId: string) { return this.qcTasksService.assign(id, userId); }

  @Roles('ADMIN')
  @Post(':id/unassign')
  unassign(@Param('id') id: string) { return this.qcTasksService.unassign(id); }

  @Roles('ADMIN')
  @Post(':id/checklists')
  addChecklist(@Param('id') id: string, @Body('title') title: string) { return this.qcTasksService.addChecklist(id, title); }

  @Roles('ADMIN')
  @Delete('checklists/:id')
  deleteChecklist(@Param('id') id: string) { return this.qcTasksService.deleteChecklist(id); }

  @Post(':id/submit')
  submitChecklist(@Body() body: { checklistId: string; status: 'APPROVED' | 'REJECTED'; comment: string; imageUrl: string }) {
    return this.qcTasksService.submitChecklist(body.checklistId, body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.qcTasksService.remove(id); }
}
