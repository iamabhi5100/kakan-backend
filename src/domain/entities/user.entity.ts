import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Otp } from './otp.entity';
import { DownloadedVideo } from './downloaded-video.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  mobile: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ nullable: true })
  handleName?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: false })
  hasProfile: boolean;

  @OneToMany(() => Otp, otp => otp.user)
  otps: Otp[];

  @OneToMany(() => DownloadedVideo, downloadedVideo => downloadedVideo.user)
  downloadedVideos: DownloadedVideo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}