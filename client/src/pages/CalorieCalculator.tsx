import { useState, useEffect } from "react";
import { Calculator, Apple, Plus, X, Save, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FoodItem {
  name: string;
  calories: number;
  image: string;
  quantity: number;
}

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

interface SavedMeal {
  name: string;
  foods: FoodItem[];
  totalCalories: number;
  date: string;
}

const CalorieCalculator = () => {
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [mealName, setMealName] = useState("");
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);

  // Load saved meals when component mounts
  useEffect(() => {
    const meals = JSON.parse(localStorage.getItem("savedMeals") || "[]");
    setSavedMeals(meals);
  }, []);

  const totalCalories = selectedFoods.reduce(
    (total, food) => total + food.calories * food.quantity,
    0
  );

  const handleQuantityChange = (index: number, change: number) => {
    const newFoods = [...selectedFoods];
    newFoods[index].quantity = Math.max(0, newFoods[index].quantity + change);
    setSelectedFoods(newFoods);
  };

  const addFoodItem = (food: FoodItem) => {
    const existingFood = selectedFoods.find((f) => f.name === food.name);
    if (existingFood) {
      handleQuantityChange(selectedFoods.indexOf(existingFood), 1);
    } else {
      setSelectedFoods([...selectedFoods, { ...food, quantity: 1 }]);
    }
  };

  const removeFoodItem = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const handleSaveMeal = () => {
    if (!mealName.trim() || selectedFoods.length === 0) return;

    const meal: SavedMeal = {
      name: mealName,
      foods: [...selectedFoods],
      totalCalories,
      date: new Date().toISOString(),
    };

    // Update both localStorage and state
    const updatedMeals = [...savedMeals, meal];
    localStorage.setItem("savedMeals", JSON.stringify(updatedMeals));
    setSavedMeals(updatedMeals);

    // Reset form
    setMealName("");
    setSelectedFoods([]);
  };

  const handleDeleteMeal = (index: number) => {
    const updatedMeals = savedMeals.filter((_, i) => i !== index);
    localStorage.setItem("savedMeals", JSON.stringify(updatedMeals));
    setSavedMeals(updatedMeals);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Calorie Calculator
          </h1>
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
                    <Card key={index} className="p-4 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleDeleteMeal(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex justify-between items-start mb-2 pr-8">
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Food Categories */}
          <Card className="lg:col-span-2 p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {foodCategories.map((category) => (
                <Card key={category.name} className="p-4">
                  <h3 className="text-lg font-medium mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.items.map((food) => (
                      <Button
                        key={food.name}
                        variant="outline"
                        className="flex items-center justify-between h-auto p-2 hover:bg-primary/5"
                        onClick={() => addFoodItem(food)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{food.image}</span>
                          <div className="text-left">
                            <div className="text-sm font-medium">
                              {food.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {food.calories} cal
                            </div>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Right Column - Selected Foods */}
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Apple className="h-6 w-6 text-primary" />
              Selected Foods
            </h2>

            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto mb-4">
              {selectedFoods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{food.image}</span>
                    <div>
                      <div className="text-sm font-medium">{food.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {food.calories * food.quantity} cal
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(index, -1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{food.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(index, 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFoodItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">Total Calories</div>
                <div className="text-2xl font-bold text-primary">
                  {totalCalories}
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Enter meal name"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg py-6 text-lg font-semibold flex items-center justify-center gap-2 rounded-lg transition-all duration-200"
                    variant="default"
                    onClick={handleSaveMeal}
                    disabled={!mealName.trim() || selectedFoods.length === 0}
                  >
                    <Save className="h-5 w-5" />
                    Save Meal Plan
                  </Button>
                  <Button
                    className="bg-destructive hover:bg-destructive/85 text-white shadow-lg py-6 text-lg font-semibold flex items-center justify-center gap-2 rounded-lg transition-all duration-200"
                    variant="destructive"
                    onClick={() => {
                      setMealName("");
                      setSelectedFoods([]);
                    }}
                    disabled={!mealName.trim() && selectedFoods.length === 0}
                  >
                    <X className="h-5 w-5" />
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CalorieCalculator;
