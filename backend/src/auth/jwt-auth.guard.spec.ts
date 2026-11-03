import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { signAccessToken } from './jwt.util';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const usersService = { findTokenVersion: jest.fn() };
  const guard = new JwtAuthGuard(reflector as any, usersService as any);
  const context = (authorization?: string) => {
    const request: any = { headers: authorization ? { authorization } : {}, user: undefined };
    const ctx = { getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
    return { ctx, request };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
    usersService.findTokenVersion.mockResolvedValue(0);
    reflector.getAllAndOverride.mockImplementation((key: string) => key === 'isPublic' ? false : undefined);
  });

  it('allows public routes without a token', async () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);
    await expect(guard.canActivate(context().ctx)).resolves.toBe(true);
  });

  it('rejects requests without a bearer token', async () => {
    await expect(guard.canActivate(context().ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches verified identity after checking the current token version', async () => {
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER', tokenVersion: 0 });
    const { ctx, request } = context(`Bearer ${token}`);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(usersService.findTokenVersion).toHaveBeenCalledWith('user-1');
    expect(request.user).toEqual({ id: 'user-1', username: 'tester', role: 'USER' });
  });

  it('rejects a token after its user token version has been incremented', async () => {
    usersService.findTokenVersion.mockResolvedValue(1);
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER', tokenVersion: 0 });
    await expect(guard.canActivate(context(`Bearer ${token}`).ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects tokens for deleted users', async () => {
    usersService.findTokenVersion.mockResolvedValue(null);
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' });
    await expect(guard.canActivate(context(`Bearer ${token}`).ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects users without the required role', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === 'roles' ? ['ADMIN'] : false);
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' });
    await expect(guard.canActivate(context(`Bearer ${token}`).ctx)).rejects.toThrow(ForbiddenException);
  });
});
