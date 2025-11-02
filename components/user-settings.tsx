'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, Bell, Download, Share2, Trash2, Eye, EyeOff, Lock, Smartphone, Globe } from 'lucide-react'

export function UserSettings() {
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    medicationAlerts: true,
    healthInsights: true,
    weeklyReports: false,
    emergencyAlerts: true
  })

  const [privacy, setPrivacy] = useState({
    shareWithProviders: false,
    anonymousAnalytics: true,
    dataRetention: '2-years',
    encryptionLevel: 'maximum'
  })

  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    voiceNavigation: false,
    screenReader: false
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your privacy, notifications, and accessibility preferences
        </p>
      </div>

      <Tabs defaultValue="privacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-2 border-medical-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-medical-blue" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>
                Control how your health data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your data is encrypted with medical-grade security and stored in HIPAA-compliant servers
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Healthcare Provider Sharing</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow your healthcare providers to access your nutrition data
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareWithProviders}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, shareWithProviders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Anonymous Analytics</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help improve the app with anonymized usage data
                    </p>
                  </div>
                  <Switch
                    checked={privacy.anonymousAnalytics}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, anonymousAnalytics: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Data Retention Period</Label>
                  <Select 
                    value={privacy.dataRetention} 
                    onValueChange={(value) => setPrivacy(prev => ({ ...prev, dataRetention: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How long to keep your health data after account deletion
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Encryption Level</Label>
                  <Select 
                    value={privacy.encryptionLevel} 
                    onValueChange={(value) => setPrivacy(prev => ({ ...prev, encryptionLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (AES-256)</SelectItem>
                      <SelectItem value="maximum">Maximum (AES-256 + Zero-Knowledge)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-600">Currently using maximum encryption</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Medical Information</CardTitle>
              <CardDescription>
                Control who can access your medical data in emergencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Emergency Access</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow emergency responders to view critical health information
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Emergency Info Visible:</strong> Allergies, medications, emergency contacts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-medical-blue" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose which health alerts and reminders you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Meal Reminders</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reminders to log your meals and snacks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.mealReminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, mealReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Medication Alerts</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Critical alerts for medication timing and food interactions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    <Switch
                      checked={notifications.medicationAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, medicationAlerts: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Health Insights</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI-powered nutrition insights and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={notifications.healthInsights}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, healthInsights: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Summary of your nutrition progress and health trends
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Emergency Alerts</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Urgent health warnings and emergency notifications
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">Emergency</Badge>
                    <Switch
                      checked={notifications.emergencyAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emergencyAlerts: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-medical-blue" />
                <span>Accessibility Options</span>
              </CardTitle>
              <CardDescription>
                Customize the app for your accessibility needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">High Contrast Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={accessibility.highContrast}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, highContrast: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Large Text</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase text size throughout the app
                    </p>
                  </div>
                  <Switch
                    checked={accessibility.largeText}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, largeText: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Voice Navigation</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Navigate the app using voice commands
                    </p>
                  </div>
                  <Switch
                    checked={accessibility.voiceNavigation}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, voiceNavigation: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Screen Reader Optimization</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enhanced compatibility with screen readers
                    </p>
                  </div>
                  <Switch
                    checked={accessibility.screenReader}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, screenReader: checked }))
                    }
                  />
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Mobile Accessibility:</strong> This app supports iOS VoiceOver and Android TalkBack
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-medical-blue" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>
                Export, share, or delete your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span className="font-medium">Export Health Data</span>
                  </div>
                  <p className="text-xs text-gray-600 text-left">
                    Download all your nutrition and health data in CSV format
                  </p>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">Share with Provider</span>
                  </div>
                  <p className="text-xs text-gray-600 text-left">
                    Generate a secure report for your healthcare provider
                  </p>
                </Button>
              </div>

              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <Globe className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Data Portability:</strong> You can export your data at any time in standard formats
                </AlertDescription>
              </Alert>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Health Data
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone. All your health data, meal logs, and insights will be permanently deleted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
