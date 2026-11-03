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
