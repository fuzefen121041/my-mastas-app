# 快速开始：部署到 Cloudflare Workers

这是将猫咪健康咨询 AI 部署到 Cloudflare Workers 的快速指南。

## 5 分钟快速部署

### 1. 克隆并安装

```bash
# 进入项目目录
cd my-mastra-app

# 安装依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .dev.vars.example .dev.vars

# 编辑 .dev.vars，添加你的 OpenAI API Key
# OPENAI_API_KEY=sk-your-key-here
```

### 3. 本地测试

```bash
# 构建 Worker
npm run build:worker

# 启动本地开发服务器
npm run worker:dev
```

访问 http://localhost:8787 测试应用。

### 4. 部署到生产环境

```bash
# 登录 Cloudflare
npx wrangler login

# 设置 OpenAI API Key（生产环境）
npx wrangler secret put OPENAI_API_KEY
# 然后粘贴你的 API Key

# 部署
npm run worker:deploy
```

完成！你的应用已部署到 Cloudflare Workers。

## 新增的文件

改造后新增的文件：

```
my-mastra-app/
├── src/
│   └── worker.ts                    # Workers 入口文件
├── scripts/
│   └── build-worker.js              # 构建脚本
├── wrangler.toml                    # Wrangler 配置
├── DEPLOY_WORKERS.md                # 详细部署文档
└── QUICK_START_WORKERS.md           # 本文档
```

## 可用的命令

```bash
# 构建 Worker（生成内联 HTML）
npm run build:worker

# 本地开发
npm run worker:dev

# 部署到生产环境
npm run worker:deploy

# 查看实时日志
npx wrangler tail

# 原有的 Mastra 命令仍然可用
npm run dev           # Mastra Playground
npm run test:cat-agent
npm run test:workflow
```

## API 端点

部署后，你的 Worker 提供以下端点：

- `GET /` - Web UI
- `GET /api/health` - 健康检查
- `POST /api/consultation` - 简单咨询
- `POST /api/consultation/workflow` - 完整 Workflow 咨询

## 示例请求

```bash
# 健康检查
curl https://your-worker.workers.dev/api/health

# 咨询请求
curl -X POST https://your-worker.workers.dev/api/consultation \
  -H "Content-Type: application/json" \
  -d '{
    "catName": "小白",
    "age": 2,
    "consultationType": "health",
    "symptoms": ["食欲不振"]
  }'
```

## 与原项目的区别

| 特性 | 原项目 (Mastra + Pages) | Workers 版本 |
|------|-------------------------|--------------|
| 部署目标 | Cloudflare Pages | Cloudflare Workers |
| 入口文件 | 自动生成 | `src/worker.ts` |
| 静态文件 | Pages 托管 | 内联到 Worker |
| 开发命令 | `npm run pages:dev` | `npm run worker:dev` |
| 部署命令 | `npm run pages:deploy` | `npm run worker:deploy` |
| 路由 | Pages 自动 | Worker 手动定义 |

## 成本

- **免费版**: 100,000 请求/天，完全够用于测试
- **付费版**: $5/月，10M 请求/月

OpenAI API 成本另计（约 $0.01-0.05/次咨询）。

## 下一步

查看 [DEPLOY_WORKERS.md](./DEPLOY_WORKERS.md) 了解：
- 自定义域名配置
- 环境管理
- 故障排查
- 性能优化
- 监控和日志

## 支持

遇到问题？查看：
- [详细部署文档](./DEPLOY_WORKERS.md)
- [项目 README](./README.md)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
