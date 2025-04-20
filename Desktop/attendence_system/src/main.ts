import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS with WebSocket support
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Attendance System API')
    .setDescription('Real-time attendance system with offline sync capabilities')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`WebSocket server is running on: ws://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap();
