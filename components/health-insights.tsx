'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Heart, Activity } from 'lucide-react'

export function HealthInsights() {
  const insights = [
    {
      type: 'positive',
      title: 'Great Progress!',
      description: 'Your sodium intake has decreased by 15% this week',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      type: 'warning',
      title: 'Watch Your Iron',
      description: 'Consider adding more iron-rich foods to prevent deficiency',
      icon: AlertTriangle,
      color: 'text-amber-600'
    },
    {
      type: 'info',
      title: 'Hydration Reminder',
      description: 'You\'re 2 glasses behind your daily water goal',
      icon: Activity,
      color: 'text-blue-600'
    }
  ]

  const healthGoals = [
    { name: 'Blood Sugar Control', progress: 85, target: 'Excellent' },
    { name: 'Heart Health', progress: 72, target: 'Good' },
    { name: 'Weight Management', progress: 90, target: 'On Track' },
    { name: 'Energy Levels', progress: 68, target: 'Improving' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-medical-blue" />
            <span>AI Health Insights</span>
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your health profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-medical-blue" />
            <span>Health Goals</span>
          </CardTitle>
          <CardDescription>
            Track your progress towards better health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthGoals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{goal.name}</span>
                <Badge 
                  variant="secondary"
                  className={`text-xs ${
                    goal.progress >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : goal.progress >= 60 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {goal.target}
                </Badge>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <p className="text-xs text-gray-500">{goal.progress}% complete</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-medical-blue/20">
        <CardHeader>
          <CardTitle className="text-lg">Today's Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-medical-blue" />
              <span className="font-medium text-sm">Meal Suggestion</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your diabetes management, try a quinoa bowl with grilled chicken, 
              roasted vegetables, and avocado for balanced blood sugar.
            </p>
            <Badge className="bg-medical-blue text-white">
              Diabetes-Friendly
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
