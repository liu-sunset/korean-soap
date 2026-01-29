'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Video, FileText, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardItem as CardItemType } from '@/lib/types';

interface FormData {
  type: 'video' | 'text' | 'mixed';
  bilibiliId?: string;
  summary: string;
  content?: string;
}

export default function AdminPage() {
  const [cards, setCards] = useState<CardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItemType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: 'text',
    summary: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; max-age=0';
    window.location.href = '/';
  };

  const handleCreate = () => {
    setEditingCard(null);
    setFormData({ type: 'text', summary: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (card: CardItemType) => {
    setEditingCard(card);
    setFormData({
      type: card.type,
      bilibiliId: card.bilibiliId,
      summary: card.summary,
      content: card.content,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;

    try {
      const response = await fetch(`/api/admin/cards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCards(cards.filter(card => card.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingCard
        ? `/api/admin/cards/${editingCard.id}`
        : '/api/admin/cards';
      const method = editingCard ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadCards();
        setIsDialogOpen(false);
        setEditingCard(null);
        setFormData({ type: 'text', summary: '' });
      }
    } catch (error) {
      console.error('Failed to save card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'mixed':
        return <Layers className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return '视频';
      case 'mixed':
        return '混合';
      default:
        return '文字';
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f9fafb]">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              管理后台
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              退出登录
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            管理后台
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              新增卡片
            </Button>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="popLayout">
          {cards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Card>
                <CardContent className="p-12">
                  <p className="text-muted-foreground text-lg mb-4">
                    还没有卡片，点击上方"新增卡片"开始创建
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                              {getTypeIcon(card.type)}
                              {getTypeLabel(card.type)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(card.timestamp).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                            {card.summary}
                          </p>
                          {card.bilibiliId && (
                            <p className="text-xs text-muted-foreground mb-1">
                              Bilibili ID: {card.bilibiliId}
                            </p>
                          )}
                          {card.content && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {card.content}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(card)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(card.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? '编辑卡片' : '新增卡片'}
            </DialogTitle>
            <DialogDescription>
              {editingCard ? '修改卡片信息' : '填写下方信息创建新卡片'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">类型</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">文字</SelectItem>
                    <SelectItem value="video">视频</SelectItem>
                    <SelectItem value="mixed">混合</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.type === 'video' || formData.type === 'mixed') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Bilibili 视频 ID <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.bilibiliId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, bilibiliId: e.target.value })
                    }
                    placeholder="例如: BV1xx411c7mD"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    输入 B 站视频的 BV 号
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  摘要 <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  placeholder="简短的摘要或标题"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">详细内容</label>
                <Textarea
                  value={formData.content || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="完整的台词内容（支持 Markdown）"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  支持 Markdown 格式，用于显示完整的台词内容
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : editingCard ? '保存修改' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
