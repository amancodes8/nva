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

  const { date, glasses } = await request.json()

  if (!date || glasses === undefined) {
    return NextResponse.json(
      { error: "Date and glasses are required" },
      { status: 400 }
    )
  }

  try {
    // Check if record exists for today
    const { data: existingRecord } = await supabase
      .from("daily_nutrition")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .single()

    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from("daily_nutrition")
        .update({
          water_intake_glasses: glasses,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("log_date", date)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data,
        message: "Water intake updated successfully",
      })
    } else {
      // Create new record
      const { data, error } = await supabase
        .from("daily_nutrition")
        .insert({
          user_id: user.id,
          log_date: date,
          water_intake_glasses: glasses,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          total_fiber: 0,
          total_sugar: 0,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data,
        message: "Water intake logged successfully",
      })
    }
  } catch (error) {
    console.error("Water intake error:", error)
    return NextResponse.json(
      {
        error: "Failed to save water intake",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  try {
    const { data, error } = await supabase
      .from("daily_nutrition")
      .select("water_intake_glasses")
      .eq("user_id", user.id)
      .eq("log_date", date)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({
      water_intake_glasses: data?.water_intake_glasses || 0,
      date,
    })
  } catch (error) {
    console.error("Failed to fetch water intake:", error)
    return NextResponse.json(
      { error: "Failed to fetch water intake" },
      { status: 500 }
    )
  }
}