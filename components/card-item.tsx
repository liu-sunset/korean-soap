'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Video, Play, FileText, Layers } from 'lucide-react';
import { CardItem as CardItemType } from '@/lib/types';
import { marked } from 'marked';

interface CardItemProps {
  item: CardItemType;
}

export function CardItem({ item }: CardItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (item.htmlContent) {
        setHtmlContent(item.htmlContent);
      } else {
        Promise.resolve(marked.parse(item.content || item.summary)).then(setHtmlContent);
      }
    }
  }, [isOpen, item]);

  const getBilibiliEmbedUrl = (bvid: string) => {
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=1`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'mixed':
        return <Layers className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getDisplayCoverText = () => {
    if (item.coverText) {
      return item.coverText;
    }
    if (item.htmlContent) {
      const titleMatch = item.htmlContent.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      if (titleMatch) {
        return titleMatch[1].trim();
      }
      const bodyText = item.htmlContent.replace(/<[^>]+>/g, '').trim();
      return bodyText.slice(0, 10);
    }
    return item.summary.slice(0, 10);
  };

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group ${
          item.type === 'text' ? 'h-[350px] flex flex-col' : ''
        }`}
      >
        <CardContent className="p-0 flex-1 flex flex-col">
          {(item.type === 'video' || item.type === 'mixed') && item.bilibiliId && (
            <div
              className="relative aspect-video bg-muted group-hover:opacity-90 transition-opacity"
              onClick={() => setIsOpen(true)}
            >
              <iframe
                src={getBilibiliEmbedUrl(item.bilibiliId)}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                scrolling="no"
                style={{ border: 0 }}
                frameBorder="no"
                loading="lazy"
              />
            </div>
          )}

          {item.type === 'text' && (
            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-muted/30 to-muted/10">
              <h2
                className="text-center text-xl font-serif tracking-wide text-foreground/80 whitespace-pre-wrap leading-relaxed"
                style={{
                  fontFamily: '"Noto Serif SC", "Source Han Serif SC", "STSong", "SimSun", serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {getDisplayCoverText()}
              </h2>
            </div>
          )}

          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {getTypeIcon(item.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {item.summary}
            </p>

            {(item.type === 'video' || item.type === 'mixed' || item.content || item.htmlContent) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="mt-3 h-8 px-3 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                展开
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={`${
          item.type === 'text' ? 'max-w-6xl h-[95vh]' : 'max-w-4xl max-h-[90vh]'
        } overflow-hidden flex flex-col`}>
          <DialogHeader>
            <DialogTitle>{item.summary}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {getTypeIcon(item.type)}
                  {item.type === 'video' ? '视频' : item.type === 'mixed' ? '混合' : '文字'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto pr-1 flex-1">
            {(item.type === 'video' || item.type === 'mixed') && item.bilibiliId && (
              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-4 shadow-lg">
                <iframe
                  src={getBilibiliEmbedUrl(item.bilibiliId)}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  scrolling="no"
                  style={{ border: 0 }}
                  frameBorder="no"
                />
              </div>
            )}

            <div
              className={item.htmlContent
                ? 'text-foreground pb-4 leading-relaxed p-4 rounded-xl bg-muted/20'
                : 'prose prose-sm max-w-none text-foreground dark:prose-invert pb-4 leading-relaxed'
              }
              dangerouslySetInnerHTML={{
                __html: htmlContent
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}