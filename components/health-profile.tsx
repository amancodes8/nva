"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, AlertTriangle, User, Edit, X, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MEDICAL_CONDITIONS = [
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "Heart Disease",
  "Kidney Disease",
  "High Cholesterol",
  "Food Allergies",
  "Celiac Disease",
  "Irritable Bowel Syndrome",
  "Gastroesophageal Reflux Disease",
  "Osteoporosis",
  "Anemia",
  "Thyroid Disorders",
  "None of the above",
]

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Low-Sodium",
  "Low-Carb",
  "Keto",
  "Mediterranean",
  "DASH Diet",
  "None",
]

export function HealthProfile() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [editFormData, setEditFormData] = useState({
    age: "",
    gender: "",
    activityLevel: "",
    medicalConditions: [] as string[],
    dietaryRestrictions: [] as string[],
    allergies: "",
  })

  const [medicalConditions, setMedicalConditions] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [allergies, setAllergies] = useState<any[]>([])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user) return

        const response = await fetch("/api/user-profile")
        if (response.ok) {
          const profile = await response.json()
          setEditFormData({
            age: profile.age || "",
            gender: profile.gender || "",
            activityLevel: profile.activity_level || "",
            medicalConditions: [],
            dietaryRestrictions: [],
            allergies: "",
          })
        }

        // Fetch medical conditions
        const { data: conditions } = await supabase.from("medical_conditions").select("*").eq("user_id", user.id)

        if (conditions) {
          setMedicalConditions(conditions)
          setEditFormData((prev) => ({
            ...prev,
            medicalConditions: conditions.map((c) => c.condition_name),
          }))
        }

        // Fetch dietary restrictions
        const { data: restrictions } = await supabase.from("dietary_restrictions").select("*").eq("user_id", user.id)

        if (restrictions) {
          setEditFormData((prev) => ({
            ...prev,
            dietaryRestrictions: restrictions.map((r) => r.restriction),
          }))
        }

        // Fetch allergies
        const { data: allergyData } = await supabase.from("food_allergies").select("*").eq("user_id", user.id)

        if (allergyData) {
          setAllergies(allergyData)
          setEditFormData((prev) => ({
            ...prev,
            allergies: allergyData.map((a) => a.allergen).join(", "),
          }))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      if (!user) throw new Error("User not authenticated")

      // Update basic user info
      const response = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number.parseInt(editFormData.age),
          gender: editFormData.gender,
          activity_level: editFormData.activityLevel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      // Delete and re-insert medical conditions
      await supabase.from("medical_conditions").delete().eq("user_id", user.id)
      for (const condition of editFormData.medicalConditions) {
        if (condition !== "None of the above") {
          await supabase.from("medical_conditions").insert({
            user_id: user.id,
            condition_name: condition,
            severity: "Moderate",
            diagnosed_year: new Date().getFullYear(),
          })
        }
      }

      // Delete and re-insert dietary restrictions
      await supabase.from("dietary_restrictions").delete().eq("user_id", user.id)
      for (const restriction of editFormData.dietaryRestrictions) {
        if (restriction !== "None") {
          await supabase.from("dietary_restrictions").insert({
            user_id: user.id,
            restriction: restriction,
          })
        }
      }

      // Delete and re-insert allergies
      await supabase.from("food_allergies").delete().eq("user_id", user.id)
      if (editFormData.allergies) {
        await supabase.from("food_allergies").insert({
          user_id: user.id,
          allergen: editFormData.allergies,
          severity: "Moderate",
          reaction_description: editFormData.allergies,
        })
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setEditFormData((prev) => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, condition],
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        medicalConditions: prev.medicalConditions.filter((c) => c !== condition),
      }))
    }
  }

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    if (checked) {
      setEditFormData((prev) => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, restriction],
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        dietaryRestrictions: prev.dietaryRestrictions.filter((r) => r !== restriction),
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-medical-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your medical information and health goals</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-medical-blue hover:bg-medical-blue/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Card className="border-2 border-medical-blue/20">
          <CardHeader>
            <CardTitle>Edit Profile Information</CardTitle>
            <CardDescription>Update your health and dietary information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editFormData.age}
                  onChange={(e) => handleEditChange("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select value={editFormData.gender} onValueChange={(value) => handleEditChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activity">Activity Level</Label>
              <Select
                value={editFormData.activityLevel}
                onValueChange={(value) => handleEditChange("activityLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very-active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Label className="text-base font-medium mb-3 block">Medical Conditions</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {MEDICAL_CONDITIONS.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={condition}
                      checked={editFormData.medicalConditions.includes(condition)}
                      onChange={(e) => handleConditionChange(condition, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={condition} className="text-sm cursor-pointer">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label className="text-base font-medium mb-3 block">Dietary Restrictions</Label>
              <div className="grid grid-cols-2 gap-3">
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <div key={restriction} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={restriction}
                      checked={editFormData.dietaryRestrictions.includes(restriction)}
                      onChange={(e) => handleRestrictionChange(restriction, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={restriction} className="text-sm cursor-pointer">
                      {restriction}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-allergies">Food Allergies & Intolerances</Label>
              <Textarea
                id="edit-allergies"
                value={editFormData.allergies}
                onChange={(e) => handleEditChange("allergies", e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Basic Info</CardTitle>
                  <User className="h-4 w-4 text-medical-blue" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{editFormData.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{editFormData.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activity:</span>
                      <span className="font-medium">{editFormData.activityLevel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Conditions</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{medicalConditions.length}</p>
                  <p className="text-xs text-gray-500">Medical conditions tracked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Allergies</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{allergies.length}</p>
                  <p className="text-xs text-gray-500">Food allergies logged</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {medicalConditions.length > 0 ? (
                  medicalConditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{condition.condition_name}</p>
                      </div>
                      <Badge variant="secondary">{condition.severity}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No medical conditions recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {medicalConditions.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {medicalConditions.map((condition, index) => (
                      <AccordionItem key={index} value={`condition-${index}`}>
                        <AccordionTrigger>
                          <div className="flex items-center justify-between w-full mr-4">
                            <span className="font-medium">{condition.condition_name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-600">Diagnosed: {condition.diagnosed_year}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-gray-500">No medical conditions recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
