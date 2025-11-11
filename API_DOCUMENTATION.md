# Cat Consultation AI - API Documentation

## Base URL

**Production**: `https://cat-consultation-ai.fuzefen121.workers.dev`

**Local Development**: `http://localhost:8787`

## Authentication

目前无需认证。API 使用预配置的 OpenAI API Key。

## CORS

所有端点都支持 CORS，允许跨域请求。

## API Endpoints

### 1. 健康检查

检查 API 服务状态。

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T03:23:48.301Z"
}
```

**Status Codes**:
- `200 OK` - 服务正常

---

### 2. 简单咨询

快速的猫咪健康咨询，直接调用 AI Agent。

**Endpoint**: `POST /api/consultation`

**Request Body**:
```typescript
interface ConsultationRequest {
  // 猫咪基本信息
  catName?: string;           // 猫咪名字
  age?: number;               // 年龄（岁）
  ageInWeeks?: number;        // 年龄（周）- 用于幼猫
  weight?: number;            // 体重（公斤）
  breed?: string;             // 品种

  // 图片信息（可选）
  imageBase64?: string;       // base64 编码的图片
  imageUrl?: string;          // 图片 URL

  // 症状和咨询
  symptoms?: string[];        // 症状列表
  symptomsDuration?: string;  // 症状持续时间
  behaviorChanges?: string;   // 行为变化描述
  consultationType: 'health' | 'nutrition' | 'behavior' | 'general';  // 咨询类型
  additionalNotes?: string;   // 额外备注
}
```

**Example Request**:
```json
{
  "catName": "小白",
  "age": 2,
  "weight": 4.5,
  "consultationType": "health",
  "symptoms": ["食欲不振", "精神萎靡"],
  "symptomsDuration": "2天",
  "additionalNotes": "最近天气变化比较大"
}
```

**Example Request with Image**:
```json
{
  "catName": "小花",
  "age": 1,
  "consultationType": "general",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "additionalNotes": "帮我看看这是什么品种"
}
```

**Response**:
```typescript
interface ConsultationResponse {
  success: boolean;
  consultationId?: string;
  report?: {
    text: string;
    timestamp: string;
  };
  error?: string;
}
```

**Example Success Response**:
```json
{
  "success": true,
  "consultationId": "CONSULT-1699876543210",
  "report": {
    "text": "根据您描述的症状，小白可能出现了...",
    "timestamp": "2025-11-11T03:25:00.000Z"
  }
}
```

**Example Error Response**:
```json
{
  "success": false,
  "error": "咨询处理失败"
}
```

**Status Codes**:
- `200 OK` - 请求成功（包括业务错误）
- `500 Internal Server Error` - 服务器错误

---

### 3. 完整咨询（Workflow）

使用多步骤 Workflow 进行深度咨询，包括图片分析、紧急评估等。

**Endpoint**: `POST /api/consultation/workflow`

**Request Body**: 与简单咨询相同（`ConsultationRequest`）

**Response**:
```typescript
interface ConsultationResponse {
  success: boolean;
  consultationId?: string;
  report?: {
    consultationId: string;
    timestamp: string;
    catInfo: {
      name?: string;
      age?: number;
      weight?: number;
      breed?: string;
    };
    imageAnalysis?: {
      breedIdentification?: string;
      healthObservations?: string;
      confidence?: string;
    };
    emergencyAssessment?: {
      isEmergency: boolean;
      urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
      immediateActions?: string[];
      criticalSymptoms?: string[];
    };
    recommendations?: string[];
    disclaimer?: string;
  };
  error?: string;
}
```

**Example Success Response**:
```json
{
  "success": true,
  "consultationId": "CONSULT-1699876543210",
  "report": {
    "consultationId": "CONSULT-1699876543210",
    "timestamp": "2025-11-11T03:25:00.000Z",
    "catInfo": {
      "name": "小白",
      "age": 2,
      "weight": 4.5
    },
    "emergencyAssessment": {
      "isEmergency": false,
      "urgencyLevel": "medium",
      "immediateActions": ["观察食欲变化", "监测体温"]
    },
    "recommendations": [
      "建议24小时内就医检查",
      "保持水分摄入",
      "记录症状变化"
    ],
    "disclaimer": "本咨询仅供参考，不能替代专业兽医诊断"
  }
}
```

**Status Codes**:
- `200 OK` - 请求成功
- `500 Internal Server Error` - 服务器错误

---

## 咨询类型说明

### `health` - 健康咨询
用于疾病症状、健康问题咨询。

**适用场景**:
- 猫咪生病了
- 出现异常症状
- 需要健康评估

### `nutrition` - 营养咨询
用于饮食、营养相关问题。

**适用场景**:
- 喂养建议
- 食物选择
- 营养搭配

### `behavior` - 行为咨询
用于行为问题分析。

**适用场景**:
- 行为异常
- 训练问题
- 情绪问题

### `general` - 综合咨询
用于一般性问题。

**适用场景**:
- 品种识别
- 日常护理
- 综合建议

---

## 图片上传说明

### 支持的格式
- JPEG
- PNG
- WebP

### 图片大小限制
- 建议: < 5MB
- 最大: 取决于 Cloudflare Workers 请求体限制（通常 100MB）

### 图片编码方式

#### 方式 1: Base64 编码（推荐）
```javascript
// 前端示例
const file = event.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target.result; // data:image/jpeg;base64,...
  // 发送到 API
  fetch('/api/consultation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      consultationType: 'general'
    })
  });
};
reader.readAsDataURL(file);
```

#### 方式 2: 图片 URL
```json
{
  "imageUrl": "https://example.com/cat.jpg",
  "consultationType": "general"
}
```

---

## 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "咨询处理失败" | AI 服务错误 | 重试请求 |
| "Workflow执行失败" | Workflow 执行错误 | 检查请求参数 |
| "Invalid request body" | 请求体格式错误 | 检查 JSON 格式 |
| "Internal Server Error" | 服务器内部错误 | 联系管理员 |

---

## 使用示例

### JavaScript/TypeScript

```typescript
// 简单咨询
async function simpleConsultation() {
  const response = await fetch('https://cat-consultation-ai.fuzefen121.workers.dev/api/consultation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      catName: '小白',
      age: 2,
      consultationType: 'health',
      symptoms: ['食欲不振']
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('咨询结果:', data.report.text);
  } else {
    console.error('错误:', data.error);
  }
}

// 带图片的咨询
async function consultationWithImage(imageFile: File) {
  // 转换图片为 base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(imageFile);
  });

  const response = await fetch('https://cat-consultation-ai.fuzefen121.workers.dev/api/consultation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      consultationType: 'general',
      additionalNotes: '请帮我识别品种'
    })
  });

  const data = await response.json();
  return data;
}

// 完整 Workflow 咨询
async function workflowConsultation() {
  const response = await fetch('https://cat-consultation-ai.fuzefen121.workers.dev/api/consultation/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      catName: '小花',
      age: 3,
      weight: 5.2,
      consultationType: 'behavior',
      behaviorChanges: '最近变得很焦躁',
      symptoms: ['过度舔毛', '食欲下降']
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('紧急程度:', data.report.emergencyAssessment.urgencyLevel);
    console.log('建议:', data.report.recommendations);
  }
}
```

### cURL

```bash
# 健康检查
curl https://cat-consultation-ai.fuzefen121.workers.dev/api/health

# 简单咨询
curl -X POST https://cat-consultation-ai.fuzefen121.workers.dev/api/consultation \
  -H "Content-Type: application/json" \
  -d '{
    "catName": "小白",
    "age": 2,
    "consultationType": "health",
    "symptoms": ["食欲不振"]
  }'

# Workflow 咨询
curl -X POST https://cat-consultation-ai.fuzefen121.workers.dev/api/consultation/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "catName": "小花",
    "age": 3,
    "consultationType": "behavior",
    "behaviorChanges": "焦躁不安"
  }'
```

---

## 速率限制

目前没有速率限制，但建议：
- 避免短时间内大量请求
- 实现客户端请求去重
- 添加加载状态避免重复提交

---

## 最佳实践

1. **错误处理**: 始终检查 `success` 字段
2. **加载状态**: 显示加载指示器
3. **图片压缩**: 上传前压缩大图片
4. **请求去重**: 避免重复提交
5. **超时处理**: 设置合理的超时时间（建议 30-60 秒）

---

## 支持

- **部署文档**: [DEPLOY_WORKERS.md](./DEPLOY_WORKERS.md)
- **项目文档**: [README.md](./README.md)
- **问题反馈**: 通过 GitHub Issues
