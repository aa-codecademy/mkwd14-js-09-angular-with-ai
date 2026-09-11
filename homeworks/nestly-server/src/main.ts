import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.CORS_ORIGIN ?? '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nestly API')
    .setDescription(
      'Backend for the Nestly homeworks. Reading stays is public; creating/updating a stay ' +
        'requires a logged-in user and deleting one requires an ADMIN (Homework 6).',
    )
    .setVersion('1.0')
    .addTag('stays', 'CRUD operations for stay listings')
    .addTag('seed', 'Fill (or reset) the database with sample data')
    .addTag('auth', 'Register, log in, refresh, log out')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Nestly API listening on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
