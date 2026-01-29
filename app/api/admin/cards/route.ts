import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addCard, getAllCards } from '@/lib/blobs';

// 验证管理员身份
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  return adminSession === 'authenticated';
}

// 创建新卡片
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, bilibiliId, summary, content } = body;

    if (!type || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'video' && !bilibiliId) {
      return NextResponse.json({ error: 'Bilibili ID is required for video type' }, { status: 400 });
    }

    const newCard = await addCard({
      type,
      bilibiliId,
      summary,
      content,
    });

    return NextResponse.json(newCard);
  } catch (error) {
    console.error('Failed to create card:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}
