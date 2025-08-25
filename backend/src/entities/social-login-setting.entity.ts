import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('social_login_settings')
export class SocialLoginSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  provider: string;

  @Column({ name: 'is_enabled', default: false })
  @Index()
  isEnabled: boolean;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @Column({ name: 'client_secret', nullable: true })
  clientSecret: string;

  @Column({ type: 'jsonb', name: 'additional_settings', default: '{}' })
  additionalSettings: {
    scope?: string;
    authUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}