# 部署到 Cloudflare Pages 指南

本指南将帮助你把猫咪健康咨询 AI 应用部署到 Cloudflare Pages。

## 前置要求

- Node.js >= 20.9.0
- 一个 Cloudflare 账号 (免费账号即可)
- Git (用于代码管理)
- OpenAI API Key

## 部署步骤

### 1. 安装依赖

首先安装项目依赖,包括 Wrangler CLI:

```bash
npm install
```

### 2. 配置环境变量

#### 本地开发环境变量

复制 `.dev.vars.example` 创建 `.dev.vars` 文件:

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 文件,填入你的 OpenAI API Key:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

> 注意: `.dev.vars` 文件仅用于本地开发,已添加到 `.gitignore` 中不会提交到 Git

### 3. 登录 Cloudflare

使用 Wrangler CLI 登录你的 Cloudflare 账号:

```bash
npx wrangler login
```

这会打开浏览器让你授权 Wrangler 访问你的 Cloudflare 账号。

### 4. 构建项目

运行构建命令:

```bash
npm run build
```

这会使用 Mastra 构建工具生成部署文件到 `.mastra/build` 目录。

### 5. 首次部署

#### 方式一: 通过命令行部署 (推荐)

运行部署命令:

```bash
npx wrangler pages deploy
```

首次部署时,Wrangler 会询问:
- **项目名称**: 输入 `my-mastra-app` (或你喜欢的名称)
- **确认部署**: 输入 `y`

部署成功后,会显示你的应用 URL,类似: `https://my-mastra-app.pages.dev`

#### 方式二: 通过 Git + Cloudflare Dashboard 部署

1. 将代码推送到 GitHub/GitLab

```bash
git add .
git commit -m "准备部署到 Cloudflare Pages"
git push origin main
```

2. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)

3. 进入 **Pages** > **Create a project**

4. 选择 **Connect to Git** 并授权访问你的代码仓库

5. 选择你的项目仓库

6. 配置构建设置:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `.mastra/build`
   - **Root directory**: `/`
   - **Node version**: `20`

7. 点击 **Save and Deploy**

### 6. 配置生产环境变量

部署后,需要在 Cloudflare 中配置环境变量:

1. 进入 Cloudflare Dashboard > Pages > 你的项目

2. 点击 **Settings** > **Environment variables**

3. 添加生产环境变量:
   - **Variable name**: `OPENAI_API_KEY`
   - **Value**: 你的 OpenAI API Key
   - **Environment**: 选择 `Production` (和 `Preview` 如果需要)

4. 点击 **Save**

5. 重新部署以应用环境变量:
   - 进入 **Deployments** 标签
   - 点击最新部署旁边的 **...** > **Retry deployment**

### 7. 访问应用

部署成功后,你可以通过以下 URL 访问应用:

- **生产环境**: `https://your-project-name.pages.dev`
- **自定义域名**: 可在 Cloudflare Dashboard 中配置

## 后续部署

### 通过命令行更新

修改代码后,运行:

```bash
npm run build
npx wrangler pages deploy
```

### 通过 Git 自动部署

如果使用 Git 集成方式:

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Cloudflare 会自动检测到代码变更并重新部署。

## 本地测试 Cloudflare 环境

在部署前,可以本地测试 Cloudflare Pages 环境:

```bash
npm run pages:dev
```

访问 `http://localhost:8788` 测试应用。

## 数据库配置

### 使用 LibSQL (当前配置)

当前配置使用本地 LibSQL 数据库 (`mastra.db`)。在 Cloudflare Pages 上,每次部署会创建新的实例,数据不会持久化。

### 升级到 Cloudflare D1 (推荐用于生产)

如需持久化存储,建议迁移到 Cloudflare D1:

1. 创建 D1 数据库:

```bash
npx wrangler d1 create my-mastra-db
```

2. 复制返回的 `database_id`,更新 `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-mastra-db"
database_id = "你的-database-id"
```

3. 修改 `src/mastra/index.ts` 使用 D1 绑定 (需要适配代码)

### 使用远程 LibSQL (Turso)

另一个选项是使用 [Turso](https://turso.tech/) 的托管 LibSQL:

1. 注册 Turso 账号并创建数据库

2. 获取数据库 URL 和认证 token

3. 在 Cloudflare 中添加环境变量:
   - `LIBSQL_URL`: 数据库 URL
   - `LIBSQL_AUTH_TOKEN`: 认证 token

4. 更新 `src/mastra/index.ts`:

```typescript
storage: new LibSQLStore({
  url: process.env.LIBSQL_URL || "file:../mastra.db",
  authToken: process.env.LIBSQL_AUTH_TOKEN,
}),
```

## 监控和调试

### 查看日志

1. 进入 Cloudflare Dashboard > Pages > 你的项目

2. 点击 **View details** 查看部署详情

3. 点击 **Functions** 标签查看函数日志

### 实时日志

使用 Wrangler tail 查看实时日志:

```bash
npx wrangler pages deployment tail
```

## 常见问题

### Q: 部署后 API 返回 500 错误

**A**: 检查环境变量是否正确配置:
- 确认 `OPENAI_API_KEY` 已在 Cloudflare Dashboard 中设置
- 重新部署以应用环境变量

### Q: 数据库连接失败

**A**: 检查数据库配置:
- 本地文件数据库在 Cloudflare 上不会持久化
- 建议使用 Turso 或 Cloudflare D1

### Q: 如何查看构建日志?

**A**:
- 命令行部署: 日志会直接显示在终端
- Git 集成: 在 Cloudflare Dashboard > Deployments 中查看

### Q: 如何回滚到之前的版本?

**A**:
1. 进入 Cloudflare Dashboard > Pages > 你的项目
2. 点击 **Deployments** 标签
3. 找到想要恢复的部署
4. 点击 **...** > **Rollback to this deployment**

### Q: 免费额度够用吗?

**A**: Cloudflare Pages 免费额度:
- **请求数**: 100,000 次/天
- **构建时间**: 500 分钟/月
- **带宽**: 无限制

对于中小型应用完全足够。

## 性能优化建议

### 1. 启用缓存

在响应中添加缓存头:

```typescript
response.headers.set('Cache-Control', 'public, max-age=3600');
```

### 2. 使用 Cloudflare KV 缓存

对于品种信息等静态数据,可以使用 KV 存储:

```bash
npx wrangler kv:namespace create CACHE
```

### 3. 开启 Cloudflare CDN

Cloudflare Pages 自动使用全球 CDN,无需额外配置。

### 4. 压缩响应

确保响应启用 gzip/brotli 压缩 (Cloudflare 自动处理)。

## 安全建议

1. **API Key 保护**: 永远不要将 API Key 提交到 Git
2. **环境变量**: 使用 Cloudflare 的环境变量管理
3. **HTTPS**: Cloudflare Pages 自动提供免费 SSL 证书
4. **访问控制**: 可在 Cloudflare 中配置访问策略

## 自定义域名

1. 进入 Cloudflare Dashboard > Pages > 你的项目

2. 点击 **Custom domains** 标签

3. 点击 **Set up a custom domain**

4. 输入你的域名并按提示配置 DNS

## 更多资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Mastra 文档](https://mastra.ai/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)

## 技术支持

如遇到问题:
1. 查看 Cloudflare Pages 文档
2. 检查项目的 Issues
3. 联系 Cloudflare 支持

---

祝你部署顺利! 🚀
