import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from 'src/application/use-cases/auth/auth.service';
import { RequestOtpDto } from './dtos/request-otp.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

class SaveVideoDto {
  videoId: string;
  title: string;
  channelTitle: string;
  filePath: string;
  thumbnailUrl?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return await this.authService.requestOtp(dto.mobile);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.authService.verifyOtp(dto.mobile, dto.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-profile')
  async createProfile(@Body() dto: CreateProfileDto, @Req() req: Request) {
    return await this.authService.createProfile(dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save-downloaded-video')
  async saveDownloadedVideo(@Body() dto: SaveVideoDto, @Req() req: Request) {
    return await this.authService.saveDownloadedVideo(dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('downloaded-videos')
  async getDownloadedVideos(@Req() req: Request) {
    return await this.authService.getDownloadedVideos(req);
  }
}