import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QuizModule } from "./quiz/quiz.module";
import { SessionModule } from "./session/session.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "dev_secret"),
        signOptions: { expiresIn: "7d" },
      }),
    }),
    PrismaModule,
    AuthModule,
    QuizModule,
    SessionModule,
    HealthModule,
  ],
})
export class AppModule {}
