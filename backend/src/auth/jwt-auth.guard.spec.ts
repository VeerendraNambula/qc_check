import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { signAccessToken } from './jwt.util';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new JwtAuthGuard(reflector as any);
  const context = (authorization?: string) => {
    const request: any = { headers: authorization ? { authorization } : {}, user: undefined };
    const ctx = { getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
    return { ctx, request };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
    reflector.getAllAndOverride.mockImplementation((key: string) => key === 'isPublic' ? false : undefined);
  });

  it('allows public routes without a token', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);
    expect(guard.canActivate(context().ctx)).toBe(true);
  });

  it('rejects requests without a bearer token', () => {
    expect(() => guard.canActivate(context().ctx)).toThrow(UnauthorizedException);
  });

  it('attaches verified identity to the request', () => {
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' });
    const { ctx, request } = context(`Bearer ${token}`);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(request.user).toEqual({ id: 'user-1', username: 'tester', role: 'USER' });
  });

  it('rejects users without the required role', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => key === 'roles' ? ['ADMIN'] : false);
    const token = signAccessToken({ id: 'user-1', username: 'tester', role: 'USER' });
    expect(() => guard.canActivate(context(`Bearer ${token}`).ctx)).toThrow(ForbiddenException);
  });
});
