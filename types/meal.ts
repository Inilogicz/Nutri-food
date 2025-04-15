export interface Meal {
    id: string;
    name: string;
    description: string;
    category: string;
    timeOfDay: ('morning' | 'afternoon' | 'night')[];
    imageUrl: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    instructions: string[];
  }