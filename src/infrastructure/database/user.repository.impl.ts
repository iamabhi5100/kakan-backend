import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Otp } from '../../domain/entities/otp.entity';
import { DownloadedVideo } from '../../domain/entities/downloaded-video.entity';

@Injectable()
export class UserRepositoryImpl implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(DownloadedVideo)
    private readonly downloadedVideoRepository: Repository<DownloadedVideo>,
  ) {}

  async findUserByMobile(mobile: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { mobile } });
    return user ?? undefined;
  }

  async createUser(mobile: string): Promise<User> {
    const user = this.userRepository.create({ mobile });
    return this.userRepository.save(user);
  }

  async storeOtp(user: User, code: string, expiresAt: Date): Promise<Otp> {
    const otp = this.otpRepository.create({ code, expiresAt, user });
    return this.otpRepository.save(otp);
  }

  async getLatestOtp(user: User): Promise<Otp | undefined> {
    const otp = await this.otpRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
    return otp ?? undefined;
  }

  async deleteOtp(otpId: string): Promise<void> {
    await this.otpRepository.delete(otpId);
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  async updateUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async storeDownloadedVideo(
    user: User,
    videoData: { videoId: string; title: string; channelTitle: string; filePath: string; thumbnailUrl?: string }
  ): Promise<DownloadedVideo> {
    const downloadedVideo = this.downloadedVideoRepository.create({
      ...videoData,
      user,
    });
    return this.downloadedVideoRepository.save(downloadedVideo);
  }

  async getDownloadedVideos(userId: string): Promise<DownloadedVideo[]> {
    return this.downloadedVideoRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}