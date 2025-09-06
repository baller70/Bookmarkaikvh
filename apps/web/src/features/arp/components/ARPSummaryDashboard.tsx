'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react'

interface ARPSection {
  id: string
  title: string
  dueDate?: Date
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'not_started' | 'in_progress' | 'review' | 'complete'
  progress: number
  estimatedHours?: number
  actualHours?: number
}

interface ARPSummaryDashboardProps {
  sections: ARPSection[]
}

export const ARPSummaryDashboard: React.FC<ARPSummaryDashboardProps> = ({
  sections
}) => {
  const totalSections = sections.length
  const completedSections = sections.filter(s => s.status === 'complete').length
  const inProgressSections = sections.filter(s => s.status === 'in_progress').length
  const overdueSections = sections.filter(s => 
    s.dueDate && new Date() > s.dueDate && s.status !== 'complete'
  ).length
  
  const averageProgress = totalSections > 0 
    ? Math.round(sections.reduce((sum, s) => sum + s.progress, 0) / totalSections)
    : 0

  const totalEstimatedHours = sections.reduce((sum, s) => sum + (s.estimatedHours || 0), 0)
  const totalActualHours = sections.reduce((sum, s) => sum + (s.actualHours || 0), 0)

  const urgentSections = sections.filter(s => s.priority === 'urgent' && s.status !== 'complete').length
  const assignedSections = sections.filter(s => s.assignedTo).length

  const upcomingDeadlines = sections
    .filter(s => s.dueDate && s.status !== 'complete')
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))
    .slice(0, 3)

  const formatDate = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays <= 7) return `${diffDays} days`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{averageProgress}%</span>
              <Badge variant="secondary">{completedSections}/{totalSections}</Badge>
            </div>
            <Progress value={averageProgress} className="h-2" />
            <div className="text-xs text-gray-500">
              {inProgressSections} in progress
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actual</span>
              <span className="font-semibold">{totalActualHours}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated</span>
              <span className="font-semibold">{totalEstimatedHours}h</span>
            </div>
            {totalEstimatedHours > 0 && (
              <div className="text-xs text-gray-500">
                {totalActualHours > totalEstimatedHours ? 'Over' : 'Under'} by{' '}
                {Math.abs(totalActualHours - totalEstimatedHours)}h
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overdueSections > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Overdue</span>
                <Badge variant="destructive">{overdueSections}</Badge>
              </div>
            )}
            {urgentSections > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-600">Urgent</span>
                <Badge className="bg-orange-500">{urgentSections}</Badge>
              </div>
            )}
            {overdueSections === 0 && urgentSections === 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">All on track</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Upcoming
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((section) => (
                <div key={section.id} className="flex items-center justify-between">
                  <span className="text-xs truncate flex-1 mr-2">
                    {section.title || 'Untitled'}
                  </span>
                  <span className={`text-xs ${
                    section.dueDate && new Date() > section.dueDate 
                      ? 'text-red-600 font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {section.dueDate && formatDate(section.dueDate)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 text-center py-2">
                No upcoming deadlines
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
