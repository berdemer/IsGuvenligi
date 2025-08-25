import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_sessions')
@Index(['userId'])
@Index(['sessionId'])
@Index(['isActive'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'session_id', unique: true })
  @Index()
  sessionId: string;

  @Column({ type: 'jsonb', name: 'device_info', nullable: true })
  deviceInfo: {
    platform?: string;
    mobile?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };

  @Column({ type: 'inet', name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  lastActivity: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;
}