import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string; // e.g., 'user', 'role', 'audit'

  @Column()
  action: string; // e.g., 'read', 'write', 'delete'

  @Column({ nullable: true })
  conditions: string; // JSON string for conditional permissions

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to get permission string
  get permissionString(): string {
    return `${this.resource}:${this.action}`;
  }
}