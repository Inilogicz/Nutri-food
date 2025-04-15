import { NextResponse } from 'next/server';
import { Meal } from '@/types/meal';

const dummyMeals: Record<string, Meal> = {
  morning: {
    id: '1',
    name: 'Protein Pancakes with Berries',
    description: 'Fluffy protein pancakes topped with fresh berries and a drizzle of honey. Perfect for starting your day with energy.',
    category: 'Breakfast',
    timeOfDay: ['morning'],
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 350,
    protein: 25,
    carbs: 40,
    fats: 8,
    ingredients: [
      '1 cup oat flour',
      '1 scoop protein powder',
      '1 egg',
      '1/2 cup almond milk',
      '1/2 cup mixed berries',
      '1 tsp honey'
    ],
    instructions: [
      'Mix dry ingredients',
      'Add wet ingredients and whisk',
      'Cook on medium heat',
      'Top with berries and honey'
    ]
  },
  afternoon: {
    id: '2',
    name: 'Quinoa Salad Bowl',
    description: 'Nutritious quinoa salad with roasted vegetables and lemon-tahini dressing.',
    category: 'Lunch',
    timeOfDay: ['afternoon'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 420,
    protein: 18,
    carbs: 55,
    fats: 15,
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 cup chickpeas',
      '1/2 cup roasted vegetables',
      '2 tbsp tahini',
      '1 lemon juiced',
      '1 tbsp olive oil'
    ],
    instructions: [
      'Combine quinoa and chickpeas',
      'Add roasted vegetables',
      'Whisk dressing ingredients',
      'Toss everything together'
    ]
  },
  night: {
    id: '3',
    name: 'Grilled Salmon with Asparagus',
    description: 'Perfectly grilled salmon with roasted asparagus and quinoa. Light yet satisfying dinner option.',
    category: 'Dinner',
    timeOfDay: ['night'],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    calories: 480,
    protein: 38,
    carbs: 30,
    fats: 22,
    ingredients: [
      '1 salmon fillet',
      '1 bunch asparagus',
      '1/2 cup cooked quinoa',
      '1 lemon',
      '2 tbsp olive oil',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Season salmon and asparagus',
      'Grill salmon for 4-5 minutes per side',
      'Roast asparagus for 10 minutes',
      'Serve with quinoa and lemon'
    ]
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const time = searchParams.get('time') as 'morning' | 'afternoon' | 'night';
  
  if (!time || !dummyMeals[time]) {
    return NextResponse.json({ meal: dummyMeals.morning });
  }
  
  return NextResponse.json({ meal: dummyMeals[time] });
}