import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

/**
 * 猫咪咨询完整工作流
 *
 * 流程：
 * 1. 接收图片和基本信息
 * 2. 分析图片(品种识别、健康状况观察)
 * 3. 收集症状信息
 * 4. 紧急情况评估
 * 5. 疾病识别(如有症状)
 * 6. 生成完整建议(健康、营养、行为等)
 * 7. 提供后续跟进建议
 */

const inputSchema = z.object({
  // 猫咪基本信息
  catName: z.string().optional().describe('猫咪名字'),
  age: z.number().optional().describe('年龄(岁)'),
  ageInWeeks: z.number().optional().describe('年龄(周)'),
  weight: z.number().optional().describe('体重(公斤)'),
  breed: z.string().optional().describe('品种'),

  // 图片信息
  hasImage: z.boolean().describe('是否上传了图片'),
  imageUrl: z.string().optional().describe('图片URL或base64'),
  imageDescription: z.string().optional().describe('图片AI描述'),

  // 症状和咨询内容
  symptoms: z.array(z.string()).optional().describe('症状列表'),
  symptomsDuration: z.string().optional().describe('症状持续时间'),
  behaviorChanges: z.string().optional().describe('行为变化'),
  consultationType: z.enum(['health', 'nutrition', 'behavior', 'general']).describe('咨询类型'),
  additionalNotes: z.string().optional().describe('补充说明'),
});

// Step 1: 初始化咨询
const initializeConsultation = createStep({
  id: 'initialize-consultation',
  description: '初始化猫咪咨询会话',
  inputSchema: inputSchema,
  outputSchema: z.object({
    consultationId: z.string(),
    timestamp: z.string(),
    catName: z.string(),
    consultationType: z.string(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    const inputData = context.inputData as z.infer<typeof inputSchema>;
    const { catName, consultationType } = inputData;

    return {
      consultationId: `CONSULT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      catName: catName || '您的猫咪',
      consultationType,
      status: 'initialized',
    };
  },
});

// Step 2: 图片分析(如果有图片)
const analyzeImage = createStep({
  id: 'analyze-image',
  description: '分析猫咪图片',
  inputSchema: inputSchema,
  outputSchema: z.object({
    imageAnalyzed: z.boolean(),
    identifiedBreed: z.string().nullable(),
    findings: z.array(z.string()),
    observations: z.array(z.string()),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const inputData = context.inputData as z.infer<typeof inputSchema>;
    const { hasImage, imageDescription } = inputData;

    if (!hasImage || !imageDescription) {
      return {
        imageAnalyzed: false,
        identifiedBreed: null,
        findings: [],
        observations: [],
        message: '未提供图片,跳过图片分析',
      };
    }

    // 基于图片描述进行分析
    const findings: string[] = [];
    const observations: string[] = [];

    // 品种识别关键词
    const breedKeywords: Record<string, string[]> = {
      '英国短毛猫': ['圆脸', '短毛', '蓝色', '橙色眼睛', '强壮'],
      '美国短毛猫': ['银色斑纹', '强壮', '短毛'],
      '布偶猫': ['蓝眼睛', '长毛', '白色', '大体型', '手套'],
      '暹罗猫': ['尖脸', '蓝眼睛', '浅色身体', '深色耳朵'],
      '波斯猫': ['扁脸', '长毛', '圆眼睛'],
      '缅因猫': ['大体型', '长毛', '耳朵簇毛'],
    };

    // 简单的品种识别逻辑
    let identifiedBreed: string | null = null;
    for (const [breed, keywords] of Object.entries(breedKeywords)) {
      const matchCount = keywords.filter(kw =>
        imageDescription.toLowerCase().includes(kw.toLowerCase())
      ).length;
      if (matchCount >= 2) {
        identifiedBreed = breed;
        break;
      }
    }

    if (identifiedBreed) {
      findings.push(`图片识别:可能是${identifiedBreed}`);
    }

    // 健康状况观察
    const healthIndicators = {
      positive: ['干净', '明亮', '光泽', '活泼', '清澈'],
      negative: ['脏', '无精打采', '消瘦', '分泌物', '红肿', '秃毛'],
    };

    const positiveCount = healthIndicators.positive.filter(ind =>
      imageDescription.toLowerCase().includes(ind)
    ).length;

    const negativeCount = healthIndicators.negative.filter(ind =>
      imageDescription.toLowerCase().includes(ind)
    ).length;

    if (positiveCount > negativeCount) {
      observations.push('从图片看,猫咪的整体状况良好');
    } else if (negativeCount > 0) {
      observations.push('注意:图片中可能有一些需要关注的健康迹象');
    }

    return {
      imageAnalyzed: true,
      identifiedBreed,
      findings,
      observations,
    };
  },
});

// Step 3: 紧急情况评估
const assessEmergency = createStep({
  id: 'assess-emergency',
  description: '评估紧急程度',
  inputSchema: inputSchema,
  outputSchema: z.object({
    isEmergency: z.boolean(),
    urgencyLevel: z.string(),
    canProceed: z.boolean(),
    emergencyMessage: z.string().optional(),
    immediateActions: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    const inputData = context.inputData as z.infer<typeof inputSchema>;
    const { symptoms } = inputData;

    if (!symptoms || symptoms.length === 0) {
      return {
        isEmergency: false,
        urgencyLevel: '无紧急情况',
        canProceed: true,
      };
    }

    // 紧急症状检查
    const criticalSymptoms = [
      '呼吸困难', '大量出血', '抽搐', '无法站立', '误食毒物',
      '意识不清', '无法排尿', '体温过高', '体温过低',
    ];

    const hasCritical = symptoms.some(symptom =>
      criticalSymptoms.some(critical =>
        symptom.includes(critical)
      )
    );

    if (hasCritical) {
      return {
        isEmergency: true,
        urgencyLevel: '立即就医',
        canProceed: false,
        emergencyMessage: '🚨 检测到紧急症状!请立即就医,不要延误!',
        immediateActions: [
          '立即联系最近的宠物急诊医院',
          '保持猫咪温暖和安静',
          '不要喂食或给水(除非医生指示)',
          '准备好猫咪的医疗记录',
        ],
      };
    }

    return {
      isEmergency: false,
      urgencyLevel: '需要评估',
      canProceed: true,
    };
  },
});

// Step 4: 生成最终报告
const generateFinalReport = createStep({
  id: 'generate-final-report',
  description: '生成完整咨询报告',
  inputSchema: z.object({
    initResult: z.any(),
    imageResult: z.any(),
    emergencyResult: z.any(),
  }),
  outputSchema: z.object({
    consultationId: z.string(),
    timestamp: z.string(),
    report: z.any(),
  }),
  execute: async ({ context }) => {
    const { initResult, imageResult, emergencyResult } = context.inputData as any;

    const report = {
      consultationId: initResult?.consultationId,
      timestamp: initResult?.timestamp,
      catName: initResult?.catName,

      // 图片分析结果
      imageAnalysis: imageResult?.imageAnalyzed ? {
        analyzed: true,
        breed: imageResult.identifiedBreed,
        findings: imageResult.findings,
        observations: imageResult.observations,
      } : null,

      // 紧急情况评估
      emergency: {
        isEmergency: emergencyResult?.isEmergency || false,
        urgencyLevel: emergencyResult?.urgencyLevel,
        message: emergencyResult?.emergencyMessage,
        actions: emergencyResult?.immediateActions,
      },

      // 免责声明
      disclaimer: '⚠️ 本咨询结果仅供参考,不能替代专业兽医的诊断和治疗。对于任何健康问题,请及时咨询专业兽医。',
    };

    return {
      consultationId: initResult?.consultationId,
      timestamp: new Date().toISOString(),
      report,
    };
  },
});

// 创建工作流
export const catConsultationWorkflow = createWorkflow({
  id: 'cat-consultation-workflow',
  description: '猫咪健康咨询完整工作流',
  inputSchema,
  outputSchema: z.object({
    consultationId: z.string(),
    timestamp: z.string(),
    report: z.any(),
  }),
})
  .then(initializeConsultation)
  .then(analyzeImage)
  .then(assessEmergency)
  .then(generateFinalReport)
  .commit();
