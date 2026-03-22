import { getStore } from '@netlify/blobs';

export interface CardData {
  id: string;
  type: 'video' | 'text' | 'mixed';
  bilibiliId?: string;
  summary: string;
  content?: string;
  htmlContent?: string;
  coverText?: string;
  timestamp: number;
}

const STORE_NAME = 'korea-soap-cards';

async function getBlobStore() {
  return getStore({
    name: STORE_NAME,
  });
}

export async function getAllCards(): Promise<CardData[]> {
  const store = await getBlobStore();
  try {
    const data = await store.get('cards', { type: 'json' }) as CardData[] | null;
    return data || [];
  } catch (error) {
    console.error('Failed to get cards:', error);
    return [];
  }
}

export async function addCard(card: Omit<CardData, 'id' | 'timestamp'>): Promise<CardData> {
  const store = await getBlobStore();
  const cards = await getAllCards();

  const newCard: CardData = {
    ...card,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  const updatedCards = [...cards, newCard];
  await store.set('cards', JSON.stringify(updatedCards));

  return newCard;
}

export async function deleteCard(id: string): Promise<boolean> {
  const store = await getBlobStore();
  const cards = await getAllCards();

  const filteredCards = cards.filter(card => card.id !== id);
  await store.set('cards', JSON.stringify(filteredCards));

  return true;
}

export async function updateCard(id: string, updates: Partial<CardData>): Promise<CardData | null> {
  const store = await getBlobStore();
  const cards = await getAllCards();

  const index = cards.findIndex(card => card.id === id);
  if (index === -1) return null;

  cards[index] = { ...cards[index], ...updates };
  await store.set('cards', JSON.stringify(cards));

  return cards[index];
}