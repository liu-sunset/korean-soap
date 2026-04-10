# 韩剧剪辑与台词展示网站 (South Korea Soap)

一个基于 Next.js 的治愈系韩剧剪辑与台词展示网站，采用瀑布流布局展示韩剧片段和台词。

## 项目介绍

这是一个专注于韩剧经典片段和经典台词展示的网站项目，主要特点：

- 📱 **响应式瀑布流布局**：支持移动端（1列）、平板（2列）和 PC（3列）自适应
- 🎬 **视频片段展示**：支持 Bilibili 视频嵌入播放，支持封面懒加载
- 📝 **多种卡片类型**：纯文字台词、视频片段、混合（视频+文字）三种类型
- 🎨 **精美 UI 设计**：使用 Radix UI 组件和 Framer Motion 动画
- 🔐 **管理后台**：支持管理员登录认证，可进行卡片的增删改查操作
- 📁 **云端存储**：使用 Netlify Blobs 进行数据持久化存储

## 技术栈

- **前端框架**: Next.js 16.1.6 (App Router)
- **UI 库**: Radix UI 组件 (Dialog, Select, Dropdown)
- **样式**: Tailwind CSS 4.1.18 + Framer Motion 动画
- **数据存储**: @netlify/blobs (无服务器存储)
- **类型安全**: TypeScript 5.9.3
- **图标**: Lucide React
- **Markdown 解析**: marked

## 项目结构

```
app/
├── api/
│   ├── login/route.ts          # 登录认证
│   ├── logout/route.ts         # 退出登录
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
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── textarea.tsx
└── card-item.tsx              # 卡片展示组件

lib/
├── blobs.ts                   # Netlify Blobs 数据操作
├── types.ts                   # 类型定义
├── utils.ts                   # 工具函数
└── mock-data.ts               # Mock 数据（开发用）

middleware.ts                  # 中间件 - 管理员路由保护
```

## 快速开始

### 前置要求

- Node.js 18+ 版本
- npm 或 pnpm 包管理器

### 本地开发

1. **克隆项目**

```bash
git clone <your-forked-repo-url>
cd south-korea-soap
```

2. **安装依赖**

```bash
npm install
# 或
pnpm install
```

3. **配置环境变量**

创建 `.env.local` 文件（或重命名 `.env.example` 为 `.env.local`）：

```bash
# Netlify 配置（用于数据存储）
NETLIFY_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_netlify_site_id
```

> **注意**：如果暂时没有 Netlify 账号，项目可以使用 mock 数据进行本地开发测试。

4. **启动开发服务器**

```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

### 管理后台

1. 访问 [http://localhost:3000/login](http://localhost:3000/login) 登录
2. 默认凭据（可在 `app/api/login/route.ts` 中修改）：
   - 用户名: `admin`
   - 密码: `admin`

## 功能说明

### 首页功能

- 📊 **瀑布流布局**：根据屏幕宽度自动调整列数
- 🔍 **类型筛选**：支持按卡片类型筛选（全部/文字/视频/混合）
- 📱 **响应式设计**：完美适配移动端和 PC 端
- 🎬 **视频懒加载**：点击弹窗时才加载播放器，提升性能

### 管理后台功能

- ➕ **新增卡片**：支持创建文字、视频、混合三种类型
- ✏️ **编辑卡片**：修改卡片内容
- 🗑️ **删除卡片**：删除不需要的卡片
- 📤 **文件上传**：支持 HTML/Markdown 文件上传（纯文本类型）
- 🖼️ **封面文字**：纯文本卡片支持自定义封面显示文字

### 卡片类型

1. **纯文字 (text)**：仅显示台词文字，可上传 HTML/Markdown 文件
2. **视频 (video)**：仅显示 Bilibili 视频片段
3. **混合 (mixed)**：视频 + 文字组合展示

## Netlify 部署

### 一键部署

点击下方按钮部署到 Netlify：

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/south-korea-soap)

### 手动部署

1. 将项目推送到 GitHub 仓库
2. 在 Netlify 控制台选择 "Sites" → "Add new site" → "Import an existing project"
3. 选择你的 GitHub 仓库
4. 配置环境变量：
   - `NETLIFY_TOKEN`
   - `NETLIFY_SITE_ID`
5. 点击 "Deploy site"

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

# 运行类型检查
npx tsc --noEmit
```

## 数据结构

卡片数据结构 (`lib/types.ts`)：

```typescript
interface CardData {
  id: string;              // 卡片唯一标识
  type: 'video' | 'text' | 'mixed';  // 卡片类型
  bilibiliId?: string;     // Bilibili 视频 BV 号（视频/混合类型）
  summary: string;         // 摘要/标题
  content?: string;        // Markdown 格式的详细内容
  htmlContent?: string;    // HTML 文件内容（纯文本类型）
  coverText?: string;      // 封面显示文字（纯文本类型，最多10个字）
  timestamp: number;       // 创建时间戳
}
```

## Bilibili 视频嵌入

视频使用 Bilibili 嵌入播放器，格式：

```
https://player.bilibili.com/player.html?bvid={BV号}&page=1&high_quality=1&danmaku=1
```

- 首页显示视频封面（懒加载）
- 点击弹窗时自动播放

## 注意事项

1. **认证安全性**：当前使用简单的 Cookie-based session，生产环境建议使用 JWT 或更安全的认证机制

2. **数据存储**：本地开发时 Netlify Blobs 可能无法正常工作，需要配置正确的环境变量

3. **响应式适配**：所有功能都已适配移动端和 PC 端

4. **文件上传**：纯文本类型支持上传 HTML 或 Markdown 文件，内容会自动解析

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

ISC License

## 作者

South Korea Soap Team
