# Nutri-Vision AI - API Integration Guide

## Overview

This comprehensive guide explains how to integrate backend APIs into the Nutri-Vision AI frontend. The app requires 4 core API services:
1. Food Logging & Recognition
2. AI Nutrition Insights
3. Meal Suggestions
4. Medical Alerts

---

## 1. Food Logging API Integration

### Purpose
Analyzes food descriptions, images, or voice input and returns detailed nutrition information.

### Frontend Integration Points
- **Location**: `/components/food-input-tabs.tsx`
- **Usage**: Text input, image upload, voice recording tabs

### Expected Backend API Endpoint
\`\`\`
POST /api/food/analyze
\`\`\`

### Expected Request Payload

#### Text Input Method
\`\`\`json
{
  "type": "text",
  "input": "Grilled chicken breast with steamed broccoli and brown rice",
  "portion_size": "1 breast + 1 cup vegetables + 1 cup rice",
  "user_id": "user-uuid",
  "timestamp": "2024-11-05T12:30:00Z"
}
\`\`\`

#### Image Upload Method
\`\`\`json
{
  "type": "image",
  "image_url": "https://cdn.example.com/food-image.jpg",
  "image_data": "base64-encoded-image-string",
  "user_id": "user-uuid",
  "timestamp": "2024-11-05T12:30:00Z"
}
\`\`\`

#### Voice Input Method
\`\`\`json
{
  "type": "voice",
  "audio_url": "https://cdn.example.com/audio.mp3",
  "audio_data": "base64-encoded-audio-string",
  "user_id": "user-uuid",
  "timestamp": "2024-11-05T12:30:00Z"
}
\`\`\`

### Expected Response
\`\`\`json
{
  "success": true,
  "food_items": [
    {
      "name": "Grilled Chicken Breast",
      "serving_size": "1 breast (100g)",
      "calories": 165,
      "macros": {
        "protein": 31,
        "carbs": 0,
        "fat": 3.6
      },
      "micros": {
        "vitamin_b6": 0.88,
        "vitamin_b12": 0.3,
        "niacin": 8.9,
        "iron": 0.8
      },
      "confidence": 0.95,
      "allergens": []
    },
    {
      "name": "Steamed Broccoli",
      "serving_size": "1 cup (156g)",
      "calories": 55,
      "macros": {
        "protein": 3.7,
        "carbs": 11,
        "fat": 0.6
      },
      "micros": {
        "vitamin_c": 89.2,
        "vitamin_k": 101.6,
        "folate": 63
      },
      "confidence": 0.98,
      "allergens": []
    }
  ],
  "meal_summary": {
    "total_calories": 500,
    "total_protein": 44,
    "total_carbs": 100,
    "total_fat": 10,
    "meal_type": "lunch",
    "meal_quality_score": 8.5
  },
  "health_alerts": [],
  "meal_id": "meal-uuid-12345",
  "processed_at": "2024-11-05T12:30:15Z"
}
\`\`\`

### Frontend Integration Code

Add this to `/app/api/food-logs/route.ts`:

\`\`\`typescript
import { createSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const foodData = await request.json()

  try {
    // Call your backend API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/food/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          ...foodData,
          user_id: user.id,
        }),
      }
    )

    const mealData = await backendResponse.json()

    // Store in Supabase
    const { data: savedMeal, error } = await supabase
      .from("food_logs")
      .insert({
        user_id: user.id,
        description: foodData.input || foodData.image_url,
        log_type: foodData.type,
        calories: mealData.meal_summary.total_calories,
        protein: mealData.meal_summary.total_protein,
        carbs: mealData.meal_summary.total_carbs,
        fat: mealData.meal_summary.total_fat,
        logged_at: new Date().toISOString(),
      })
      .select()

    return NextResponse.json(mealData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze food" }, { status: 500 })
  }
}
\`\`\`

---

## 2. AI Nutrition Insights API Integration

### Purpose
Generates personalized nutrition advice based on user's health profile and logged food.

### Frontend Integration Points
- **Location**: `/components/ai-recommendations.tsx`
- **Usage**: Displays AI-generated insights on dashboard

### Expected Backend API Endpoint
\`\`\`
POST /api/nutrition/insights
\`\`\`

### Expected Request Payload
\`\`\`json
{
  "user_id": "user-uuid",
  "time_period": "daily",
  "health_profile": {
    "age": 45,
    "gender": "Female",
    "activity_level": "Moderate",
    "medical_conditions": ["Diabetes Type 2", "Hypertension"],
    "dietary_restrictions": ["Low-Sodium"],
    "allergies": ["Shellfish"]
  },
  "food_logs_today": [
    {
      "meal_id": "meal-uuid",
      "food_items": ["Chicken", "Rice", "Vegetables"],
      "calories": 450,
      "macros": {
        "protein": 35,
        "carbs": 50,
        "fat": 12
      }
    }
  ],
  "goals": {
    "daily_calories": 2000,
    "daily_protein": 120,
    "daily_carbs": 200
  }
}
\`\`\`

### Expected Response
\`\`\`json
{
  "success": true,
  "insights": [
    {
      "type": "nutrition",
      "priority": "high",
      "title": "Protein Intake on Track",
      "description": "You've consumed 35g of protein so far. You're doing well! Try to include protein-rich foods in your next meals.",
      "suggestion": "Add a Greek yogurt snack (20g protein) this afternoon",
      "confidence": 0.92
    },
    {
      "type": "medical",
      "priority": "high",
      "title": "High Sodium Alert",
      "description": "Your sodium intake today is approaching the recommended limit for hypertension (1,200mg consumed of 2,300mg daily limit)",
      "suggestion": "Avoid processed foods and added salt for your remaining meals",
      "confidence": 0.95,
      "related_condition": "Hypertension"
    },
    {
      "type": "wellness",
      "priority": "medium",
      "title": "Hydration Reminder",
      "description": "You've had 4 glasses of water. Aim for 8 glasses daily to support metabolism.",
      "suggestion": "Drink another glass of water before your next meal",
      "confidence": 0.88
    }
  ],
  "daily_summary": {
    "calorie_progress": {
      "consumed": 450,
      "goal": 2000,
      "percentage": 22.5
    },
    "nutrition_score": 7.8,
    "health_status": "Good",
    "recommendations_count": 3
  },
  "generated_at": "2024-11-05T12:35:00Z"
}
\`\`\`

### Frontend Integration Code

Add this to `/app/api/nutrition/insights/route.ts`:

\`\`\`typescript
import { createSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch user profile
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    // Fetch today's food logs
    const today = new Date().toISOString().split("T")[0]
    const { data: foodLogs } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", today)

    // Fetch medical conditions
    const { data: conditions } = await supabase
      .from("medical_conditions")
      .select("*")
      .eq("user_id", user.id)

    // Call backend API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/nutrition/insights`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          health_profile: {
            age: userProfile?.age,
            gender: userProfile?.gender,
            activity_level: userProfile?.activity_level,
            medical_conditions: conditions?.map((c) => c.condition_name) || [],
          },
          food_logs_today: foodLogs || [],
        }),
      }
    )

    const insights = await backendResponse.json()

    // Store insights in Supabase
    for (const insight of insights.insights) {
      await supabase.from("health_insights").insert({
        user_id: user.id,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
      })
    }

    return NextResponse.json(insights)
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
\`\`\`

---

## 3. Meal Suggestions API Integration

### Purpose
Provides personalized meal recommendations based on health profile and daily nutrition goals.

### Frontend Integration Points
- **Location**: `/components/meal-suggestions.tsx`
- **Usage**: Shows suggested meals on dashboard

### Expected Backend API Endpoint
\`\`\`
POST /api/meals/suggest
\`\`\`

### Expected Request Payload
\`\`\`json
{
  "user_id": "user-uuid",
  "health_profile": {
    "medical_conditions": ["Diabetes Type 2", "Hypertension"],
    "dietary_restrictions": ["Low-Sodium", "Low-Carb"],
    "allergies": ["Shellfish", "Peanuts"],
    "food_preferences": ["Mediterranean", "Asian"]
  },
  "current_nutrition": {
    "calories_consumed": 450,
    "calories_remaining": 1550,
    "protein_consumed": 35,
    "protein_remaining": 85,
    "carbs_consumed": 50,
    "carbs_remaining": 150
  },
  "meal_type": "lunch",
  "prep_time_minutes": 30
}
\`\`\`

### Expected Response
\`\`\`json
{
  "success": true,
  "meal_suggestions": [
    {
      "id": "meal-suggestion-1",
      "name": "Lemon Herb Grilled Salmon with Quinoa",
      "cuisine": "Mediterranean",
      "prep_time": "25 minutes",
      "difficulty": "medium",
      "nutrition": {
        "calories": 520,
        "protein": 45,
        "carbs": 35,
        "fat": 18
      },
      "benefits": [
        "High in Omega-3 fatty acids (heart health)",
        "Low glycemic index (blood sugar control)",
        "Supports healthy cholesterol levels"
      ],
      "why_recommended": "This meal fits perfectly into your remaining calories and provides excellent protein. The low glycemic index helps manage your diabetes.",
      "ingredients": [
        "Salmon fillet (6 oz)",
        "Quinoa (½ cup cooked)",
        "Lemon",
        "Herbs (thyme, rosemary)",
        "Olive oil (1 tbsp)"
      ],
      "allergen_safe": true,
      "recipe_url": "https://recipes.example.com/salmon-quinoa",
      "confidence": 0.96
    },
    {
      "id": "meal-suggestion-2",
      "name": "Vegetable Stir-Fry with Tofu",
      "cuisine": "Asian",
      "prep_time": "20 minutes",
      "difficulty": "easy",
      "nutrition": {
        "calories": 380,
        "protein": 28,
        "carbs": 42,
        "fat": 12
      },
      "benefits": [
        "High in fiber and antioxidants",
        "Low sodium preparation",
        "Excellent for weight management"
      ],
      "why_recommended": "Lower calorie option that still meets your nutritional needs. Perfect for managing hypertension with minimal sodium.",
      "ingredients": [
        "Extra firm tofu (8 oz)",
        "Mixed vegetables (broccoli, bell peppers, snap peas)",
        "Low-sodium soy sauce",
        "Garlic and ginger",
        "Sesame oil (½ tbsp)"
      ],
      "allergen_safe": true,
      "recipe_url": "https://recipes.example.com/tofu-stir-fry",
      "confidence": 0.92
    }
  ],
  "generated_at": "2024-11-05T12:40:00Z"
}
\`\`\`

### Frontend Integration Code

Add this to `/app/api/meals/suggest/route.ts`:

\`\`\`typescript
import { createSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch user profile and current nutrition
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    const today = new Date().toISOString().split("T")[0]
    const { data: dailyNutrition } = await supabase
      .from("daily_nutrition")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .single()

    // Call backend API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/meals/suggest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          health_profile: userProfile,
          current_nutrition: dailyNutrition || { calories_consumed: 0 },
        }),
      }
    )

    const suggestions = await backendResponse.json()
    return NextResponse.json(suggestions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get meal suggestions" }, { status: 500 })
  }
}
\`\`\`

---

## 4. Medical Alerts API Integration

### Purpose
Detects health risks like medication-food interactions, allergen warnings, and dangerous nutrient combinations.

### Frontend Integration Points
- **Location**: `/components/medical-condition-alerts.tsx`
- **Usage**: Shows urgent health warnings

### Expected Backend API Endpoint
\`\`\`
POST /api/health/alerts
\`\`\`

### Expected Request Payload
\`\`\`json
{
  "user_id": "user-uuid",
  "health_data": {
    "medical_conditions": ["Diabetes Type 2", "Hypertension"],
    "medications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily"
      },
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "once daily"
      }
    ],
    "allergies": ["Shellfish (anaphylaxis)", "Peanuts (hives)"]
  },
  "food_items_logged": [
    {
      "name": "Grilled Salmon",
      "macros": {
        "sodium": 85,
        "potassium": 415,
        "vitamin_k": 0
      }
    },
    {
      "name": "Brown Rice",
      "macros": {
        "sodium": 5,
        "potassium": 84,
        "vitamin_k": 0.8
      }
    }
  ],
  "daily_totals": {
    "sodium": 2800,
    "potassium": 3200
  }
}
\`\`\`

### Expected Response
\`\`\`json
{
  "success": true,
  "alerts": [
    {
      "id": "alert-1",
      "severity": "high",
      "type": "medication_interaction",
      "title": "Potential Medication Interaction",
      "message": "High potassium intake detected (3,200mg). This may interact with your Lisinopril (ACE inhibitor), which can increase potassium levels dangerously.",
      "affected_medication": "Lisinopril",
      "recommendation": "Limit potassium intake to <2,000mg daily. Avoid high-potassium foods like bananas, spinach, and sweet potatoes.",
      "action_required": true,
      "action_items": [
        "Contact your doctor to check potassium levels",
        "Adjust your diet to reduce potassium intake"
      ],
      "generated_at": "2024-11-05T12:45:00Z"
    },
    {
      "id": "alert-2",
      "severity": "high",
      "type": "allergen_warning",
      "title": "Allergen Detected",
      "message": "Warning: Shellfish detected in your logged food. You have a severe shellfish allergy (anaphylaxis)!",
      "allergen": "Shellfish",
      "severity_level": "Anaphylaxis",
      "recommendation": "DO NOT CONSUME. Call emergency services if you have already ingested this food and experiencing symptoms.",
      "action_required": true,
      "emergency_contact": true,
      "generated_at": "2024-11-05T12:45:00Z"
    },
    {
      "id": "alert-3",
      "severity": "medium",
      "type": "sodium_warning",
      "title": "High Sodium Intake Alert",
      "message": "Your sodium intake today (2,800mg) exceeds the recommended limit for hypertension (2,300mg). This is 122% of your daily target.",
      "affected_condition": "Hypertension",
      "risk": "elevated",
      "recommendation": "Reduce sodium for remaining meals. Avoid: soy sauce, canned foods, processed meats, salted snacks.",
      "current_sodium": 2800,
      "daily_limit": 2300,
      "generated_at": "2024-11-05T12:45:00Z"
    }
  ],
  "alert_count": 3,
  "critical_alerts": 2
}
\`\`\`

### Frontend Integration Code

Add this to `/app/api/health/alerts/route.ts`:

\`\`\`typescript
import { createSupabaseServer } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch user health data
    const { data: medicalConditions } = await supabase
      .from("medical_conditions")
      .select("*")
      .eq("user_id", user.id)

    const { data: allergies } = await supabase
      .from("food_allergies")
      .select("*")
      .eq("user_id", user.id)

    // Fetch today's food logs
    const today = new Date().toISOString().split("T")[0]
    const { data: foodLogs } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", today)

    // Calculate daily totals
    const dailyTotals = foodLogs?.reduce(
      (acc, log) => ({
        calories: (acc.calories || 0) + (log.calories || 0),
        protein: (acc.protein || 0) + (log.protein || 0),
        carbs: (acc.carbs || 0) + (log.carbs || 0),
        fat: (acc.fat || 0) + (log.fat || 0),
      }),
      {}
    ) || {}

    // Call backend API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/health/alerts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          health_data: {
            medical_conditions: medicalConditions?.map((c) => c.condition_name) || [],
            allergies: allergies?.map((a) => ({ name: a.allergen, severity: a.severity })) || [],
          },
          food_items_logged: foodLogs || [],
          daily_totals: dailyTotals,
        }),
      }
    )

    const alerts = await backendResponse.json()

    // Store alerts in Supabase if critical
    for (const alert of alerts.alerts) {
      if (alert.severity === "high") {
        await supabase.from("health_insights").insert({
          user_id: user.id,
          insight_type: "alert",
          title: alert.title,
          description: alert.message,
          priority: "high",
        })
      }
    }

    return NextResponse.json(alerts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate alerts" }, { status: 500 })
  }
}
\`\`\`

---

## Implementation Steps Summary

### Step 1: Set Up Environment Variables
Add to your `.env.local`:
\`\`\`
NEXT_PUBLIC_BACKEND_URL=http://your-backend-api.com
BACKEND_API_KEY=your-api-key-here
\`\`\`

### Step 2: Create API Route Handlers
Copy the provided code into:
- `/app/api/food-logs/route.ts`
- `/app/api/nutrition/insights/route.ts`
- `/app/api/meals/suggest/route.ts`
- `/app/api/health/alerts/route.ts`

### Step 3: Hook Up Components
The components already have hooks set up. They call these endpoints:

\`\`\`typescript
// In food-input-tabs.tsx
const response = await fetch("/api/food-logs", { method: "POST" })

// In ai-recommendations.tsx
const response = await fetch("/api/nutrition/insights")

// In meal-suggestions.tsx
const response = await fetch("/api/meals/suggest")

// In medical-condition-alerts.tsx
const response = await fetch("/api/health/alerts", { method: "POST" })
\`\`\`

### Step 4: Test Each Integration
1. Log a food item through the text input
2. Check that nutritional data appears in the dashboard
3. Verify AI recommendations are displayed
4. Confirm meal suggestions are personalized
5. Test that medical alerts appear for high-risk foods

---

## Error Handling

All API endpoints should return standardized error responses:

\`\`\`json
{
  "error": "Error message here",
  "error_code": "SPECIFIC_CODE",
  "details": "Additional context if available",
  "timestamp": "2024-11-05T12:45:00Z"
}
\`\`\`

Frontend handles errors with toast notifications:
\`\`\`typescript
if (!response.ok) {
  const error = await response.json()
  toast({
    title: "Error",
    description: error.error || "Something went wrong",
    variant: "destructive"
  })
}
\`\`\`

---

## Rate Limiting & Performance

- **Food Analysis**: Cache results for 1 hour
- **Insights Generation**: Once per day per user
- **Meal Suggestions**: Cache for 24 hours
- **Medical Alerts**: Real-time, no caching

---

## Security Considerations

1. All endpoints require user authentication (checked via Supabase)
2. Backend API calls use Bearer token authorization
3. User data is never exposed in frontend console logs
4. Sensitive health data is encrypted at rest in Supabase (RLS enabled)

---

## Testing Checklist

- [ ] Food logging creates entry in database
- [ ] Nutritional data displays correctly on dashboard
- [ ] AI insights appear within 2 seconds
- [ ] Meal suggestions match user's health profile
- [ ] Medical alerts trigger for dangerous combinations
- [ ] Notifications popup works correctly
- [ ] All data syncs with Supabase in real-time
- [ ] Error messages display gracefully
- [ ] App works offline (for cached data)
