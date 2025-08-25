"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { RealtimeConnectionStatus } from "@/types/session"

interface RealtimeStatusProps {
  status: RealtimeConnectionStatus
}

export function RealtimeStatus({ status }: RealtimeStatusProps) {
  const getStatusColor = () => {
    if (status.connected) return "bg-green-500"
    if (status.reconnectAttempts > 0) return "bg-amber-500"
    return "bg-red-500"
  }

  const getStatusText = () => {
    if (status.connected) return "Live"
    if (status.reconnectAttempts > 0) return "Reconnecting"
    return "Disconnected"
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
          <p><strong>Connection Status:</strong> {status.connected ? "Connected" : "Disconnected"}</p>
          {status.lastHeartbeat && (
            <p><strong>Last Update:</strong> {new Date(status.lastHeartbeat).toLocaleTimeString()}</p>
          )}
          {status.reconnectAttempts > 0 && (
            <p><strong>Reconnect Attempts:</strong> {status.reconnectAttempts}/{status.maxReconnectAttempts}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}