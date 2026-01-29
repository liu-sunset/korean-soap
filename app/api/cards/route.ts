import { NextResponse } from 'next/server';
import { getAllCards } from '@/lib/blobs';

export async function GET() {
  try {
    const cards = await getAllCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Failed to fetch cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}
