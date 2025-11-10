# 猫咪健康咨询 AI 助手

这是一个基于 Mastra 框架构建的专业猫咪健康咨询 AI 系统，提供全面的猫咪护理、健康评估、行为分析和营养建议服务。

## 功能特性

### 核心功能

1. **品种识别与知识分享**
   - 通过图片或描述识别猫咪品种
   - 提供详细的品种特征和护理要点
   - 说明常见健康问题和预防措施

2. **健康评估与监测**
   - 基于症状的健康状态评估
   - 紧急程度判断和就医建议
   - 常见疾病的识别和预防

3. **营养与喂养指导**
   - 个性化的饮食计划
   - 根据年龄、体重、活动水平定制建议
   - 特殊时期的营养管理

4. **行为理解与训练**
   - 解读猫咪的肢体语言
   - 行为问题分析和解决方案
   - 压力和焦虑管理

5. **基础护理指导**
   - 日常护理知识
   - 环境设置建议
   - 应急准备指导

## 目标用户

| 用户类型 | 使用场景 | 主要功能 |
|---------|---------|---------|
| **新手猫主** | 初次养猫，缺乏经验 | 品种识别、基础护理知识、行为理解 |
| **资深铲屎官** | 有养猫经验，追求科学喂养 | 健康监测、营养建议、疾病预防 |
| **宠物医疗工作者** | 兽医、宠物店员工 | 辅助诊断工具、客户教育资料 |
| **救助组织** | 流浪猫救助志愿者 | 快速品种判断、健康评估 |

## 技术架构

### 核心组件

- **Mastra Framework**: AI 应用框架
- **OpenAI GPT-4o**: 支持图片识别和文本理解
- **LibSQL**: 数据存储和记忆管理
- **Zod**: 数据验证和类型安全

### Agent 架构

```
catConsultantAgent
├── Tools (工具)
│   ├── catHealthAssessmentTool     # 健康评估工具
│   ├── catBreedInfoTool            # 品种信息查询工具
│   ├── catNutritionAdviceTool      # 营养建议工具
│   └── catBehaviorInterpretationTool # 行为解读工具
├── Memory                           # 对话记忆
└── Instructions                     # 专业指导提示词
```

## 快速开始

### 环境要求

- Node.js >= 20.9.0
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd my-mastra-app
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 创建 `.env` 文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，添加 OpenAI API Key：
```
OPENAI_API_KEY=your-openai-api-key-here
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**

服务启动后，打开浏览器访问 Mastra 提供的管理界面（通常是 `http://localhost:4111`）

### 使用方式

#### 方式一：通过 Mastra Playground

1. 启动服务后，访问 Mastra Playground
2. 选择 `catConsultantAgent`
3. 开始对话，可以：
   - 上传猫咪图片进行品种识别
   - 描述症状进行健康评估
   - 询问喂养和护理问题
   - 咨询行为问题

#### 方式二：通过 API 调用

```typescript
import { mastra } from './src/mastra';

// 获取 catConsultantAgent
const agent = mastra.agents.catConsultantAgent;

// 文字咨询
const textResponse = await agent.generate({
  messages: [{
    role: 'user',
    content: '我的猫咪最近不爱吃东西，应该怎么办？'
  }]
});

// 图片 + 文字咨询
const imageResponse = await agent.generate({
  messages: [{
    role: 'user',
    content: [
      {
        type: 'text',
        text: '请帮我看看这只猫是什么品种？'
      },
      {
        type: 'image_url',
        image_url: {
          url: 'https://example.com/cat-image.jpg'
        }
      }
    ]
  }]
});
```

## 工具说明

### 1. catHealthAssessmentTool

评估猫咪的健康状况，提供紧急程度判断和建议。

**输入参数**:
- `symptoms` (string[]): 症状列表
- `age` (number, 可选): 猫咪年龄
- `behaviorChanges` (string, 可选): 行为变化描述

**输出**:
- 紧急程度（低/中/高/紧急）
- 健康评估
- 具体建议
- 警告信息

### 2. catBreedInfoTool

查询猫咪品种的详细信息。

**输入参数**:
- `breed` (string): 品种名称

**输出**:
- 品种特征
- 护理要点
- 常见健康问题
- 寿命信息

### 3. catNutritionAdviceTool

提供个性化的营养建议。

**输入参数**:
- `age` (number): 年龄（岁）
- `weight` (number): 体重（公斤）
- `activityLevel` (enum): 活动水平（低/中/高）
- `specialNeeds` (string[], 可选): 特殊需求

**输出**:
- 生命阶段
- 每日热量需求
- 喂养建议
- 营养提示

### 4. catBehaviorInterpretationTool

解读猫咪的行为含义。

**输入参数**:
- `behavior` (string): 行为描述

**输出**:
- 行为解释
- 可能原因
- 应对建议

## 使用示例

### 示例 1: 品种识别

**用户**: [上传猫咪图片] "这是什么品种的猫？"

**AI 助手**:
```
根据您提供的图片，这只猫咪看起来是英国短毛猫。

品种特征：
- 圆圆的脸型和大眼睛
- 短而密集的毛发
- 体型强壮，肌肉发达
- 性格温顺友好

护理要点：
- 每周梳毛1-2次即可
- 注意控制体重，避免肥胖
- 定期检查关节健康
- 提供足够的活动空间

健康注意事项：
- 容易发生的问题：肥胖、心脏病、多囊肾病
- 建议定期体检，尤其关注心脏和肾脏
- 平均寿命：12-17年

您有关于这个品种的其他问题吗？
```

### 示例 2: 健康咨询

**用户**: "我的猫咪今天突然呕吐了3次，还不吃东西，应该怎么办？"

**AI 助手**:
```
感谢您的详细描述。根据您提供的信息，我来分析一下情况：

初步评估：
频繁呕吐且食欲不振可能表示消化系统问题、误食异物、或其他疾病。

紧急程度：高

建议行动：
1. 建议24小时内就医检查
2. 暂停喂食4-6小时，观察呕吐是否继续
3. 确保有清洁的饮用水
4. 记录呕吐物的颜色和内容
5. 观察是否有其他症状（如：腹泻、嗜睡、发烧）

⚠️ 重要提示：
此建议仅供参考，不能替代专业兽医的诊断。鉴于症状的严重性，强烈建议尽快就医，以排除严重疾病的可能性。

如果出现以下情况，请立即就医：
- 持续呕吐无法停止
- 呕吐物中有血
- 猫咪极度虚弱或脱水
- 体温异常
- 呼吸困难

还有其他需要了解的吗？
```

### 示例 3: 行为咨询

**用户**: "我的猫总是在沙发上磨爪子，怎么改掉这个习惯？"

**AI 助手**:
```
您提到的磨爪行为是猫咪的自然本能，我们来分析一下：

行为含义：
磨爪是猫咪的正常行为，用于：
- 维护爪子健康，去除老旧的角质层
- 标记领地（爪垫有气味腺）
- 伸展肌肉和关节
- 释放压力和能量

可能原因：
- 猫抓板位置不佳或不吸引
- 沙发材质符合猫咪偏好
- 缺乏替代的磨爪选择
- 这是它的习惯标记点

应对建议：
1. 在沙发旁放置高质量的猫抓板或猫爬架
2. 在猫抓板上喷洒猫薄荷增加吸引力
3. 用铝箔或双面胶暂时保护沙发（猫咪不喜欢这些材质）
4. 当猫咪使用猫抓板时给予奖励和表扬
5. 提供多样的猫抓板（垂直、水平、不同材质）
6. 定期修剪指甲（每2-3周）

重要：
- 不要惩罚猫咪磨爪，这是它的自然需求
- 耐心引导到合适的地方
- 给予足够的替代选择

通常需要2-4周的时间来改变习惯，保持耐心和一致性很重要！
```

## 项目结构

```
my-mastra-app/
├── src/
│   └── mastra/
│       ├── index.ts                    # Mastra 主
│       ├── agents/
│       │   ├── cat-consultant-agent.ts # 猫咪咨询 Agent
│       │   └── weather-agent.ts        # (原有) 天气 Agent
│       ├── tools/
│       │   ├── cat-tools.ts            # 猫咪咨询工具集
│       │   └── weather-tool.ts         # (原有) 天气工具
│       ├── workflows/
│       │   └── weather-workflow.ts     # (原有) 工作流
│       └── scorers/
│           └── weather-scorer.ts       # (原有) 评分器
├── package.json
├── tsconfig.json
├── .env                                # 环境变量配置
└── README.md                           # 项目文档
```

## 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start

# 运行测试
npm test
```

## 注意事项

### 重要声明

这个 AI 助手提供的所有建议仅供参考，**不能替代专业兽医的诊断和治疗**。

- 对于任何健康问题，请及时咨询专业兽医
- 紧急情况下，请立即就医
- 不要根据 AI 建议自行用药

### 数据隐私

- 对话记录存储在本地数据库（LibSQL）
- 图片数据仅用于分析，不会永久存储
- 请遵守相关隐私法规

### 限制说明

- 图片识别依赖于 AI 模型，可能存在误判
- 品种数据库目前包含主流品种，可能不包括所有稀有品种
- 健康评估基于症状描述，无法替代实际检查

## 扩展开发

### 添加新的猫咪品种

编辑 `src/mastra/tools/cat-tools.ts`，在 `CAT_BREEDS` 对象中添加新品种：

```typescript
const CAT_BREEDS = {
  // 现有品种...
  '新品种名称': {
    characteristics: '品种特征',
    care: '护理要点',
    commonIssues: '常见问题',
    lifespan: '寿命',
  },
};
```

### 添加新的工具

在 `src/mastra/tools/cat-tools.ts` 中创建新工具：

```typescript
export const newCatTool = createTool({
  id: 'tool-id',
  description: '工具描述',
  inputSchema: z.object({
    // 定义输入结构
  }),
  outputSchema: z.object({
    // 定义输出结构
  }),
  execute: async ({ context }) => {
    // 实现工具逻辑
  },
});
```

然后在 `cat-consultant-agent.ts` 中注册工具。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

ISC

## 联系方式

如有问题或建议，请通过 Issue 与我们联系。

---

**祝您和您的猫咪健康快乐！** 🐱
