import { NextResponse } from 'next/server';
import { Dietician } from '@/types/dietician';

const dummyDieticians: Dietician[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Weight Management',
    bio: 'Certified nutrition specialist with 10 years of experience helping clients achieve sustainable weight loss.',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 124,
    rate: 100,
    available: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Diabetes Care',
    bio: 'Endocrinologist specializing in nutritional approaches to diabetes management and prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 98,
    rate: 120,
    available: true
  },
  {
    id: '3',
    name: 'Dr. Emily Wilson',
    specialty: 'Pediatric Nutrition',
    bio: 'Pediatric dietitian focused on creating healthy eating habits for children and families.',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviews: 87,
    rate: 150,
    available: true
  },
  {
    id: '4',
    name: 'Dr. James Rodriguez',
    specialty: 'Sports Nutrition',
    bio: 'Performance nutritionist working with athletes to optimize their diet for peak performance.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 156,
    rate: 180,
    available: true
  },
  {
    id: '5',
    name: 'Dr. Aisha Mohammed',
    specialty: 'Plant-Based Nutrition',
    bio: 'Expert in plant-based diets and helping clients transition to vegetarian/vegan lifestyles.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 112,
    rate: 130,
    available: true
  }
];

export async function GET() {
  return NextResponse.json({ dieticians: dummyDieticians });
}