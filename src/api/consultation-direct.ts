/**
 * 直接调用 OpenAI API 的咨询服务
 * 用于 Cloudflare Workers 环境，避免 Mastra 初始化问题
 */

export interface ConsultationRequest {
  catName?: string;
  age?: number;
  ageInWeeks?: number;
  weight?: number;
  breed?: string;
  imageBase64?: string;
  imageUrl?: string;
  symptoms?: string[];
  symptomsDuration?: string;
  behaviorChanges?: string;
  consultationType: 'health' | 'nutrition' | 'behavior' | 'general';
  additionalNotes?: string;
}

export interface ConsultationResponse {
  success: boolean;
  consultationId?: string;
  report?: {
    text: string;
    timestamp: string;
  };
  error?: string;
}

// 系统提示词（从 cat-consultant-agent.ts 复制）
const SYSTEM_PROMPT = `你是一位经验丰富的猫咪健康咨询专家，具备以下专业能力：

1. **品种识别**：能够根据图片或描述准确识别猫咪品种
2. **健康评估**：能够根据症状描述评估猫咪的健康状况
3. **营养建议**：提供专业的饮食和营养建议
4. **行为分析**：解读猫咪的行为含义和情绪状态
5. **紧急判断**：快速识别需要紧急就医的情况

**回答原则**：
- 始终提供专业、准确的信息
- 对于严重症状，明确建议就医
- 使用温和、易懂的语言
- 提供实用的护理建议
- 说明可能的原因和解决方案

**重要免责声明**：
本咨询仅供参考，不能替代专业兽医的诊断和治疗。对于任何健康问题，请及时咨询专业兽医。

现在，请根据用户的咨询提供专业建议。`;

/**
 * 直接调用 OpenAI API 进行咨询
 */
export async function handleConsultationDirect(
  request: ConsultationRequest,
  openaiApiKey: string
): Promise<ConsultationResponse> {
  try {
    // 构建消息内容
    const messageContent: any[] = [];

    // 添加文字描述
    let textContent = `咨询类型：${request.consultationType}\n`;

    if (request.catName) {
      textContent += `猫咪名字：${request.catName}\n`;
    }
    if (request.age) {
      textContent += `年龄：${request.age}岁\n`;
    }
    if (request.ageInWeeks) {
      textContent += `年龄：${request.ageInWeeks}周\n`;
    }
    if (request.weight) {
      textContent += `体重：${request.weight}公斤\n`;
    }
    if (request.breed) {
      textContent += `品种：${request.breed}\n`;
    }
    if (request.symptoms && request.symptoms.length > 0) {
      textContent += `症状：${request.symptoms.join('、')}\n`;
    }
    if (request.symptomsDuration) {
      textContent += `症状持续时间：${request.symptomsDuration}\n`;
    }
    if (request.behaviorChanges) {
      textContent += `行为变化：${request.behaviorChanges}\n`;
    }
    if (request.additionalNotes) {
      textContent += `补充说明：${request.additionalNotes}\n`;
    }

    textContent += '\n请根据以上信息提供专业的咨询建议。';

    messageContent.push({
      type: 'text',
      text: textContent,
    });

    // 添加图片（如果有）
    if (request.imageBase64) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: request.imageBase64.startsWith('data:')
            ? request.imageBase64
            : `data:image/jpeg;base64,${request.imageBase64}`,
        },
      });
    } else if (request.imageUrl) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: request.imageUrl,
        },
      });
    }

    // 调用 OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    const assistantMessage = data.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error('No response from OpenAI API');
    }

    return {
      success: true,
      consultationId: `CONSULT-${Date.now()}`,
      report: {
        text: assistantMessage,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Consultation error:', error);
    return {
      success: false,
      error: error.message || '咨询处理失败',
    };
  }
}

/**
 * Workflow 咨询的简化版本
 */
export async function handleConsultationWithWorkflowDirect(
  request: ConsultationRequest,
  openaiApiKey: string
): Promise<ConsultationResponse> {
  // 目前使用简单版本，未来可以扩展为多步骤
  return handleConsultationDirect(request, openaiApiKey);
}
