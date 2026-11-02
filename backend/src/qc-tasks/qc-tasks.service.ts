import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQcTaskDto } from './dto/create-qc-task.dto';
import { UpdateQcTaskDto } from './dto/update-qc-task.dto';

const assignedUserSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  profilePictureUrl: true,
};

@Injectable()
export class QcTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQcTaskDto: CreateQcTaskDto) {
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
    return this.prisma.qcTask.findMany({
      include: {
        assignedTo: { select: assignedUserSelect },
        checklists: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.qcTask.findUnique({
      where: { id },
      include: {
        checklists: { include: { response: true } },
        assignedTo: { select: assignedUserSelect },
      },
    });
  }

  update(id: string, updateQcTaskDto: UpdateQcTaskDto) {
    const { checklists, ...updateData } = updateQcTaskDto;
    return this.prisma.qcTask.update({
      where: { id },
      data: updateData as any,
    });
  }

  assign(id: string, userId: string) {
    return this.prisma.qcTask.update({
      where: { id },
      data: { assignedToId: userId, status: 'IN_PROGRESS' },
    });
  }

  unassign(id: string) {
    return this.prisma.qcTask.update({
      where: { id },
      data: { assignedToId: null, status: 'PENDING' },
    });
  }

  async addChecklist(id: string, title: string) {
    const existing = await this.prisma.qcChecklist.aggregate({
      where: { taskId: id },
      _max: { order: true },
    });

    const nextOrder = (existing._max.order || 0) + 1;

    return this.prisma.qcChecklist.create({
      data: { taskId: id, title, order: nextOrder },
    });
  }

  deleteChecklist(id: string) {
    return this.prisma.qcChecklist.delete({
      where: { id },
    });
  }

  submitChecklist(
    checklistId: string,
    data: {
      status: 'APPROVED' | 'REJECTED';
      comment: string;
      imageUrl: string;
    },
  ) {
    return this.prisma.qcResponse.create({
      data: {
        checklistId,
        ...data,
      },
    });
  }

  remove(id: string) {
    return this.prisma.qcTask.delete({
      where: { id },
    });
  }
}
