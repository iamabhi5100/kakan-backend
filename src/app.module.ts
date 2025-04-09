import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/use-cases/auth/auth.service';
import { TwilioService } from './infrastructure/twilio/twilio.service';
import { UserRepositoryImpl } from './infrastructure/database/user.repository.impl';
import { User } from './domain/entities/user.entity';
import { Otp } from './domain/entities/otp.entity';
import { DownloadedVideo } from './domain/entities/downloaded-video.entity'; // Add this
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './presentation/controllers/jwt.strategy';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.NEON_DATABASE_URL,
      entities: [User, Otp, DownloadedVideo], // Add DownloadedVideo
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Otp, DownloadedVideo]), // Add DownloadedVideo
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TwilioService,
    JwtStrategy,
    { provide: 'UserRepositoryInterface', useClass: UserRepositoryImpl },
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class AppModule {}