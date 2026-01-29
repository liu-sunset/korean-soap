# Netlify 部署指南

## 前置准备

1. 确保代码已推送到 GitHub/GitLab 仓库
2. 已创建 Netlify 账号

## 部署步骤

### 方法一：通过 Netlify 控制台部署（推荐）

1. **登录 Netlify**
   - 访问 https://app.netlify.com

2. **创建新站点**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 Git 提供商（GitHub/GitLab/Bitbucket）

3. **配置构建设置**
   - 选择你的仓库分支（通常是 main 或 master）
   - 构建设置会自动识别：
     - Build command: `npm run build`
     - Publish directory: `.next`

4. **配置环境变量**
   在 "Environment variables" 部分添加以下变量：

   | 变量名 | 获取方式 |
   |--------|----------|
   | `NETLIFY_TOKEN` | 从 Netlify 用户设置中获取（见下方） |
   | `NETLIFY_SITE_ID` | 部署后自动获取（见下方） |

### 方法二：通过 Netlify CLI 部署

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **初始化并部署**
   ```bash
   cd D:\thought\korea-soap
   netlify init
   # 按照提示操作，创建新站点
   ```

## 获取环境变量

### 获取 NETLIFY_TOKEN

1. 登录 Netlify 控制台
2. 点击右上角头像 → User settings
3. 左侧选择 "Applications"
4. 点击 "New access token"
5. 输入描述（如 "korea-soap"）
6. 点击 "Generate token" 并复制（**只显示一次，请妥善保存**）

### 获取 NETLIFY_SITE_ID

**方法一：从控制台获取**
1. 进入你的站点详情页
2. 查看 URL，格式为：`https://app.netlify.com/sites/{site-name}/site_configuration`
3. `NETLIFY_SITE_ID` 即为 `{site-name}`

**方法二：从 CLI 获取**
```bash
netlify status
```
输出中会显示 `Site ID`

## 部署后配置环境变量

### 通过控制台配置

1. 进入你的站点
2. 点击 "Site configuration" → "Environment variables"
3. 添加以下两个环境变量：
   - `NETLIFY_TOKEN` = 你生成的 token
   - `NETLIFY_SITE_ID` = 你的站点 ID

4. 点击 "Save" 保存

5. **触发重新部署**
   - 点击 "Deploys" 标签
   - 点击 "Trigger deploy" → "Deploy site"

### 通过 CLI 配置

```bash
# 设置环境变量
netlify env:set NETLIFY_TOKEN "你的token"
netlify env:set NETLIFY_SITE_ID "你的站点ID"

# 触发重新部署
netlify deploy --prod
```

## 验证部署

1. 访问你的 Netlify 站点 URL
2. 检查首页是否正常加载
3. 测试管理员登录功能（/login）
4. 测试创建/编辑/删除卡片功能

## 常见问题

### 构建失败

- 检查 Node.js 版本是否正确（netlify.toml 中设置为 20）
- 确保所有依赖已正确安装
- 查看 Deploy logs 了解具体错误

### 环境变量未生效

- 确保变量名拼写正确（`NETLIFY_TOKEN` 和 `NETLIFY_SITE_ID`）
- 环境变量修改后需要触发重新部署
- 检查 NETLIFY_TOKEN 是否有足够权限

### Blobs 存储无法访问

- 确保 NETLIFY_TOKEN 是 Personal Access Token
- 确保 NETLIFY_SITE_ID 正确
- 检查 token 是否已过期（如有问题，重新生成）

## 更新部署

每次推送代码到 Git 仓库后，Netlify 会自动触发部署。也可以手动触发：
```bash
netlify deploy --prod
```
或在控制台点击 "Trigger deploy" 按钮。
