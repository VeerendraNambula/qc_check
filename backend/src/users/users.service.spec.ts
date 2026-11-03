import { UsersService } from './users.service';
import * as crypto from 'crypto';

describe('UsersService password reset token lookup', () => {
  it('hashes the supplied raw token before querying the database', async () => {
    const rawToken = 'a'.repeat(64);
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
    };
    const service = new UsersService(prisma as any);

    await service.findByResetToken(rawToken);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        resetToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
        resetTokenExpiry: { gt: expect.any(Date) },
      },
    });
  });
});


describe('UsersService registration privileges', () => {
  it('always creates a USER account, ignoring any supplied role field', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }) => data),
      },
    };
    const service = new UsersService(prisma as any);

    await service.create({
      name: 'New Inspector',
      username: 'inspector1',
      email: 'inspector@example.com',
      password: 'StrongPassword123!',
      role: 'ADMIN',
    } as any);

    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: 'USER' }),
      select: expect.objectContaining({ id: true, role: true }),
    }));
  });
});
