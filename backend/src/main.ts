import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  console.log('Bootstrap starting...');
  const app = await NestFactory.create(AppModule);
  console.log('App created.');
  app.setGlobalPrefix('api', {
    exclude: [{ path: '*', method: RequestMethod.GET }],
  });
  app.enableCors({
    origin: true, // Allow any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  console.log('CORS enabled with permissive config.');
  const port = process.env.PORT ?? 3000;
  console.log(`Attempting to listen on port ${port}...`);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is listening on: ${await app.getUrl()}`);
}
bootstrap();