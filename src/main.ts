import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API for authentication and user management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token', // Mô tả để người dùng nhập token
      },
      'access-token', // Tên của security scheme
    ) // Add JWT Authentication
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Swagger path definition

  await app.listen(process.env.PORT ?? 3001);
  app.enableCors({
    origin: [
      'https://manager-chatbot.vercel.app/',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
}
bootstrap();
