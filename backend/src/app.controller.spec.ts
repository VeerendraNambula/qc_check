import { AppController } from './app.controller';

describe('AppController', () => {
  const appController = new AppController();

  it('returns a healthy status', () => {
    expect(appController.health()).toEqual({ status: 'ok' });
  });
});
