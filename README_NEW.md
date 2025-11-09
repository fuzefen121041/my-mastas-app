# 🐱 猫咪健康咨询 AI 系统 (升级版)

这是一个功能完整的猫咪健康咨询AI平台，支持**图片上传、症状分析、智能诊断**，并通过**完整的Workflow**提供一站式咨询服务。

## 🆕 最新更新

### V2.0 核心改进

✅ **删除天气相关功能**
✅ **新增8个专业工具** - 从4个增加到8个
✅ **创建完整咨询Workflow** - 自动化的咨询流程
✅ **支持图片上传** - 品种识别、健康观察
✅ **前端上传界面** - 友好的用户交互
✅ **API端点** - 支持程序化调用

## 📋 完整功能列表

### 1. 专业工具（8个）

| 工具名称 | 功能 | 使用场景 |
|---------|------|---------|
| **catHealthAssessmentTool** | 健康评估 | 症状分析、紧急程度判断 |
| **catBreedInfoTool** | 品种信息 | 品种查询、特征介绍 |
| **catNutritionAdviceTool** | 营养建议 | 饮食计划、热量计算 |
| **catBehaviorInterpretationTool** | 行为解读 | 行为分析、训练建议 |
| **catDiseaseIdentificationTool** | 疾病识别 | 症状匹配、疾病库查询 |
| **catVaccineScheduleTool** | 疫苗计划 | 接种时间表、疫苗建议 |
| **catImageAnalysisTool** | 图片分析 | 辅助图片识别 |
| **catEmergencyAssessmentTool** | 紧急评估 | 快速判断是否需立即就医 |

### 2. 完整咨询Workflow

**流程**：图片上传 → 症状收集 → AI分析 → 生成建议

**步骤详解**：

1. **初始化咨询** - 创建咨询ID，记录时间
2. **图片分析** - 识别品种、观察健康状况
3. **紧急评估** - 检测危急症状，优先级判断
4. **症状分析** - 分类症状、评估严重程度
5. **生成建议** - 综合建议、后续跟进
6. **最终报告** - 完整的咨询报告

### 3. 数据库扩充

#### 疾病数据库（7种常见疾病）
- 猫瘟
- 猫杯状病毒
- 猫鼻支
- 泌尿系统疾病
- 慢性肾病
- 糖尿病
- 甲状腺机能亢进

#### 疫苗时间表
- 幼猫首次接种（8-9周）
- 幼猫加强免疫（12周）
- 成年猫年度接种
- 非核心疫苗

## 🚀 使用方式

### 方式1：Playground（推荐）

```bash
# 1. 启动服务
npm run dev

# 2. 访问Playground
http://localhost:4111/playground

# 3. 选择 catConsultantAgent

# 4. 上传图片并咨询
- 点击图片上传按钮
- 选择猫咪照片
- 输入症状描述
- 获取AI建议
```

### 方式2：前端上传页面（新）

```bash
# 1. 启动服务
npm run dev

# 2. 访问前端页面
http://localhost:4111/index.html

# 3. 使用界面
- 拖拽或点击上传图片
- 填写猫咪信息
- 添加症状标签
- 提交获取建议
```

**注意**: 前端页面需要配置API端点才能完整工作。当前为演示版本。

### 方式3：通过Workflow（程序化）

```typescript
import { mastra } from './src/mastra/index.js';

const workflow = mastra.workflows.catConsultationWorkflow;

const result = await workflow.execute({
  triggerData: {
    catName: '小橘',
    age: 3,
    weight: 5.2,
    hasImage: false,
    symptoms: ['呕吐', '食欲不振'],
    symptomsDuration: '2天',
    consultationType: 'health',
  },
});

console.log(result.results?.['generate-final-report']);
```

### 方式4：通过Agent + 图片

```typescript
import { mastra } from './src/mastra/index.js';

const agent = mastra.agents.catConsultantAgent;

const response = await agent.generate({
  messages: [{
    role: 'user',
    content: [
      {
        type: 'text',
        text: '我的猫出现呕吐，请帮我分析',
      },
      {
        type: 'image_url',
        image_url: {
          url: 'data:image/jpeg;base64,...', // 或图片URL
        },
      },
    ],
  }],
});
```

## 🧪 测试

### 测试Agent功能

```bash
npm run test:cat-agent
```

包含6个测试场景：
1. 基础咨询
2. 品种信息查询
3. 健康评估
4. 营养建议
5. 行为咨询
6. 多轮对话

### 测试Workflow功能（新）

```bash
npm run test:workflow
```

包含2个测试：
1. 完整Workflow流程
2. Agent图片咨询

## 📁 项目结构

```
my-mastra-app/
├── src/
│   ├── mastra/
│   │   ├── index.ts                          # 主配置（已更新）
│   │   ├── agents/
│   │   │   └── cat-consultant-agent.ts       # Agent（8个工具）
│   │   ├── tools/
│   │   │   └── cat-tools.ts                  # 8个专业工具
│   │   └── workflows/
│   │       └── cat-consultation-workflow.ts  # ✨ 新增Workflow
│   └── api/
│       └── consultation.ts                    # ✨ 新增API端点
│
├── public/
│   └── index.html                             # ✨ 新增前端上传界面
│
├── test-cat-agent.ts                          # Agent测试脚本
├── test-workflow.ts                           # ✨ 新增Workflow测试
│
├── README.md                                  # 原文档
├── README_NEW.md                              # ✨ 本文件（新版说明）
├── QUICK_START.md                             # 快速入门
├── USAGE_EXAMPLES.md                          # 使用示例
├── FEATURES.md                                # 功能详解
└── PROJECT_SUMMARY.md                         # 改造总结
```

## 🆚 V1 vs V2 对比

| 功能 | V1 | V2 |
|------|----|----|
| 专业工具 | 4个 | ✅ 8个 |
| Workflow | ❌ 无 | ✅ 完整6步流程 |
| 图片上传界面 | ❌ 无 | ✅ HTML页面 |
| API端点 | ❌ 无 | ✅ 咨询API |
| 疾病数据库 | ❌ 无 | ✅ 7种疾病 |
| 疫苗计划 | ❌ 无 | ✅ 完整时间表 |
| 紧急评估 | 部分 | ✅ 独立工具 |
| 天气功能 | ✅ 有 | ❌ 已删除 |

## 🎯 完整咨询示例

### 场景：猫咪呕吐，上传图片咨询

**1. 用户操作**：
```
- 上传猫咪照片（橘色短毛猫）
- 填写信息：
  · 名字：小橘
  · 年龄：3岁
  · 体重：5.2公斤
- 添加症状：呕吐、食欲不振
- 症状时间：2天
- 行为变化：精神比平时差
```

**2. Workflow自动执行**：

```
步骤1 - 初始化咨询
  ✓ 创建咨询ID: CONSULT-1234567890
  ✓ 记录时间戳

步骤2 - 图片分析
  ✓ 识别品种：可能是中华田园猫
  ✓ 健康观察：毛发光泽良好，无明显异常

步骤3 - 紧急情况评估
  ✓ 检测紧急症状：未发现
  ✓ 紧急程度：需要评估
  ✓ 可继续分析：是

步骤4 - 症状分析
  ✓ 症状分类：
    - 消化系统：呕吐、食欲不振
  ✓ 症状数量：2个
  ✓ 需要就医：是（症状2天）

步骤5 - 生成建议
  ✓ 优先级：24小时内就医
  ✓ 建议事项：
    - 密切观察症状变化
    - 记录呕吐频率和内容
    - 确保充足饮水
  ✓ 警告：建议24-48小时内就医检查

步骤6 - 生成最终报告
  ✓ 完整报告已生成
  ✓ 包含免责声明
```

**3. 输出报告**：

```json
{
  "consultationId": "CONSULT-1234567890",
  "timestamp": "2025-11-09T14:30:00Z",
  "catName": "小橘",
  "consultationType": "health",
  "basicInfo": {
    "age": 3,
    "weight": 5.2,
    "breed": "中华田园猫"
  },
  "imageAnalysis": {
    "analyzed": true,
    "breed": "中华田园猫",
    "findings": ["图片识别：可能是中华田园猫"],
    "observations": ["从图片看，猫咪的整体状况良好"]
  },
  "emergency": {
    "isEmergency": false,
    "urgencyLevel": "需要评估"
  },
  "symptoms": {
    "total": 2,
    "categorized": {
      "digestive": ["呕吐", "食欲不振"]
    },
    "duration": "2天",
    "needsVetVisit": true
  },
  "recommendations": {
    "priority": "NORMAL",
    "items": [
      "密切观察症状变化",
      "记录症状的时间、频率和严重程度",
      "成年猫营养：每日2-3餐，保持均衡饮食",
      "注意体重管理，理想体重范围：4-5公斤"
    ],
    "warnings": [
      "建议24-48小时内就医检查"
    ],
    "followUp": [
      "定期健康检查（每年1-2次）",
      "保持疫苗接种up-to-date",
      "如有任何新症状或变化，及时咨询"
    ]
  },
  "disclaimer": "⚠️ 本咨询结果仅供参考..."
}
```

## 🛠️ 开发扩展

### 添加新工具

```typescript
// src/mastra/tools/cat-tools.ts

export const yourNewTool = createTool({
  id: 'your-tool-id',
  description: '工具描述',
  inputSchema: z.object({
    // 输入参数
  }),
  outputSchema: z.object({
    // 输出结构
  }),
  execute: async ({ context }) => {
    // 实现逻辑
  },
});
```

### 自定义Workflow步骤

```typescript
// src/mastra/workflows/cat-consultation-workflow.ts

const yourCustomStep: Step = {
  id: 'your-custom-step',
  execute: async ({ context }) => {
    // 访问前面步骤的结果
    const previousResult = context.machineContext.stepResults?.['previous-step'];

    // 执行自定义逻辑
    return {
      // 返回结果
    };
  },
};

// 添加到workflow
catConsultationWorkflow
  .step(existingStep)
  .then(yourCustomStep) // 添加你的步骤
  .commit();
```

## ⚠️ 重要说明

1. **图片上传**
   - Mastra Playground 原生支持图片上传
   - 前端HTML页面需要配置API端点
   - 图片会被转换为base64发送给GPT-4o

2. **API调用**
   - 需要配置 OpenAI API Key
   - GPT-4o支持图片识别
   - API调用会产生费用

3. **医疗免责**
   - 所有建议仅供参考
   - 不能替代专业兽医诊断
   - 紧急情况请立即就医

## 📖 相关文档

- **QUICK_START.md** - 5分钟快速上手
- **USAGE_EXAMPLES.md** - 详细使用示例
- **FEATURES.md** - 功能特性详解
- **PROJECT_SUMMARY.md** - 项目改造总结

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

ISC

---

**升级完成！现在开始使用新功能吧！** 🎉

```bash
npm run dev
# 访问 http://localhost:4111/playground
```
