import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQcTaskDto } from './dto/create-qc-task.dto';
import { UpdateQcTaskDto } from './dto/update-qc-task.dto';

const assignedUserSelect = { id: true, name: true, username: true, role: true, profilePictureUrl: true } as const;
@Injectable()
export class QcTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQcTaskDto) {
    return this.prisma.qcTask.create({ data: { title: dto.title, description: dto.description, status: 'PENDING', checklists: dto.checklists ? { create: dto.checklists.map((item, index) => ({ title: item.title, order: item.order ?? index + 1 })) } : undefined }, include: { checklists: true } });
  }

  findAll() { return this.prisma.qcTask.findMany({ include: { assignedTo: { select: assignedUserSelect }, checklists: true } }); }
  findAllForUser(userId: string) { return this.prisma.qcTask.findMany({ where: { OR: [{ assignedToId: userId }, { assignedToId: null }] }, include: { assignedTo: { select: assignedUserSelect }, checklists: true } }); }
  findOne(id: string) { return this.prisma.qcTask.findUnique({ where: { id }, include: { checklists: { include: { response: true } }, assignedTo: { select: assignedUserSelect } } }); }

  async findOneForUser(id: string, userId: string) {
    const task = await this.findOne(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.assignedToId && task.assignedToId !== userId) throw new ForbiddenException('This task is assigned to another inspector');
    return task;
  }

  update(id: string, dto: UpdateQcTaskDto) {
    const { checklists, ...updateData } = dto;
    return this.prisma.qcTask.update({ where: { id }, data: updateData as any });
  }

  async updateStatusForUser(id: string, userId: string, status: 'COMPLETED' | 'REJECTED') {
    const task = await this.prisma.qcTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.assignedToId !== userId) throw new ForbiddenException('You can only submit a task assigned to you');
    return this.prisma.qcTask.update({ where: { id }, data: { status } });
  }

  async claim(id: string, userId: string) {
    const result = await this.prisma.qcTask.updateMany({ where: { id, assignedToId: null, status: 'PENDING' }, data: { assignedToId: userId, status: 'IN_PROGRESS' } });
    if (result.count !== 1) throw new ForbiddenException('This task is no longer available to claim');
    return this.findOne(id);
  }

  assign(id: string, userId: string) { return this.prisma.qcTask.update({ where: { id }, data: { assignedToId: userId, status: 'IN_PROGRESS' } }); }
  unassign(id: string) { return this.prisma.qcTask.update({ where: { id }, data: { assignedToId: null, status: 'PENDING' } }); }

  async addChecklist(id: string, title: string) {
    const existing = await this.prisma.qcChecklist.aggregate({ where: { taskId: id }, _max: { order: true } });
    return this.prisma.qcChecklist.create({ data: { taskId: id, title, order: (existing._max.order || 0) + 1 } });
  }
  deleteChecklist(id: string) { return this.prisma.qcChecklist.delete({ where: { id } }); }

  async submitChecklist(checklistId: string, userId: string, data: { status: 'APPROVED' | 'REJECTED'; comment: string; imageUrl: string }) {
    const checklist = await this.prisma.qcChecklist.findUnique({ where: { id: checklistId }, include: { task: true } });
    if (!checklist) throw new NotFoundException('Checklist item not found');
    if (checklist.task.assignedToId !== userId) throw new ForbiddenException('You can only submit checklist items for tasks assigned to you');
    return this.prisma.qcResponse.create({ data: { checklistId, ...data } });
  }
  remove(id: string) { return this.prisma.qcTask.delete({ where: { id } }); }
}
