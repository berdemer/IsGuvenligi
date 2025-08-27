# Health & Monitoring System API Documentation

## Overview

The Health & Monitoring API provides comprehensive system health monitoring, infrastructure metrics, incident management, and alerting capabilities for the Workplace Safety Admin Panel.

### Base URL
```
/api/health
```

### Authentication
All endpoints require JWT authentication with appropriate RBAC permissions.

## API Endpoints

### System Overview

#### GET /api/health/overview
Get comprehensive system health overview including KPIs, trends, and top alerts.

**Query Parameters:**
- `timeRange` (optional): Time range for metrics (`1h`, `24h`, `7d`, `30d`) - default: `24h`

**Response:**
```typescript
{
  overview: {
    timestamp: string
    healthScore: number           // 0-100 overall system health
    uptime: number               // percentage
    avgResponseTime: number      // milliseconds
    errorRate: number           // percentage
    criticalAlerts: number
    totalServices: number
    healthyServices: number
    services: ServiceHealth[]
    topAlerts: HealthAlert[]
    trends: {
      healthScore: TrendData
      responseTime: TrendData
      errorRate: TrendData
      uptime: TrendData
    }
    sla: {
      target: number        // 99.9%
      current: number
      monthToDate: number
      breach: boolean
    }
  }
  lastUpdated: string
  nextUpdate: string
}
```

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/health/overview?timeRange=24h"
```

### Services Monitoring

#### GET /api/health/services
Get health status for all monitored services.

**Query Parameters:**
- `status` (optional): Filter by status (`healthy`, `warning`, `critical`)
- `type` (optional): Filter by service type (`api`, `database`, `redis`, etc.)
- `showUnhealthyOnly` (optional): Boolean to show only unhealthy services

**Response:**
```typescript
{
  services: ServiceHealth[]
  summary: {
    total: number
    healthy: number
    warning: number
    critical: number
  }
  lastUpdated: string
}
```

#### GET /api/health/services/:id
Get detailed health information for a specific service.

**Path Parameters:**
- `id`: Service identifier

**Response:**
```typescript
{
  service: ServiceHealth & {
    dependencies: ServiceDependency[]
    recentIncidents: HealthIncident[]
    metrics: {
      history: TimeSeriesMetric[]
      current: HealthMetric[]
    }
  }
  lastUpdated: string
}
```

#### POST /api/health/services/:id/restart
Restart a service (requires SystemAdmin role).

**Path Parameters:**
- `id`: Service identifier

**Request Body:**
```typescript
{
  reason?: string
  force?: boolean
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  restartId: string
  estimatedDuration: number  // seconds
}
```

#### POST /api/health/services/:id/health-check
Trigger manual health check for a service.

**Path Parameters:**
- `id`: Service identifier

**Response:**
```typescript
{
  success: boolean
  results: {
    status: ServiceStatus
    latency: number
    errors: string[]
    timestamp: string
  }
}
```

### Infrastructure Monitoring

#### GET /api/health/infrastructure
Get current infrastructure metrics.

**Query Parameters:**
- `timeRange` (optional): Time range for historical data
- `metrics` (optional): Comma-separated list of metrics to include

**Response:**
```typescript
{
  current: InfrastructureMetrics
  history: TimeSeriesMetric[]
  alerts: HealthAlert[]
  lastUpdated: string
}
```

#### GET /api/health/infrastructure/metrics/:metric
Get detailed time series data for a specific infrastructure metric.

**Path Parameters:**
- `metric`: Metric type (`cpu`, `memory`, `disk`, `network`)

**Query Parameters:**
- `timeRange`: Time range (`1h`, `24h`, `7d`, `30d`)
- `interval`: Data point interval (`1m`, `5m`, `1h`)
- `aggregation`: Aggregation method (`avg`, `max`, `min`)

**Response:**
```typescript
{
  metric: TimeSeriesMetric
  thresholds?: HealthThreshold[]
  alerts: HealthAlert[]
}
```

### Incidents Management

#### GET /api/health/incidents
Get incidents with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status
- `severity` (optional): Filter by severity
- `serviceId` (optional): Filter by service
- `from` (optional): Start date filter (ISO string)
- `to` (optional): End date filter (ISO string)
- `search` (optional): Search in title/description

**Response:**
```typescript
{
  incidents: HealthIncident[]
  summary: {
    total: number
    open: number
    resolved: number
    avgResolutionTime: number  // minutes
  }
  timeline: IncidentEvent[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

#### GET /api/health/incidents/:id
Get detailed incident information.

**Path Parameters:**
- `id`: Incident identifier

**Response:**
```typescript
{
  incident: HealthIncident & {
    fullTimeline: IncidentEvent[]
    affectedMetrics: TimeSeriesMetric[]
    relatedIncidents: HealthIncident[]
  }
}
```

#### POST /api/health/incidents
Create a new incident.

**Request Body:**
```typescript
{
  serviceId?: string
  title: string
  description: string
  severity: IncidentSeverity
  impact: {
    affectedServices: string[]
    userImpact: 'none' | 'minimal' | 'moderate' | 'severe'
    estimatedUsers?: number
  }
}
```

**Response:**
```typescript
{
  incident: HealthIncident
  message: string
}
```

#### PUT /api/health/incidents/:id
Update incident status and add timeline events.

**Path Parameters:**
- `id`: Incident identifier

**Request Body:**
```typescript
{
  status?: IncidentStatus
  message?: string
  rootCause?: string
  resolution?: string
  preventionSteps?: string[]
}
```

**Response:**
```typescript
{
  incident: HealthIncident
  message: string
}
```

#### POST /api/health/incidents/:id/timeline
Add an event to incident timeline.

**Path Parameters:**
- `id`: Incident identifier

**Request Body:**
```typescript
{
  type: 'investigating' | 'update' | 'resolved' | 'post_mortem'
  message: string
  metadata?: Record<string, any>
}
```

**Response:**
```typescript
{
  event: IncidentEvent
  message: string
}
```

### Health Configuration

#### GET /api/health/thresholds
Get all health thresholds.

**Query Parameters:**
- `serviceType` (optional): Filter by service type
- `metric` (optional): Filter by metric type
- `enabled` (optional): Filter by enabled status

**Response:**
```typescript
{
  thresholds: HealthThreshold[]
  total: number
}
```

#### POST /api/health/thresholds
Create a new health threshold.

**Request Body:**
```typescript
{
  serviceId?: string
  serviceType?: ServiceType
  metric: MetricType
  warning: {
    value: number
    operator: ThresholdOperator
  }
  critical: {
    value: number
    operator: ThresholdOperator
  }
  enabled: boolean
  description?: string
}
```

**Response:**
```typescript
{
  threshold: HealthThreshold
  message: string
}
```

#### PUT /api/health/thresholds/:id
Update a health threshold.

**Path Parameters:**
- `id`: Threshold identifier

**Request Body:**
Same as POST /api/health/thresholds

**Response:**
```typescript
{
  threshold: HealthThreshold
  message: string
}
```

#### DELETE /api/health/thresholds/:id
Delete a health threshold.

**Path Parameters:**
- `id`: Threshold identifier

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

### Alerting Configuration

#### GET /api/health/alert-configs
Get all alert configurations.

**Response:**
```typescript
{
  configs: AlertingConfig[]
  total: number
}
```

#### POST /api/health/alert-configs
Create a new alert configuration.

**Request Body:**
```typescript
{
  name: string
  description?: string
  enabled: boolean
  conditions: {
    serviceIds?: string[]
    serviceTypes?: ServiceType[]
    severities: IncidentSeverity[]
    metrics: MetricType[]
  }
  channels: AlertChannelConfig[]
  cooldown: number
  escalation?: {
    enabled: boolean
    delay: number
    channels: AlertChannelConfig[]
  }
  schedule?: {
    enabled: boolean
    timezone: string
    quietHours?: {
      start: string
      end: string
    }
    weekends: boolean
  }
}
```

**Response:**
```typescript
{
  config: AlertingConfig
  message: string
}
```

#### PUT /api/health/alert-configs/:id
Update an alert configuration.

**Path Parameters:**
- `id`: Configuration identifier

**Request Body:**
Same as POST /api/health/alert-configs

**Response:**
```typescript
{
  config: AlertingConfig
  message: string
}
```

#### DELETE /api/health/alert-configs/:id
Delete an alert configuration.

**Path Parameters:**
- `id`: Configuration identifier

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

#### POST /api/health/alert-configs/:id/test
Test an alert configuration.

**Path Parameters:**
- `id`: Configuration identifier

**Response:**
```typescript
{
  success: boolean
  results: {
    channel: AlertChannel
    success: boolean
    error?: string
    latency: number
  }[]
  message: string
}
```

### Health Checks Configuration

#### GET /api/health/health-checks
Get all health check configurations.

**Response:**
```typescript
{
  checks: HealthCheckConfig[]
  total: number
}
```

#### POST /api/health/health-checks
Create a new health check configuration.

**Request Body:**
```typescript
{
  serviceId: string
  name: string
  type: 'http' | 'tcp' | 'database' | 'custom'
  interval: number        // seconds
  timeout: number         // seconds
  retries: number
  config: {
    url?: string
    method?: string
    headers?: Record<string, string>
    body?: string
    expectedStatus?: number[]
    expectedContent?: string
    host?: string
    port?: number
    query?: string        // for database checks
    script?: string       // for custom checks
  }
  enabled: boolean
}
```

**Response:**
```typescript
{
  check: HealthCheckConfig
  message: string
}
```

### Metrics Export and Reporting

#### GET /api/health/export/metrics
Export health metrics in various formats.

**Query Parameters:**
- `format`: Export format (`json`, `csv`, `prometheus`)
- `timeRange`: Time range for data
- `services` (optional): Comma-separated service IDs
- `metrics` (optional): Comma-separated metric types

**Response:**
- Content-Type varies based on format
- File download or JSON response

#### POST /api/health/reports
Generate a health report.

**Request Body:**
```typescript
{
  type: 'overview' | 'service' | 'incident' | 'sla'
  period: {
    start: string
    end: string
  }
  format: 'json' | 'csv' | 'pdf'
  filters?: {
    serviceIds?: string[]
    severities?: IncidentSeverity[]
    metrics?: MetricType[]
  }
  includeCharts?: boolean
}
```

**Response:**
```typescript
{
  report: HealthReport
  downloadUrl?: string
  message: string
}
```

#### GET /api/health/reports/:id
Get a previously generated report.

**Path Parameters:**
- `id`: Report identifier

**Response:**
```typescript
{
  report: HealthReport
  downloadUrl?: string
}
```

### Real-time Updates

#### WebSocket /api/health/ws
WebSocket endpoint for real-time health updates.

**Connection:**
```javascript
const ws = new WebSocket('wss://api.example.com/api/health/ws?token=<jwt_token>');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Handle health update
};
```

**Message Format:**
```typescript
{
  type: 'service_status' | 'metric_update' | 'alert' | 'incident' | 'system_health'
  timestamp: string
  data: {
    // Type-specific data
    serviceId?: string
    metric?: HealthMetric
    alert?: HealthAlert
    incident?: HealthIncident
    systemHealth?: SystemOverview
  }
  source: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}
```

## Data Models

### Core Types

```typescript
// Service Health
interface ServiceHealth {
  id: string
  name: string
  type: ServiceType
  status: ServiceStatus
  uptime: number
  avgLatency: number
  errorRate: number
  lastCheck: string
  healthScore: number
  version?: string
  endpoint?: string
  dependencies: string[]
  metrics: Record<string, HealthMetric>
  lastIncident?: {
    id: string
    timestamp: string
    duration: number
    impact: IncidentSeverity
  }
}

// Infrastructure Metrics
interface InfrastructureMetrics {
  id: string
  timestamp: string
  system: {
    cpu: {
      usage: number
      cores: number
      loadAverage: number[]
    }
    memory: {
      used: number
      total: number
      usage: number
      swap?: {
        used: number
        total: number
      }
    }
    disk: {
      used: number
      total: number
      usage: number
      iops?: {
        read: number
        write: number
      }
    }
    network: {
      bytesIn: number
      bytesOut: number
      packetsIn: number
      packetsOut: number
      errors: number
    }
  }
  services: Record<string, {
    cpu: number
    memory: number
    disk: number
  }>
}

// Health Incident
interface HealthIncident {
  id: string
  serviceId?: string
  serviceName?: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  startedAt: string
  resolvedAt?: string
  duration?: number
  impact: {
    affectedServices: string[]
    userImpact: 'none' | 'minimal' | 'moderate' | 'severe'
    estimatedUsers?: number
  }
  resolvedBy?: {
    userId: string
    username: string
    method: 'auto' | 'manual'
  }
  timeline: IncidentEvent[]
  metrics?: {
    errorSpike?: number
    downtimeMinutes?: number
    responseTimeIncrease?: number
  }
  rootCause?: string
  resolution?: string
  preventionSteps?: string[]
  relatedIncidents?: string[]
}
```

### Database Schema (PostgreSQL)

```sql
-- Services health tracking
CREATE TABLE service_health (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'unknown',
    uptime DECIMAL(5,2) DEFAULT 0,
    avg_latency INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    health_score INTEGER DEFAULT 0,
    version VARCHAR,
    endpoint VARCHAR,
    dependencies JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    last_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infrastructure metrics
CREATE TABLE infra_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    system_metrics JSONB NOT NULL,
    service_metrics JSONB DEFAULT '{}',
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health incidents
CREATE TABLE health_incidents (
    id VARCHAR PRIMARY KEY,
    service_id VARCHAR,
    service_name VARCHAR,
    title VARCHAR NOT NULL,
    description TEXT,
    severity VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'open',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- minutes
    impact JSONB NOT NULL,
    resolved_by JSONB,
    timeline JSONB DEFAULT '[]',
    metrics JSONB,
    root_cause TEXT,
    resolution TEXT,
    prevention_steps JSONB,
    related_incidents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (service_id) REFERENCES service_health(id)
);

-- Health thresholds
CREATE TABLE health_thresholds (
    id VARCHAR PRIMARY KEY,
    service_id VARCHAR,
    service_type VARCHAR,
    metric VARCHAR NOT NULL,
    warning_value DECIMAL NOT NULL,
    warning_operator VARCHAR NOT NULL,
    critical_value DECIMAL NOT NULL,
    critical_operator VARCHAR NOT NULL,
    enabled BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR NOT NULL,
    
    FOREIGN KEY (service_id) REFERENCES service_health(id)
);

-- Alert configurations
CREATE TABLE alert_configs (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    conditions JSONB NOT NULL,
    channels JSONB NOT NULL,
    cooldown INTEGER DEFAULT 15,
    escalation JSONB,
    schedule JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR NOT NULL
);

-- Health check configurations
CREATE TABLE health_check_configs (
    id VARCHAR PRIMARY KEY,
    service_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    interval_seconds INTEGER NOT NULL,
    timeout_seconds INTEGER NOT NULL,
    retries INTEGER DEFAULT 3,
    config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    consecutive_failures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (service_id) REFERENCES service_health(id)
);

-- Time series metrics (for historical data)
CREATE TABLE health_metrics_ts (
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service_id VARCHAR,
    metric_type VARCHAR NOT NULL,
    value DECIMAL NOT NULL,
    unit VARCHAR,
    metadata JSONB,
    
    FOREIGN KEY (service_id) REFERENCES service_health(id)
);

-- Create hypertable for time series data (TimescaleDB extension)
SELECT create_hypertable('health_metrics_ts', 'timestamp');

-- Indexes for performance
CREATE INDEX idx_service_health_status ON service_health(status);
CREATE INDEX idx_service_health_type ON service_health(type);
CREATE INDEX idx_health_incidents_status ON health_incidents(status);
CREATE INDEX idx_health_incidents_severity ON health_incidents(severity);
CREATE INDEX idx_health_incidents_service ON health_incidents(service_id);
CREATE INDEX idx_health_incidents_started ON health_incidents(started_at);
CREATE INDEX idx_health_thresholds_metric ON health_thresholds(metric);
CREATE INDEX idx_health_thresholds_service_type ON health_thresholds(service_type);
CREATE INDEX idx_health_metrics_ts_service_metric ON health_metrics_ts(service_id, metric_type);
CREATE INDEX idx_health_metrics_ts_timestamp ON health_metrics_ts(timestamp);
```

### Redis Integration

```typescript
// Redis keys for caching and pub/sub
const REDIS_KEYS = {
  // Caching keys
  SERVICE_HEALTH: (id: string) => `health:service:${id}`,
  SYSTEM_OVERVIEW: 'health:system:overview',
  INFRA_METRICS: 'health:infra:current',
  ALERTS_ACTIVE: 'health:alerts:active',
  
  // Pub/Sub channels
  HEALTH_UPDATES: 'health:updates',
  ALERT_NOTIFICATIONS: 'health:alerts',
  SERVICE_STATUS: 'health:service:status'
}

// Example Redis operations
class HealthRedisService {
  async cacheServiceHealth(serviceId: string, health: ServiceHealth): Promise<void> {
    await this.redis.setex(
      REDIS_KEYS.SERVICE_HEALTH(serviceId),
      300, // 5 minutes
      JSON.stringify(health)
    )
  }
  
  async publishHealthUpdate(update: HealthUpdateEvent): Promise<void> {
    await this.redis.publish(
      REDIS_KEYS.HEALTH_UPDATES,
      JSON.stringify(update)
    )
  }
}
```

## Error Handling

### Standard Error Response Format

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any,
    timestamp: string
  }
}
```

### Common Error Codes

- `HEALTH_001`: Service not found
- `HEALTH_002`: Invalid health metric
- `HEALTH_003`: Threshold validation error
- `HEALTH_004`: Alert configuration error
- `HEALTH_005`: Service restart failed
- `HEALTH_006`: Insufficient permissions
- `HEALTH_007`: Health check timeout
- `HEALTH_008`: Incident not found
- `HEALTH_009`: Report generation failed
- `HEALTH_010`: WebSocket connection error

## Rate Limiting

- Health overview: 10 requests per minute
- Service operations: 5 requests per minute
- Incident creation: 3 requests per minute
- Reports generation: 1 request per minute

## Integration Examples

### Prometheus Metrics Export

```typescript
// Expose metrics in Prometheus format
app.get('/api/health/prometheus', (req, res) => {
  const metrics = `
    # HELP system_health_score Overall system health score
    # TYPE system_health_score gauge
    system_health_score ${systemOverview.healthScore}
    
    # HELP service_uptime Service uptime percentage
    # TYPE service_uptime gauge
    ${services.map(s => `service_uptime{service="${s.name}",type="${s.type}"} ${s.uptime}`).join('\n')}
    
    # HELP service_response_time Service response time in milliseconds
    # TYPE service_response_time gauge
    ${services.map(s => `service_response_time{service="${s.name}"} ${s.avgLatency}`).join('\n')}
  `
  
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  res.send(metrics)
})
```

### Grafana Dashboard Integration

```json
{
  "dashboard": {
    "id": null,
    "title": "System Health Overview",
    "panels": [
      {
        "id": 1,
        "title": "System Health Score",
        "type": "gauge",
        "targets": [
          {
            "expr": "system_health_score",
            "legendFormat": "Health Score"
          }
        ]
      }
    ]
  }
}
```

This comprehensive API documentation provides all the necessary endpoints, data models, and integration examples for implementing a robust health monitoring system.