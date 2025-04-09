import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TwilioService } from '../../../infrastructure/twilio/twilio.service';
import { UserRepositoryInterface } from '../../../domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { CreateProfileDto } from '../../../presentation/controllers/dtos/create-profile.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly twilioService: TwilioService,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  private normalizeMobile(mobile: string): string {
    if (!mobile.startsWith('+')) {
      return `+91${mobile}`;
    }
    return mobile;
  }

  async requestOtp(mobile: string): Promise<{ message: string }> {
    if (!mobile) {
      throw new BadRequestException('Mobile number is required');
    }
    
    const normalizedMobile = this.normalizeMobile(mobile);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await this.userRepository.findUserByMobile(normalizedMobile);
    if (!user) {
      user = await this.userRepository.createUser(normalizedMobile);
    }
    await this.userRepository.storeOtp(user, otpCode, expiresAt);
    await this.twilioService.sendOtp(normalizedMobile, otpCode);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(mobile: string, otp: string): Promise<{ token: string; hasProfile: boolean }> {
    if (!mobile || !otp) {
      throw new BadRequestException('Mobile and OTP are required');
    }

    const normalizedMobile = this.normalizeMobile(mobile);
    const user = await this.userRepository.findUserByMobile(normalizedMobile);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const latestOtp = await this.userRepository.getLatestOtp(user);
    if (!latestOtp) {
      throw new BadRequestException('No OTP requested');
    }

    if (latestOtp.code !== otp || latestOtp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.userRepository.deleteOtp(latestOtp.id);

    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    return { token, hasProfile: user.hasProfile };
  }

  async createProfile(dto: CreateProfileDto, req: Request): Promise<{ message: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string; mobile: string };
    const user = await this.userRepository.findUserByMobile(decoded.mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const existingUser = await this.userRepository.findUserByUsername(dto.username);
    if (existingUser && existingUser.id !== user.id) {
      throw new BadRequestException('Username is already taken');
    }

    user.username = dto.username;
    user.handleName = dto.handleName;
    user.fullName = dto.fullName;
    user.email = dto.email || undefined;
    user.hasProfile = true;
    await this.userRepository.updateUser(user);

    return { message: 'Profile created successfully' };
  }

  async saveDownloadedVideo(
    dto: { videoId: string; title: string; channelTitle: string; filePath: string; thumbnailUrl?: string },
    req: Request
  ): Promise<{ message: string }> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string; mobile: string };
    const user = await this.userRepository.findUserByMobile(decoded.mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.userRepository.storeDownloadedVideo(user, dto);
    return { message: 'Video download saved successfully' };
  }

  async getDownloadedVideos(req: Request): Promise<any[]> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string; mobile: string };
    const user = await this.userRepository.findUserByMobile(decoded.mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const videos = await this.userRepository.getDownloadedVideos(user.id);
    return videos.map(video => ({
      id: video.id,
      videoId: video.videoId,
      title: video.title,
      channelTitle: video.channelTitle,
      filePath: video.filePath,
      thumbnailUrl: video.thumbnailUrl,
      createdAt: video.createdAt,
    }));
  }
}