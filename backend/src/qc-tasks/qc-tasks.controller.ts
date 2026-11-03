import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ForbiddenException } from '@nestjs/common';
import { QcTasksService } from './qc-tasks.service';
import { CreateQcTaskDto } from './dto/create-qc-task.dto';
import { UpdateQcTaskDto } from './dto/update-qc-task.dto';
import { Roles } from '../auth/auth.decorators';

@Controller('qc/tasks')
export class QcTasksController {
  constructor(private readonly service: QcTasksService) {}
  @Roles('ADMIN') @Post() create(@Body() dto: CreateQcTaskDto) { return this.service.create(dto); }
  @Get() findAll(@Req() req: any) { return req.user.role === 'ADMIN' ? this.service.findAll() : this.service.findAllForUser(req.user.id); }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return req.user.role === 'ADMIN' ? this.service.findOne(id) : this.service.findOneForUser(id, req.user.id); }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQcTaskDto, @Req() req: any) {
    if (req.user.role === 'ADMIN') return this.service.update(id, dto);
    const keys = Object.keys(dto);
    if (keys.length !== 1 || keys[0] !== 'status' || !['COMPLETED', 'REJECTED'].includes(dto.status || '')) throw new ForbiddenException('Inspectors may only submit the final status of their assigned tasks');
    return this.service.updateStatusForUser(id, req.user.id, dto.status as 'COMPLETED' | 'REJECTED');
  }

  @Roles('ADMIN') @Post(':id/assign') assign(@Param('id') id: string, @Body('userId') userId: string) { return this.service.assign(id, userId); }
  @Roles('ADMIN') @Post(':id/unassign') unassign(@Param('id') id: string) { return this.service.unassign(id); }
  @Post(':id/claim') claim(@Param('id') id: string, @Req() req: any) { return this.service.claim(id, req.user.id); }
  @Roles('ADMIN') @Post(':id/checklists') addChecklist(@Param('id') id: string, @Body('title') title: string) { return this.service.addChecklist(id, title); }
  @Roles('ADMIN') @Delete('checklists/:id') deleteChecklist(@Param('id') id: string) { return this.service.deleteChecklist(id); }
  @Post(':id/submit') submitChecklist(@Body() body: { checklistId: string; status: 'APPROVED' | 'REJECTED'; comment: string; imageUrl: string }, @Req() req: any) { return this.service.submitChecklist(body.checklistId, req.user.id, body); }
  @Roles('ADMIN') @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
