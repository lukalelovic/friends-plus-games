const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}

bootstrap();