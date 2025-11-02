'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Type, Camera, Mic, Upload, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function FoodInputTabs() {
  const { toast } = useToast()
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast({
      title: "Food Logged Successfully",
      description: `Added "${textInput}" to your daily log with nutritional analysis.`,
    })
    
    setTextInput('')
    setIsProcessing(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    // Simulate image processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    toast({
      title: "Image Analyzed",
      description: "Food items detected and added to your log with portion estimates.",
    })
    
    setIsProcessing(false)
  }

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessing(true)
      
      // Simulate voice processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Voice Log Processed",
        description: "Your spoken meal description has been analyzed and logged.",
      })
      
      setIsProcessing(false)
    } else {
      setIsRecording(true)
      // Simulate starting recording
      setTimeout(() => {
        if (isRecording) {
          setIsRecording(false)
          toggleRecording()
        }
      }, 5000) // Auto-stop after 5 seconds for demo
    }
  }

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="text" className="flex items-center space-x-2">
          <Type className="h-4 w-4" />
          <span>Text</span>
        </TabsTrigger>
        <TabsTrigger value="image" className="flex items-center space-x-2">
          <Camera className="h-4 w-4" />
          <span>Image</span>
        </TabsTrigger>
        <TabsTrigger value="voice" className="flex items-center space-x-2">
          <Mic className="h-4 w-4" />
          <span>Voice</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="food-text">Describe your meal</Label>
          <Textarea
            id="food-text"
            placeholder="e.g., Grilled chicken breast with steamed broccoli and brown rice"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            className="bg-medical-blue hover:bg-medical-blue/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Log Food
              </>
            )}
          </Button>
        </div>
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Smart Recognition:</strong> Our AI can identify ingredients, cooking methods, and portion sizes from your description.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="image" className="space-y-4">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Take a photo or upload an image of your meal
            </p>
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button asChild disabled={isProcessing}>
                  <span>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </>
                    )}
                  </span>
                </Button>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Advanced Recognition:</strong> Our AI analyzes food items, portion sizes, and preparation methods from photos.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="voice" className="space-y-4">
        <div className="text-center space-y-4">
          <div className="p-8">
            <Mic className={`h-16 w-16 mx-auto mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isRecording ? 'Recording... Speak naturally about your meal' : 'Tap to start recording your meal description'}
            </p>
            <Button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-medical-blue hover:bg-medical-blue/90'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isRecording ? (
                'Stop Recording'
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
          {isRecording && (
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>Natural Language:</strong> Just speak naturally - "I had a turkey sandwich with lettuce and tomato for lunch"
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
