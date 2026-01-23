import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQcTaskDto } from './dto/create-qc-task.dto';
import { UpdateQcTaskDto } from './dto/update-qc-task.dto';

@Injectable()
export class QcTasksService {
  constructor(private readonly prisma: PrismaService) { }

  // @ts-ignore
  async create(createQcTaskDto: CreateQcTaskDto) {
    // @ts-ignore
    return this.prisma.qcTask.create({
      data: {
        title: createQcTaskDto.title,
        description: createQcTaskDto.description,
        status: 'PENDING',
        checklists: createQcTaskDto.checklists
          ? {
            create: createQcTaskDto.checklists.map((item, index) => ({
              title: item.title,
              order: item.order ?? index + 1,
            })),
          }
          : undefined,
      },
      include: { checklists: true },
    });
  }

  findAll() {
    // @ts-ignore
    return this.prisma.qcTask.findMany({
      include: { assignedTo: true, checklists: true },
    });
  }

  findOne(id: string) {
    // @ts-ignore
    return this.prisma.qcTask.findUnique({
      where: { id },
      include: {
        checklists: { include: { response: true } },
        assignedTo: true
      },
    });
  }

  // @ts-ignore
  update(id: string, updateQcTaskDto: UpdateQcTaskDto) {
    const { checklists, ...updateData } = updateQcTaskDto;
    // @ts-ignore
    return this.prisma.qcTask.update({
      where: { id },
      data: updateData as any,
    });
  }

  assign(id: string, userId: string) {
    // @ts-ignore
    return this.prisma.qcTask.update({
      where: { id },
      data: { assignedToId: userId, status: 'IN_PROGRESS' },
    });
  }

  unassign(id: string) {
    // @ts-ignore
    return this.prisma.qcTask.update({
      where: { id },
      data: { assignedToId: null, status: 'PENDING' },
    });
  }

  // @ts-ignore
  async addChecklist(id: string, title: string) {
    // Find current max order
    // @ts-ignore
    const existing = await this.prisma.qcChecklist.aggregate({
      where: { taskId: id },
      _max: { order: true }
    });

    const nextOrder = (existing._max.order || 0) + 1;

    // @ts-ignore
    return this.prisma.qcChecklist.create({
      data: {
        taskId: id,
        title,
        order: nextOrder
      }
    });
  }

  // @ts-ignore
  deleteChecklist(id: string) {
    // @ts-ignore
    return this.prisma.qcChecklist.delete({
      where: { id },
    });
  }

  // @ts-ignore
  submitChecklist(
    checklistId: string,
    data: {
      status: 'APPROVED' | 'REJECTED';
      comment: string;
      imageUrl: string;
    },
  ) {
    // @ts-ignore
    return this.prisma.qcResponse.create({
      data: {
        checklistId,
        ...data,
      },
    });
  }

  remove(id: string) {
    // @ts-ignore
    return this.prisma.qcTask.delete({
      where: { id },
    });
  }
}
