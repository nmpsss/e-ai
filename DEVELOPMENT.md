# 开发指南

## 开发环境设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd e-ai
```

### 2. 后端开发环境

#### 安装Python依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件,配置以下内容:

```env
# 数据库 - 开发环境可使用SQLite
DATABASE_URL=sqlite:///./llm_chat.db
# 或使用PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/llm_chat

# JWT密钥 - 开发环境可使用任意字符串
SECRET_KEY=dev-secret-key-change-in-production

# LLM API密钥 - 至少配置一个
OPENAI_API_KEY=sk-xxx
# ANTHROPIC_API_KEY=sk-ant-xxx
```

#### 启动后端开发服务器

```bash
cd backend
uvicorn app.main:app --reload
```

后端服务将在 http://localhost:8000 启动

访问 http://localhost:8000/docs 查看API文档

### 3. 前端开发环境

#### 安装Node.js依赖

```bash
cd frontend
npm install
```

#### 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 http://localhost:5173 启动

## 开发工作流

### 代码规范

#### 后端(Python)

- 使用Black进行代码格式化
- 遵循PEP 8代码规范
- 使用类型提示(Type Hints)
- 编写清晰的文档字符串(Docstrings)

```bash
# 安装开发工具
pip install black flake8 mypy

# 格式化代码
black .

# 检查代码
flake8 .
mypy .
```

#### 前端(TypeScript/React)

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循React Hooks最佳实践
- 使用TypeScript类型系统

```bash
# 检查代码
npm run lint

# 格式化代码(如果配置了Prettier)
npm run format
```

### 数据库迁移

使用Alembic管理数据库迁移:

```bash
cd backend

# 创建迁移
alembic revision --autogenerate -m "描述信息"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

### 测试

#### 后端测试

```bash
cd backend

# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest
```

#### 前端测试

```bash
cd frontend

# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage
```

## 项目架构

### 后端架构

```
backend/app/
├── api/          # API路由层
│   ├── auth.py       # 认证相关API
│   ├── chat.py       # 聊天相关API
│   ├── conversation.py  # 会话管理API
│   └── admin.py      # 管理后台API
├── models/       # 数据库模型层
│   ├── user.py
│   ├── conversation.py
│   ├── message.py
│   └── api_usage.py
├── schemas/      # Pydantic模型层
│   ├── user.py
│   ├── conversation.py
│   └── message.py
├── services/     # 业务逻辑层
│   ├── auth_service.py
│   ├── chat_service.py
│   └── llm_service.py
└── utils/        # 工具函数
    ├── security.py
    └── dependencies.py
```

### 前端架构

```
frontend/src/
├── components/   # React组件
│   ├── common/       # 通用组件
│   ├── chat/         # 聊天相关组件
│   └── layout/       # 布局组件
├── pages/        # 页面组件
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Chat.tsx
├── services/     # API服务
│   ├── api.ts        # Axios配置
│   ├── auth.ts
│   ├── chat.ts
│   └── conversation.ts
├── store/        # 状态管理(Zustand)
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── settingsStore.ts
├── hooks/        # 自定义Hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useTheme.ts
└── utils/        # 工具函数
    ├── constants.ts
    └── helpers.ts
```

## 常见开发任务

### 添加新的API端点

1. 在 `backend/app/schemas/` 中定义请求和响应模型
2. 在 `backend/app/services/` 中实现业务逻辑
3. 在 `backend/app/api/` 中创建API路由
4. 在前端 `frontend/src/services/` 中添加API调用函数
5. 更新相关组件使用新API

### 添加新页面

1. 在 `frontend/src/pages/` 创建页面组件
2. 在 `frontend/src/App.tsx` 中添加路由
3. 如需要,在 `frontend/src/components/` 创建相关组件
4. 更新导航菜单

### 修改数据库模型

1. 修改 `backend/app/models/` 中的模型
2. 创建数据库迁移: `alembic revision --autogenerate -m "描述"`
3. 应用迁移: `alembic upgrade head`
4. 更新相关的Pydantic schemas
5. 更新相关的服务和API

### 添加新的LLM提供商

1. 在 `backend/app/services/llm_service.py` 中添加新方法
2. 实现聊天和流式响应接口
3. 在 `.env` 中添加API密钥配置
4. 在 `frontend/src/utils/constants.ts` 中添加模型选项
5. 测试新提供商的集成

## 调试技巧

### 后端调试

1. **使用日志**:
```python
import logging
logger = logging.getLogger(__name__)
logger.info("调试信息")
```

2. **使用断点**:
在VSCode中设置断点,使用调试模式启动

3. **查看API文档**:
访问 http://localhost:8000/docs 测试API

### 前端调试

1. **React DevTools**: 安装浏览器扩展查看组件状态
2. **Redux DevTools**: 查看Zustand状态变化
3. **Network Tab**: 查看API请求和响应
4. **Console日志**: 在代码中使用 `console.log()`

## 性能优化

### 后端优化

1. 使用数据库索引
2. 实现缓存(Redis)
3. 使用异步操作
4. 优化数据库查询(避免N+1问题)
5. 实现请求限流

### 前端优化

1. 使用React.memo优化组件渲染
2. 实现虚拟滚动(长列表)
3. 使用代码分割(React.lazy)
4. 优化图片和资源加载
5. 使用Service Worker实现离线功能

## 部署检查清单

- [ ] 更新生产环境配置
- [ ] 设置强密钥和密码
- [ ] 配置HTTPS
- [ ] 设置CORS策略
- [ ] 启用数据库备份
- [ ] 配置日志记录
- [ ] 设置监控和告警
- [ ] 进行安全审计
- [ ] 性能测试
- [ ] 编写部署文档

## 故障排查

### 常见问题

1. **后端无法启动**:
   - 检查Python版本和依赖
   - 检查环境变量配置
   - 检查数据库连接

2. **前端无法启动**:
   - 删除 `node_modules` 重新安装
   - 检查Node.js版本
   - 清除缓存

3. **API请求失败**:
   - 检查CORS配置
   - 检查API端点是否正确
   - 查看浏览器Network标签

4. **数据库错误**:
   - 检查数据库连接字符串
   - 运行数据库迁移
   - 检查数据库权限

## 资源链接

- [FastAPI文档](https://fastapi.tiangolo.com/)
- [React文档](https://react.dev/)
- [TypeScript文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [SQLAlchemy文档](https://docs.sqlalchemy.org/)
- [Zustand文档](https://docs.pmnd.rs/zustand/)

## 贡献流程

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request
6. 等待代码审查
7. 合并到主分支
