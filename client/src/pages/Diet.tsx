import { useState, useEffect } from "react";
import {
  Scale,
  Apple,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarRange,
  Clock,
  Utensils,
  Info,
  Calculator,
  Plus,
  X,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MealPlan {
  time: string;
  meal: string;
  calories: number;
  description: string;
}

interface DietPlan {
  type: "weight_loss" | "weight_gain" | "maintenance";
  dailyCalories: number;
  meals: MealPlan[];
  tips: string[];
  suggestions: string[];
}

interface FoodItem {
  name: string;
  calories: number;
  image: string;
  quantity: number;
}

interface SavedMeal {
  name: string;
  foods: FoodItem[];
  totalCalories: number;
  date: string;
}

const getPersonalizedSuggestions = (
  bmi: number,
  weight: number,
  height: number,
  goal: "weight_loss" | "weight_gain" | "maintenance"
): string[] => {
  const suggestions: string[] = [];
  const bmiCategory = getBMICategory(bmi);

  // Base suggestions based on BMI
  if (bmiCategory === "Underweight") {
    suggestions.push(
      "Focus on nutrient-dense foods to gain healthy weight",
      "Include healthy fats like avocados, nuts, and olive oil",
      "Eat more frequently throughout the day"
    );
  } else if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
    suggestions.push(
      "Focus on portion control and mindful eating",
      "Choose lean proteins and whole grains",
      "Increase fiber intake through vegetables and fruits"
    );
  }

  // Goal-specific suggestions
  if (goal === "weight_loss") {
    suggestions.push(
      "Create a caloric deficit of 500-750 calories per day",
      "Increase protein intake to preserve muscle mass",
      "Include more fiber-rich foods to feel fuller",
      "Consider intermittent fasting under medical supervision",
      "Track your food intake using a food diary"
    );
  } else if (goal === "weight_gain") {
    suggestions.push(
      "Aim for a caloric surplus of 300-500 calories per day",
      "Consume protein-rich foods with each meal",
      "Add healthy calorie-dense foods to your meals",
      "Consider weight training to build muscle mass",
      "Drink calories through smoothies and protein shakes"
    );
  } else {
    suggestions.push(
      "Maintain balanced macronutrient ratios",
      "Focus on food quality rather than quantity",
      "Stay consistent with meal timing",
      "Adjust portions based on activity level",
      "Regular monitoring of weight and measurements"
    );
  }

  // Add personalized caloric suggestions
  const idealWeight = 22 * (height / 100) * (height / 100); // Using BMI 22 as target
  if (goal === "weight_loss" && weight > idealWeight) {
    suggestions.push(
      `Target weight range: ${Math.round(idealWeight - 5)} to ${Math.round(
        idealWeight
      )} kg`
    );
  } else if (goal === "weight_gain" && weight < idealWeight) {
    suggestions.push(
      `Target weight range: ${Math.round(idealWeight)} to ${Math.round(
        idealWeight + 5
      )} kg`
    );
  }

  return suggestions;
};

const dietPlans: Record<string, DietPlan> = {
  weight_loss: {
    type: "weight_loss",
    dailyCalories: 1500,
    meals: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        calories: 300,
        description:
          "Oatmeal with berries, 1 scoop protein powder, and almonds",
      },
      {
        time: "10:00 AM",
        meal: "Morning Snack",
        calories: 150,
        description: "Greek yogurt with honey and chia seeds",
      },
      {
        time: "1:00 PM",
        meal: "Lunch",
        calories: 400,
        description: "Grilled chicken salad with olive oil dressing",
      },
      {
        time: "4:00 PM",
        meal: "Evening Snack",
        calories: 150,
        description: "Apple with 1 tablespoon peanut butter",
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        calories: 500,
        description: "Baked salmon with quinoa and roasted vegetables",
      },
    ],
    tips: [
      "Create a caloric deficit by consuming 500-750 fewer calories than your TDEE",
      "Include high-protein foods to preserve muscle mass and feel fuller",
      "Eat plenty of fiber-rich vegetables to control hunger",
      "Stay hydrated - drink water before meals to reduce appetite",
      "Practice portion control using smaller plates",
      "Get adequate sleep (7-9 hours) to regulate hunger hormones",
      "Plan your meals ahead to avoid impulsive eating",
      "Include strength training to maintain muscle mass",
      "Track your food intake using a food diary or app",
      "Allow yourself occasional treats to maintain motivation",
    ],
    suggestions: [],
  },
  weight_gain: {
    type: "weight_gain",
    dailyCalories: 3000,
    meals: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        calories: 600,
        description: "4 eggs, whole grain toast, avocado, and banana smoothie",
      },
      {
        time: "10:00 AM",
        meal: "Morning Snack",
        calories: 400,
        description: "Trail mix with nuts and dried fruits, protein shake",
      },
      {
        time: "1:00 PM",
        meal: "Lunch",
        calories: 800,
        description:
          "Brown rice, grilled chicken breast, sweet potatoes, and vegetables",
      },
      {
        time: "4:00 PM",
        meal: "Evening Snack",
        calories: 400,
        description: "Peanut butter sandwich with banana and honey",
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        calories: 800,
        description:
          "Pasta with meat sauce, garlic bread, and mixed vegetables",
      },
    ],
    tips: [
      "Aim for a caloric surplus of 300-500 calories above your TDEE",
      "Eat larger portions and increase meal frequency",
      "Include healthy calorie-dense foods like nuts, avocados, and olive oil",
      "Drink your calories through smoothies and protein shakes",
      "Focus on compound exercises to stimulate muscle growth",
      "Have protein-rich foods with every meal",
      "Eat before bed to prevent muscle breakdown during sleep",
      "Track your progress with both scale weight and measurements",
      "Don't skip meals - set reminders if needed",
      "Choose nutrient-dense foods over empty calories",
    ],
    suggestions: [],
  },
  maintenance: {
    type: "maintenance",
    dailyCalories: 2000,
    meals: [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        calories: 400,
        description: "Whole grain toast with eggs and avocado, fruit",
      },
      {
        time: "10:00 AM",
        meal: "Morning Snack",
        calories: 200,
        description: "Mixed nuts and an apple",
      },
      {
        time: "1:00 PM",
        meal: "Lunch",
        calories: 500,
        description: "Turkey sandwich with vegetables and hummus",
      },
      {
        time: "4:00 PM",
        meal: "Evening Snack",
        calories: 200,
        description: "Greek yogurt with granola",
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        calories: 700,
        description: "Grilled fish with brown rice and steamed vegetables",
      },
    ],
    tips: [
      "Focus on balanced macronutrient ratios (40% carbs, 30% protein, 30% fat)",
      "Maintain consistent meal timing day to day",
      "Adjust portions based on your activity level",
      "Monitor your weight weekly to catch any trends",
      "Practice mindful eating - pay attention to hunger cues",
      "Include a variety of foods to ensure nutrient adequacy",
      "Stay active with a mix of cardio and strength training",
      "Plan for social events and holidays to maintain balance",
      "Get regular health check-ups to monitor overall wellness",
      "Make sustainable food choices you can maintain long-term",
    ],
    suggestions: [],
  },
};

const commonFoods: FoodItem[] = [
  { name: "Apple", calories: 95, image: "🍎", quantity: 0 },
  { name: "Banana", calories: 105, image: "🍌", quantity: 0 },
  { name: "Rice (100g)", calories: 130, image: "🍚", quantity: 0 },
  { name: "Chicken Breast (100g)", calories: 165, image: "🍗", quantity: 0 },
  { name: "Egg", calories: 70, image: "🥚", quantity: 0 },
  { name: "Bread Slice", calories: 80, image: "🍞", quantity: 0 },
  { name: "Milk (250ml)", calories: 120, image: "🥛", quantity: 0 },
  { name: "Pizza Slice", calories: 285, image: "🍕", quantity: 0 },
  { name: "Salad Bowl", calories: 100, image: "🥗", quantity: 0 },
  { name: "Yogurt (200g)", calories: 150, image: "🍶", quantity: 0 },
];

const foodCategories = [
  {
    name: "Indian Foods",
    items: [
      { name: "Roti", calories: 120, image: "🫓", quantity: 0 },
      { name: "Dal (1 cup)", calories: 150, image: "🥘", quantity: 0 },
      { name: "Rice (1 cup)", calories: 130, image: "🍚", quantity: 0 },
      { name: "Paneer Curry (100g)", calories: 265, image: "🍛", quantity: 0 },
      { name: "Samosa", calories: 260, image: "🔺", quantity: 0 },
      {
        name: "Butter Chicken (150g)",
        calories: 290,
        image: "🍗",
        quantity: 0,
      },
      { name: "Biryani (1 cup)", calories: 250, image: "🍛", quantity: 0 },
      { name: "Dosa", calories: 120, image: "🥞", quantity: 0 },
      { name: "Idli (2 pieces)", calories: 80, image: "⚪", quantity: 0 },
    ],
  },
  {
    name: "Vegetables",
    items: [
      { name: "Carrot (100g)", calories: 41, image: "🥕", quantity: 0 },
      { name: "Broccoli (100g)", calories: 34, image: "🥦", quantity: 0 },
      { name: "Spinach (100g)", calories: 23, image: "🥬", quantity: 0 },
      { name: "Potato (100g)", calories: 77, image: "🥔", quantity: 0 },
      { name: "Tomato", calories: 22, image: "🍅", quantity: 0 },
      { name: "Cucumber (100g)", calories: 15, image: "🥒", quantity: 0 },
      { name: "Bell Pepper", calories: 30, image: "🫑", quantity: 0 },
      { name: "Onion (100g)", calories: 40, image: "🧅", quantity: 0 },
    ],
  },
  {
    name: "Fast Foods",
    items: [
      { name: "Burger", calories: 350, image: "🍔", quantity: 0 },
      { name: "Pizza Slice", calories: 285, image: "🍕", quantity: 0 },
      { name: "French Fries", calories: 365, image: "🍟", quantity: 0 },
      { name: "Hot Dog", calories: 290, image: "🌭", quantity: 0 },
      { name: "Sandwich", calories: 250, image: "🥪", quantity: 0 },
      { name: "Fried Chicken", calories: 320, image: "🍗", quantity: 0 },
      { name: "Taco", calories: 210, image: "🌮", quantity: 0 },
      { name: "Burrito", calories: 380, image: "🌯", quantity: 0 },
    ],
  },
  {
    name: "Common Foods",
    items: [
      { name: "Apple", calories: 95, image: "🍎", quantity: 0 },
      { name: "Banana", calories: 105, image: "🍌", quantity: 0 },
      { name: "Egg", calories: 70, image: "🥚", quantity: 0 },
      { name: "Bread Slice", calories: 80, image: "🍞", quantity: 0 },
      { name: "Milk (250ml)", calories: 120, image: "🥛", quantity: 0 },
      { name: "Yogurt (200g)", calories: 150, image: "🍶", quantity: 0 },
      {
        name: "Chicken Breast (100g)",
        calories: 165,
        image: "🍗",
        quantity: 0,
      },
      { name: "Fish (100g)", calories: 140, image: "🐟", quantity: 0 },
    ],
  },
];

const Diet = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("maintenance");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);

  // Load saved meals when component mounts
  useEffect(() => {
    const meals = JSON.parse(localStorage.getItem("savedMeals") || "[]");
    setSavedMeals(meals);
  }, []);

  const getHeightInCm = () => {
    if (heightUnit === "cm") {
      return parseFloat(height);
    } else {
      // Convert feet and inches to cm
      const feetNum = parseFloat(feet) || 0;
      const inchesNum = parseFloat(inches) || 0;
      return feetNum * 30.48 + inchesNum * 2.54;
    }
  };

  const calculateBMI = () => {
    const weightNum = parseFloat(weight);
    const heightInCm = getHeightInCm();
    const heightNum = heightInCm / 100; // convert cm to m
    if (weightNum && heightNum) {
      const bmi = weightNum / (heightNum * heightNum);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const calculateTDEE = () => {
    const weightNum = parseFloat(weight);
    const heightInCm = getHeightInCm();
    const ageNum = parseFloat(age);

    if (weightNum && heightInCm && ageNum) {
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (gender === "male") {
        bmr = 10 * weightNum + 6.25 * heightInCm - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightInCm - 5 * ageNum - 161;
      }

      // Apply activity multiplier
      const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
      };

      return Math.round(
        bmr * multipliers[activityLevel as keyof typeof multipliers]
      );
    }
    return null;
  };

  const handlePlanChange = (
    type: "weight_loss" | "weight_gain" | "maintenance"
  ) => {
    const weightNum = parseFloat(weight);
    const heightInCm = getHeightInCm();
    const bmiNum = weightNum / ((heightInCm / 100) * (heightInCm / 100));

    const plan = { ...dietPlans[type] };
    if (weightNum && heightInCm) {
      plan.suggestions = getPersonalizedSuggestions(
        bmiNum,
        weightNum,
        heightInCm,
        type
      );
      // Adjust daily calories based on TDEE
      const calculatedTDEE = calculateTDEE();
      if (calculatedTDEE) {
        if (type === "weight_loss") {
          plan.dailyCalories = Math.max(1200, calculatedTDEE - 500);
        } else if (type === "weight_gain") {
          plan.dailyCalories = calculatedTDEE + 500;
        } else {
          plan.dailyCalories = calculatedTDEE;
        }
      }
    }
    setSelectedPlan(type);
  };

  const bmi = calculateBMI();
  const tdee = calculateTDEE();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Personalized Diet Plan
          </h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Saved Meals
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Your Saved Meals</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {savedMeals.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No saved meals yet
                    </p>
                  ) : (
                    savedMeals.map((meal, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{meal.name}</h3>
                          <Badge variant="secondary">
                            {meal.totalCalories} cal
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {meal.foods.map((food, foodIndex) => (
                            <div
                              key={foodIndex}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span>{food.image}</span>
                              <span className="flex-1">{food.name}</span>
                              <span className="text-muted-foreground">
                                {food.quantity} × {food.calories} cal
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Saved on {new Date(meal.date).toLocaleDateString()}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => navigate("/calorie-calculator")}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Calculator className="h-5 w-5" />
              Calorie Calculator
            </Button>
          </div>
        </div>

        {/* BMI and Diet Plan Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Calculate Your Needs
            </h2>
            <div className="space-y-5">
              <div className="group">
                <Label
                  htmlFor="weight"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-medium">Height</Label>
                  <Select value={heightUnit} onValueChange={setHeightUnit}>
                    <SelectTrigger className="w-[100px] focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft/in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {heightUnit === "cm" ? (
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter height in cm"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={feet}
                        onChange={(e) => setFeet(e.target.value)}
                        placeholder="Feet"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={inches}
                        onChange={(e) => setInches(e.target.value)}
                        placeholder="Inches"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="group">
                <Label
                  htmlFor="age"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="group">
                <Label className="text-sm font-medium mb-1.5 block">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="group">
                <Label className="text-sm font-medium mb-1.5 block">
                  Activity Level
                </Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">
                      Sedentary (little or no exercise)
                    </SelectItem>
                    <SelectItem value="light">
                      Light (exercise 1-3 times/week)
                    </SelectItem>
                    <SelectItem value="moderate">
                      Moderate (exercise 3-5 times/week)
                    </SelectItem>
                    <SelectItem value="active">
                      Active (exercise 6-7 times/week)
                    </SelectItem>
                    <SelectItem value="veryActive">
                      Very Active (hard exercise daily)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {bmi && tdee && (
              <div className="mt-8 space-y-4">
                <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Your BMI
                      </p>
                      <p className="text-3xl font-bold text-primary mt-1">
                        {bmi}
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm py-1.5">
                      {getBMICategory(parseFloat(bmi))}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
                  <p className="text-sm text-muted-foreground font-medium">
                    Daily Calorie Needs (TDEE)
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-primary">{tdee}</p>
                    <span className="text-muted-foreground">calories</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Apple className="h-6 w-6 text-primary" />
              Your Diet Plan
            </h2>
            <Tabs
              defaultValue="maintenance"
              className="w-full"
              onValueChange={(value) =>
                handlePlanChange(
                  value as "weight_loss" | "weight_gain" | "maintenance"
                )
              }
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="weight_loss"
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20"
                >
                  <TrendingDown className="h-4 w-4" />
                  Loss
                </TabsTrigger>
                <TabsTrigger
                  value="maintenance"
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20"
                >
                  <Minus className="h-4 w-4" />
                  Maintain
                </TabsTrigger>
                <TabsTrigger
                  value="weight_gain"
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20"
                >
                  <TrendingUp className="h-4 w-4" />
                  Gain
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium">Daily Calories</h3>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {dietPlans[selectedPlan]?.dailyCalories} cal
                </Badge>
              </div>

              <div className="space-y-4">
                {dietPlans[selectedPlan]?.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="p-4 border border-primary/10 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {meal.time}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-background group-hover:bg-primary/10 transition-colors"
                      >
                        {meal.calories} cal
                      </Badge>
                    </div>
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {meal.meal}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors">
                      {meal.description}
                    </p>
                  </div>
                ))}
              </div>

              {dietPlans[selectedPlan]?.suggestions.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Personalized Suggestions
                  </h3>
                  <ul className="space-y-3">
                    {dietPlans[selectedPlan]?.suggestions.map(
                      (suggestion, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-primary/5"
                        >
                          <Info className="h-4 w-4 text-primary shrink-0" />
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          <Card className="md:col-span-2 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                Diet Tips
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {selectedPlan &&
                  dietPlans[selectedPlan]?.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-primary/5"
                    >
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 flex items-center justify-center rounded-full"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Diet;
