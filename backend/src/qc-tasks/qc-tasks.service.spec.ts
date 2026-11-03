import { QcTasksService } from './qc-tasks.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('QcTasksService authorization boundaries', () => {
  const task = { id: 'task-1', assignedToId: 'user-1', status: 'IN_PROGRESS' };

  it('lists only tasks assigned to the user or unassigned tasks', async () => {
    const prisma = { qcTask: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new QcTasksService(prisma as any);

    await service.findAllForUser('user-1');

    expect(prisma.qcTask.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ assignedToId: 'user-1' }, { assignedToId: null }] },
    }));
  });

  it('rejects viewing a task assigned to another user', async () => {
    const prisma = { qcTask: { findUnique: jest.fn().mockResolvedValue({ ...task, assignedToId: 'user-2' }) } };
    const service = new QcTasksService(prisma as any);

    await expect(service.findOneForUser('task-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns an unassigned task to an eligible user', async () => {
    const prisma = { qcTask: { findUnique: jest.fn().mockResolvedValue({ ...task, assignedToId: null }) } };
    const service = new QcTasksService(prisma as any);

    await expect(service.findOneForUser('task-1', 'user-1')).resolves.toMatchObject({ id: 'task-1' });
  });

  it('rejects final status updates when the task belongs to another user', async () => {
    const prisma = {
      qcTask: {
        findUnique: jest.fn().mockResolvedValue({ ...task, assignedToId: 'user-2' }),
        update: jest.fn(),
      },
    };
    const service = new QcTasksService(prisma as any);

    await expect(service.updateStatusForUser('task-1', 'user-1', 'COMPLETED')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.qcTask.update).not.toHaveBeenCalled();
  });

  it('allows the assigned user to submit a final task status', async () => {
    const prisma = {
      qcTask: {
        findUnique: jest.fn().mockResolvedValue(task),
        update: jest.fn().mockResolvedValue({ ...task, status: 'COMPLETED' }),
      },
    };
    const service = new QcTasksService(prisma as any);

    await service.updateStatusForUser('task-1', 'user-1', 'COMPLETED');

    expect(prisma.qcTask.update).toHaveBeenCalledWith({
      where: { id: 'task-1' }, data: { status: 'COMPLETED' },
    });
  });

  it('uses a conditional update so only one user can claim an available task', async () => {
    const prisma = {
      qcTask: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    const service = new QcTasksService(prisma as any);

    await expect(service.claim('task-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.qcTask.updateMany).toHaveBeenCalledWith({
      where: { id: 'task-1', assignedToId: null, status: 'PENDING' },
      data: { assignedToId: 'user-1', status: 'IN_PROGRESS' },
    });
  });

  it('rejects checklist submissions for tasks assigned to someone else', async () => {
    const prisma = {
      qcChecklist: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'check-1', task: { assignedToId: 'user-2' },
        }),
      },
      qcResponse: { create: jest.fn() },
    };
    const service = new QcTasksService(prisma as any);

    await expect(service.submitChecklist('check-1', 'user-1', {
      status: 'APPROVED', comment: 'Checked', imageUrl: '',
    })).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.qcResponse.create).not.toHaveBeenCalled();
  });

  it('returns not found when a requested task does not exist', async () => {
    const prisma = { qcTask: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new QcTasksService(prisma as any);

    await expect(service.findOneForUser('missing', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
