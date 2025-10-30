import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/entities/user.entity";
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.getOrThrow<string>("DATABASE_HOST"),
        port: configService.getOrThrow<number>("DATABASE_PORT"),
        username: configService.getOrThrow<string>("DATABASE_USER"),
        password: configService.getOrThrow<string>("DATABASE_PASSWORD"),
        database: configService.getOrThrow<string>("DATABASE_NAME"),
        entities: [User],
        synchronize: configService.getOrThrow<string>("NODE_ENV") === 'development',
        logging: configService.getOrThrow<string>("DATABASE_LOGGING") === 'true',
      }),
    }),
    AuthModule,
    UsersModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
