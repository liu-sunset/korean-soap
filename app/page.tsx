'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, LayoutGrid, FileText, Video, Layers, ChevronDown } from 'lucide-react';
import { CardItem } from '@/components/card-item';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CardItem as CardItemType } from '@/lib/types';

type FilterType = 'all' | 'text' | 'video' | 'mixed';

const filterOptions: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: '全部', icon: <LayoutGrid className="w-4 h-4" /> },
  { value: 'text', label: '文字', icon: <FileText className="w-4 h-4" /> },
  { value: 'video', label: '视频', icon: <Video className="w-4 h-4" /> },
  { value: 'mixed', label: '混合', icon: <Layers className="w-4 h-4" /> },
];

export default function HomePage() {
  const [cards, setCards] = useState<CardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const loadCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (response.ok) {
          const data = await response.json();
          const sortedCards = [...data].sort((a, b) => b.timestamp - a.timestamp);
          setCards(sortedCards);
        }
      } catch (error) {
        console.error('Failed to load cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, []);

  const filteredCards = filter === 'all' ? cards : cards.filter(card => card.type === filter);
  const currentOption = filterOptions.find(opt => opt.value === filter);

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              heal-lines-soup
            </h1>

          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              增加片段
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {currentOption?.icon}
              <span>{currentOption?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={filter === option.value ? 'bg-accent' : ''}
              >
                <span className="mr-2">{option.icon}</span>
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <p className="text-muted-foreground">加载中...</p>
            </motion.div>
          ) : filteredCards.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground text-lg">
                {filter === 'all' ? '暂无内容，敬请期待' : '暂无符合条件的卡片'}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  查看全部卡片
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
            >
              {filteredCards.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="break-inside-avoid"
                >
                  <CardItem item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}