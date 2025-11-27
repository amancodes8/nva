"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Droplet, Plus, Minus, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WaterIntakeProps {
  userId?: string
  initialGlasses?: number
  goal?: number
}

export function WaterIntakeTracker({ userId, initialGlasses = 0, goal = 8 }: WaterIntakeProps) {
  const { toast } = useToast()
  const [waterGlasses, setWaterGlasses] = useState(initialGlasses)
  const [isAnimating, setIsAnimating] = useState(false)
  const [ripples, setRipples] = useState<number[]>([])

  // Load water intake from database on mount
  useEffect(() => {
    loadWaterIntake()
  }, [userId])

  // Save to database whenever water glasses change
  useEffect(() => {
    if (waterGlasses !== initialGlasses) {
      saveWaterIntake()
    }
  }, [waterGlasses])

  const loadWaterIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/daily-nutrition?date=${today}`)
      
      if (response.ok) {
        const data = await response.json()
        setWaterGlasses(data.water_intake_glasses || 0)
      }
    } catch (error) {
      console.error('Failed to load water intake:', error)
    }
  }

  const saveWaterIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch('/api/water-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          glasses: waterGlasses,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save water intake')
      }
    } catch (error) {
      console.error('Failed to save water intake:', error)
    }
  }

  const addWater = () => {
    if (waterGlasses < goal + 4) {
      setWaterGlasses(prev => prev + 1)
      triggerAnimation()
      
      const newGlasses = waterGlasses + 1
      if (newGlasses === goal) {
        toast({
          title: "🎉 Goal Reached!",
          description: `Great job! You've reached your daily water goal of ${goal} glasses!`,
        })
      } else if (newGlasses < goal) {
        toast({
          title: "💧 Water Added",
          description: `${newGlasses}/${goal} glasses today. Keep it up!`,
        })
      } else {
        toast({
          title: "💪 Excellent Hydration!",
          description: `You're exceeding your goal! ${newGlasses}/${goal} glasses.`,
        })
      }
    }
  }

  const removeWater = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(prev => prev - 1)
      triggerAnimation()
    }
  }

  const resetWater = () => {
    setWaterGlasses(0)
    toast({
      title: "Reset Complete",
      description: "Water intake has been reset to 0.",
    })
  }

  const triggerAnimation = () => {
    setIsAnimating(true)
    
    // Add ripple effect
    const newRipple = Date.now()
    setRipples(prev => [...prev, newRipple])
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 600)

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r !== newRipple))
    }, 800)
  }

  const percentage = Math.min((waterGlasses / goal) * 100, 100)
  const isGoalReached = waterGlasses >= goal

  return (
    <Card className={`border-2 transition-all duration-300 ${
      isGoalReached 
        ? 'border-green-300 bg-green-50 dark:bg-green-900/10' 
        : 'border-blue-300 bg-blue-50 dark:bg-blue-900/10'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
        <div className="relative">
          <Droplet 
            className={`h-5 w-5 transition-all duration-300 ${
              isGoalReached 
                ? 'text-green-600' 
                : 'text-blue-600'
            } ${isAnimating ? 'scale-125' : 'scale-100'}`}
          />
          {ripples.map((ripple) => (
            <div
              key={ripple}
              className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"
              style={{ animationDuration: '0.8s' }}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Water Count Display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300">
              {waterGlasses}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              of {goal} glasses
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={percentage} 
              className={`h-3 transition-all duration-500 ${
                isAnimating ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(percentage)}% of goal</span>
              {waterGlasses > goal && (
                <span className="text-green-600 font-medium">
                  +{waterGlasses - goal} bonus!
                </span>
              )}
            </div>
          </div>

          {/* Visual Water Glasses */}
          <div className="grid grid-cols-8 gap-1 py-2">
            {Array.from({ length: Math.max(goal, waterGlasses) }).map((_, index) => (
              <div
                key={index}
                className={`h-8 rounded transition-all duration-300 ${
                  index < waterGlasses
                    ? isGoalReached && index >= goal
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
                style={{
                  transitionDelay: `${index * 30}ms`
                }}
              />
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={removeWater}
              disabled={waterGlasses === 0}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Minus className="h-4 w-4 mr-1" />
              Remove
            </Button>
            
            <Button
              onClick={addWater}
              disabled={waterGlasses >= goal + 4}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Glass
            </Button>

            <Button
              onClick={resetWater}
              variant="ghost"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Motivational Messages */}
          {waterGlasses === 0 && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
              💧 Start tracking your water intake today!
            </div>
          )}
          
          {waterGlasses > 0 && waterGlasses < goal / 2 && (
            <div className="text-center text-xs text-blue-600 dark:text-blue-400 pt-2">
              🌊 Good start! Keep drinking water throughout the day.
            </div>
          )}
          
          {waterGlasses >= goal / 2 && waterGlasses < goal && (
            <div className="text-center text-xs text-blue-600 dark:text-blue-400 pt-2">
              💪 Halfway there! You're doing great!
            </div>
          )}
          
          {isGoalReached && (
            <div className="text-center text-xs text-green-600 dark:text-green-400 pt-2 font-medium animate-pulse">
              🎉 Excellent! You've met your hydration goal!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}