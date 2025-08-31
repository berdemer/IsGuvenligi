"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { RealtimeConnectionStatus } from "@/types/session"
import { useTranslations } from 'next-intl'

interface RealtimeStatusProps {
  status: RealtimeConnectionStatus
}

export function RealtimeStatus({ status }: RealtimeStatusProps) {
  const t = useTranslations('common.sessions.realtime')
  const getStatusColor = () => {
    if (status.connected) return "bg-green-500"
    if (status.reconnectAttempts > 0) return "bg-amber-500"
    return "bg-red-500"
  }

  const getStatusText = () => {
    if (status.connected) return t('status.live')
    if (status.reconnectAttempts > 0) return t('status.reconnecting')
    return t('status.disconnected')
  }

  const getStatusIcon = () => {
    if (status.connected) return <Wifi className="h-3 w-3" />
    if (status.reconnectAttempts > 0) return <AlertCircle className="h-3 w-3" />
    return <WifiOff className="h-3 w-3" />
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`flex items-center space-x-1 text-white border-transparent ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1 text-xs">
          <p><strong>{t('tooltip.connectionStatus')}:</strong> {status.connected ? t('tooltip.connected') : t('tooltip.disconnected')}</p>
          {status.lastHeartbeat && (
            <p><strong>{t('tooltip.lastUpdate')}:</strong> {new Date(status.lastHeartbeat).toLocaleTimeString()}</p>
          )}
          {status.reconnectAttempts > 0 && (
            <p><strong>{t('tooltip.reconnectAttempts')}:</strong> {status.reconnectAttempts}/{status.maxReconnectAttempts}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}