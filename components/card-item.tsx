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

const getBilibiliCoverUrl = async (bvid: string): Promise<string> => {
  try {
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    const data = await response.json();
    return data.data?.pic || '';
  } catch (error) {
    console.error('Failed to fetch video cover:', error);
    return '';
  }
};

interface CardItemProps {
  item: CardItemType;
}

export function CardItem({ item }: CardItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const needsExpand = item.content && item.content.length > 100;

  // 加载封面
  useEffect(() => {
    if ((item.type === 'video' || item.type === 'mixed') && item.bilibiliId) {
      getBilibiliCoverUrl(item.bilibiliId).then(url => {
        if (url) {
          setCoverUrls(prev => ({ ...prev, [item.id]: url }));
        }
      });
    }
  }, [item]);

  useEffect(() => {
    if (isOpen) {
      // 如果有 htmlContent，直接使用；否则解析 Markdown
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

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group ${
          item.type === 'text' ? 'h-[350px] flex flex-col' : ''
        }`}
      >
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* Video Section */}
          {(item.type === 'video' || item.type === 'mixed') && item.bilibiliId && (
            <div
              className="relative aspect-video bg-muted group-hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              {coverUrls[item.id] ? (
                <img
                  src={coverUrls[item.id]}
                  alt={item.summary}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white" />
              </div>
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

      {/* Detail Dialog */}
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

          {/* 滚动容器 */}
          <div className="overflow-y-auto pr-1 flex-1">
            {/* Video */}
            {(item.type === 'video' || item.type === 'mixed') && item.bilibiliId && (
              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-4">
                {isOpen ? (
                  <iframe
                    key={`${item.id}-player`}
                    src={`${getBilibiliEmbedUrl(item.bilibiliId)}&autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay"
                    scrolling="no"
                    style={{ border: 0 }}
                    frameBorder="no"
                  />
                ) : (
                  <img
                    src={coverUrls[item.id] || ''}
                    alt={item.summary}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Full Content */}
            <div
              className={item.htmlContent ? 'text-foreground pb-4' : 'prose prose-sm max-w-none text-foreground dark:prose-invert pb-4'}
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
