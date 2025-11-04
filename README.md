# LLM Chat System - 大模型对话系统

一个现代化的、全功能的大语言模型对话系统,支持多模型、流式响应、会话管理等功能。

## 功能特性

### 核心功能
- ✅ 用户注册/登录系统(JWT认证)
- ✅ 多模型支持(GPT-3.5/GPT-4/Claude 3系列)
- ✅ 流式响应与打字机效果
- ✅ 对话历史保存与管理
- ✅ 多会话管理(创建、切换、删除、重命名)
- ✅ Markdown渲染(代码高亮、表格、列表等)
- ✅ 代码块一键复制
- ✅ 停止生成功能
- ✅ 主题切换(亮色/暗色模式)
- ✅ 响应式设计(支持移动端)

### 管理功能
- ✅ 用户管理
- ✅ API使用统计
- ✅ Token消耗监控

## 技术栈

### 后端
- **FastAPI** - 高性能Python Web框架
- **SQLAlchemy** - ORM数据库操作
- **PostgreSQL** - 关系型数据库
- **JWT** - 用户认证
- **OpenAI/Anthropic SDK** - LLM集成

### 前端
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具
- **Zustand** - 状态管理
- **React Router** - 路由管理
- **React Markdown** - Markdown渲染

## 项目结构

```
e-ai/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── models/            # 数据库模型
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── api/               # API路由
│   │   ├── services/          # 业务逻辑
│   │   └── utils/             # 工具函数
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # React组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── store/             # 状态管理
│   │   └── utils/             # 工具函数
│   └── package.json
└── README.md
```

详细的项目结构说明请查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 18+
- PostgreSQL 13+

### 后端设置

1. 安装依赖:
```bash
cd backend
pip install -r requirements.txt
```

2. 配置环境变量:
```bash
cp .env.example .env
# 编辑 .env 文件,填入你的配置
```

3. 初始化数据库:
```bash
# 确保PostgreSQL已启动
# 创建数据库
createdb llm_chat

# 运行应用(会自动创建表)
python -m app.main
```

4. 启动后端服务:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端服务将在 http://localhost:8000 启动

API文档: http://localhost:8000/docs

### 前端设置

1. 安装依赖:
```bash
cd frontend
npm install
```

2. 启动开发服务器:
```bash
npm run dev
```

前端应用将在 http://localhost:5173 启动

### 生产部署

#### 后端部署

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 使用Gunicorn部署
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### 前端部署

```bash
cd frontend

# 构建生产版本
npm run build

# dist目录可以部署到任何静态服务器
# 例如Nginx、Apache、Vercel等
```

## 配置说明

### 后端环境变量

在 `backend/.env` 文件中配置:

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/llm_chat

# JWT密钥(生产环境请使用强随机字符串)
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM API密钥
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key

# CORS配置
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 前端环境变量

在 `frontend/.env` 文件中配置(可选):

```env
VITE_API_BASE_URL=/api
```

## API文档

启动后端服务后,访问以下URL查看完整API文档:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要API端点

#### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新Token
- `GET /api/auth/me` - 获取当前用户信息

#### 对话相关
- `POST /api/chat` - 发送消息(非流式)
- `POST /api/chat/stream` - 发送消息(流式)
- `POST /api/chat/stop` - 停止生成

#### 会话管理
- `GET /api/conversations` - 获取会话列表
- `POST /api/conversations` - 创建新会话
- `GET /api/conversations/{id}` - 获取会话详情
- `PUT /api/conversations/{id}` - 更新会话
- `DELETE /api/conversations/{id}` - 删除会话
- `GET /api/conversations/{id}/messages` - 获取会话消息
- `GET /api/conversations/search` - 搜索会话

#### 管理后台
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/usage` - 获取使用情况

## 使用指南

### 基本使用流程

1. **注册/登录**
   - 访问 http://localhost:5173
   - 点击"注册"创建账号
   - 使用账号登录系统

2. **开始对话**
   - 登录后自动进入聊天界面
   - 点击"新建对话"创建新会话
   - 在输入框输入消息,按Enter发送
   - AI会实时流式返回回复

3. **会话管理**
   - 左侧边栏显示所有对话
   - 点击对话可切换
   - 鼠标悬停显示编辑/删除按钮
   - 支持重命名和删除操作

4. **个性化设置**
   - 点击右上角主题图标切换暗色/亮色模式
   - 选择不同的AI模型(GPT-3.5/GPT-4/Claude等)
   - 自定义系统提示词(即将支持)

### 高级功能

#### 代码复制
- AI生成的代码块会自动语法高亮
- 点击代码块右上角的"复制"按钮一键复制

#### 停止生成
- AI回复时,发送按钮变为"停止"按钮
- 点击可随时停止当前生成

#### Markdown支持
系统完整支持Markdown语法:
- 标题、列表、表格
- 代码块、引用
- 链接、图片
- 数学公式(LaTeX)

## 开发指南

### 添加新的LLM提供商

1. 在 `backend/app/services/llm_service.py` 中添加新的方法
2. 实现聊天和流式响应接口
3. 在配置中添加API密钥
4. 在前端 `constants.ts` 中添加模型选项

### 自定义主题

编辑 `frontend/tailwind.config.js` 中的颜色配置:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义主题色
      },
    },
  },
}
```

### 添加新功能

1. 后端:在 `backend/app/api/` 添加新的路由
2. 前端:在 `frontend/src/pages/` 添加新页面
3. 更新路由配置

## 常见问题

### Q: 如何更换数据库?
A: 修改 `DATABASE_URL` 环境变量,SQLAlchemy支持PostgreSQL、MySQL、SQLite等

### Q: 如何限制用户API使用?
A: 在 `ApiUsage` 表中记录了所有使用情况,可以基于此实现配额限制

### Q: 如何添加更多AI模型?
A: 在 `llm_service.py` 中添加新模型的实现,在前端 `constants.ts` 中添加配置

### Q: 支持哪些浏览器?
A: 支持所有现代浏览器(Chrome、Firefox、Safari、Edge)

## 安全建议

1. **生产环境必做**:
   - 更改 `SECRET_KEY` 为强随机字符串
   - 使用HTTPS
   - 启用数据库备份
   - 设置合理的CORS策略

2. **API密钥管理**:
   - 不要将API密钥提交到代码仓库
   - 使用环境变量或密钥管理服务
   - 定期轮换密钥

3. **数据保护**:
   - 定期备份数据库
   - 对敏感数据加密
   - 实现访问日志

## 贡献指南

欢迎贡献代码、报告问题或提出建议!

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议,欢迎提Issue或Pull Request。

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 实现基础对话功能
- 支持多模型
- 流式响应
- 会话管理
- 用户系统
- 管理后台

## 致谢

感谢以下开源项目:
- FastAPI
- React
- Tailwind CSS
- OpenAI
- Anthropic
