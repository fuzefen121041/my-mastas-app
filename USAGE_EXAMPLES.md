# 猫咪咨询 AI 助手 - 使用示例

本文档提供详细的使用示例，帮助您快速上手猫咪咨询 AI 助手。

## 目录

1. [启动服务](#启动服务)
2. [通过 Playground 使用](#通过-playground-使用)
3. [通过代码调用](#通过代码调用)
4. [实际场景示例](#实际场景示例)

## 启动服务

### 1. 配置环境

确保已配置 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，添加你的 OpenAI API Key
# OPENAI_API_KEY=sk-...
```

### 2. 启动开发服务器

```bash
npm run dev
```

服务启动后，你会看到类似的输出：

```
INFO [Mastra]: Server started on http://localhost:4111
INFO [Mastra]: Playground available at http://localhost:4111/playground
```

## 通过 Playground 使用

### 访问 Playground

打开浏览器访问：`http://localhost:4111/playground`

### 选择 Agent

在 Agent 选择器中选择 **catConsultantAgent**

### 开始对话

#### 场景 1: 品种识别

**Step 1**: 点击上传图片按钮，选择猫咪照片

**Step 2**: 输入提问
```
请帮我看看这只猫是什么品种？
```

**Step 3**: 发送消息，查看 AI 分析结果

#### 场景 2: 健康咨询

**输入**:
```
我的猫咪3岁，最近2天食欲不振，今天还呕吐了一次，精神也不太好，该怎么办？
```

AI 会自动调用 `catHealthAssessmentTool` 进行评估，并提供建议。

#### 场景 3: 行为问题

**输入**:
```
我的猫最近总是半夜叫，影响睡眠，这是什么原因？应该怎么办？
```

AI 会调用 `catBehaviorInterpretationTool` 解释行为并给出建议。

#### 场景 4: 营养咨询

**输入**:
```
我的猫咪刚做完绝育手术，5岁，体重4.5公斤，活动量中等，应该怎么调整饮食？
```

AI 会调用 `catNutritionAdviceTool` 提供个性化的营养建议。

## 通过代码调用

### 基础用法

创建一个测试文件 `test-cat-agent.ts`：

```typescript
import { mastra } from './src/mastra';

async function testCatAgent() {
  const agent = mastra.agents.catConsultantAgent;

  // 简单文字咨询
  const response = await agent.generate({
    messages: [{
      role: 'user',
      content: '我是新手猫主，刚领养了一只小猫，需要准备什么？'
    }]
  });

  console.log('AI 回复:', response.text);
}

testCatAgent().catch(console.error);
```

运行：
```bash
npx tsx test-cat-agent.ts
```

### 图片识别示例

```typescript
import { mastra } from './src/mastra';
import * as fs from 'fs';
import * as path from 'path';

async function identifyCatBreed(imagePath: string) {
  const agent = mastra.agents.catConsultantAgent;

  // 读取图片并转换为 base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = path.extname(imagePath) === '.png' ? 'image/png' : 'image/jpeg';

  const response = await agent.generate({
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: '请详细分析这只猫的品种、健康状况和外观特征'
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        }
      ]
    }]
  });

  console.log('分析结果:', response.text);
}

// 使用示例
identifyCatBreed('./path/to/cat-image.jpg').catch(console.error);
```

### 多轮对话示例

```typescript
import { mastra } from './src/mastra';

async function multiTurnConversation() {
  const agent = mastra.agents.catConsultantAgent;

  const messages = [];

  // 第一轮
  messages.push({
    role: 'user' as const,
    content: '我想了解布偶猫的特点'
  });

  let response = await agent.generate({ messages });
  console.log('AI:', response.text);

  // 添加 AI 回复到历史
  messages.push({
    role: 'assistant' as const,
    content: response.text
  });

  // 第二轮 - 继续讨论
  messages.push({
    role: 'user' as const,
    content: '布偶猫适合新手养吗？'
  });

  response = await agent.generate({ messages });
  console.log('AI:', response.text);

  // 第三轮 - 深入了解
  messages.push({
    role: 'assistant' as const,
    content: response.text
  });

  messages.push({
    role: 'user' as const,
    content: '那布偶猫每天需要梳毛多久？'
  });

  response = await agent.generate({ messages });
  console.log('AI:', response.text);
}

multiTurnConversation().catch(console.error);
```

### 使用特定工具

虽然 AI 会自动决定使用哪个工具，但你也可以通过提示引导：

```typescript
import { mastra } from './src/mastra';

async function useSpecificTool() {
  const agent = mastra.agents.catConsultantAgent;

  // 引导使用健康评估工具
  const healthResponse = await agent.generate({
    messages: [{
      role: 'user',
      content: `我的猫有以下症状，请帮我评估健康状况：
      - 食欲不振已经3天
      - 今天呕吐2次
      - 精神萎靡
      - 猫咪5岁，平时很活泼
      `
    }]
  });
  console.log('健康评估:', healthResponse.text);

  // 引导使用品种信息工具
  const breedResponse = await agent.generate({
    messages: [{
      role: 'user',
      content: '请详细介绍英国短毛猫的品种信息'
    }]
  });
  console.log('品种信息:', breedResponse.text);

  // 引导使用营养建议工具
  const nutritionResponse = await agent.generate({
    messages: [{
      role: 'user',
      content: `请为我的猫制定营养计划：
      - 年龄：2岁
      - 体重：4公斤
      - 活动水平：高（很活泼）
      - 已绝育
      `
    }]
  });
  console.log('营养建议:', nutritionResponse.text);

  // 引导使用行为解读工具
  const behaviorResponse = await agent.generate({
    messages: [{
      role: 'user',
      content: '我的猫经常踩奶，这是什么意思？'
    }]
  });
  console.log('行为解读:', behaviorResponse.text);
}

useSpecificTool().catch(console.error);
```

## 实际场景示例

### 场景 1: 新手猫主第一天

```typescript
async function newCatOwnerDay1() {
  const agent = mastra.agents.catConsultantAgent;

  console.log('=== 新手猫主第一天 ===\n');

  // 问题1: 基础准备
  console.log('问题1: 刚把小猫接回家，需要注意什么？');
  let response = await agent.generate({
    messages: [{
      role: 'user',
      content: '我今天刚从朋友那里接回一只2个月大的小猫，这是我第一次养猫，需要注意什么？家里需要准备什么？'
    }]
  });
  console.log('AI回复:', response.text, '\n');

  // 问题2: 喂养
  console.log('问题2: 应该怎么喂养？');
  response = await agent.generate({
    messages: [{
      role: 'user',
      content: '2个月大的小猫应该吃什么？每天喂几次？每次喂多少？'
    }]
  });
  console.log('AI回复:', response.text, '\n');

  // 问题3: 健康
  console.log('问题3: 需要打疫苗吗？');
  response = await agent.generate({
    messages: [{
      role: 'user',
      content: '小猫需要打疫苗吗？什么时候打？打哪些疫苗？'
    }]
  });
  console.log('AI回复:', response.text, '\n');
}
```

### 场景 2: 紧急健康问题

```typescript
async function emergencyHealthIssue() {
  const agent = mastra.agents.catConsultantAgent;

  console.log('=== 紧急健康问题 ===\n');

  const response = await agent.generate({
    messages: [{
      role: 'user',
      content: `紧急情况！我的猫出现以下症状：
      - 呼吸急促
      - 嘴唇发白
      - 无法站立
      - 一直喵喵叫，好像很痛苦

      这是怎么回事？我该怎么办？`
    }]
  });

  console.log('AI紧急评估:', response.text, '\n');
}
```

### 场景 3: 完整的品种咨询

```typescript
async function completeBreedConsultation() {
  const agent = mastra.agents.catConsultantAgent;

  const messages = [];

  console.log('=== 完整品种咨询 ===\n');

  // 第一步：品种咨询
  console.log('步骤1: 我想养一只猫，在考虑品种');
  messages.push({
    role: 'user' as const,
    content: '我想养猫，性格温顺、不太吵闹的品种有哪些推荐？我住公寓。'
  });

  let response = await agent.generate({ messages });
  console.log('AI:', response.text, '\n');
  messages.push({ role: 'assistant' as const, content: response.text });

  // 第二步：选定品种，深入了解
  console.log('步骤2: 我对布偶猫感兴趣');
  messages.push({
    role: 'user' as const,
    content: '布偶猫听起来不错，能详细介绍一下吗？'
  });

  response = await agent.generate({ messages });
  console.log('AI:', response.text, '\n');
  messages.push({ role: 'assistant' as const, content: response.text });

  // 第三步：护理问题
  console.log('步骤3: 布偶猫的护理');
  messages.push({
    role: 'user' as const,
    content: '布偶猫的长毛好打理吗？每天需要花多少时间护理？'
  });

  response = await agent.generate({ messages });
  console.log('AI:', response.text, '\n');
  messages.push({ role: 'assistant' as const, content: response.text });

  // 第四步：健康问题
  console.log('步骤4: 健康注意事项');
  messages.push({
    role: 'user' as const,
    content: '布偶猫容易生病吗？有什么常见的健康问题需要注意？'
  });

  response = await agent.generate({ messages });
  console.log('AI:', response.text, '\n');
}
```

### 场景 4: 行为问题解决

```typescript
async function behaviorProblemSolving() {
  const agent = mastra.agents.catConsultantAgent;
  const messages = [];

  console.log('=== 行为问题解决 ===\n');

  // 描述问题
  console.log('问题描述: 猫咪乱尿');
  messages.push({
    role: 'user' as const,
    content: '我的猫最近总是在床上尿尿，已经3次了，以前从来不这样，这是怎么回事？'
  });

  let response = await agent.generate({ messages });
  console.log('AI分析:', response.text, '\n');
  messages.push({ role: 'assistant' as const, content: response.text });

  // 提供更多信息
  console.log('追加信息');
  messages.push({
    role: 'user' as const,
    content: `补充一些信息：
    - 猫咪3岁，已绝育
    - 最近家里来了客人住了几天
    - 猫砂盆位置没有改变
    - 吃喝正常，精神也还好
    `
  });

  response = await agent.generate({ messages });
  console.log('AI深度分析:', response.text, '\n');
  messages.push({ role: 'assistant' as const, content: response.text });

  // 询问解决方案
  console.log('询问解决方案');
  messages.push({
    role: 'user' as const,
    content: '明白了，具体应该怎么做来改善这个问题？'
  });

  response = await agent.generate({ messages });
  console.log('AI解决方案:', response.text, '\n');
}
```

## 运行完整示例

创建一个完整的测试脚本 `examples.ts`：

```typescript
import { mastra } from './src/mastra';

// 导入上面的所有示例函数...

async function runAllExamples() {
  console.log('开始运行所有示例...\n');

  try {
    await newCatOwnerDay1();
    console.log('\n' + '='.repeat(50) + '\n');

    await emergencyHealthIssue();
    console.log('\n' + '='.repeat(50) + '\n');

    await completeBreedConsultation();
    console.log('\n' + '='.repeat(50) + '\n');

    await behaviorProblemSolving();

    console.log('\n所有示例运行完成！');
  } catch (error) {
    console.error('示例运行出错:', error);
  }
}

// 运行示例
runAllExamples();
```

运行：
```bash
npx tsx examples.ts
```

## 提示和技巧

### 1. 提供详细信息

越详细的信息，AI 能给出越准确的建议：

✅ 好的提问：
```
我的猫咪5岁，布偶猫，已绝育，体重5.5公斤。
最近3天食欲下降，只吃平时一半的量。
今天早上呕吐了一次，呕吐物是未消化的猫粮。
精神状态比平时差，不太爱动。
有点轻微腹泻，软便。
```

❌ 不好的提问：
```
我的猫不舒服，怎么办？
```

### 2. 上传清晰的图片

用于品种识别或健康评估时：
- 确保光线充足
- 猫咪处于图片中心
- 能看清楚五官和体型
- 多角度更好（正面、侧面）

### 3. 遵循 AI 的建议流程

当 AI 提出需要更多信息时，尽量提供：

```
AI: "为了更好地评估，请告诉我猫咪的年龄、品种和症状持续时间"
你: [提供详细信息]
```

### 4. 紧急情况立即就医

当 AI 标注为 🚨 紧急情况时，请：
1. 立即按 AI 建议行动
2. 不要等待或观察
3. 直接就医

## 常见问题

### Q1: AI 没有调用工具？

确保你的提问明确，例如：
- "评估健康状况" → 会调用 healthAssessmentTool
- "介绍品种" → 会调用 breedInfoTool
- "制定饮食计划" → 会调用 nutritionAdviceTool
- "解释行为" → 会调用 behaviorInterpretationTool

### Q2: 图片识别不准确？

检查：
- 图片是否清晰
- 猫咪特征是否明显
- 尝试提供多张不同角度的图片

### Q3: 响应时间较长？

正常情况：
- 文字咨询：3-10秒
- 图片分析：10-20秒
- 使用工具：5-15秒

如果超时，检查：
- 网络连接
- OpenAI API 状态
- API Key 额度

## 下一步

- 查看 [README.md](./README.md) 了解项目架构
- 阅读 [开发指南](#) 学习如何扩展功能
- 加入社区讨论使用心得

---

祝您使用愉快！ 🐱
