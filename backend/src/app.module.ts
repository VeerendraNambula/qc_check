import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { QcTasksModule } from './qc-tasks/qc-tasks.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpaFallbackFilter } from './spa-fallback.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'frontend', 'dist'),
      exclude: ['/api/(.*)', '/uploads/(.*)'],
    }),
    PrismaModule,
    UsersModule,
    QcTasksModule,
    AuthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SpaFallbackFilter,
    },
  ],
})
export class AppModule { }
