# 部署到 Cloudflare Workers 指南

本指南将帮助你将猫咪健康咨询 AI 部署到 Cloudflare Workers。

## 目录

- [前提条件](#前提条件)
- [项目结构](#项目结构)
- [本地开发](#本地开发)
- [部署到生产环境](#部署到生产环境)
- [配置环境变量](#配置环境变量)
- [测试部署](#测试部署)
- [故障排查](#故障排查)

## 前提条件

1. **Node.js 环境**
   - Node.js >= 20.9.0
   - npm 或 yarn

2. **Cloudflare 账户**
   - 注册 Cloudflare 账户：https://dash.cloudflare.com/sign-up
   - 确认邮箱地址

3. **OpenAI API Key**
   - 获取 OpenAI API Key：https://platform.openai.com/api-keys
   - 需要有访问 GPT-4o 模型的权限

## 项目结构

改造后的项目结构：

```
my-mastra-app/
├── src/
│   ├── worker.ts                    # Cloudflare Workers 入口文件 (新)
│   ├── mastra/                      # Mastra 配置
│   │   ├── index.ts
│   │   ├── agents/
│   │   ├── tools/
│   │   └── workflows/
│   ├── api/
│   │   └── consultation.ts          # API 处理函数
│   └── generated/                   # 构建时生成 (新)
│       └── index.html.ts            # 内联的 HTML
├── scripts/
│   └── build-worker.js              # Workers 构建脚本 (新)
├── public/
│   └── index.html                   # Web UI
├── wrangler.toml                    # Wrangler 配置 (新)
├── .dev.vars                        # 本地环境变量
├── .dev.vars.example                # 环境变量示例
└── package.json                     # 更新了脚本
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.dev.vars` 文件（用于 Cloudflare Workers 本地开发）：

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 并添加你的 OpenAI API Key：

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. 构建 Worker

这个命令会读取 `public/index.html` 并生成内联版本：

```bash
npm run build:worker
```

### 4. 启动本地开发服务器

```bash
npm run worker:dev
```

这会启动 Wrangler 本地开发服务器，默认地址：http://localhost:8787

### 5. 测试 API 端点

**健康检查：**
```bash
curl http://localhost:8787/api/health
```

**简单咨询：**
```bash
curl -X POST http://localhost:8787/api/consultation \
  -H "Content-Type: application/json" \
  -d '{
    "catName": "小白",
    "age": 2,
    "weight": 4.5,
    "consultationType": "health",
    "symptoms": ["食欲不振"],
    "symptomsDuration": "2天"
  }'
```

**使用 Workflow 的完整咨询：**
```bash
curl -X POST http://localhost:8787/api/consultation/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "catName": "小花",
    "age": 3,
    "consultationType": "behavior",
    "behaviorChanges": "最近变得很焦躁"
  }'
```

## 部署到生产环境

### 1. 登录 Cloudflare

首次部署需要登录：

```bash
npx wrangler login
```

这会打开浏览器让你授权 Wrangler 访问你的 Cloudflare 账户。

### 2. 构建并部署

```bash
npm run worker:deploy
```

这个命令会：
1. 运行 `build:worker` 脚本生成内联 HTML
2. 使用 Wrangler 部署到 Cloudflare Workers

### 3. 查看部署结果

部署成功后，Wrangler 会输出你的 Worker URL，类似：

```
Published cat-consultation-ai (0.xx sec)
  https://cat-consultation-ai.your-subdomain.workers.dev
```

## 配置环境变量

### 通过 Wrangler CLI

```bash
npx wrangler secret put OPENAI_API_KEY
```

然后粘贴你的 OpenAI API Key。

### 通过 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard：https://dash.cloudflare.com
2. 进入 **Workers & Pages**
3. 选择你的 Worker（`cat-consultation-ai`）
4. 进入 **Settings** → **Variables**
5. 点击 **Add variable**
6. 添加环境变量：
   - Variable name: `OPENAI_API_KEY`
   - Value: 你的 OpenAI API Key
   - Type: Secret (加密存储)
7. 点击 **Deploy**

## 测试部署

### 1. 访问 Web UI

在浏览器打开你的 Worker URL：

```
https://cat-consultation-ai.your-subdomain.workers.dev
```

### 2. 测试 API 端点

```bash
# 健康检查
curl https://cat-consultation-ai.your-subdomain.workers.dev/api/health

# 咨询测试
curl -X POST https://cat-consultation-ai.your-subdomain.workers.dev/api/consultation \
  -H "Content-Type: application/json" \
  -d '{
    "catName": "测试猫",
    "age": 1,
    "consultationType": "general",
    "additionalNotes": "测试部署"
  }'
```

### 3. 上传图片测试

使用 Web UI 上传猫咪图片并进行咨询测试。

## 高级配置

### 自定义域名

1. 在 Cloudflare Dashboard 中添加你的域名
2. 编辑 `wrangler.toml`：

```toml
routes = [
  { pattern = "cats.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

3. 重新部署：

```bash
npm run worker:deploy
```

### 环境配置

在 `wrangler.toml` 中配置多个环境：

```toml
[env.production]
name = "cat-consultation-ai-production"
workers_dev = false

[env.staging]
name = "cat-consultation-ai-staging"
workers_dev = true
```

部署到特定环境：

```bash
# 部署到 staging
npx wrangler deploy --env staging

# 部署到 production
npx wrangler deploy --env production
```

## 故障排查

### 问题 1: "Module not found" 错误

**原因：** 构建脚本未运行或生成的文件丢失

**解决方案：**
```bash
npm run build:worker
```

确保 `src/generated/index.html.ts` 文件存在。

### 问题 2: "OPENAI_API_KEY is not defined"

**原因：** 环境变量未配置

**解决方案：**
- 本地开发：检查 `.dev.vars` 文件
- 生产环境：使用 `wrangler secret put OPENAI_API_KEY` 或在 Dashboard 配置

### 问题 3: API 请求超时

**原因：** Cloudflare Workers 有 CPU 时间限制（免费版 10ms，付费版 50ms）

**解决方案：**
- 升级到 Cloudflare Workers Paid 计划
- 优化 AI 请求（减少工具调用）
- 考虑使用 Cloudflare Workers Unbound（按请求时间计费）

### 问题 4: 图片上传失败

**原因：** Worker 请求体大小限制（免费版 100MB）

**解决方案：**
- 在前端压缩图片
- 限制图片大小（建议 < 5MB）
- 使用 Cloudflare Images 或 R2 存储

### 问题 5: CORS 错误

**原因：** 跨域配置问题

**解决方案：**
Worker 已配置 CORS 头，检查 `src/worker.ts` 中的 `corsHeaders`。

## 监控和日志

### 查看实时日志

```bash
npx wrangler tail
```

### Cloudflare Dashboard

1. 进入 **Workers & Pages**
2. 选择你的 Worker
3. 查看：
   - **Metrics**: 请求量、错误率、CPU 时间
   - **Logs**: 实时日志流
   - **Triggers**: 路由和调度配置

## 成本估算

### Cloudflare Workers 免费版

- 100,000 请求/天
- 10ms CPU 时间/请求
- 完全够用于小规模测试

### Cloudflare Workers Paid ($5/月)

- 10,000,000 请求/月（包含）
- 50ms CPU 时间/请求
- 超出后 $0.50 / 百万请求

### OpenAI API 成本

- GPT-4o: $5.00 / 1M input tokens, $15.00 / 1M output tokens
- Vision (图片): 按分辨率计费
- 估算：每次咨询约 $0.01-0.05

## 下一步

- [ ] 配置自定义域名
- [ ] 设置监控和告警
- [ ] 优化图片处理
- [ ] 添加缓存策略
- [ ] 实现速率限制
- [ ] 添加数据库存储（Cloudflare D1）

## 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Mastra 文档](https://mastra.ai/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)

## 支持

如有问题，请查看：
- [项目 README](./README.md)
- [功能文档](./Documentation/FEATURES.md)
- [使用示例](./Documentation/USAGE_EXAMPLES.md)
