import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { apiReference } from "@scalar/nestjs-api-reference";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Auth Example")
    .setDescription("The Auth API description")
    .setVersion("1.0")
    .addTag("auth")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.use(
    "/reference",
    apiReference({
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `Application is running on: http://${process.env.HOST ?? "localhost"}:${process.env.PORT ?? 3000}`,
    );
  });
}
bootstrap();
