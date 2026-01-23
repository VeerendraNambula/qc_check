import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }
  async onModuleInit() {
    // Lazy connect
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
