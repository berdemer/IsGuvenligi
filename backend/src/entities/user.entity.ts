import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  loginCount: number;

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => AuditLog, auditLog => auditLog.user)
  auditLogs: AuditLog[];

  // Virtual getters
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  
  set fullName(value: string) {
    const parts = value.split(' ');
    this.firstName = parts[0] || '';
    this.lastName = parts.slice(1).join(' ') || '';
  }

  get permissions(): string[] {
    const permissions = new Set<string>();
    this.roles?.forEach(role => {
      role.permissions?.forEach(permission => permissions.add(permission));
    });
    return Array.from(permissions);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some(role => role.name === roleName) || false;
  }
}