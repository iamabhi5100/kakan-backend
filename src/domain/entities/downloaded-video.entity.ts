import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class DownloadedVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  videoId: string;

  @Column()
  title: string;

  @Column()
  channelTitle: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @ManyToOne(() => User, user => user.downloadedVideos, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}