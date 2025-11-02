'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Mail, Lock, User, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function AuthFlow() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [healthDataConsent, setHealthDataConsent] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)

  const handleAuth = async (type: 'login' | 'signup') => {
    if (type === 'signup' && (!healthDataConsent || !privacyConsent)) {
      toast({
        title: "Consent Required",
        description: "Please review and accept our privacy and health data policies to continue.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (type === 'signup') {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Welcome
        </Button>

        <Card className="border-2 border-medical-blue/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Secure Access</CardTitle>
            <CardDescription>
              Your health data is protected with medical-grade security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleAuth('login')}
                  disabled={isLoading}
                  className="w-full bg-medical-blue hover:bg-medical-blue/90"
                >
                  {isLoading ? 'Signing In...' : 'Sign In Securely'}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="health-consent"
                      checked={healthDataConsent}
                      onCheckedChange={(checked) => setHealthDataConsent(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="health-consent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Health Data Consent
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I consent to the secure processing of my health data for personalized nutrition insights
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="privacy-consent"
                      checked={privacyConsent}
                      onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="privacy-consent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Privacy Policy Agreement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I have read and agree to the privacy policy and terms of service
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleAuth('signup')}
                  disabled={isLoading || !healthDataConsent || !privacyConsent}
                  className="w-full bg-medical-blue hover:bg-medical-blue/90"
                >
                  {isLoading ? 'Creating Account...' : 'Create Secure Account'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-medical-blue" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Your data is encrypted and stored securely following HIPAA compliance standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
