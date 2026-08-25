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
      'Homework 3 backend — a small public API for the Nestly app. ' +
        'Every route here is public (no authentication yet); use it to swap your hardcoded ' +
        '`stays` array for real HTTP calls with Angular\'s HttpClient.',
    )
    .setVersion('1.0')
    .addTag('stays', 'CRUD operations for stay listings')
    .addTag('seed', 'Fill (or reset) the database with sample data')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Nestly API listening on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
