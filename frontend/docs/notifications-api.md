# Notifications API Specification

## Overview
This document outlines the NestJS API endpoints and data models for the Notifications system in the Workplace Safety Admin Panel.

## Base URL
```
/api/v1/notifications
```

## Authentication
All endpoints require JWT authentication with appropriate RBAC permissions.

## Data Models

### Notification Entity
```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: NotificationSource
  })
  source: NotificationSource;

  @Column({
    type: 'enum',
    enum: NotificationSeverity,
    default: NotificationSeverity.LOW
  })
  severity: NotificationSeverity;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  // Related entity information (JSON)
  @Column('jsonb', { nullable: true })
  relatedEntity: {
    type: string;
    id: string;
    name: string;
    metadata?: Record<string, any>;
  };

  // User assignment (null = system-wide notification)
  @Column({ nullable: true })
  userId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date;

  // Additional metadata (JSON)
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  // Indexes for performance
  @Index(['userId', 'status'])
  @Index(['type', 'severity'])
  @Index(['createdAt'])
  @Index(['source'])
}
```

### NotificationSettings Entity
```typescript
@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryColumn()
  userId: string;

  // Delivery channels
  @Column('jsonb')
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push?: boolean;
  };

  // Type-specific settings
  @Column('jsonb')
  typeSettings: {
    security: TypeNotificationSettings;
    system: TypeNotificationSettings;
    risk: TypeNotificationSettings;
    user_activity: TypeNotificationSettings;
  };

  // Timing settings
  @Column('jsonb', { nullable: true })
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };

  // Digest settings
  @Column('jsonb', { nullable: true })
  digest?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

interface TypeNotificationSettings {
  enabled: boolean;
  minSeverity: NotificationSeverity;
  channels: ('inApp' | 'email' | 'sms')[];
}
```

### NotificationDelivery Entity
```typescript
@Entity('notification_deliveries')
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  notificationId: string;

  @Column({
    type: 'enum',
    enum: ['inApp', 'email', 'sms', 'push']
  })
  channel: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending'
  })
  status: string;

  @Column()
  recipient: string; // email, phone, userId

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  failedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextRetryAt: Date;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  providerId: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;
}
```

### NotificationTemplate Entity
```typescript
@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationSource
  })
  source: NotificationSource;

  @Column({
    type: 'enum',
    enum: NotificationSeverity
  })
  severity: NotificationSeverity;

  @Column()
  titleTemplate: string;

  @Column('text')
  descriptionTemplate: string;

  // Template variables
  @Column('jsonb')
  variables: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    description: string;
  }[];

  // Auto-generation rules
  @Column('jsonb', { nullable: true })
  rules?: {
    condition: string; // JSON logic expression
    autoArchive?: {
      after: number; // minutes
      condition?: string;
    };
    escalation?: {
      after: number; // minutes
      increaseSeverity: boolean;
      notifyAdmins: boolean;
    };
  };

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## API Endpoints

### Notification Management

#### GET /notifications
Get paginated list of notifications with filtering and sorting.

**Query Parameters:**
```typescript
{
  page?: number;
  pageSize?: number;
  search?: string;
  types?: NotificationType[];
  statuses?: NotificationStatus[];
  severities?: NotificationSeverity[];
  sources?: NotificationSource[];
  dateRange?: { from: string; to: string };
  userId?: string; // Admin only
  hasRelatedEntity?: boolean;
  actionRequired?: boolean;
  sortBy?: 'createdAt' | 'severity' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  notifications: Notification[];
  total: number;
  unread: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats: {
    security: number;
    system: number;
    risk: number;
    user_activity: number;
  };
}
```

#### GET /notifications/summary
Get notification summary for dashboard KPI cards.

**Response:**
```typescript
{
  totalNotifications: number;
  unreadNotifications: number;
  securityAlerts: number;
  systemHealthWarnings: number;
  recentNotifications: Notification[]; // Last 5 notifications
  trends: {
    notifications: { change: number; trend: 'up' | 'down' };
    security: { change: number; trend: 'up' | 'down' };
    system: { change: number; trend: 'up' | 'down' };
    unreadRate: { change: number; trend: 'up' | 'down' };
  };
}
```

#### GET /notifications/:id
Get a specific notification by ID.

**Response:** `Notification`

#### POST /notifications
Create a new notification.

**Body:**
```typescript
{
  type: NotificationType;
  title: string;
  description: string;
  source: NotificationSource;
  severity: NotificationSeverity;
  userId?: string; // null = system-wide
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
    metadata?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  autoArchiveAfter?: number; // minutes
  requiresAction?: boolean;
}
```

**Response:** `Notification`

#### PATCH /notifications/:id
Update notification status or content.

**Body:**
```typescript
{
  status?: NotificationStatus;
  title?: string;
  description?: string;
  severity?: NotificationSeverity;
  metadata?: Record<string, any>;
}
```

**Response:** `Notification`

#### DELETE /notifications/:id
Delete a notification.

**Response:** `{ success: boolean; message: string }`

#### POST /notifications/bulk-actions
Perform bulk operations on multiple notifications.

**Body:**
```typescript
{
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'archive' | 'delete';
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  affected: number;
  failed: number;
  errors?: {
    notificationId: string;
    error: string;
  }[];
}
```

#### POST /notifications/mark-all-read
Mark all notifications as read for current user.

**Body:**
```typescript
{
  types?: NotificationType[]; // Optional: only mark specific types as read
  beforeDate?: string; // Optional: only mark notifications before this date
}
```

**Response:**
```typescript
{
  success: boolean;
  affected: number;
}
```

### Notification Settings

#### GET /notifications/settings
Get current user's notification settings.

**Response:** `NotificationSettings`

#### PATCH /notifications/settings
Update notification settings for current user.

**Body:** `Partial<NotificationSettings>`
**Response:** `NotificationSettings`

#### POST /notifications/settings/reset
Reset notification settings to defaults.

**Response:** `NotificationSettings`

#### POST /notifications/test/:type
Send a test notification of specified type.

**Path Parameters:**
- `type`: NotificationType

**Response:**
```typescript
{
  success: boolean;
  message: string;
  notificationId?: string;
}
```

### Analytics and Export

#### GET /notifications/analytics
Get notification analytics data.

**Query Parameters:**
```typescript
{
  timeRange?: { from: string; to: string };
  types?: NotificationType[];
  userIds?: string[]; // Admin only
}
```

**Response:** `NotificationAnalytics`

#### POST /notifications/export
Export notifications data.

**Body:**
```typescript
{
  format: 'csv' | 'json' | 'pdf';
  filters?: NotificationFilters;
  includeMetadata?: boolean;
  includeRelatedEntities?: boolean;
  dateRange?: { from: string; to: string };
}
```

**Response:** File download

### Real-time Updates

#### GET /notifications/events (SSE)
Server-Sent Events endpoint for real-time notification updates.

**Query Parameters:**
```typescript
{
  types?: NotificationType[];
  severities?: NotificationSeverity[];
}
```

**Event Types:**
```typescript
{
  type: 'notification_created' | 'notification_updated' | 'notification_deleted' | 'bulk_action';
  data: {
    notification?: Notification;
    notifications?: Notification[];
    action?: string;
    userId?: string;
    timestamp: string;
  };
}
```

#### WebSocket: /notifications/ws
WebSocket endpoint for real-time bidirectional communication.

**Messages:**
```typescript
// Subscribe to notifications
{
  type: 'subscribe';
  data: {
    types?: NotificationType[];
    severities?: NotificationSeverity[];
  };
}

// Mark as read via WebSocket
{
  type: 'mark_read';
  data: {
    notificationId: string;
  };
}

// Notification updates
{
  type: 'notification_update';
  data: {
    action: 'created' | 'updated' | 'deleted';
    notification: Notification;
  };
}
```

### Templates Management (Admin)

#### GET /notifications/templates
Get notification templates.

**Response:** `NotificationTemplate[]`

#### POST /notifications/templates
Create notification template.

**Body:** `CreateNotificationTemplateDto`
**Response:** `NotificationTemplate`

#### PUT /notifications/templates/:id
Update notification template.

**Body:** `UpdateNotificationTemplateDto`
**Response:** `NotificationTemplate`

#### DELETE /notifications/templates/:id
Delete notification template.

**Response:** `{ success: boolean }`

### Delivery Status

#### GET /notifications/:id/deliveries
Get delivery status for a notification.

**Response:** `NotificationDelivery[]`

#### POST /notifications/:id/retry
Retry failed notification delivery.

**Body:**
```typescript
{
  channels?: ('email' | 'sms' | 'push')[]; // Optional: specific channels to retry
}
```

**Response:**
```typescript
{
  success: boolean;
  retriedChannels: string[];
  message: string;
}
```

## Data Transfer Objects (DTOs)

### CreateNotificationDto
```typescript
export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  description: string;

  @IsEnum(NotificationSource)
  source: NotificationSource;

  @IsEnum(NotificationSeverity)
  severity: NotificationSeverity;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RelatedEntityDto)
  relatedEntity?: RelatedEntityDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  autoArchiveAfter?: number;

  @IsOptional()
  @IsBoolean()
  requiresAction?: boolean;
}
```

### UpdateNotificationDto
```typescript
export class UpdateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(NotificationSeverity)
  severity?: NotificationSeverity;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
```

### NotificationFiltersDto
```typescript
export class NotificationFiltersDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  types?: NotificationType[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationStatus, { each: true })
  statuses?: NotificationStatus[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationSeverity, { each: true })
  severities?: NotificationSeverity[];

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationSource, { each: true })
  sources?: NotificationSource[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  hasRelatedEntity?: boolean;

  @IsOptional()
  @IsBoolean()
  actionRequired?: boolean;

  @IsOptional()
  @IsEnum(['createdAt', 'severity', 'status', 'type'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
```

## Security Considerations

1. **Authentication & Authorization**:
   - All endpoints require valid JWT token
   - RBAC permissions:
     - `notification:read` - View own notifications
     - `notification:write` - Create/update own notifications
     - `notification:delete` - Delete own notifications
     - `notification:admin` - Manage all notifications
     - `notification:settings` - Manage notification settings

2. **Data Privacy**:
   - Users can only access their own notifications (unless admin)
   - Personal data in notifications is encrypted at rest
   - Audit logging for all notification operations

3. **Rate Limiting**:
   - API rate limiting: 1000 requests/hour per user
   - Notification creation rate limiting: 100/hour per user
   - Real-time connection limits: 10 concurrent connections per user

4. **Input Validation**:
   - All input validated using DTOs and class-validator
   - SQL injection prevention with parameterized queries
   - XSS prevention with input sanitization

## Performance Optimizations

1. **Database Optimization**:
   ```sql
   -- Indexes for performance
   CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
   CREATE INDEX idx_notifications_type_severity ON notifications(type, severity);
   CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
   CREATE INDEX idx_notifications_source ON notifications(source);
   
   -- Partial index for unread notifications
   CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) 
   WHERE status = 'unread';
   ```

2. **Caching Strategy**:
   - Redis cache for unread counts (TTL: 5 minutes)
   - Cache notification settings (TTL: 1 hour)
   - Cache recent notifications (TTL: 10 minutes)

3. **Real-time Updates**:
   - Redis Pub/Sub for real-time notification delivery
   - WebSocket connection pooling
   - SSE with automatic reconnection

4. **Background Jobs**:
   - Notification delivery queue (Bull/BullMQ)
   - Auto-archiving of old notifications
   - Cleanup of failed delivery attempts
   - Digest notification generation

## Database Schema

```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  source notification_source_enum NOT NULL,
  severity notification_severity_enum NOT NULL DEFAULT 'low',
  status notification_status_enum NOT NULL DEFAULT 'unread',
  related_entity JSONB,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  archived_at TIMESTAMP,
  metadata JSONB
);

-- Notification Settings table
CREATE TABLE notification_settings (
  user_id VARCHAR(255) PRIMARY KEY,
  channels JSONB NOT NULL,
  type_settings JSONB NOT NULL,
  quiet_hours JSONB,
  digest JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Deliveries table
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  recipient VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  provider VARCHAR(100),
  provider_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Templates table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type_enum NOT NULL,
  source notification_source_enum NOT NULL,
  severity notification_severity_enum NOT NULL,
  title_template VARCHAR(500) NOT NULL,
  description_template TEXT NOT NULL,
  variables JSONB NOT NULL,
  rules JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enums
CREATE TYPE notification_type_enum AS ENUM ('security', 'system', 'risk', 'user_activity');
CREATE TYPE notification_status_enum AS ENUM ('unread', 'read', 'archived');
CREATE TYPE notification_severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE notification_source_enum AS ENUM ('auth', 'access_policies', 'health', 'keycloak', 'system', 'user_management', 'risk_assessment', 'incidents');

-- Indexes
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_type_severity ON notifications(type, severity);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_source ON notifications(source);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE status = 'unread';

-- Full-text search
CREATE INDEX idx_notifications_search ON notifications USING gin(to_tsvector('english', title || ' ' || description));
```

## Redis Pub/Sub Channels

```typescript
// Channel naming convention
const CHANNELS = {
  // User-specific notifications
  USER_NOTIFICATIONS: (userId: string) => `notifications:user:${userId}`,
  
  // System-wide notifications
  SYSTEM_NOTIFICATIONS: 'notifications:system',
  
  // Type-specific channels
  SECURITY_NOTIFICATIONS: 'notifications:security',
  SYSTEM_HEALTH: 'notifications:system_health',
  
  // Admin channels
  ADMIN_NOTIFICATIONS: 'notifications:admin',
  
  // Delivery status updates
  DELIVERY_STATUS: 'notifications:delivery'
};

// Message format
interface NotificationMessage {
  type: 'created' | 'updated' | 'deleted' | 'bulk_action';
  notification?: Notification;
  notifications?: Notification[];
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```