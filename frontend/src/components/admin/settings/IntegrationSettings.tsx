'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Puzzle, Globe, Database, Server } from 'lucide-react'

interface IntegrationSettingsProps {
  onSettingsChange: (hasChanges: boolean) => void
}

export default function IntegrationSettings({ onSettingsChange }: IntegrationSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            External Integrations
          </CardTitle>
          <CardDescription>
            Configure integrations with external services and APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Prometheus</h4>
                <Badge variant="outline">Available</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Metrics collection and monitoring
              </p>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Grafana</h4>
                <Badge variant="outline">Available</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Data visualization and dashboards
              </p>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">WebHooks</h4>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                HTTP callbacks for events
              </p>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}