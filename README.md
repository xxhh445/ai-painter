# AI Painter - 智能绘画工坊

一个带有可爱机器人的 AI 绘画应用，支持与 AI 对话和图像生成。

## 📁 项目结构

```
ai-painter/
├── index.html              # 前端界面
└── backend/               # 后端服务（可选）
    ├── server.js          # Express 服务器
    ├── package.json       # 依赖配置
    ├── railway.json       # Railway 部署配置
    └── README.md          # 后端部署说明
```

## 🚀 快速开始

### 方式一：纯前端（无需后端）

1. 直接在浏览器中打开 `index.html`
2. 点击右上角 ⚙️ 设置按钮
3. 输入 DeepSeek API Key
4. 开始使用！

**特点：**
- ✅ 简单快捷
- ✅ 无需服务器
- ⚠️ API Key 保存在浏览器中
- ⚠️ 部分浏览器可能存在 CORS 问题

### 方式二：前后端分离（推荐）

#### 后端部署（Railway 免费版）

1. **上传代码到 GitHub**
   ```bash
   cd ai-painter
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/ai-painter.git
   git push -u origin main
   ```

2. **部署后端到 Railway**
   - 访问 https://railway.app
   - 使用 GitHub 登录
   - 点击 **New Project** → **Deploy from GitHub repo**
   - 选择你的仓库
   - Railway 会自动检测 `backend` 目录

3. **配置环境变量**
   在 Railway 项目的 **Variables** 中添加：
   ```
   DEEPSEEK_API_KEY=你的DeepSeek API密钥
   ```

4. **获取后端地址**
   部署完成后，Railway 会提供类似这样的 URL：
   ```
   https://ai-painter-backend-xxxx.up.railway.app
   ```

5. **修改前端代码**
   编辑 `index.html`，找到第 832 行：
   ```javascript
   const API_BASE_URL = '';  // 改为你的后端地址
   ```
   例如：
   ```javascript
   const API_BASE_URL = 'https://ai-painter-backend-xxxx.up.railway.app';
   ```

6. **部署前端到 GitHub Pages**
   - 进入 GitHub 仓库 → **Settings** → **Pages**
   - **Source** 选择 `main` 分支 + `/ (root)`
   - 保存后访问：`https://你的用户名.github.io/ai-painter/`

## 🎨 功能

### 🤖 AI 对话
- 与智能机器人对话
- AI 优化你的绘图描述
- 自动填充提示词

### 🎨 图像生成
- 支持多种尺寸：正方形、竖版、横版
- 多种风格：写实、动漫、油画、水彩、3D
- 使用免费的 Pollinations.ai 服务

### ⚙️ 设置
- 配置 DeepSeek API Key
- 测试 API 连接
- 本地存储配置

## 🔧 API 配置

### DeepSeek API Key
1. 访问 https://platform.deepseek.com
2. 注册并登录
3. 在 API Keys 页面创建新密钥
4. 复制密钥并粘贴到设置中

### 费用说明
- **DeepSeek API**：按使用量计费，价格实惠
- **Pollinations.ai**：完全免费，无需 API Key
- **Railway**：免费版每月 500 小时

## 📝 API 接口文档

### 后端 API 端点

#### 健康检查
```
GET /api/health
```

#### AI 对话
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "你好"}
  ],
  "apiKey": "可选（如果不传则使用环境变量中的密钥）"
}
```

#### 图像生成
```
POST /api/generate-image
Content-Type: application/json

{
  "prompt": "一只可爱的猫咪",
  "width": 1024,
  "height": 1024,
  "style": "anime"
}
```

#### 测试 API Key
```
POST /api/test
Content-Type: application/json

{
  "apiKey": "你的API密钥"
}
```

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, Vanilla JavaScript
- **后端**：Node.js, Express
- **AI**：DeepSeek API
- **图像**：Pollinations.ai
- **部署**：GitHub Pages, Railway

## 📄 许可证

MIT License

## 🙏 致谢

- DeepSeek - AI 语言模型
- Pollinations.ai - 免费图像生成
- Railway - 免费后端部署
