'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('IncidentsTracking Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 border-l-4 border-red-500 bg-red-50">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong with the incident timeline
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please refresh the page. If the problem persists, contact support.</p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Error details</summary>
                    <pre className="mt-2 text-xs">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary