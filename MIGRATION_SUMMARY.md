# Cloudflare Workers 改造总结

本文档总结了将猫咪健康咨询 AI 从 Mastra + Cloudflare Pages 架构改造为 Cloudflare Workers 的所有变更。

## 改造日期

2025-11-11

## 改造目标

将项目从 Cloudflare Pages 部署方式改造为 Cloudflare Workers，以获得：
- 更灵活的路由控制
- 更好的 API 性能
- 统一的请求处理
- 更简单的部署流程

## 新增文件

### 1. `src/worker.ts`
**用途**: Cloudflare Workers 入口文件

**功能**:
- 处理所有 HTTP 请求
- 路由分发（首页、API、健康检查）
- CORS 处理
- 错误处理
- 环境变量设置

**关键代码**:
```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 设置环境变量
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;

    // 路由处理
    const url = new URL(request.url);
    const path = url.pathname;

    // 根据路径分发请求...
  }
}
```

### 2. `scripts/build-worker.js`
**用途**: 构建脚本，将 HTML 文件内联

**功能**:
- 读取 `public/index.html`
- 转义特殊字符
- 生成 TypeScript 模块 `src/generated/index.html.ts`

**原因**: Cloudflare Workers 不支持直接提供静态文件，需要将 HTML 内联到代码中。

### 3. `wrangler.toml`
**用途**: Wrangler CLI 配置文件

**配置内容**:
```toml
name = "cat-consultation-ai"
main = "src/worker.ts"
compatibility_date = "2024-01-01"
node_compat = true
workers_dev = true

[build]
command = "npm run build:worker"
```

### 4. `DEPLOY_WORKERS.md`
**用途**: 详细的部署文档

**内容包括**:
- 前提条件
- 本地开发指南
- 生产环境部署步骤
- 环境变量配置
- 故障排查
- 成本估算
- 高级配置

### 5. `QUICK_START_WORKERS.md`
**用途**: 快速开始指南

**内容**: 5 分钟快速部署流程

### 6. `MIGRATION_SUMMARY.md`
**用途**: 本文档，改造总结

## 修改文件

### 1. `package.json`
**变更**: 添加新的 npm 脚本

**新增脚本**:
```json
{
  "build:worker": "node scripts/build-worker.js",
  "worker:dev": "npm run build:worker && wrangler dev",
  "worker:deploy": "npm run build:worker && wrangler deploy"
}
```

**说明**:
- `build:worker`: 生成内联 HTML
- `worker:dev`: 本地开发
- `worker:deploy`: 部署到生产环境

### 2. `.gitignore`
**变更**: 排除生成的文件

**新增规则**:
```gitignore
# Generated files for Cloudflare Workers
src/generated/
```

## 未修改文件

以下核心文件**保持不变**，确保原有功能完全兼容：

- `src/mastra/index.ts` - Mastra 配置
- `src/mastra/agents/cat-consultant-agent.ts` - AI Agent
- `src/mastra/tools/cat-tools.ts` - 8 个专业工具
- `src/mastra/workflows/cat-consultation-workflow.ts` - Workflow
- `src/api/consultation.ts` - API 处理函数
- `public/index.html` - Web UI
- `.env.example` - 环境变量示例
- `.dev.vars.example` - Workers 环境变量示例

## 架构变化

### 之前（Cloudflare Pages）

```
请求 → Cloudflare Pages
       ↓
       Mastra 自动生成的路由
       ↓
       静态文件 (Pages 托管)
       ↓
       API Functions (Pages Functions)
```

### 之后（Cloudflare Workers）

```
请求 → Cloudflare Workers (src/worker.ts)
       ↓
       手动路由逻辑
       ↓
       ├─ GET / → 内联 HTML
       ├─ POST /api/consultation → API 处理
       ├─ POST /api/consultation/workflow → Workflow
       └─ GET /api/health → 健康检查
```

## 关键技术点

### 1. 静态文件内联

**问题**: Workers 不能直接提供静态文件

**解决方案**:
- 构建时读取 HTML 文件
- 转义后生成 TypeScript 模块
- Worker 直接返回 HTML 字符串

### 2. 环境变量处理

**开发环境**:
- 使用 `.dev.vars` 文件
- Wrangler 自动加载

**生产环境**:
- 使用 `wrangler secret put` 或 Dashboard 配置
- Worker 从 `env` 参数读取

### 3. CORS 处理

**实现**:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

所有响应都包含 CORS 头。

### 4. 路由设计

**端点**:
- `GET /` - 首页
- `GET /api/health` - 健康检查
- `POST /api/consultation` - 简单咨询
- `POST /api/consultation/workflow` - 完整 Workflow

## 部署流程对比

### Pages 部署

```bash
npm run build
npm run pages:deploy
```

### Workers 部署

```bash
npm run build:worker
npm run worker:deploy
```

## 兼容性保证

### 完全兼容的功能

✅ AI Agent 咨询
✅ 图片上传和分析
✅ 8 个专业工具
✅ Workflow 执行
✅ Web UI
✅ API 端点
✅ 环境变量配置

### 新增功能

✅ 健康检查端点
✅ 统一的 CORS 处理
✅ 更好的错误处理
✅ 请求日志

## 使用方式

### 开发者

```bash
# 原有方式仍然可用
npm run dev              # Mastra Playground
npm run test:cat-agent   # 测试 Agent
npm run test:workflow    # 测试 Workflow

# 新的 Workers 方式
npm run build:worker     # 构建
npm run worker:dev       # 本地开发
npm run worker:deploy    # 部署
```

### 最终用户

使用体验**完全一致**，只是后端部署方式不同。

## 性能考虑

### Cloudflare Workers 限制

**免费版**:
- 100,000 请求/天
- 10ms CPU 时间/请求
- 128MB 内存

**付费版**:
- 10,000,000 请求/月
- 50ms CPU 时间/请求
- 128MB 内存

### AI 请求优化

由于 CPU 时间限制，建议：
1. 使用付费版（50ms CPU 时间）
2. 减少工具调用次数
3. 优化 Prompt 长度
4. 考虑使用 Workers Unbound（按时间计费）

## 测试清单

部署前请确认：

- [ ] 构建脚本成功运行 (`npm run build:worker`)
- [ ] 生成文件存在 (`src/generated/index.html.ts`)
- [ ] 本地开发服务器正常启动 (`npm run worker:dev`)
- [ ] 首页可访问 (http://localhost:8787)
- [ ] 健康检查正常 (`GET /api/health`)
- [ ] 咨询 API 正常 (`POST /api/consultation`)
- [ ] Workflow API 正常 (`POST /api/consultation/workflow`)
- [ ] 图片上传功能正常
- [ ] 环境变量正确配置 (`OPENAI_API_KEY`)

## 回滚方案

如果 Workers 部署出现问题，可以回滚到 Pages：

```bash
# 使用原有的 Pages 部署方式
npm run build
npm run pages:deploy
```

原有文件都未修改，可以无缝回滚。

## 后续优化建议

### 短期（1-2周）

1. **添加缓存**
   - 使用 Cloudflare Cache API
   - 缓存常见咨询结果

2. **速率限制**
   - 防止滥用
   - 使用 Cloudflare KV 存储请求计数

3. **监控和告警**
   - 设置 Cloudflare Alerts
   - 监控错误率和响应时间

### 中期（1-2月）

1. **数据库集成**
   - 使用 Cloudflare D1
   - 存储咨询历史

2. **用户认证**
   - 实现用户系统
   - 咨询历史查询

3. **图片优化**
   - 使用 Cloudflare Images
   - 或 R2 对象存储

### 长期（3-6月）

1. **WebSocket 支持**
   - 实时咨询
   - 流式响应

2. **多语言支持**
   - 国际化
   - 多语言 AI 响应

3. **移动应用**
   - React Native / Flutter
   - 使用 Workers API

## 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Mastra 文档](https://mastra.ai/docs)
- [项目 README](./README.md)
- [部署文档](./DEPLOY_WORKERS.md)
- [快速开始](./QUICK_START_WORKERS.md)

## 维护者

如果您对改造有任何问题或建议，请查看文档或提交 Issue。

---

**改造完成！** 🎉

项目现在支持两种部署方式：
1. **Cloudflare Pages** (原有方式)
2. **Cloudflare Workers** (新方式)

选择最适合您需求的部署方式！
