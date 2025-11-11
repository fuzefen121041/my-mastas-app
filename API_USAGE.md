# API 使用指南

## 🌐 API 端点说明

### 基础 URL

**本地开发:**
```
http://localhost:4111
```

**生产环境 (Cloudflare Pages):**
```
https://mastra-cat-consultation.pages.dev
```

---

## 📡 可用端点

### 1. Web UI 测试界面 (推荐新手使用)

```
GET /playground
```

**功能:**
- 可视化测试所有 Agent 和 Workflow
- 支持图片上传
- 实时查看响应
- 无需编写代码

**访问方式:**agents/catConsultantAgent
```bash
# 本地
http://localhost:4111/playground

# 生产
https://mastra-cat-consultation.pages.dev/playground
```

---

### 2. Agent API - 文字咨询

```
POST /api/agents/catConsultantAgent/generate
```

**请求示例 (cURL):**
```bash
curl -X POST http://localhost:4111/api/agents/catConsultantAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "我的猫咪最近不爱吃东西,应该怎么办?"
      }
    ]
  }'
```

**请求示例 (JavaScript/TypeScript):**
```typescript
const response = await fetch('http://localhost:4111/api/agents/catConsultantAgent/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: '我的猫咪最近不爱吃东西,应该怎么办?'
      }
    ]
  })
});

const data = await response.json();
console.log(data.text);
```

**请求示例 (Python):**
```python
import requests

url = "http://localhost:4111/api/agents/catConsultantAgent/generate"
payload = {
    "messages": [
        {
            "role": "user",
            "content": "我的猫咪最近不爱吃东西,应该怎么办?"
        }
    ]
}

response = requests.post(url, json=payload)
print(response.json()['text'])
```

**响应示例:**
```json
{
  "text": "根据您描述的情况,猫咪食欲不振可能有多种原因...",
  "model": "openai/gpt-4o",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 300,
    "totalTokens": 450
  }
}
```

---

### 3. Agent API - 图片 + 文字咨询

```
POST /api/agents/catConsultantAgent/generate
```

**请求示例 (cURL):**
```bash
curl -X POST http://localhost:4111/api/agents/catConsultantAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "请帮我看看这只猫是什么品种?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
            }
          }
        ]
      }
    ]
  }'
```

**请求示例 (JavaScript - 从文件上传):**
```typescript
// 读取图片文件并转为 base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 上传并咨询
async function consultWithImage(file: File, question: string) {
  const base64Image = await fileToBase64(file);

  const response = await fetch('http://localhost:4111/api/agents/catConsultantAgent/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: question },
            {
              type: 'image_url',
              image_url: { url: base64Image }
            }
          ]
        }
      ]
    })
  });

  return await response.json();
}

// 使用示例
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const result = await consultWithImage(file, "这是什么品种的猫?");
console.log(result.text);
```

**请求示例 (Python - 从文件上传):**
```python
import requests
import base64

def consult_with_image(image_path: str, question: str):
    # 读取图片并转为 base64
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')

    url = "http://localhost:4111/api/agents/catConsultantAgent/generate"
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": question
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    }
                ]
            }
        ]
    }

    response = requests.post(url, json=payload)
    return response.json()['text']

# 使用示例
result = consult_with_image("cat.jpg", "这是什么品种的猫?")
print(result)
```

---

### 4. Workflow API - 完整咨询流程

```
POST /api/workflows/catConsultationWorkflow/execute
```

**请求示例 (cURL):**
```bash
curl -X POST http://localhost:4111/api/workflows/catConsultationWorkflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "triggerData": {
      "catName": "小花",
      "age": 3,
      "weight": 4.5,
      "breed": "英国短毛猫",
      "symptoms": ["食欲不振", "精神萎靡"],
      "consultationType": "health",
      "additionalNotes": "已经持续2天了"
    }
  }'
```

**请求示例 (JavaScript/TypeScript):**
```typescript
const response = await fetch('http://localhost:4111/api/workflows/catConsultationWorkflow/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    triggerData: {
      catName: '小花',
      age: 3,
      weight: 4.5,
      breed: '英国短毛猫',
      symptoms: ['食欲不振', '精神萎靡'],
      consultationType: 'health',
      additionalNotes: '已经持续2天了'
    }
  })
});

const data = await response.json();
console.log(data.results);
```

**响应示例:**
```json
{
  "results": {
    "initialize-consultation": {
      "consultationId": "CONSULT-1731283200000",
      "timestamp": "2025-11-11T00:00:00.000Z",
      "catProfile": { ... }
    },
    "analyze-image": {
      "imageAnalysis": "未提供图片"
    },
    "assess-emergency": {
      "urgency": "high",
      "recommendation": "建议24小时内就医"
    },
    "generate-final-report": {
      "consultationId": "CONSULT-1731283200000",
      "report": {
        "summary": "...",
        "assessment": "...",
        "recommendations": [...]
      }
    }
  }
}
```

---

### 5. 健康检查

```
GET /health
```

**请求示例:**
```bash
curl http://localhost:4111/health
```

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T00:00:00.000Z"
}
```

---

## 🔧 Workflow 输入参数详解

### consultationType 类型

| 值 | 说明 | 适用场景 |
|----|------|---------|
| `health` | 健康咨询 | 疾病症状、身体检查、健康评估 |
| `nutrition` | 营养咨询 | 饮食计划、喂养建议、体重管理 |
| `behavior` | 行为咨询 | 行为问题、训练指导、心理健康 |
| `general` | 一般咨询 | 品种识别、日常护理、其他问题 |

### 完整参数说明

```typescript
interface ConsultationInput {
  // 基本信息
  catName?: string;              // 猫咪名字
  age?: number;                  // 年龄(岁)
  ageInWeeks?: number;           // 年龄(周,用于幼猫)
  weight?: number;               // 体重(公斤)
  breed?: string;                // 品种

  // 图片(二选一)
  imageBase64?: string;          // Base64编码的图片
  imageUrl?: string;             // 图片URL

  // 健康相关
  symptoms?: string[];           // 症状列表
  symptomsDuration?: string;     // 症状持续时间
  behaviorChanges?: string;      // 行为变化描述

  // 咨询类型(必填)
  consultationType: 'health' | 'nutrition' | 'behavior' | 'general';

  // 其他
  additionalNotes?: string;      // 额外说明
}
```

---

## 🚀 快速测试

### 测试 1: 简单文字咨询

```bash
curl -X POST http://localhost:4111/api/agents/catConsultantAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"猫咪可以吃巧克力吗?"}]}'
```

### 测试 2: 健康评估

```bash
curl -X POST http://localhost:4111/api/workflows/catConsultationWorkflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "triggerData": {
      "catName": "测试猫",
      "symptoms": ["呕吐"],
      "consultationType": "health"
    }
  }'
```

---

## 🔐 生产环境配置

### 1. 部署到 Cloudflare Pages

```bash
# 登录 Cloudflare
npx wrangler login

# 配置环境变量
npm run pages:secret
# 输入你的 OPENAI_API_KEY

# 部署
npm run pages:deploy
```

### 2. 获取生产 URL

部署成功后,你会得到类似以下的 URL:
```
https://mastra-cat-consultation-xxx.pages.dev
```

### 3. 使用生产 API

将所有请求的 `localhost:4111` 替换为你的生产域名:

```bash
curl -X POST https://mastra-cat-consultation.pages.dev/api/agents/catConsultantAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"猫咪可以吃巧克力吗?"}]}'
```

---

## ⚠️ 注意事项

### 图片大小限制

- 建议图片大小 < 5MB
- 支持格式: JPEG, PNG, WebP
- Base64 编码会增加约 33% 的大小

### 速率限制

- Cloudflare Pages 免费版: 100,000 请求/天
- OpenAI API: 根据你的配额限制

### 超时设置

- 默认超时: 30 秒
- 如果请求较复杂可能需要更长时间

### 错误处理

所有 API 错误都会返回标准格式:

```json
{
  "error": {
    "message": "错误描述",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## 📚 完整示例项目

### React 前端示例

```typescript
// components/CatConsultation.tsx
import { useState } from 'react';

export function CatConsultation() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/agents/catConsultantAgent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        })
      });

      const data = await res.json();
      setResponse(data.text);
    } catch (error) {
      console.error('Error:', error);
      setResponse('发生错误,请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入你的问题..."
        />
        <button type="submit" disabled={loading}>
          {loading ? '咨询中...' : '提交咨询'}
        </button>
      </form>
      {response && (
        <div className="response">
          <h3>AI 回复:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🆘 故障排查

### 问题 1: 连接被拒绝

**解决:**
```bash
# 确保服务正在运行
npm run dev

# 检查端口是否被占用
netstat -an | grep 4111
```

### 问题 2: API Key 错误

**解决:**
```bash
# 检查环境变量
cat .dev.vars

# 重新设置
echo "OPENAI_API_KEY=sk-your-key-here" > .dev.vars
```

### 问题 3: 图片上传失败

**解决:**
- 检查图片格式是否支持
- 确认 Base64 编码正确
- 验证图片大小 < 5MB

---

## 📞 获取帮助

- 查看项目 README: `README.md`
- 查看部署文档: `DEPLOY_TO_CLOUDFLARE.md`
- 查看功能文档: `FEATURES.md`

---

**祝你使用愉快!** 🐱
