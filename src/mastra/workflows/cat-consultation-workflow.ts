import { Workflow, Step } from '@mastra/core/workflow';
import { z } from 'zod';

/**
 * 猫咪咨询完整工作流
 *
 * 流程：
 * 1. 接收图片和基本信息
 * 2. 分析图片（品种识别、健康状况观察）
 * 3. 收集症状信息
 * 4. 紧急情况评估
 * 5. 疾病识别（如有症状）
 * 6. 生成完整建议（健康、营养、行为等）
 * 7. 提供后续跟进建议
 */

export const catConsultationWorkflow = new Workflow({
  name: 'cat-consultation-workflow',
  triggerSchema: z.object({
    // 猫咪基本信息
    catName: z.string().optional().describe('猫咪名字'),
    age: z.number().optional().describe('年龄（岁）'),
    ageInWeeks: z.number().optional().describe('年龄（周）'),
    weight: z.number().optional().describe('体重（公斤）'),
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
  }),
});

// Step 1: 初始化咨询
const initializeConsultation: Step = {
  id: 'initialize-consultation',
  execute: async ({ context }) => {
    const { catName, consultationType } = context.machineContext.triggerData;

    return {
      consultationId: `CONSULT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      catName: catName || '您的猫咪',
      consultationType,
      status: 'initialized',
      findings: [],
      recommendations: [],
    };
  },
};

// Step 2: 图片分析（如果有图片）
const analyzeImage: Step = {
  id: 'analyze-image',
  execute: async ({ context }) => {
    const triggerData = context.machineContext.triggerData;
    const { hasImage, imageDescription } = triggerData;

    if (!hasImage || !imageDescription) {
      return {
        imageAnalyzed: false,
        message: '未提供图片，跳过图片分析',
      };
    }

    // 基于图片描述进行分析
    const findings = [];
    const observations = [];

    // 品种识别关键词
    const breedKeywords = {
      '英国短毛猫': ['圆脸', '短毛', '蓝色', '橙色眼睛', '强壮'],
      '美国短毛猫': ['银色斑纹', '强壮', '短毛'],
      '布偶猫': ['蓝眼睛', '长毛', '白色', '大体型', '手套'],
      '暹罗猫': ['尖脸', '蓝眼睛', '浅色身体', '深色耳朵'],
      '波斯猫': ['扁脸', '长毛', '圆眼睛'],
      '缅因猫': ['大体型', '长毛', '耳朵簇毛'],
    };

    // 简单的品种识别逻辑
    let identifiedBreed = null;
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
      findings.push(`图片识别：可能是${identifiedBreed}`);
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
      observations.push('从图片看，猫咪的整体状况良好');
    } else if (negativeCount > 0) {
      observations.push('注意：图片中可能有一些需要关注的健康迹象');
    }

    return {
      imageAnalyzed: true,
      identifiedBreed,
      findings,
      observations,
    };
  },
};

// Step 3: 紧急情况评估
const assessEmergency: Step = {
  id: 'assess-emergency',
  execute: async ({ context }) => {
    const { symptoms } = context.machineContext.triggerData;

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
        canProceed: false, // 紧急情况下，建议立即就医，不继续常规分析
        emergencyMessage: '🚨 检测到紧急症状！请立即就医，不要延误！',
        immediateActions: [
          '立即联系最近的宠物急诊医院',
          '保持猫咪温暖和安静',
          '不要喂食或给水（除非医生指示）',
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
};

// Step 4: 症状分析和疾病识别
const analyzeSymptoms: Step = {
  id: 'analyze-symptoms',
  execute: async ({ context }) => {
    const previousStep = context.machineContext.stepResults?.['assess-emergency'];

    // 如果是紧急情况，跳过此步骤
    if (previousStep?.isEmergency) {
      return { skipped: true, reason: '紧急情况，已建议立即就医' };
    }

    const { symptoms, symptomsDuration } = context.machineContext.triggerData;

    if (!symptoms || symptoms.length === 0) {
      return {
        hasSymptoms: false,
        analysis: '未报告症状',
      };
    }

    // 症状分类
    const symptomCategories = {
      digestive: ['呕吐', '腹泻', '食欲不振', '便秘'],
      respiratory: ['咳嗽', '打喷嚏', '流鼻涕', '呼吸急促'],
      urinary: ['血尿', '排尿困难', '频繁如厕'],
      skin: ['脱毛', '瘙痒', '皮肤红肿'],
      behavioral: ['嗜睡', '躁动', '攻击性'],
    };

    const categorizedSymptoms: Record<string, string[]> = {};

    for (const [category, keywords] of Object.entries(symptomCategories)) {
      const matched = symptoms.filter(symptom =>
        keywords.some(keyword => symptom.includes(keyword))
      );
      if (matched.length > 0) {
        categorizedSymptoms[category] = matched;
      }
    }

    return {
      hasSymptoms: true,
      totalSymptoms: symptoms.length,
      categorizedSymptoms,
      duration: symptomsDuration || '未指定',
      needsVetVisit: symptoms.length >= 3 || symptomsDuration?.includes('天'),
    };
  },
};

// Step 5: 生成综合建议
const generateRecommendations: Step = {
  id: 'generate-recommendations',
  execute: async ({ context }) => {
    const triggerData = context.machineContext.triggerData;
    const emergencyResult = context.machineContext.stepResults?.['assess-emergency'];
    const imageResult = context.machineContext.stepResults?.['analyze-image'];
    const symptomsResult = context.machineContext.stepResults?.['analyze-symptoms'];

    const recommendations: string[] = [];
    const warnings: string[] = [];
    const followUpActions: string[] = [];

    // 紧急情况处理
    if (emergencyResult?.isEmergency) {
      return {
        priority: 'EMERGENCY',
        message: emergencyResult.emergencyMessage,
        immediateActions: emergencyResult.immediateActions,
        recommendations: [],
        doNotProceed: true,
      };
    }

    // 根据咨询类型生成建议
    const { consultationType, age, weight } = triggerData;

    // 品种相关建议
    if (imageResult?.identifiedBreed) {
      recommendations.push(`品种识别：${imageResult.identifiedBreed}`);
      recommendations.push(`建议查询该品种的特殊护理需求和常见健康问题`);
    }

    // 健康相关建议
    if (symptomsResult?.hasSymptoms) {
      if (symptomsResult.needsVetVisit) {
        warnings.push('建议24-48小时内就医检查');
      }
      recommendations.push('密切观察症状变化');
      recommendations.push('记录症状的时间、频率和严重程度');
    }

    // 营养相关建议
    if (consultationType === 'nutrition' || (age && weight)) {
      if (age < 1) {
        recommendations.push('幼猫营养：需要高蛋白高能量饮食');
        recommendations.push('每日3-4餐，选择幼猫专用粮');
      } else if (age > 7) {
        recommendations.push('老年猫营养：注意肾脏保护，选择老年猫专用粮');
        recommendations.push('每日2餐，控制磷含量');
      } else {
        recommendations.push('成年猫营养：每日2-3餐，保持均衡饮食');
      }

      if (weight) {
        const idealWeightRange = '4-5公斤'; // 简化处理
        recommendations.push(`注意体重管理，理想体重范围：${idealWeightRange}`);
      }
    }

    // 后续跟进
    followUpActions.push('定期健康检查（每年1-2次）');
    followUpActions.push('保持疫苗接种up-to-date');
    followUpActions.push('如有任何新症状或变化，及时咨询');

    return {
      priority: emergencyResult?.urgencyLevel || 'NORMAL',
      recommendations,
      warnings,
      followUpActions,
      timestamp: new Date().toISOString(),
    };
  },
};

// Step 6: 生成最终报告
const generateFinalReport: Step = {
  id: 'generate-final-report',
  execute: async ({ context }) => {
    const triggerData = context.machineContext.triggerData;
    const initResult = context.machineContext.stepResults?.['initialize-consultation'];
    const imageResult = context.machineContext.stepResults?.['analyze-image'];
    const emergencyResult = context.machineContext.stepResults?.['assess-emergency'];
    const symptomsResult = context.machineContext.stepResults?.['analyze-symptoms'];
    const recommendationsResult = context.machineContext.stepResults?.['generate-recommendations'];

    // 构建完整报告
    const report = {
      consultationId: initResult?.consultationId,
      timestamp: initResult?.timestamp,
      catName: initResult?.catName,
      consultationType: triggerData.consultationType,

      // 基本信息
      basicInfo: {
        age: triggerData.age,
        weight: triggerData.weight,
        breed: triggerData.breed || imageResult?.identifiedBreed || '未知',
      },

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

      // 症状分析
      symptoms: symptomsResult?.hasSymptoms ? {
        total: symptomsResult.totalSymptoms,
        categorized: symptomsResult.categorizedSymptoms,
        duration: symptomsResult.duration,
        needsVetVisit: symptomsResult.needsVetVisit,
      } : null,

      // 建议
      recommendations: {
        priority: recommendationsResult?.priority,
        items: recommendationsResult?.recommendations || [],
        warnings: recommendationsResult?.warnings || [],
        followUp: recommendationsResult?.followUpActions || [],
      },

      // 免责声明
      disclaimer: '⚠️ 本咨询结果仅供参考，不能替代专业兽医的诊断和治疗。对于任何健康问题，请及时咨询专业兽医。',
    };

    return report;
  },
};

// 添加步骤到工作流
catConsultationWorkflow
  .step(initializeConsultation)
  .then(analyzeImage)
  .then(assessEmergency)
  .then(analyzeSymptoms)
  .then(generateRecommendations)
  .then(generateFinalReport)
  .commit();
