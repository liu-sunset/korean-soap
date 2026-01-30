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
  const needsExpand = item.content && item.content.length > 100;

  useEffect(() => {
    if (isOpen) {
      Promise.resolve(marked.parse(item.content || item.summary)).then(setHtmlContent);
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

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group ${
          item.type === 'text' ? 'h-[400px] flex flex-col' : ''
        }`}
      >
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Video Section */}
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

          {/* 纯文本卡片内容不足时显示图标填充 */}
          {item.type === 'text' && (
            <div className="flex-1 flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
          )}

          {/* Text Section */}
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
              {needsExpand
                ? `${item.content?.slice(0, 100) || item.summary}...`
                : item.content || item.summary}
            </p>

            {(needsExpand || item.type === 'video' || item.type === 'mixed') && (
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

      {/* Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {/* Video */}
          {(item.type === 'video' || item.type === 'mixed') && item.bilibiliId && (
            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-4">
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

          {/* Full Content */}
          <div
            className="prose prose-sm max-w-none text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: htmlContent
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
