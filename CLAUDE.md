# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 的治愈系韩剧剪辑与台词展示网站，采用瀑布流布局展示韩剧片段和台词。网站包含用户浏览页面和管理后台，使用 Netlify Blobs 作为数据存储。

## 部署与存储

| 项目 | 值 |
|------|-----|
| 部署平台 | Netlify (需 `@netlify/plugin-nextjs` 插件) |
| 数据存储 | Netlify Blobs (`korea-soap-cards` 存储桶) |
| 导出模式 | `standalone` (见 `next.config.ts`) |
| 图片优化 | 关闭 (Netlify 自带图片处理) |

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run lint         # 运行 lint 检查
npx tsc --noEmit     # 运行类型检查
```

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI 库**: Radix UI 组件 (Dialog, Select, DropdownMenu, AlertDialog, Slot)
- **样式**: Tailwind CSS 4 + Framer Motion 动画 + tailwindcss-animate
- **数据存储**: @netlify/blobs (无服务器存储)
- **工具库**: clsx + tailwind-merge (cn 函数), class-variance-authority
- **图标**: Lucide React
- **Markdown 解析**: marked

## 架构说明

### 目录结构

```
app/
├── api/
│   ├── login/route.ts          # 登录认证
│   ├── logout/route.ts         # 退出登录 (删除 httpOnly cookie)
│   ├── cards/route.ts          # 公开获取卡片列表
│   └── admin/cards/
│       ├── route.ts            # 创建卡片 (POST)
│       └── [id]/route.ts      # 更新/删除卡片 (PATCH/DELETE)
├── page.tsx                   # 首页 - 瀑布流展示
├── login/page.tsx             # 登录页面
├── admin/page.tsx             # 管理后台
├── layout.tsx                 # 根布局
├── providers.tsx              # Toast 上下文 Provider (客户端组件)
└── globals.css                # 全局样式

components/
├── ui/                        # Radix UI 组件封装
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── alert-dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── textarea.tsx
└── card-item.tsx              # 卡片展示组件 (视频嵌入、封面文字等)

hooks/
└── use-toast.tsx              # Toast 通知系统 (React Context)

lib/
├── blobs.ts                   # Netlify Blobs 数据操作 (含 CardData 接口定义)
├── types.ts                   # 类型定义 (CardType, CardItem 接口)
├── utils.ts                   # cn() 工具函数
└── mock-data.ts               # Mock 数据 (当 Blobs 不可用时的开发后备)

middleware.ts                  # 中间件 - 管理员路由保护和登录重定向
next.config.ts                 # standlone 输出 + 禁用图片优化
```

### 注意：类型重复

`CardData` 接口在 `lib/blobs.ts` 中定义，`CardItem` 接口在 `lib/types.ts` 中定义。两者字段完全相同但名称不同。修改字段时需同步更新两处。

### 核心数据流

1. **数据存储**: 所有卡片数据存储在 Netlify Blobs 的 `korea-soap-cards` 存储桶中，以 JSON 格式存储在 `cards` 键下。开发时若 Blobs 不可用，可改用 `mock-data.ts` 中的 mock 数据。

2. **认证机制**:
   - Cookie-based session (`admin_session` cookie)
   - 凭证硬编码在 `app/api/login/route.ts` (默认 `admin/admin`)
   - 中间件保护 `/admin` 路由，并将已登录用户从 `/login` 重定向到 `/admin`
   - 中间件匹配模式: `['/admin/:path*', '/login']`

3. **卡片类型** (`CardType`):
   - `text`: 纯文字台词（支持 HTML/Markdown 文件上传）
   - `video`: Bilibili 视频片段
   - `mixed`: 视频加文字组合

4. **卡片排序**: 所有卡片列表按时间倒序排列（最新的在前）。

5. **登录/退出跳转**:
   - 登录成功 → `window.location.href = '/admin'` 必须完整刷新（httpOnly cookie 需要）
   - 退出登录 → 跳转 `/login`（不要跳首页，否则已登录用户访问首页会因中间件跳回 `/admin`）

6. **Toast 通知系统** (`hooks/use-toast.tsx`):
   - 基于 React Context 的全局通知组件
   - 支持 4 种类型: success / error / warning / info
   - 4 秒自动消失，固定定位在页面顶部居中，z-index 为 100
   - 通过 `app/providers.tsx` 在根布局注入

### 模块间关系

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                           │
└─────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │   首页    │       │  管理后台 │       │  登录页   │
    │(page.tsx)│       │(admin/)   │       │ (login/) │
    └────┬─────┘       └────┬─────┘       └────┬─────┘
         │                   │                   │
         ▼                   ▼                   ▼
    /api/cards (GET)    /api/admin/cards       /api/login
                        GET/POST/PATCH/DELETE  /api/logout
                              │
                              ▼
                    ┌──────────────────┐
                    │  Netlify Blobs   │
                    │ (korea-soap-cards)│
                    └──────────────────┘
```

### API 端点

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/cards` | GET | 获取所有卡片（公开） | 否 |
| `/api/login` | POST | 管理员登录 | 否 |
| `/api/logout` | POST | 退出登录 | 否 |
| `/api/admin/cards` | POST | 创建卡片 | 是 |
| `/api/admin/cards/[id]` | PATCH | 更新卡片 | 是 |
| `/api/admin/cards/[id]` | DELETE | 删除卡片 | 是 |

## 环境变量

```
NETLIFY_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_netlify_site_id
```

在 `lib/blobs.ts` 中通过 `getStore({ name: 'korea-soap-cards' })` 初始化。

## Bilibili 视频嵌入

### 视频封面懒加载
- **收起状态**：显示视频封面（从 B站 API 获取），悬停时显示播放按钮
- **展开状态**：仅在弹窗中加载播放器并自动播放

### 视频播放器 URL 格式
```
https://player.bilibili.com/player.html?bvid={BV号}&page=1&high_quality=1&danmaku=1
```
展开时添加 `&autoplay=1`。实现在 `components/card-item.tsx` 的 `getBilibiliEmbedUrl` 和 `getBilibiliCoverUrl` 函数中。

## HTML/Markdown 文件上传

- **HTML 文件**: 内容存入 `htmlContent` 字段，禁用文本编辑
- **Markdown 文件**: 内容存入 `content` 字段，可继续编辑
- 展示时优先使用 `htmlContent`，否则用 `marked` 解析 `content`
- 混合类型卡片也支持上传文本文件：封面显示视频，弹窗显示视频 + 文本
- 封面文字规则：上传文件时自动使用文件名（去除扩展名），手写文本时必须输入（最多10字），展示使用艺术字体（serif）

## 注意事项

1. **类型同步**: `lib/blobs.ts` 的 `CardData` 和 `lib/types.ts` 的 `CardItem` 字段重复定义，修改字段时需同步更新两处。

2. **httpOnly Cookie**: 登录设置的 `admin_session` cookie 为 httpOnly，客户端 JS 无法操作。退出登录必须调用服务端 `POST /api/logout`。

3. **登录跳转**: 必须使用 `window.location.href` 触发完整页面刷新，否则 httpOnly cookie 设置失败会导致中间件拦截回登录页。

4. **瀑布流**: `columns-1 sm:columns-2 lg:columns-3` + `break-inside-avoid` 防止卡片被分截。

5. **动画**: 使用 Framer Motion，注意 `AnimatePresence` 的 `mode` 属性。

6. **z-index 层级**: Dialog (z-50), AlertDialog (z-50), Toast (z-[100]), DropdownMenu (需要高于 Dialog)。参考提交 `95d4afc` 修复的 z-index 冲突问题。

7. **Netlify 部署**: 需要 `@netlify/plugin-nextjs` 插件，配置为 `standalone` 输出模式，关闭 Next.js 自带图片优化。
