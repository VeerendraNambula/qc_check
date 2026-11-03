import { AuthService } from './auth.service';

describe('AuthService password recovery', () => {
  const user = { id: 'user-1', email: 'person@example.com' };
  const usersService = {
    findOneByEmail: jest.fn(),
    update: jest.fn(),
  };
  const transporter = { sendMail: jest.fn().mockResolvedValue({}) };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.findOneByEmail.mockResolvedValue(user);
    usersService.update.mockResolvedValue({});
    process.env.FRONTEND_URL = 'https://app.example.com';
    service = new AuthService(usersService as any);
    (service as any).transporter = transporter;
  });

  afterAll(() => {
    delete process.env.FRONTEND_URL;
  });

  it('stores only a SHA-256 hash while emailing the raw reset token', async () => {
    await service.forgotPassword({ email: user.email });

    const updateData = usersService.update.mock.calls[0][1];
    const mail = transporter.sendMail.mock.calls[0][0];
    const resetLink = mail.text.match(/https:\/\/app\.example\.com\/reset-password\?token=([^ ]+)/)?.[0];
    expect(resetLink).toBeDefined();

    const rawToken = new URL(resetLink!).searchParams.get('token');
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    expect(updateData.resetToken).toBe(
      require('crypto').createHash('sha256').update(rawToken).digest('hex'),
    );
    expect(updateData.resetToken).not.toBe(rawToken);
    expect(mail.html).toContain(rawToken);
    expect(updateData.resetTokenExpiry).toBeInstanceOf(Date);
  });
});
