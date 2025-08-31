import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['action', 'createdAt'])
@Index(['userId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // e.g., 'user.created', 'role.updated', 'login.success'

  @Column()
  resource: string; // e.g., 'user', 'role', 'session'

  @Column({ nullable: true })
  resourceId: string; // ID of the affected resource

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>; // Additional context and changes

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: 'info' })
  level: 'debug' | 'info' | 'warn' | 'error'; // Log level

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Extra metadata

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.auditLogs, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;
}