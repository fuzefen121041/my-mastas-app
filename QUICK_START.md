# 🐱 猫咪咨询 AI 助手 - 快速入门

欢迎使用猫咪咨询 AI 助手！这是一个基于 Mastra 和 OpenAI GPT-4o 构建的专业猫咪健康咨询系统。

## 🚀 5分钟快速启动

### 步骤 1: 环境准备

确保你的电脑已安装：
- **Node.js** >= 20.9.0 ([下载地址](https://nodejs.org/))
- **npm** (Node.js 自带)

验证安装：
```bash
node --version   # 应该显示 v20.9.0 或更高
npm --version    # 应该显示 npm 版本号
```

### 步骤 2: 安装依赖

```bash
npm install
```

这会安装所有必要的依赖包，大约需要 1-2 分钟。

### 步骤 3: 配置 OpenAI API Key

#### 3.1 获取 API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录或注册账号
3. 点击 "Create new secret key" 创建新的 API Key
4. 复制生成的 API Key（格式类似：`sk-...`）

#### 3.2 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

编辑 `.env` 文件，粘贴你的 API Key：

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **重要提示**：
- 不要分享你的 API Key
- 不要将 `.env` 文件提交到 Git
- `.gitignore` 已配置忽略 `.env` 文件

### 步骤 4: 启动服务

```bash
npm run dev
```

成功启动后，你会看到：

```
INFO [Mastra]: Server started on http://localhost:4111
INFO [Mastra]: Playground available at http://localhost:4111/playground
```

🎉 恭喜！服务已启动！

### 步骤 5: 开始使用

#### 方式 1: 使用 Playground（推荐新手）

1. 打开浏览器访问：`http://localhost:4111/playground`
2. 在 Agent 选择器中选择 **catConsultantAgent**
3. 开始对话！

**试试这些问题**：
```
- 我是新手，刚养了一只小猫，需要准备什么？
- [上传猫咪照片] 这是什么品种？
- 我的猫不爱吃东西了，怎么办？
- 猫咪踩奶是什么意思？
- 请帮我制定2岁猫咪的饮食计划
```

#### 方式 2: 使用测试脚本

运行预置的测试脚本：

```bash
npm run test:cat-agent
```

这会运行 6 个测试场景，展示 AI 助手的各种能力。

#### 方式 3: 编写代码调用

创建一个新文件 `my-test.ts`：

```typescript
import { mastra } from './src/mastra/index.js';

async function askQuestion() {
  const agent = mastra.agents.catConsultantAgent;

  const response = await agent.generate({
    messages: [{
      role: 'user',
      content: '我想了解布偶猫的特点'
    }]
  });

  console.log(response.text);
}

askQuestion();
```

运行：
```bash
npx tsx my-test.ts
```

## 📚 核心功能

### 1. 品种识别
上传猫咪照片，AI 会识别品种并提供详细信息。

### 2. 健康评估
描述症状，AI 会评估严重程度并给出建议。

### 3. 营养指导
提供年龄、体重等信息，获取个性化饮食计划。

### 4. 行为解读
询问猫咪的行为，了解其含义和应对方法。

### 5. 护理知识
获取日常护理、疫苗、绝育等方面的指导。

## 🎯 使用示例

### 示例 1: 新手猫主

**你问**：
> 我刚领养了一只2个月大的小猫，第一次养猫，需要准备什么？

**AI 回答**：
- 基础用品清单（猫砂盆、食盆、水盆、猫粮等）
- 环境设置建议
- 健康检查和疫苗计划
- 初期注意事项
- 社会化训练要点

### 示例 2: 健康问题

**你问**：
> 我的猫今天呕吐了2次，还不爱吃东西，需要马上去医院吗？

**AI 回答**：
- 使用 `catHealthAssessmentTool` 评估紧急程度
- 提供详细的症状分析
- 给出明确的就医建议
- 列出观察要点
- 说明何时需要紧急就医

### 示例 3: 品种咨询

**你问**：
> [上传英短照片] 这是什么品种？

**AI 回答**：
- 识别品种（英国短毛猫）
- 描述外观特征
- 说明性格特点
- 提供护理要点
- 列出常见健康问题

### 示例 4: 行为问题

**你问**：
> 我的猫半夜总是叫，影响睡眠，这是为什么？

**AI 回答**：
- 使用 `catBehaviorInterpretationTool` 分析原因
- 解释可能的原因（发情、无聊、疾病等）
- 提供解决方案
- 给出训练建议

## 🛠️ 工具说明

AI 助手配备了 4 个专业工具，会根据你的问题自动选择使用：

| 工具 | 用途 | 触发场景 |
|------|------|---------|
| **catHealthAssessmentTool** | 健康评估 | 描述症状、询问健康问题 |
| **catBreedInfoTool** | 品种信息 | 询问特定品种、品种对比 |
| **catNutritionAdviceTool** | 营养建议 | 咨询喂养、饮食计划 |
| **catBehaviorInterpretationTool** | 行为解读 | 询问行为含义、行为问题 |

## 💡 使用技巧

### 1. 提供详细信息

✅ **好的提问**：
```
我的猫5岁，布偶猫，已绝育，体重5公斤。
最近3天食欲下降，只吃平时一半的量。
今天呕吐了一次，呕吐物是猫粮。
精神比平时差，不爱玩了。
```

❌ **不好的提问**：
```
我的猫不舒服
```

### 2. 上传清晰图片

进行品种识别或健康评估时：
- ✅ 光线充足
- ✅ 猫咪居中
- ✅ 能看清五官和体型
- ❌ 避免模糊、昏暗的照片

### 3. 多轮对话

可以连续提问，AI 会记住上下文：

```
你: 我想养一只猫，性格温顺的
AI: [推荐几个品种]

你: 布偶猫适合新手吗？
AI: [详细说明]

你: 那需要花多少钱？
AI: [费用分析]
```

### 4. 紧急情况识别

当 AI 标注 🚨 时，表示紧急情况：
- 立即按建议行动
- 不要犹豫或等待
- 直接就医

## ⚠️ 重要声明

AI 助手提供的建议**仅供参考**，不能替代专业兽医诊断。

- ✅ 用于：日常咨询、知识学习、初步判断
- ❌ 不能：替代就医、诊断疾病、开处方药

**任何健康问题，请及时咨询专业兽医！**

## 📖 进阶学习

### 查看完整文档

- **README.md** - 详细的项目介绍和架构说明
- **USAGE_EXAMPLES.md** - 大量实际使用示例和代码
- **src/mastra/agents/cat-consultant-agent.ts** - Agent 配置和提示词
- **src/mastra/tools/cat-tools.ts** - 工具函数实现

### 自定义扩展

想添加新功能？

1. **添加品种**：编辑 `src/mastra/tools/cat-tools.ts` 中的 `CAT_BREEDS`
2. **创建工具**：参考现有工具，创建新的 `createTool`
3. **修改提示词**：编辑 `src/mastra/agents/cat-consultant-agent.ts`

详见 README.md 的"扩展开发"章节。

## 🔧 故障排除

### 问题 1: 启动失败

**错误**：`Error: Cannot find module ...`

**解决**：
```bash
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: API 报错

**错误**：`401 Unauthorized` 或 `Invalid API Key`

**解决**：
1. 检查 `.env` 文件是否存在
2. 确认 API Key 正确无误
3. 验证 API Key 是否有效（未过期）

### 问题 3: 响应缓慢

**原因**：
- 网络延迟
- OpenAI 服务器负载
- 图片文件过大

**建议**：
- 压缩图片后再上传
- 检查网络连接
- 耐心等待（通常 5-20 秒）

### 问题 4: 构建失败

**解决**：
```bash
npm run build
```

查看错误信息，通常是 TypeScript 类型问题。

## 🤝 获取帮助

遇到问题？

1. 查看 [常见问题](./README.md#注意事项)
2. 阅读 [使用示例](./USAGE_EXAMPLES.md)
3. 提交 Issue（如果是 bug）
4. 查看 Mastra 官方文档

## 📝 命令速查

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start

# 运行测试脚本
npm run test:cat-agent

# 安装依赖
npm install

# 检查 Node.js 版本
node --version
```

## 🎓 学习路线

1. ✅ **完成本快速入门** ← 你在这里
2. 📚 在 Playground 中试用各种场景
3. 💻 运行 `npm run test:cat-agent` 查看示例
4. 📖 阅读 USAGE_EXAMPLES.md 学习高级用法
5. 🛠️ 尝试自定义和扩展功能

---

**准备好了吗？开始使用吧！** 🚀

```bash
npm run dev
```

然后访问：http://localhost:4111/playground

**祝您和您的猫咪健康快乐！** 🐱💕
