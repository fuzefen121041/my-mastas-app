/**
 * 猫咪咨询API端点
 *
 * 提供图片上传和咨询服务
 */

import { mastra } from '../mastra/index.js';

export interface ConsultationRequest {
  // 猫咪基本信息
  catName?: string;
  age?: number;
  ageInWeeks?: number;
  weight?: number;
  breed?: string;

  // 图片信息
  imageBase64?: string; // base64编码的图片
  imageUrl?: string;

  // 症状和咨询
  symptoms?: string[];
  symptomsDuration?: string;
  behaviorChanges?: string;
  consultationType: 'health' | 'nutrition' | 'behavior' | 'general';
  additionalNotes?: string;
}

export interface ConsultationResponse {
  success: boolean;
  consultationId?: string;
  report?: any;
  error?: string;
}

/**
 * 处理图片上传和咨询请求
 */
export async function handleConsultation(
  request: ConsultationRequest
): Promise<ConsultationResponse> {
  try {
    // 调试信息
    console.log('Mastra object:', mastra);
    console.log('Mastra agents:', mastra.agents);

    if (!mastra.agents || !mastra.agents.catConsultantAgent) {
      throw new Error('catConsultantAgent is not available. Mastra may not be initialized correctly in Workers environment.');
    }

    const agent = mastra.agents.catConsultantAgent;

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

    // 调用Agent生成响应
    const response = await agent.generate({
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    return {
      success: true,
      consultationId: `CONSULT-${Date.now()}`,
      report: {
        text: response.text,
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
 * 使用Workflow处理完整咨询流程
 */
export async function handleConsultationWithWorkflow(
  request: ConsultationRequest
): Promise<ConsultationResponse> {
  try {
    const workflow = mastra.workflows.catConsultationWorkflow;

    // 如果有图片，先用AI分析图片内容
    let imageDescription = '';
    if (request.imageBase64 || request.imageUrl) {
      const agent = mastra.agents.catConsultantAgent;
      const imageAnalysisResponse = await agent.generate({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请详细描述这张猫咪图片中的内容，包括猫咪的外观、毛色、体型、精神状态等。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: request.imageBase64?.startsWith('data:')
                    ? request.imageBase64
                    : request.imageUrl || '',
                },
              },
            ],
          },
        ],
      });
      imageDescription = imageAnalysisResponse.text || '';
    }

    // 执行Workflow
    const result = await workflow.execute({
      triggerData: {
        catName: request.catName,
        age: request.age,
        ageInWeeks: request.ageInWeeks,
        weight: request.weight,
        breed: request.breed,
        hasImage: !!(request.imageBase64 || request.imageUrl),
        imageUrl: request.imageBase64 || request.imageUrl,
        imageDescription,
        symptoms: request.symptoms,
        symptomsDuration: request.symptomsDuration,
        behaviorChanges: request.behaviorChanges,
        consultationType: request.consultationType,
        additionalNotes: request.additionalNotes,
      },
    });

    return {
      success: true,
      consultationId: result.results?.['generate-final-report']?.consultationId,
      report: result.results?.['generate-final-report'],
    };
  } catch (error: any) {
    console.error('Workflow consultation error:', error);
    return {
      success: false,
      error: error.message || 'Workflow执行失败',
    };
  }
}
