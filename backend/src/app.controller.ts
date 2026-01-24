import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /*
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  */
  @Get('*')
  getFallback(@Res() res: Response) {
    res.sendFile(join(process.cwd(), '..', 'frontend', 'dist', 'index.html'));
  }
