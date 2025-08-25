import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[]; // Array of permission strings like 'user:read', 'role:write'

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean; // System roles cannot be deleted

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}