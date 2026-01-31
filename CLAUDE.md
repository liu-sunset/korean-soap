# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 的治愈系韩剧剪辑与台词展示网站，采用瀑布流布局展示韩剧片段和台词。网站包含用户浏览页面和管理后台，使用 Netlify Blobs 作为数据存储。

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行 lint 检查
npm run lint
```

## 技术栈

- **前端框架**: Next.js 16.1.6 (App Router)
- **UI 库**: Radix UI 组件 (Dialog, Select)
- **样式**: Tailwind CSS 4.1.18 + Framer Motion 动画
- **数据存储**: @netlify/blobs (无服务器存储)
- **类型安全**: TypeScript 5.9.3
- **图标**: Lucide React

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
└── layout.tsx                 # 根布局

components/
├── ui/                        # Radix UI 组件封装
└── card-item.tsx              # 卡片展示组件

lib/
├── blobs.ts                   # Netlify Blobs 数据操作
├── types.ts                   # 类型定义
└── utils.ts                   # 工具函数

middleware.ts                  # 中间件 - 管理员路由保护
```

### 核心数据流

1. **数据存储**: 所有卡片数据存储在 Netlify Blobs 的 `korea-soap-cards` 存储桶中，以 JSON 格式存储在 `cards` 键下

2. **认证机制**:
   - 使用简单的 Cookie-based session (`admin_session` cookie)
   - 凭证硬编码在 `app/api/login/route.ts` 中 (生产环境应改为环境变量)
   - 中间件 (`middleware.ts`) 保护 `/admin` 路由

3. **卡片类型**:
   - `text`: 纯文字台词
   - `video`: Bilibili 视频片段
   - `mixed`: 视频加文字组合

4. **卡片数据结构** (`lib/types.ts`):
   - `id`: 卡片唯一标识
   - `type`: 卡片类型（`text` | `video` | `mixed`）
   - `bilibiliId`: Bilibili 视频 BV 号（视频/混合类型）
   - `summary`: 摘要/标题
   - `content`: Markdown 格式的详细内容
   - `htmlContent`: 上传的 HTML 文件内容（纯文本类型时使用）
   - `timestamp`: 创建时间戳

5. **卡片排序**:
   - 所有卡片列表都按时间倒序排列（最新的在前面）
   - 首页和管理后台的 `loadCards` 函数中实现排序逻辑

6. **登录跳转**:
   - 登录成功后使用 `window.location.href = '/admin'` 进行完整页面刷新
   - 这确保 `httpOnly` cookie 正确设置，中间件能正确验证认证状态

7. **新增卡片优化**:
   - 新增卡片时直接在本地状态顶部添加（`[newCard, ...cards]`），无需等待完整 API 响应
   - 编辑卡片时仍需重新加载所有数据以确保一致性

### API 端点

- `GET /api/cards` - 获取所有卡片（公开）
- `POST /api/login` - 管理员登录
- `POST /api/logout` - 管理员退出登录（删除 httpOnly cookie）
- `POST /api/admin/cards` - 创建卡片（需要认证）
- `PATCH /api/admin/cards/[id]` - 更新卡片（需要认证）
- `DELETE /api/admin/cards/[id]` - 删除卡片（需要认证）

## 环境变量

需要配置 Netlify 相关的环境变量：
- `NETLIFY_TOKEN` - Netlify API Token
- `NETLIFY_SITE_ID` - Netlify 站点 ID

这些变量在 `lib/blobs.ts` 中用于初始化 Netlify Blobs 存储。

## Bilibili 视频嵌入

### 视频封面懒加载
- **收起状态**：显示视频封面（从 B站 API 获取），鼠标悬停时显示播放按钮
- **展开状态**：仅打开弹窗时才加载播放器并自动播放，避免首页直接加载所有 iframe

### 视频播放器 URL
嵌入 URL 格式（基础版本，不含 autoplay）：
```
https://player.bilibili.com/player.html?bvid={BV号}&page=1&high_quality=1&danmaku=1
```

展开时添加 `&autoplay=1` 参数启用自动播放。

在 `components/card-item.tsx` 的 `getBilibiliEmbedUrl` 函数和 `getBilibiliCoverUrl` 函数中实现。

## HTML 文件上传

纯文本类型的卡片支持上传 HTML 或 Markdown 文件：
- **HTML 文件**：内容存储到 `htmlContent` 字段，禁用文本输入框
- **Markdown 文件**：内容存储到 `content` 字段，用户可继续编辑
- 上传逻辑在 `app/admin/page.tsx` 的 `handleFileUpload` 函数中实现
- 展示时优先使用 `htmlContent`，否则用 `marked` 解析 `content`

## 注意事项

1. **认证安全性**: 当前使用硬编码的 admin 凭证和简单的 Cookie 验证，不适合生产环境。考虑使用 JWT 或更安全的认证机制。

2. **httpOnly Cookie 操作**: 由于登录时设置的 `admin_session` cookie 使用了 `httpOnly: true`，客户端 JavaScript 无法直接删除。退出登录必须调用服务端 API (`POST /api/logout`)。

3. **数据持久化**: 本地开发时 Netlify Blobs 可能无法正常工作，需要配置正确的环境变量或考虑本地 mock 数据。

4. **瀑布流布局**: 使用 Tailwind 的 `columns-1 sm:columns-2 lg:columns-3` 实现，确保使用 `break-inside-avoid` 防止卡片被分割。

5. **动画**: 所有页面过渡和动画使用 Framer Motion，注意 `AnimatePresence` 的 `mode` 属性设置。

6. **登录跳转注意事项**: 修改登录后的跳转逻辑时，必须使用 `window.location.href` 触发完整页面刷新，否则 `httpOnly` cookie 可能未正确设置，导致中间件验证失败而重定向回登录页。

7. **退出登录跳转**: 退出登录后跳转到 `/login` 而非首页，以避免已登录用户访问首页时自动跳转回 `/admin` 的问题。