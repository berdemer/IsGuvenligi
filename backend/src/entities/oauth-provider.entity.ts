import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('oauth_providers')
export class OAuthProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'google', 'microsoft', 'github'

  @Column()
  displayName: string; // 'Google', 'Microsoft', 'GitHub'

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true, select: false }) // Don't select by default for security
  clientSecret: string;

  @Column({ nullable: true })
  authUrl: string;

  @Column({ nullable: true })
  tokenUrl: string;

  @Column({ nullable: true })
  userInfoUrl: string;

  @Column({ type: 'json', nullable: true })
  scopes: string[]; // Required OAuth scopes

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>; // Provider-specific config

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}