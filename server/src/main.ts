import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.CORS_ORIGIN ?? '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mango API')
    .setDescription(
      'Shared backend for the Mango reference app used across the Angular training modules (G06+).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the accessToken returned by POST /auth/login.',
      },
      'bearer',
    )
    .addTag('health', 'Liveness check')
    .addTag('auth', 'Registration, login, token refresh and the current user')
    .addTag('categories', 'Read-only product categories')
    .addTag(
      'products',
      'Browsing the catalog; creating and editing it as an admin',
    )
    .addTag('orders', 'Placing orders and moving them through their lifecycle')
    .addTag('seed', 'Filling and resetting the database with demo data')
    .addTag('dev', 'Local-only helpers, available while AUTH_BYPASS is on')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha' },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Mango API listening on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
