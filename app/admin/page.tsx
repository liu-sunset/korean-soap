'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Video, FileText, Layers, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  htmlContent?: string;
  coverText?: string;
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
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [hasHtml, setHasHtml] = useState(false);
  const [fileType, setFileType] = useState<'html' | 'md' | null>(null);
  const [coverText, setCoverText] = useState<string>('');
  const [coverTextError, setCoverTextError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_COVER_TEXT_LENGTH = 10;

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

  useEffect(() => {
    loadCards();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCreate = () => {
    setEditingCard(null);
    setFormData({ type: 'text', summary: '' });
    setSelectedFileName('');
    setHasHtml(false);
    setFileType(null);
    setCoverText('');
    setCoverTextError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDialogOpen(true);
  };

  const handleEdit = (card: CardItemType) => {
    setEditingCard(card);
    setFormData({
      type: card.type,
      bilibiliId: card.bilibiliId,
      summary: card.summary,
      content: card.content,
      htmlContent: card.htmlContent,
      coverText: card.coverText,
    });
    setHasHtml(!!card.htmlContent);
    setFileType(card.htmlContent ? 'html' : null);
    setSelectedFileName('');
    setCoverText(card.coverText || '');
    setCoverTextError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDialogOpen(true);
  };

  const extractCoverTextFromFileName = (fileName: string): string => {
    return fileName.replace(/\.(html|md)$/i, '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isHtml = file.name.endsWith('.html');
    const isMd = file.name.endsWith('.md');

    if (!isHtml && !isMd) {
      alert('请选择 HTML (.html) 或 Markdown (.md) 文件');
      return;
    }

    try {
      const text = await file.text();
      const baseName = extractCoverTextFromFileName(file.name);

      if (isHtml) {
        setFormData({ ...formData, htmlContent: text, content: '' });
        setHasHtml(true);
        setFileType('html');
        setCoverText(baseName);
        if (baseName.length > MAX_COVER_TEXT_LENGTH) {
          setCoverTextError(`文件名较长，封面将截断显示前${MAX_COVER_TEXT_LENGTH}字`);
        }
      } else {
        setFormData({ ...formData, content: text });
        setHasHtml(false);
        setFileType('md');
        setCoverText(baseName);
        if (baseName.length > MAX_COVER_TEXT_LENGTH) {
          setCoverTextError(`文件名较长，封面将截断显示前${MAX_COVER_TEXT_LENGTH}字`);
        }
      }
      setSelectedFileName(file.name);
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('读取文件失败');
    }
  };

  const validateForm = (): boolean => {
    if (formData.type === 'text') {
      const effectiveCoverText = coverText.trim();
      if (!selectedFileName && !effectiveCoverText) {
        setCoverTextError('请输入封面文字');
        return false;
      }
    }
    return true;
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setCoverTextError('');

    try {
      const url = editingCard
        ? `/api/admin/cards/${editingCard.id}`
        : '/api/admin/cards';
      const method = editingCard ? 'PATCH' : 'POST';

      const submitData: FormData = {
        ...formData,
      };

      if (formData.type === 'text' && coverText.trim()) {
        submitData.coverText = coverText.trim();
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        if (editingCard) {
          await loadCards();
        } else {
          const newCard = await response.json();
          setCards([newCard, ...cards]);
        }
        setIsDialogOpen(false);
        setEditingCard(null);
        setFormData({ type: 'text', summary: '' });
        setSelectedFileName('');
        setHasHtml(false);
        setFileType(null);
        setCoverText('');
        setCoverTextError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Failed to save card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverTextChange = (value: string) => {
    setCoverText(value);
    if (value.length > MAX_COVER_TEXT_LENGTH) {
      setCoverTextError(`封面文字不能超过${MAX_COVER_TEXT_LENGTH}个字`);
    } else {
      setCoverTextError('');
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

  const remainingChars = MAX_COVER_TEXT_LENGTH - coverText.length;

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
                          {card.coverText && (
                            <p className="text-xs text-muted-foreground">
                              封面文字: {card.coverText}
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

              {formData.type === 'text' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    封面文字 {!selectedFileName && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    value={coverText}
                    onChange={(e) => handleCoverTextChange(e.target.value)}
                    placeholder="输入封面显示的文字（最多10个字）"
                    maxLength={selectedFileName ? undefined : MAX_COVER_TEXT_LENGTH + 5}
                    disabled={!!selectedFileName}
                  />
                  <div className="flex items-center justify-between">
                    {selectedFileName ? (
                      <p className="text-xs text-muted-foreground">
                        封面将显示文件名：{extractCoverTextFromFileName(selectedFileName)}
                      </p>
                    ) : (
                      <p className={`text-xs ${remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {remainingChars > 0 ? `还可以输入 ${remainingChars} 个字` : ''}
                        {remainingChars === 0 && '已达到字数上限'}
                        {remainingChars < 0 && '封面文字不能超过10个字'}
                      </p>
                    )}
                  </div>
                  {coverTextError && (
                    <p className="text-xs text-destructive">{coverTextError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    封面文字将艺术字体居中显示在卡片上
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">详细内容</label>

                {(formData.type === 'text' || formData.type === 'mixed') && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      上传文本文件
                    </Button>
                    {selectedFileName && (
                      <p className="text-xs text-muted-foreground">
                        已选择: {selectedFileName}
                      </p>
                    )}
                  </div>
                )}

                <Textarea
                  value={formData.content || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="完整的台词内容（支持 Markdown）"
                  rows={6}
                  disabled={hasHtml}
                />
                <p className="text-xs text-muted-foreground">
                  {hasHtml
                    ? '已上传 HTML 文件，无需手动输入内容'
                    : '支持 Markdown 格式，用于显示完整的台词内容' +
                      ((formData.type === 'text' || formData.type === 'mixed') ? '，也可以上传 .html 或 .md 文件导入' : '')}
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