# 项目结构说明

## 技术栈

### 后端
- **FastAPI**: 高性能的Python Web框架
- **SQLAlchemy**: ORM数据库操作
- **PostgreSQL**: 关系型数据库
- **JWT**: 用户认证
- **OpenAI/Anthropic SDK**: 大模型API集成

### 前端
- **React 18**: UI框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **React Router**: 路由管理
- **Axios**: HTTP客户端
- **React Markdown**: Markdown渲染
- **Zustand**: 状态管理

## 目录结构

```
e-ai/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI应用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # 数据库连接
│   │   ├── models/            # 数据库模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py       # 用户模型
│   │   │   ├── conversation.py  # 会话模型
│   │   │   └── message.py    # 消息模型
│   │   ├── schemas/           # Pydantic数据验证
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── conversation.py
│   │   │   └── message.py
│   │   ├── api/               # API路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py       # 认证相关API
│   │   │   ├── chat.py       # 对话相关API
│   │   │   ├── conversation.py  # 会话管理API
│   │   │   └── admin.py      # 管理后台API
│   │   ├── services/          # 业务逻辑层
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── chat_service.py
│   │   │   └── llm_service.py  # LLM接口封装
│   │   └── utils/             # 工具函数
│   │       ├── __init__.py
│   │       ├── security.py   # 加密、JWT等
│   │       └── dependencies.py  # FastAPI依赖
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic/              # 数据库迁移
├── frontend/                  # 前端应用
│   ├── public/
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── chat/        # 对话相关组件
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   └── CodeBlock.tsx
│   │   │   ├── layout/      # 布局组件
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── common/      # 通用组件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Loading.tsx
│   │   │   └── admin/       # 管理后台组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Admin.tsx
│   │   ├── services/         # API服务
│   │   │   ├── api.ts       # Axios配置
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   └── conversation.ts
│   │   ├── hooks/            # 自定义Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useChat.ts
│   │   │   └── useTheme.ts
│   │   ├── store/            # 状态管理
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── utils/            # 工具函数
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── styles/           # 全局样式
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 核心功能模块

### 1. 用户认证模块
- JWT Token认证
- 注册/登录/登出
- 密码加密存储
- Token刷新机制

### 2. 对话管理模块
- 创建新会话
- 会话列表展示
- 会话重命名
- 会话删除
- 会话搜索

### 3. 聊天功能模块
- 发送消息
- 接收AI回复（流式/非流式）
- 消息历史记录
- Markdown渲染
- 代码高亮
- 代码复制
- 停止生成

### 4. LLM集成模块
- 多模型支持（OpenAI、Anthropic、DeepSeek等）
- 统一接口封装
- 流式响应处理
- 错误处理和重试

### 5. 设置模块
- 模型选择
- 主题切换（亮色/暗色）
- 用户信息管理

### 6. 管理后台模块
- 用户列表和管理
- API使用统计
- Token消耗监控
- 系统配置

## 数据库设计

### User表
- id: 主键
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password_hash: 密码哈希
- is_active: 是否激活
- is_admin: 是否管理员
- created_at: 创建时间
- updated_at: 更新时间

### Conversation表
- id: 主键
- user_id: 用户ID（外键）
- title: 会话标题
- model: 使用的模型
- created_at: 创建时间
- updated_at: 更新时间

### Message表
- id: 主键
- conversation_id: 会话ID（外键）
- role: 角色（user/assistant/system）
- content: 消息内容
- tokens: Token数量
- created_at: 创建时间

### ApiUsage表
- id: 主键
- user_id: 用户ID（外键）
- model: 模型名称
- tokens: Token消耗
- cost: 成本
- created_at: 创建时间

## API设计

### 认证相关
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- POST /api/auth/refresh - 刷新Token
- GET /api/auth/me - 获取当前用户信息

### 对话相关
- POST /api/chat - 发送消息（非流式）
- POST /api/chat/stream - 发送消息（流式）
- POST /api/chat/stop - 停止生成

### 会话管理
- GET /api/conversations - 获取会话列表
- POST /api/conversations - 创建新会话
- GET /api/conversations/{id} - 获取会话详情
- PUT /api/conversations/{id} - 更新会话
- DELETE /api/conversations/{id} - 删除会话
- GET /api/conversations/search - 搜索会话

### 消息历史
- GET /api/conversations/{id}/messages - 获取会话消息

### 设置
- GET /api/settings - 获取用户设置
- PUT /api/settings - 更新用户设置

### 管理后台
- GET /api/admin/users - 获取用户列表
- GET /api/admin/stats - 获取统计数据
- GET /api/admin/usage - 获取使用情况

## 前端路由设计

- `/login` - 登录页
- `/register` - 注册页
- `/` - 主聊天界面
- `/chat/:conversationId` - 指定会话聊天
- `/settings` - 设置页面
- `/admin` - 管理后台（需要管理员权限）

## UI设计原则

1. **现代简洁**: 使用Tailwind CSS实现现代化设计
2. **响应式**: 支持移动端和桌面端
3. **清晰直观**: 信息层级清晰，操作简单
4. **优雅**: 适当的动画和过渡效果
5. **可访问性**: 支持键盘操作，适当的对比度

## 安全考虑

1. 密码使用bcrypt加密
2. JWT Token有效期设置
3. API请求限流
4. XSS防护
5. CORS配置
6. 环境变量管理敏感信息
