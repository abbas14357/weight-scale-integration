import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // important to avoid caching

let latestWeight: string = '';

export async function GET() {
  try {
    const response = await fetch('http://localhost:4000/weight', {
      cache: 'no-store', // also disable fetch cache
    });
    const data = await response.json();
     
    console.log('api data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching weight:', error);
    return NextResponse.json({ error: 'Failed to fetch weight' }, { status: 500 });
  }

}