"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  TestTube, Play, RotateCcw, Download, CheckCircle, 
  XCircle, AlertTriangle, Clock, User, MapPin, 
  Smartphone, Wifi, Shield, Key
} from "lucide-react"
import { AuthPolicy, SimulationResult } from "@/types/auth-policy"
import toast from "react-hot-toast"

interface PolicySimulationProps {
  policies: AuthPolicy[]
}

interface SimulationScenario {
  id: string
  name: string
  description: string
  user: {
    id: string
    email: string
    roles: string[]
    groups: string[]
  }
  conditions: {
    ip: string
    location: string
    device: string
    time: string
    userAgent: string
  }
  expectedResult: 'allow' | 'deny' | 'challenge'
}

const mockScenarios: SimulationScenario[] = [
  {
    id: 'scenario_1',
    name: 'Regular User Login',
    description: 'Standard user logging in from office during business hours',
    user: {
      id: 'user_001',
      email: 'john.doe@company.com',
      roles: ['user'],
      groups: ['employees']
    },
    conditions: {
      ip: '192.168.1.100',
      location: 'Istanbul, Turkey',
      device: 'Desktop - Windows 11',
      time: '2024-01-15T10:30:00Z',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    expectedResult: 'allow'
  },
  {
    id: 'scenario_2',
    name: 'Executive Remote Access',
    description: 'Executive accessing system from home outside business hours',
    user: {
      id: 'user_002',
      email: 'ceo@company.com',
      roles: ['executive', 'admin'],
      groups: ['executives', 'leadership']
    },
    conditions: {
      ip: '203.0.113.50',
      location: 'Ankara, Turkey',
      device: 'MacBook Pro - macOS',
      time: '2024-01-15T20:15:00Z',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    expectedResult: 'challenge'
  },
  {
    id: 'scenario_3',
    name: 'Suspicious Login Attempt',
    description: 'Login attempt from unknown location with suspicious patterns',
    user: {
      id: 'user_003',
      email: 'manager@company.com',
      roles: ['manager'],
      groups: ['managers', 'employees']
    },
    conditions: {
      ip: '45.55.xxx.xxx',
      location: 'Unknown',
      device: 'Unknown Browser',
      time: '2024-01-15T03:45:00Z',
      userAgent: 'Bot/1.0'
    },
    expectedResult: 'deny'
  },
  {
    id: 'scenario_4',
    name: 'Mobile Access',
    description: 'User accessing from mobile device during lunch break',
    user: {
      id: 'user_004',
      email: 'sales@company.com',
      roles: ['sales'],
      groups: ['sales_team', 'employees']
    },
    conditions: {
      ip: '192.168.1.205',
      location: 'Istanbul, Turkey',
      device: 'iPhone 15 Pro - iOS 17',
      time: '2024-01-15T12:30:00Z',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    },
    expectedResult: 'allow'
  },
  {
    id: 'scenario_5',
    name: 'Password Reset Request',
    description: 'User requesting password reset after multiple failed attempts',
    user: {
      id: 'user_005',
      email: 'support@company.com',
      roles: ['support'],
      groups: ['support_team', 'employees']
    },
    conditions: {
      ip: '192.168.1.150',
      location: 'Istanbul, Turkey',
      device: 'Desktop - Windows 11',
      time: '2024-01-15T14:20:00Z',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    expectedResult: 'challenge'
  }
]

export function PolicySimulation({ policies }: PolicySimulationProps) {
  const [activeTab, setActiveTab] = useState("scenarios")
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [customScenario, setCustomScenario] = useState<Partial<SimulationScenario>>({})
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleRunSimulation = async () => {
    if (selectedScenarios.length === 0 && !customScenario.id) {
      toast.error("Please select at least one scenario to simulate")
      return
    }

    setRunning(true)
    setProgress(0)

    try {
      // Mock simulation with progress
      const scenarios = selectedScenarios.length > 0 
        ? mockScenarios.filter(s => selectedScenarios.includes(s.id))
        : [customScenario as SimulationScenario]

      for (let i = 0; i <= 100; i += 20) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Mock simulation results
      const mockResults: SimulationResult = {
        simulationId: `sim_${Date.now()}`,
        timestamp: new Date().toISOString(),
        testCases: scenarios.map(scenario => ({
          scenario: scenario.name,
          user: scenario.user.email,
          conditions: scenario.conditions,
          expectedResult: scenario.expectedResult,
          actualResult: Math.random() > 0.8 ? 'deny' : scenario.expectedResult, // Randomly fail some tests
          passed: Math.random() > 0.2, // 80% pass rate
          details: Math.random() > 0.2 ? 'Policy evaluation completed successfully' : 'Policy conflict detected'
        })),
        overallResult: Math.random() > 0.3 ? 'pass' : 'warning',
        coverage: Math.floor(Math.random() * 20) + 80, // 80-100% coverage
        recommendations: [
          'Consider adding time-based restrictions for sensitive operations',
          'Review IP whitelist configuration for remote access policies',
          'Enable additional MFA methods for executive accounts'
        ]
      }

      setSimulationResults(mockResults)
      setActiveTab("results")
      toast.success("Simulation completed successfully")
    } catch (error) {
      toast.error("Simulation failed")
    } finally {
      setRunning(false)
      setProgress(0)
    }
  }

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'allow':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'deny':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'challenge':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getResultBadge = (result: string, passed: boolean) => {
    if (!passed) {
      return <Badge variant="destructive">Failed</Badge>
    }
    
    switch (result) {
      case 'allow':
        return <Badge variant="default" className="bg-green-500">Allow</Badge>
      case 'deny':
        return <Badge variant="destructive">Deny</Badge>
      case 'challenge':
        return <Badge variant="secondary" className="bg-amber-500 text-white">Challenge</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Policy Simulation</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedScenarios([])
                  setCustomScenario({})
                  setSimulationResults(null)
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleRunSimulation}
                disabled={running}
              >
                {running ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {running && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 animate-pulse" />
                <span className="font-medium">Running simulation tests...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Testing {selectedScenarios.length || 1} scenario(s) against {policies.length} active policies
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="custom">Custom Test</TabsTrigger>
          <TabsTrigger value="results" disabled={!simulationResults}>
            Results
            {simulationResults && (
              <Badge variant="secondary" className="ml-2">
                {simulationResults.testCases.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pre-built Test Scenarios</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select one or more scenarios to test your policies against common authentication situations.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {selectedScenarios.length} of {mockScenarios.length} scenarios selected
                </p>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedScenarios(mockScenarios.map(s => s.id))}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedScenarios([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {mockScenarios.map((scenario) => (
                  <Card 
                    key={scenario.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedScenarios.includes(scenario.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleScenarioToggle(scenario.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{scenario.name}</h4>
                          {getResultIcon(scenario.expectedResult)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {scenario.description}
                        </p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span>{scenario.user.email}</span>
                            <Badge variant="outline" className="text-xs">
                              {scenario.user.roles.join(', ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{scenario.conditions.location}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-3 w-3" />
                            <span>{scenario.conditions.device}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Wifi className="h-3 w-3" />
                            <span>{scenario.conditions.ip}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Expected:</span>
                          {getResultBadge(scenario.expectedResult, true)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Test Scenario</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a custom test scenario with specific user and condition parameters.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customName">Scenario Name</Label>
                  <Input
                    id="customName"
                    placeholder="Enter scenario name"
                    value={customScenario.name || ''}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customEmail">User Email</Label>
                  <Input
                    id="customEmail"
                    placeholder="user@company.com"
                    value={customScenario.user?.email || ''}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      user: { ...prev.user, email: e.target.value } as any
                    }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customDescription">Description</Label>
                <Input
                  id="customDescription"
                  placeholder="Describe the test scenario"
                  value={customScenario.description || ''}
                  onChange={(e) => setCustomScenario(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customIP">IP Address</Label>
                  <Input
                    id="customIP"
                    placeholder="192.168.1.100"
                    value={customScenario.conditions?.ip || ''}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      conditions: { ...prev.conditions, ip: e.target.value } as any
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customLocation">Location</Label>
                  <Input
                    id="customLocation"
                    placeholder="Istanbul, Turkey"
                    value={customScenario.conditions?.location || ''}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      conditions: { ...prev.conditions, location: e.target.value } as any
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customDevice">Device</Label>
                  <Input
                    id="customDevice"
                    placeholder="Desktop - Windows 11"
                    value={customScenario.conditions?.device || ''}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      conditions: { ...prev.conditions, device: e.target.value } as any
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customExpected">Expected Result</Label>
                  <Select
                    value={customScenario.expectedResult || ''}
                    onValueChange={(value) => setCustomScenario(prev => ({
                      ...prev,
                      expectedResult: value as any
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expected result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                      <SelectItem value="challenge">Challenge (MFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {simulationResults && (
            <>
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TestTube className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{simulationResults.testCases.length}</p>
                        <p className="text-xs text-muted-foreground">Total Tests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {simulationResults.testCases.filter(t => t.passed).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Passed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {simulationResults.testCases.filter(t => !t.passed).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{simulationResults.coverage}%</p>
                        <p className="text-xs text-muted-foreground">Coverage</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Result */}
              <Alert className={
                simulationResults.overallResult === 'pass' 
                  ? 'border-green-200 bg-green-50'
                  : simulationResults.overallResult === 'warning'
                  ? 'border-amber-200 bg-amber-50'  
                  : 'border-red-200 bg-red-50'
              }>
                {simulationResults.overallResult === 'pass' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : simulationResults.overallResult === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={
                  simulationResults.overallResult === 'pass' 
                    ? 'text-green-800'
                    : simulationResults.overallResult === 'warning'
                    ? 'text-amber-800'
                    : 'text-red-800'
                }>
                  <strong>
                    Simulation {simulationResults.overallResult === 'pass' ? 'Passed' : 
                      simulationResults.overallResult === 'warning' ? 'Passed with Warnings' : 'Failed'}
                  </strong>
                  <br />
                  {simulationResults.overallResult === 'pass' && 
                    "All test scenarios completed successfully. Your policies are working as expected."}
                  {simulationResults.overallResult === 'warning' && 
                    "Some tests passed with warnings. Review the results below for potential improvements."}
                  {simulationResults.overallResult === 'fail' && 
                    "Some tests failed. Please review your policy configuration before deployment."}
                </AlertDescription>
              </Alert>

              {/* Test Results */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Test Results</CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scenario</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulationResults.testCases.map((testCase, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {testCase.scenario}
                          </TableCell>
                          <TableCell>{testCase.user}</TableCell>
                          <TableCell>
                            {getResultBadge(testCase.expectedResult, true)}
                          </TableCell>
                          <TableCell>
                            {getResultBadge(testCase.actualResult, true)}
                          </TableCell>
                          <TableCell>
                            {testCase.passed ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Pass
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Fail
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {testCase.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {simulationResults.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {simulationResults.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}