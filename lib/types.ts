export type CardType = 'video' | 'text' | 'mixed';

export interface CardItem {
  id: string;
  type: CardType;
  bilibiliId?: string;
  summary: string;
  content?: string;
  timestamp: number;
}
