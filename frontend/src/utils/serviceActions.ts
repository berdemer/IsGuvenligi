// Service management utilities
export async function executeServiceAction(
  serviceId: string, 
  action: 'restart' | 'stop' | 'start' | 'health-check' | 'logs'
) {
  console.log(`🎯 Executing ${action} on service ${serviceId}`)
  
  try {
    const response = await fetch(`/api/services/${serviceId}/${action}`, {
      method: action === 'logs' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ ${action} completed successfully for ${serviceId}`)
    } else {
      console.error(`❌ ${action} failed for ${serviceId}:`, result.error)
    }
    
    return result
    
  } catch (error) {
    console.error(`❌ Service action error:`, error)
    throw error
  }
}

export interface ServiceActionResult {
  success: boolean
  message: string
  timestamp: string
  duration?: number
  error?: string
  healthData?: {
    status: string
    responseTime: number
    uptime: number
    lastCheck: string
    checks: Record<string, boolean>
  }
  logs?: Array<{
    timestamp: string
    level: string
    message: string
    service: string
    pid: number
  }>
}