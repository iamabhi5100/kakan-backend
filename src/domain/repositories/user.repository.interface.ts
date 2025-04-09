import { User } from '../entities/user.entity';
import { Otp } from '../entities/otp.entity';
import { DownloadedVideo } from '../entities/downloaded-video.entity';

export interface UserRepositoryInterface {
  findUserByMobile(mobile: string): Promise<User | undefined>;
  createUser(mobile: string): Promise<User>;
  storeOtp(user: User, otp: string, expiresAt: Date): Promise<Otp>;
  getLatestOtp(user: User): Promise<Otp | undefined>;
  deleteOtp(otpId: string): Promise<void>;
  findUserByUsername(username: string): Promise<User | undefined>;
  updateUser(user: User): Promise<User>;
  storeDownloadedVideo(user: User, videoData: { videoId: string; title: string; channelTitle: string; filePath: string; thumbnailUrl?: string }): Promise<DownloadedVideo>; // New method
  getDownloadedVideos(userId: string): Promise<DownloadedVideo[]>; // New method
}