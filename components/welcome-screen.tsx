'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Heart, Brain, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function WelcomeScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = async () => {
    setIsLoading(true)
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-8 w-8 text-medical-blue" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Nutri-Vision AI
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your personal health nutrition dashboard with AI-powered insights and medical condition awareness
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-medical-blue/20 hover:border-medical-blue/40 transition-colors">
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-medical-blue mx-auto mb-2" />
              <CardTitle className="text-lg">Medical Grade Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                HIPAA-compliant data handling with end-to-end encryption for your sensitive health information
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-medical-blue/20 hover:border-medical-blue/40 transition-colors">
            <CardHeader className="text-center">
              <Heart className="h-8 w-8 text-medical-blue mx-auto mb-2" />
              <CardTitle className="text-lg">Condition Aware</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalized nutrition recommendations based on your specific medical conditions and medications
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-medical-blue/20 hover:border-medical-blue/40 transition-colors">
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 text-medical-blue mx-auto mb-2" />
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced AI analysis of your nutrition patterns with predictive health risk assessments
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-medical-blue/20 hover:border-medical-blue/40 transition-colors">
            <CardHeader className="text-center">
              <Lock className="h-8 w-8 text-medical-blue mx-auto mb-2" />
              <CardTitle className="text-lg">Your Data, Your Control</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Granular privacy controls with easy data export and healthcare provider sharing options
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button 
            onClick={handleGetStarted}
            disabled={isLoading}
            size="lg"
            className="bg-medical-blue hover:bg-medical-blue/90 text-white px-8 py-3 text-lg"
          >
            {isLoading ? 'Loading...' : 'Get Started Safely'}
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our privacy-first approach to handling your health data
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
            <strong>Medical Disclaimer:</strong> This application provides nutritional information and should not replace professional medical advice. Always consult with your healthcare provider for medical decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
