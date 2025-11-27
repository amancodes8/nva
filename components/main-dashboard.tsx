"use client";
import { useState, useEffect } from "react";
import { WaterIntakeTracker } from "@/components/water-intake-tracker";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { FoodInputTabs } from "@/components/food-input-tabs";
import { NutritionChart } from "@/components/nutrition-chart";
import { AIRecommendations } from "@/components/ai-recommendations";
import { MedicalConditionAlerts } from "@/components/medical-condition-alerts";
import { MealSuggestions } from "@/components/meal-suggestions";
import { useToast } from "@/hooks/use-toast";

interface FoodLog {
  id: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  logged_at: string;
  log_type: string;
  confidence?: number;
  source?: string;
}

interface DailyNutrition {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber?: number;
  total_sugar?: number;
  water_intake_glasses?: number;
}

export function MainDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  // State for real data
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    total_fiber: 0,
    total_sugar: 0,
    water_intake_glasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Goals (you can make these configurable later)
  const [calorieGoal] = useState(2500);
  const [proteinGoal] = useState(150);
  const [carbsGoal] = useState(350);
  const [fatGoal] = useState(80);
  const [waterGoal] = useState(8);

  // Fetch food logs from API
  const fetchFoodLogs = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/food-logs?date=${today}`);
      if (!response.ok) {
        throw new Error("Failed to fetch food logs");
      }
      const data = await response.json();
      setFoodLogs(data);
    } catch (error) {
      console.error("Error fetching food logs:", error);
      toast({
        title: "Error",
        description: "Failed to load food logs. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  // Fetch daily nutrition summary
  const fetchDailyNutrition = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/daily-nutrition?date=${today}`);
      if (!response.ok) {
        throw new Error("Failed to fetch daily nutrition");
      }
      const data = await response.json();
      setDailyNutrition({
        total_calories: data.total_calories || 0,
        total_protein: data.total_protein || 0,
        total_carbs: data.total_carbs || 0,
        total_fat: data.total_fat || 0,
        total_fiber: data.total_fiber || 0,
        total_sugar: data.total_sugar || 0,
        water_intake_glasses: data.water_intake_glasses || 0,
      });
    } catch (error) {
      console.error("Error fetching daily nutrition:", error);
      toast({
        title: "Error",
        description: "Failed to load nutrition data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFoodLogs(), fetchDailyNutrition()]);
      setIsLoading(false);
    };
    if (user) {
      loadData();
    }
  }, [user]);

  // Listen for food log updates
  useEffect(() => {
    const handleFoodLogUpdate = () => {
      // Refresh food logs and daily nutrition
      fetchFoodLogs();
      fetchDailyNutrition();
    };
    window.addEventListener("foodLogUpdated", handleFoodLogUpdate);
    return () => {
      window.removeEventListener("foodLogUpdated", handleFoodLogUpdate);
    };
  }, []);

  // Calculate health status
  const getHealthStatus = () => {
    const calorieProgress = (dailyNutrition.total_calories / calorieGoal) * 100;
    if (calorieProgress < 50)
      return {
        status: "Low",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        level: "Consider eating more",
      };
    if (calorieProgress > 110)
      return {
        status: "High",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        level: "Over goal",
      };
    return {
      status: "Healthy",
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      level: "On track today",
    };
  };

  const healthStatus = getHealthStatus();

  // Get last 3 meals for recent meals section
  const recentMeals = foodLogs.slice(0, 3).map((log) => ({
    meal: log.description,
    time: new Date(log.logged_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    calories: log.calories,
    type: log.log_type,
    confidence: log.confidence,
  }));

  // Today's metrics with real data
  const todayMetrics = [
    {
      label: "Calories",
      value: Math.round(dailyNutrition.total_calories),
      goal: calorieGoal,
      unit: "kcal",
      color: "bg-blue-500",
    },
    {
      label: "Protein",
      value: Math.round(dailyNutrition.total_protein),
      goal: proteinGoal,
      unit: "g",
      color: "bg-green-500",
    },
    {
      label: "Carbs",
      value: Math.round(dailyNutrition.total_carbs),
      goal: carbsGoal,
      unit: "g",
      color: "bg-orange-500",
    },
    {
      label: "Fat",
      value: Math.round(dailyNutrition.total_fat),
      goal: fatGoal,
      unit: "g",
      color: "bg-purple-500",
    },
  ];

  // Generate dynamic health alerts based on data
  const generateHealthAlerts = () => {
    const alerts = [];
    // Check if over calorie goal
    if (dailyNutrition.total_calories > calorieGoal * 1.1) {
      alerts.push({
        type: "warning",
        message: `You've exceeded your calorie goal by ${Math.round(
          dailyNutrition.total_calories - calorieGoal
        )} calories`,
        time: "Now",
      });
    }
    // Check if protein is low
    if (
      dailyNutrition.total_protein < proteinGoal * 0.5 &&
      dailyNutrition.total_calories > calorieGoal * 0.5
    ) {
      alerts.push({
        type: "warning",
        message:
          "Your protein intake is low today. Consider adding protein-rich foods.",
        time: "Now",
      });
    }
    // Check if doing well on carbs
    if (
      dailyNutrition.total_carbs < carbsGoal &&
      dailyNutrition.total_carbs > carbsGoal * 0.7
    ) {
      alerts.push({
        type: "info",
        message: "Great job staying within your carb limit today!",
        time: "Now",
      });
    }
    // If no logs yet
    if (foodLogs.length === 0) {
      alerts.push({
        type: "info",
        message:
          "Start logging your meals to get personalized health insights!",
        time: "Now",
      });
    }
    return alerts;
  };

  const healthAlerts = generateHealthAlerts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-transparent rounded-xl p-8 border border-blue-100 dark:border-blue-900 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.email?.split("@")[0] || "User"}</span>!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
          {foodLogs.length === 0
            ? "Start logging your meals to track your nutrition today!"
            : `You've logged ${foodLogs.length} meal${
                foodLogs.length !== 1 ? "s" : ""
              } today. Keep up the great work!`}
        </p>
      </div>

      {/* Health Alerts Section */}
      {healthAlerts.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid gap-4">
            {healthAlerts.map((alert, index) => (
              <Alert
                key={index}
                className={`shadow-sm border-l-4 ${
                  alert.type === "warning"
                    ? "border-l-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                    : "border-l-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${
                      alert.type === "warning"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <AlertDescription className="flex justify-between items-center w-full">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{alert.message}</span>
                      <span className="text-xs text-gray-500 font-medium bg-white/50 dark:bg-black/20 px-2 py-1 rounded">{alert.time}</span>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Grid - Aligned Correctly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Calories Card - Forced Alignment */}
        <Card className="flex flex-col h-full border-2 border-blue-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Today's Calories
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
               <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(dailyNutrition.total_calories)}
                </div>
                <span className="text-sm text-muted-foreground">kcal</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              of {calorieGoal} goal
            </p>
            <Progress
              value={(dailyNutrition.total_calories / calorieGoal) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Water Intake - Central Component */}
        <div className="h-full">
            <WaterIntakeTracker
            userId={user?.id}
            initialGlasses={dailyNutrition.water_intake_glasses || 0}
            goal={waterGoal}
            />
        </div>

        {/* Health Status - Forced Alignment */}
        <Card className="flex flex-col h-full border-2 border-purple-500/10 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{healthStatus.status}</div>
            <p className="text-sm text-muted-foreground mb-3">
              {healthStatus.level}
            </p>
            <div className="flex">
                <Badge variant="secondary" className={`px-3 py-1 text-sm font-medium ${healthStatus.color}`}>
                {healthStatus.status}
                </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Modal Food Input */}
      <Card className="border-0 shadow-md bg-white dark:bg-gray-900 overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-xl">Log Your Food</CardTitle>
          <CardDescription className="mt-1">
            Use text, voice, or image to quickly log your meals
          </CardDescription>
        </div>
        <CardContent className="p-6">
          <FoodInputTabs />
        </CardContent>
      </Card>

      {/* AI & Medical Insights Section - Improved Visuals */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI & Health Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Recommendations) */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <AIRecommendations />
                </div>
                <div className="bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                     <MealSuggestions />
                </div>
            </div>

            {/* Right Column (Medical Alerts) */}
            <div className="lg:col-span-5">
                <div className="sticky top-6">
                    <MedicalConditionAlerts />
                </div>
            </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nutrition Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Today's Nutrition</CardTitle>
              <CardDescription>Track your macronutrients breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {foodLogs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium">No meals logged yet today</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start logging your meals to see your nutrition breakdown!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {todayMetrics.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {metric.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900 dark:text-white">{metric.value}</span> / {metric.goal} {metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${metric.color} shadow-sm transition-all duration-1000 ease-out`}
                          style={{
                            width: `${Math.min(
                              (metric.value / metric.goal) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Additional nutrition info if available */}
                  {(dailyNutrition.total_fiber ||
                    dailyNutrition.total_sugar) && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-4">
                        Micro Nutrients
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {dailyNutrition.total_fiber &&
                          dailyNutrition.total_fiber > 0 && (
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                                Fiber
                              </p>
                              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                {Math.round(dailyNutrition.total_fiber)}g
                              </p>
                            </div>
                          )}
                        {dailyNutrition.total_sugar &&
                          dailyNutrition.total_sugar > 0 && (
                            <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20">
                              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                                Sugar
                              </p>
                              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                {Math.round(dailyNutrition.total_sugar)}g
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <NutritionChart />
        </div>

        {/* Recent Meals Sidebar */}
        <div>
          <Card className="h-full shadow-sm border-0 ring-1 ring-gray-200 dark:ring-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Recent Meals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMeals.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-sm font-medium">No meals logged yet.</p>
                  <p className="text-xs mt-1 opacity-70">
                    Your recent meals will appear here.
                  </p>
                </div>
              ) : (
                recentMeals.map((meal, index) => (
                  <div
                    key={index}
                    className="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{meal.meal}</p>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {meal.calories} cal
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal capitalize bg-gray-50 dark:bg-gray-900/50 text-gray-500">
                                {meal.type}
                            </Badge>
                            <span className="text-[10px] text-gray-400 flex items-center">
                                {meal.time}
                            </span>
                        </div>
                        {meal.confidence && meal.confidence > 0.8 && (
                          <div title="AI Confidence Score" className="flex items-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></div>
                             <span className="text-[10px] text-green-600 font-medium">{Math.round(meal.confidence * 100)}%</span>
                          </div>
                        )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}