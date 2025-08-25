# Access Policies API Specification

## Overview
This document outlines the NestJS API endpoints and data models for the Access Policies system in the Workplace Safety Admin Panel.

## Base URL
```
/api/v1/access-policies
```

## Authentication
All endpoints require JWT authentication with appropriate RBAC permissions.

## Data Models

### AccessPolicy Entity
```typescript
@Entity('access_policies')
export class AccessPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: PolicyType,
    default: PolicyType.ALLOW
  })
  type: PolicyType;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.DRAFT
  })
  status: PolicyStatus;

  @Column({
    type: 'enum',
    enum: PolicyScope,
    default: PolicyScope.ROLE
  })
  scope: PolicyScope;

  @Column('jsonb')
  subjects: PolicySubject[];

  @Column('jsonb')
  resources: PolicyResource[];

  @Column('jsonb')
  rules: PolicyRule[];

  @Column('int', { default: 50 })
  priority: number;

  @Column('int', { default: 1 })
  version: number;

  @Column('jsonb')
  rollout: PolicyRollout;

  @Column('jsonb', { nullable: true })
  conditions: PolicyConditions;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  // Statistics (computed fields)
  @Column('jsonb', { nullable: true })
  stats: {
    affectedUsers: number;
    affectedResources: number;
    accessAttempts: number;
    deniedAttempts: number;
    lastEnforced?: Date;
  };
}
```

### PolicyConflict Entity
```typescript
@Entity('policy_conflicts')
export class PolicyConflict {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConflictSeverity
  })
  severity: ConflictSeverity;

  @Column({
    type: 'enum',
    enum: ['priority', 'contradiction', 'overlap', 'circular']
  })
  type: string;

  @Column('jsonb')
  conflictingPolicies: {
    policyId: string;
    policyName: string;
    priority: number;
  }[];

  @Column('jsonb')
  affectedResources: PolicyResource[];

  @Column('jsonb')
  affectedSubjects: PolicySubject[];

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  recommendation: string;

  @Column('boolean', { default: false })
  autoResolvable: boolean;

  @Column('boolean', { default: false })
  resolved: boolean;

  @CreateDateColumn()
  detectedAt: Date;

  @UpdateDateColumn({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedBy: string;
}
```

### PolicySimulation Entity
```typescript
@Entity('policy_simulations')
export class PolicySimulation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  resourceId: string;

  @Column('simple-array')
  requestedAccess: AccessLevel[];

  @Column('jsonb')
  result: {
    granted: boolean;
    effectiveAccess: AccessLevel[];
    deniedAccess: AccessLevel[];
    appliedPolicies: any[];
    conflicts?: any[];
    recommendations?: string[];
  };

  @Column('jsonb')
  simulationContext: {
    timestamp: string;
    userAttributes: Record<string, any>;
    resourceAttributes: Record<string, any>;
    requestAttributes: Record<string, any>;
  };

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('boolean', { default: false })
  saved: boolean;
}
```

### PolicyAuditLog Entity
```typescript
@Entity('policy_audit_logs')
export class PolicyAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: ['create', 'update', 'delete', 'enable', 'disable', 'simulate', 'enforce']
  })
  action: string;

  @Column({ nullable: true })
  policyId: string;

  @Column({ nullable: true })
  policyName: string;

  @Column()
  actorId: string;

  @Column()
  actorName: string;

  @Column({
    type: 'enum',
    enum: ['user', 'system', 'api']
  })
  actorType: string;

  @Column('jsonb')
  details: {
    changes?: Record<string, { from: any, to: any }>;
    simulation?: any;
    enforcement?: {
      resourceId: string;
      userId: string;
      granted: boolean;
      reason: string;
    };
    metadata?: Record<string, any>;
  };

  @Column('jsonb')
  context: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    correlationId?: string;
  };
}
```

## API Endpoints

### Policies Management

#### GET /policies
Get paginated list of access policies with filtering and sorting.

**Query Parameters:**
```typescript
{
  page?: number;
  pageSize?: number;
  search?: string;
  types?: PolicyType[];
  statuses?: PolicyStatus[];
  scopes?: PolicyScope[];
  priorities?: { min: number; max: number };
  tags?: string[];
  categories?: string[];
  subjects?: string[];
  resources?: string[];
  createdBy?: string[];
  dateRange?: { from: string; to: string };
  hasConflicts?: boolean;
  rolloutStatus?: 'not_started' | 'in_progress' | 'completed';
  sortBy?: 'name' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
{
  policies: AccessPolicy[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

#### GET /policies/:id
Get a specific policy by ID.

**Response:** `AccessPolicy`

#### POST /policies
Create a new access policy.

**Body:** `CreatePolicyDto`
**Response:** `AccessPolicy`

#### PUT /policies/:id
Update an existing policy.

**Body:** `UpdatePolicyDto`
**Response:** `AccessPolicy`

#### DELETE /policies/:id
Delete a policy.

**Response:** `{ success: boolean; message: string }`

#### POST /policies/:id/clone
Clone an existing policy.

**Response:** `AccessPolicy`

#### PATCH /policies/:id/status
Update policy status (enable/disable).

**Body:** `{ status: PolicyStatus }`
**Response:** `AccessPolicy`

#### POST /policies/bulk-actions
Perform bulk operations on multiple policies.

**Body:**
```typescript
{
  policyIds: string[];
  action: 'enable' | 'disable' | 'delete' | 'update-priority';
  data?: any;
}
```

**Response:** `{ success: boolean; affected: number; errors?: string[] }`

### Policy Validation and Testing

#### POST /policies/validate
Validate a policy configuration.

**Body:** `AccessPolicy`
**Response:**
```typescript
{
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  conflicts: PolicyConflict[];
}
```

#### POST /policies/simulate
Run a policy simulation.

**Body:**
```typescript
{
  userId: string;
  resourceId: string;
  requestedAccess: AccessLevel[];
  customAttributes?: Record<string, any>;
  save?: boolean;
}
```

**Response:** `PolicySimulation`

#### GET /policies/simulations
Get saved simulations with pagination.

**Query Parameters:** Pagination and filtering options
**Response:** Paginated list of `PolicySimulation`

#### DELETE /policies/simulations/:id
Delete a saved simulation.

### Conflict Management

#### GET /policies/conflicts
Get policy conflicts with filtering.

**Query Parameters:**
```typescript
{
  severity?: ConflictSeverity[];
  type?: string[];
  resolved?: boolean;
  policyIds?: string[];
}
```

**Response:**
```typescript
{
  conflicts: PolicyConflict[];
  total: number;
  severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
```

#### POST /policies/conflicts/:id/resolve
Resolve a policy conflict.

**Body:**
```typescript
{
  resolution: 'auto' | 'manual';
  changes?: any;
  reason?: string;
}
```

**Response:** `{ success: boolean; message: string }`

#### POST /policies/conflicts/detect
Trigger conflict detection for all policies.

**Response:**
```typescript
{
  conflictsDetected: number;
  newConflicts: number;
  resolvedConflicts: number;
}
```

### Analytics and Reporting

#### GET /policies/analytics
Get comprehensive policy analytics.

**Query Parameters:**
```typescript
{
  timeRange?: { from: string; to: string };
  policyIds?: string[];
  userIds?: string[];
  resourceIds?: string[];
}
```

**Response:** `PolicyAnalytics`

#### GET /policies/analytics/summary
Get KPI summary for dashboard.

**Response:**
```typescript
{
  totalPolicies: number;
  activePolicies: number;
  conflictingPolicies: number;
  enforcedResources: number;
  successRate: number;
  trends: {
    policies: { change: number; trend: 'up' | 'down' };
    conflicts: { change: number; trend: 'up' | 'down' };
    accessAttempts: { change: number; trend: 'up' | 'down' };
  };
}
```

#### POST /policies/analytics/export
Export analytics data.

**Body:**
```typescript
{
  format: 'csv' | 'json' | 'pdf';
  timeRange?: { from: string; to: string };
  includeCharts?: boolean;
}
```

**Response:** File download

### Audit Log

#### GET /policies/audit
Get policy audit logs with filtering and pagination.

**Query Parameters:**
```typescript
{
  page?: number;
  pageSize?: number;
  actions?: string[];
  actorTypes?: string[];
  actorIds?: string[];
  policyIds?: string[];
  dateRange?: { from: string; to: string };
  search?: string;
}
```

**Response:** Paginated list of `PolicyAuditLog`

#### GET /policies/audit/:id
Get detailed audit log entry.

**Response:** `PolicyAuditLog`

#### POST /policies/audit/export
Export audit logs.

**Body:**
```typescript
{
  format: 'csv' | 'json';
  filters?: AuditLogFilters;
}
```

**Response:** File download

### Policy Enforcement (Runtime)

#### POST /policies/evaluate
Evaluate access request against policies.

**Body:**
```typescript
{
  userId: string;
  resourceId: string;
  requestedAccess: AccessLevel[];
  context: {
    ipAddress?: string;
    userAgent?: string;
    location?: GeoLocation;
    deviceInfo?: DeviceInfo;
    requestAttributes?: Record<string, any>;
  };
}
```

**Response:**
```typescript
{
  granted: boolean;
  effectiveAccess: AccessLevel[];
  deniedAccess: AccessLevel[];
  appliedPolicies: {
    policyId: string;
    policyName: string;
    effect: PolicyType;
    priority: number;
    matchedConditions: string[];
  }[];
  reason: string;
  riskScore?: number;
  recommendations?: string[];
}
```

### Integration Endpoints

#### POST /policies/keycloak/sync
Synchronize with Keycloak roles and resources.

**Body:**
```typescript
{
  realm: string;
  clientId: string;
  syncRoles?: boolean;
  syncResources?: boolean;
  dryRun?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  synced: {
    roles: number;
    resources: number;
    policies: number;
  };
  errors: string[];
}
```

#### GET /policies/keycloak/status
Get Keycloak integration status.

**Response:**
```typescript
{
  connected: boolean;
  lastSync?: string;
  syncStatus: 'success' | 'error' | 'in_progress';
  errors?: string[];
  mappedRoles: number;
  mappedResources: number;
}
```

## Data Transfer Objects (DTOs)

### CreatePolicyDto
```typescript
export class CreatePolicyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(PolicyType)
  type: PolicyType;

  @IsEnum(PolicyScope)
  scope: PolicyScope;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicySubjectDto)
  subjects: PolicySubjectDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyResourceDto)
  resources: PolicyResourceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyRuleDto)
  rules: PolicyRuleDto[];

  @IsNumber()
  @Min(1)
  @Max(100)
  priority: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PolicyRolloutDto)
  rollout?: PolicyRolloutDto;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;
}
```

### UpdatePolicyDto
```typescript
export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;

  @IsOptional()
  @IsNumber()
  version?: number;
}
```

## Error Handling

### Standard Error Response
```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

### Validation Error Response
```typescript
{
  statusCode: 400;
  message: ValidationError[];
  error: "Bad Request";
  timestamp: string;
  path: string;
}
```

### Conflict Error Response
```typescript
{
  statusCode: 409;
  message: string;
  error: "Conflict";
  conflicts: PolicyConflict[];
  timestamp: string;
  path: string;
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: RBAC-based access control:
   - `policy:read` - View policies
   - `policy:write` - Create/update policies
   - `policy:delete` - Delete policies
   - `policy:admin` - All policy operations
   - `audit:read` - View audit logs
   - `analytics:read` - View analytics

3. **Input Validation**: All input validated using class-validator
4. **Rate Limiting**: API rate limiting applied
5. **Audit Trail**: All operations logged to audit trail
6. **Data Encryption**: Sensitive data encrypted at rest

## Performance Considerations

1. **Database Indexing**:
   - Index on policy status, type, priority
   - Full-text search index on name, description
   - Composite index on (createdBy, createdAt)

2. **Caching**:
   - Redis cache for active policies
   - Policy evaluation results cached (short TTL)
   - Analytics data cached (longer TTL)

3. **Pagination**: All list endpoints support pagination
4. **Background Jobs**: 
   - Conflict detection runs as background job
   - Analytics computation runs scheduled
   - Policy rollout managed as background process

## Database Schema

```sql
-- Access Policies table
CREATE TABLE access_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type policy_type_enum NOT NULL DEFAULT 'allow',
  status policy_status_enum NOT NULL DEFAULT 'draft',
  scope policy_scope_enum NOT NULL DEFAULT 'role',
  subjects JSONB NOT NULL,
  resources JSONB NOT NULL,
  rules JSONB NOT NULL,
  priority INTEGER NOT NULL DEFAULT 50,
  version INTEGER NOT NULL DEFAULT 1,
  rollout JSONB,
  conditions JSONB,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tags TEXT[],
  category VARCHAR(100),
  stats JSONB
);

-- Policy Conflicts table
CREATE TABLE policy_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity conflict_severity_enum NOT NULL,
  type VARCHAR(50) NOT NULL,
  conflicting_policies JSONB NOT NULL,
  affected_resources JSONB NOT NULL,
  affected_subjects JSONB NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  auto_resolvable BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255)
);

-- Policy Simulations table
CREATE TABLE policy_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  requested_access TEXT[] NOT NULL,
  result JSONB NOT NULL,
  simulation_context JSONB NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  saved BOOLEAN DEFAULT false
);

-- Policy Audit Logs table
CREATE TABLE policy_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(50) NOT NULL,
  policy_id UUID,
  policy_name VARCHAR(255),
  actor_id VARCHAR(255) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_type VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  context JSONB NOT NULL
);

-- Indexes
CREATE INDEX idx_policies_status ON access_policies(status);
CREATE INDEX idx_policies_type ON access_policies(type);
CREATE INDEX idx_policies_priority ON access_policies(priority);
CREATE INDEX idx_policies_created_by ON access_policies(created_by);
CREATE INDEX idx_policies_updated_at ON access_policies(updated_at);
CREATE INDEX idx_conflicts_severity ON policy_conflicts(severity);
CREATE INDEX idx_conflicts_resolved ON policy_conflicts(resolved);
CREATE INDEX idx_audit_timestamp ON policy_audit_logs(timestamp);
CREATE INDEX idx_audit_policy_id ON policy_audit_logs(policy_id);
CREATE INDEX idx_audit_actor ON policy_audit_logs(actor_id);

-- Full-text search
CREATE INDEX idx_policies_search ON access_policies 
USING gin(to_tsvector('english', name || ' ' || description));
```

## WebSocket Events

For real-time updates:

```typescript
// Policy changes
'policy:created' | 'policy:updated' | 'policy:deleted' | 'policy:status-changed'

// Conflicts
'conflict:detected' | 'conflict:resolved'

// Enforcement
'access:granted' | 'access:denied'

// System
'policies:sync-complete' | 'analytics:updated'
```