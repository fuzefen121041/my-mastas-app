import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 猫咪疾病数据库
const CAT_DISEASES = {
  '猫瘟': {
    symptoms: ['高烧', '呕吐', '腹泻', '食欲废绝', '精神沉郁', '白细胞显著减少'],
    severity: '紧急',
    treatment: '立即就医，需要住院治疗、输液、抗生素',
    prevention: '接种疫苗是最有效的预防方法',
  },
  '猫杯状病毒': {
    symptoms: ['打喷嚏', '流鼻涕', '流眼泪', '口腔溃疡', '发烧'],
    severity: '高',
    treatment: '就医治疗，抗生素预防继发感染，营养支持',
    prevention: '接种疫苗',
  },
  '猫鼻支': {
    symptoms: ['打喷嚏', '流鼻涕', '眼睛分泌物增多', '结膜炎', '发烧', '食欲下降'],
    severity: '高',
    treatment: '就医治疗，抗病毒药物，眼药水，营养支持',
    prevention: '接种疫苗，减少应激',
  },
  '泌尿系统疾病': {
    symptoms: ['排尿困难', '血尿', '频繁如厕', '尿量减少', '尿道疼痛'],
    severity: '紧急',
    treatment: '立即就医，可能需要导尿、药物治疗或手术',
    prevention: '充足饮水，优质猫粮，控制体重',
  },
  '慢性肾病': {
    symptoms: ['多饮多尿', '食欲下降', '体重减轻', '呕吐', '口臭', '精神不振'],
    severity: '高',
    treatment: '就医检查，处方粮，药物治疗，定期复查',
    prevention: '充足饮水，定期体检，优质饮食',
  },
  '糖尿病': {
    symptoms: ['多饮多尿', '食欲增加但体重下降', '精神不振'],
    severity: '高',
    treatment: '就医确诊，胰岛素注射，饮食管理',
    prevention: '控制体重，适量运动，健康饮食',
  },
  '甲状腺机能亢进': {
    symptoms: ['食欲亢进但体重下降', '多动', '呕吐', '腹泻', '心率加快'],
    severity: '中',
    treatment: '就医检查，药物治疗或放射性碘治疗',
    prevention: '定期体检（老年猫）',
  },
};

// 疫苗时间表
const VACCINE_SCHEDULE = {
  '幼猫首次接种': {
    age: '8-9周',
    vaccines: ['猫三联（猫瘟+猫杯状病毒+猫鼻支）'],
    notes: '首次接种，建立基础免疫',
  },
  '幼猫加强免疫': {
    age: '12周',
    vaccines: ['猫三联加强', '狂犬病疫苗（可选）'],
    notes: '加强免疫，完成基础免疫程序',
  },
  '成年猫年度接种': {
    age: '每年',
    vaccines: ['猫三联', '狂犬病疫苗'],
    notes: '维持免疫力，建议每1-3年加强',
  },
  '非核心疫苗': {
    age: '根据需要',
    vaccines: ['猫白血病疫苗', '猫传染性腹膜炎疫苗'],
    notes: '根据生活环境和风险评估决定是否接种',
  },
};

// 猫咪品种数据库
const CAT_BREEDS = {
  '英国短毛猫': {
    characteristics: '圆脸、短毛、体型强壮、性格温顺',
    care: '定期梳毛、控制体重、注意关节健康',
    commonIssues: '肥胖、心脏病、多囊肾病',
    lifespan: '12-17年',
  },
  '美国短毛猫': {
    characteristics: '强壮、适应力强、性格友善',
    care: '定期运动、均衡饮食、定期体检',
    commonIssues: '心脏病、肥胖',
    lifespan: '15-20年',
  },
  '布偶猫': {
    characteristics: '蓝色眼睛、长毛、体型大、性格温柔',
    care: '每日梳毛、预防毛球症、室内饲养',
    commonIssues: '肥厚型心肌病、多囊肾病',
    lifespan: '12-17年',
  },
  '暹罗猫': {
    characteristics: '尖脸、蓝眼睛、活跃、善于交流',
    care: '需要大量互动、定期玩耍、保持温暖',
    commonIssues: '呼吸系统问题、牙龈疾病',
    lifespan: '15-20年',
  },
  '波斯猫': {
    characteristics: '扁脸、长毛、优雅、安静',
    care: '每日梳毛、清洁眼睛和鼻子、室内饲养',
    commonIssues: '呼吸困难、泪道问题、多囊肾病',
    lifespan: '12-17年',
  },
  '缅因猫': {
    characteristics: '大型、长毛、友好、智慧',
    care: '定期梳毛、提供足够空间活动',
    commonIssues: '髋关节发育不良、肥厚型心肌病',
    lifespan: '12-15年',
  },
  '苏格兰折耳猫': {
    characteristics: '折耳、圆脸、温顺',
    care: '注意骨骼健康、定期检查关节',
    commonIssues: '骨软骨发育不良、关节疾病',
    lifespan: '11-14年',
  },
  '中华田园猫': {
    characteristics: '适应力强、健康、多样化外观',
    care: '基础护理、定期疫苗、绝育',
    commonIssues: '寄生虫、传染病（若未接种疫苗）',
    lifespan: '12-18年',
  },
};

// 猫咪健康指标评估工具
export const catHealthAssessmentTool = createTool({
  id: 'cat-health-assessment',
  description: '根据猫咪的症状、行为和状态进行基础健康评估，提供初步建议',
  inputSchema: z.object({
    symptoms: z.array(z.string()).describe('观察到的症状列表，如：食欲不振、呕吐、腹泻等'),
    age: z.number().optional().describe('猫咪年龄（岁）'),
    behaviorChanges: z.string().optional().describe('行为变化描述'),
  }),
  outputSchema: z.object({
    urgencyLevel: z.enum(['低', '中', '高', '紧急']),
    assessment: z.string(),
    recommendations: z.array(z.string()),
    warningMessage: z.string(),
  }),
  execute: async ({ context }) => {
    const { symptoms, age, behaviorChanges } = context;

    // 定义紧急症状
    const emergencySymptoms = [
      '呼吸困难', '大量出血', '抽搐', '无法站立', '严重外伤',
      '误食毒物', '剧烈疼痛', '意识不清', '持续呕吐24小时以上'
    ];

    // 定义高危症状
    const highRiskSymptoms = [
      '食欲不振超过48小时', '持续腹泻', '血尿', '频繁呕吐',
      '极度嗜睡', '呼吸急促', '体温异常', '脱水'
    ];

    const hasEmergency = symptoms.some(s =>
      emergencySymptoms.some(es => s.includes(es))
    );

    const hasHighRisk = symptoms.some(s =>
      highRiskSymptoms.some(hs => s.includes(hs))
    );

    let urgencyLevel: '低' | '中' | '高' | '紧急';
    let assessment: string;
    let recommendations: string[];

    if (hasEmergency) {
      urgencyLevel = '紧急';
      assessment = '检测到可能危及生命的症状，需要立即就医。';
      recommendations = [
        '立即联系最近的宠物急诊医院',
        '保持猫咪温暖和安静',
        '不要喂食或给水（除非医生指示）',
        '准备好猫咪的医疗记录',
        '如有可能，请他人帮忙驾车送医',
      ];
    } else if (hasHighRisk) {
      urgencyLevel = '高';
      assessment = '检测到需要重视的症状，建议24小时内就医检查。';
      recommendations = [
        '联系您的常规宠物医生预约就诊',
        '记录症状出现的时间和频率',
        '观察是否有其他异常症状',
        '确保猫咪有充足的水源',
        '如症状加重，立即送医',
      ];
    } else if (symptoms.length > 0) {
      urgencyLevel = '中';
      assessment = '检测到一些轻微症状，建议持续观察，必要时就医。';
      recommendations = [
        '密切观察症状是否加重或持续',
        '记录症状的变化情况',
        '确保猫咪饮食和饮水正常',
        '保持环境安静舒适',
        '如症状持续超过48小时，请就医',
      ];
    } else {
      urgencyLevel = '低';
      assessment = '未检测到明显异常症状，继续日常护理和定期体检。';
      recommendations = [
        '保持定期的健康体检（每年至少一次）',
        '注意观察日常行为和饮食习惯',
        '保持良好的预防保健措施',
        age && age > 7 ? '建议增加体检频率至每半年一次（老年猫）' : '',
      ].filter(Boolean);
    }

    const warningMessage = '⚠️ 重要提示：本评估仅供参考，不能替代专业兽医诊断。如有任何疑虑，请及时咨询专业兽医。';

    return {
      urgencyLevel,
      assessment,
      recommendations,
      warningMessage,
    };
  },
});

// 猫咪品种知识工具
export const catBreedInfoTool = createTool({
  id: 'cat-breed-info',
  description: '获取特定猫咪品种的详细信息，包括特征、护理要点和常见健康问题',
  inputSchema: z.object({
    breed: z.string().describe('猫咪品种名称'),
  }),
  outputSchema: z.object({
    breedName: z.string(),
    info: z.object({
      characteristics: z.string(),
      care: z.string(),
      commonIssues: z.string(),
      lifespan: z.string(),
    }).optional(),
    found: z.boolean(),
    suggestions: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    const { breed } = context;

    // 查找品种信息
    const breedInfo = CAT_BREEDS[breed as keyof typeof CAT_BREEDS];

    if (breedInfo) {
      return {
        breedName: breed,
        info: breedInfo,
        found: true,
      };
    }

    // 如果没找到，提供相似的建议
    const allBreeds = Object.keys(CAT_BREEDS);
    const suggestions = allBreeds.filter(b =>
      b.includes(breed) || breed.includes(b)
    );

    return {
      breedName: breed,
      found: false,
      suggestions: suggestions.length > 0 ? suggestions : allBreeds.slice(0, 5),
    };
  },
});

// 猫咪营养建议工具
export const catNutritionAdviceTool = createTool({
  id: 'cat-nutrition-advice',
  description: '根据猫咪的年龄、体重和特殊需求提供营养建议',
  inputSchema: z.object({
    age: z.number().describe('猫咪年龄（岁）'),
    weight: z.number().describe('猫咪体重（公斤）'),
    activityLevel: z.enum(['低', '中', '高']).describe('活动水平'),
    specialNeeds: z.array(z.string()).optional().describe('特殊需求，如：绝育、怀孕、疾病等'),
  }),
  outputSchema: z.object({
    lifestage: z.string(),
    dailyCalories: z.string(),
    feedingRecommendations: z.array(z.string()),
    nutritionTips: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { age, weight, activityLevel, specialNeeds = [] } = context;

    let lifestage: string;
    let baseCalories: number;

    // 确定生命阶段
    if (age < 1) {
      lifestage = '幼猫期';
      baseCalories = weight * 100; // 幼猫需要更多能量
    } else if (age <= 7) {
      lifestage = '成年期';
      baseCalories = weight * 70;
    } else if (age <= 11) {
      lifestage = '中老年期';
      baseCalories = weight * 60;
    } else {
      lifestage = '老年期';
      baseCalories = weight * 55;
    }

    // 根据活动水平调整
    const activityMultiplier = {
      '低': 0.8,
      '中': 1.0,
      '高': 1.2,
    };
    baseCalories *= activityMultiplier[activityLevel];

    // 根据特殊需求调整
    if (specialNeeds.includes('绝育')) {
      baseCalories *= 0.85; // 绝育后代谢降低
    }
    if (specialNeeds.includes('怀孕')) {
      baseCalories *= 1.5;
    }
    if (specialNeeds.includes('哺乳')) {
      baseCalories *= 2.0;
    }

    const feedingRecommendations = [
      `每日总热量：约${Math.round(baseCalories)}千卡`,
      lifestage === '幼猫期' ? '每日3-4餐，提供高蛋白幼猫粮' : '',
      lifestage === '成年期' ? '每日2-3餐，选择优质成猫粮' : '',
      lifestage.includes('老年') ? '每日2餐，选择易消化的老年猫粮' : '',
      '确保始终有新鲜清洁的饮用水',
      specialNeeds.includes('绝育') ? '选择绝育猫专用配方，控制体重' : '',
    ].filter(Boolean);

    const nutritionTips = [
      '猫咪是纯肉食动物，需要高质量的动物蛋白',
      '牛磺酸是必需营养素，确保猫粮含量充足',
      '避免频繁更换猫粮，如需更换应逐渐过渡（7-10天）',
      '不要喂食人类食物，尤其是巧克力、洋葱、葡萄等有毒食物',
      '定期称重，监控体重变化',
      age > 7 ? '老年猫需要更多关注肾脏健康，考虑处方粮' : '',
      '零食应控制在每日总热量的10%以内',
    ].filter(Boolean);

    return {
      lifestage,
      dailyCalories: `${Math.round(baseCalories)}千卡`,
      feedingRecommendations,
      nutritionTips,
    };
  },
});

// 猫咪行为解读工具
export const catBehaviorInterpretationTool = createTool({
  id: 'cat-behavior-interpretation',
  description: '解读猫咪的行为含义，帮助理解猫咪的需求和情绪',
  inputSchema: z.object({
    behavior: z.string().describe('观察到的行为描述'),
  }),
  outputSchema: z.object({
    interpretation: z.string(),
    possibleReasons: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { behavior } = context;

    // 行为数据库
    const behaviorDatabase: Record<string, { interpretation: string; reasons: string[]; recommendations: string[] }> = {
      '磨爪': {
        interpretation: '这是猫咪的自然本能行为，用于磨利爪子、标记领地和伸展身体。',
        reasons: ['维护爪子健康', '标记领地（爪垫有气味腺）', '伸展肌肉', '释放压力'],
        recommendations: [
          '提供专用的猫抓板或猫爬架',
          '定期修剪指甲',
          '在猫抓板上喷洒猫薄荷吸引使用',
          '不要惩罚这种自然行为',
        ],
      },
      '喵喵叫': {
        interpretation: '猫咪通过叫声与人类交流，表达各种需求和情绪。',
        reasons: ['寻求注意', '饥饿或口渴', '寻找伙伴', '感到不适', '打招呼', '发情期'],
        recommendations: [
          '观察叫声的音调和频率判断需求',
          '检查食物和水是否充足',
          '提供足够的陪伴和互动',
          '如果是频繁且异常的叫声，建议就医',
        ],
      },
      '蹭人': {
        interpretation: '这是友好和亲昵的表现，同时也在标记领地。',
        reasons: ['表达喜爱', '用气味腺标记（脸颊、额头）', '寻求关注', '打招呼'],
        recommendations: [
          '回应猫咪的友好行为',
          '轻柔地抚摸猫咪',
          '这是建立良好关系的好机会',
        ],
      },
      '踩奶': {
        interpretation: '这是幼猫时期的本能行为保留，表示舒适和满足。',
        reasons: ['感到安全和放松', '表达愉悦', '幼年期行为的保留', '准备休息'],
        recommendations: [
          '享受这个亲密时刻',
          '如果爪子刺痛，可以在腿上放一条毯子',
          '不要打断或惩罚这种行为',
        ],
      },
      '藏起来': {
        interpretation: '猫咪寻找安全感或感到不适。',
        reasons: ['感到害怕或压力', '生病或受伤', '需要安静的空间', '环境变化导致的不安'],
        recommendations: [
          '尊重猫咪的空间需求',
          '检查是否有健康问题',
          '提供安全的隐蔽空间',
          '如果持续超过24小时，考虑就医',
        ],
      },
      '炸毛': {
        interpretation: '这是防御反应，表示猫咪感到威胁或恐惧。',
        reasons: ['感到恐惧', '遇到威胁', '极度兴奋', '打架前的警告'],
        recommendations: [
          '移除威胁源或让猫咪离开',
          '给予猫咪空间平静下来',
          '不要突然靠近或触碰',
          '用温柔的声音安抚',
        ],
      },
    };

    // 查找匹配的行为
    const matchedBehavior = Object.keys(behaviorDatabase).find(key =>
      behavior.includes(key) || key.includes(behavior)
    );

    if (matchedBehavior) {
      const info = behaviorDatabase[matchedBehavior];
      return {
        interpretation: info.interpretation,
        possibleReasons: info.reasons,
        recommendations: info.recommendations,
      };
    }

    // 默认响应
    return {
      interpretation: '这种行为需要具体情境来分析。猫咪的行为通常与它们的需求、情绪和环境有关。',
      possibleReasons: [
        '可能是正常的猫咪行为',
        '可能是对环境的反应',
        '可能表示某种需求',
      ],
      recommendations: [
        '观察行为的频率和时机',
        '注意是否伴随其他症状',
        '如果行为突然改变或异常，建议咨询兽医',
        '可以录制视频以便更好地分析',
      ],
    };
  },
});

// 疾病识别工具
export const catDiseaseIdentificationTool = createTool({
  id: 'cat-disease-identification',
  description: '根据症状识别可能的疾病，提供疾病信息和建议',
  inputSchema: z.object({
    symptoms: z.array(z.string()).describe('观察到的症状列表'),
  }),
  outputSchema: z.object({
    possibleDiseases: z.array(z.object({
      name: z.string(),
      matchScore: z.number(),
      severity: z.string(),
      treatment: z.string(),
      prevention: z.string(),
    })),
    urgentAction: z.boolean(),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { symptoms } = context;
    const possibleDiseases = [];
    let urgentAction = false;

    // 遍历疾病数据库，匹配症状
    for (const [diseaseName, diseaseInfo] of Object.entries(CAT_DISEASES)) {
      const matchedSymptoms = symptoms.filter(symptom =>
        diseaseInfo.symptoms.some(ds =>
          symptom.includes(ds) || ds.includes(symptom)
        )
      );

      if (matchedSymptoms.length > 0) {
        const matchScore = (matchedSymptoms.length / diseaseInfo.symptoms.length) * 100;
        possibleDiseases.push({
          name: diseaseName,
          matchScore: Math.round(matchScore),
          severity: diseaseInfo.severity,
          treatment: diseaseInfo.treatment,
          prevention: diseaseInfo.prevention,
        });

        if (diseaseInfo.severity === '紧急') {
          urgentAction = true;
        }
      }
    }

    // 按匹配度排序
    possibleDiseases.sort((a, b) => b.matchScore - a.matchScore);

    const recommendations = [
      urgentAction ? '⚠️ 检测到紧急症状，请立即就医！' : '',
      '以上分析仅供参考，不能替代专业诊断',
      '建议尽快联系兽医进行专业检查',
      '记录症状出现的时间和变化情况',
      '准备好猫咪的医疗记录和疫苗记录',
    ].filter(Boolean);

    return {
      possibleDiseases: possibleDiseases.slice(0, 3),
      urgentAction,
      recommendations,
    };
  },
});

// 疫苗计划工具
export const catVaccineScheduleTool = createTool({
  id: 'cat-vaccine-schedule',
  description: '根据猫咪年龄提供疫苗接种计划和建议',
  inputSchema: z.object({
    ageInWeeks: z.number().optional().describe('猫咪年龄（周）'),
    ageInYears: z.number().optional().describe('猫咪年龄（岁）'),
    lastVaccineDate: z.string().optional().describe('上次接种日期'),
  }),
  outputSchema: z.object({
    currentStage: z.string(),
    recommendedVaccines: z.array(z.string()),
    schedule: z.array(z.object({
      stage: z.string(),
      age: z.string(),
      vaccines: z.array(z.string()),
      notes: z.string(),
    })),
    reminders: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { ageInWeeks, ageInYears } = context;

    let currentStage = '';
    let recommendedVaccines: string[] = [];
    const schedule = [];
    const reminders = [];

    const totalWeeks = ageInWeeks || (ageInYears ? ageInYears * 52 : 0);

    if (totalWeeks < 8) {
      currentStage = '未到疫苗接种年龄';
      recommendedVaccines = [];
      reminders.push('猫咪需要至少8周大才能开始接种疫苗');
      reminders.push('在此之前，确保母乳喂养或适当的幼猫奶粉');
    } else if (totalWeeks >= 8 && totalWeeks < 12) {
      currentStage = '幼猫首次接种期';
      recommendedVaccines = VACCINE_SCHEDULE['幼猫首次接种'].vaccines;
      reminders.push('现在是首次接种疫苗的时间');
      reminders.push('接种后需要在4周后进行加强免疫');
    } else if (totalWeeks >= 12 && totalWeeks < 52) {
      currentStage = '幼猫加强免疫期';
      recommendedVaccines = VACCINE_SCHEDULE['幼猫加强免疫'].vaccines;
      reminders.push('需要进行加强免疫以完成基础免疫程序');
      reminders.push('完成后每年需要加强接种');
    } else {
      currentStage = '成年猫维持免疫期';
      recommendedVaccines = VACCINE_SCHEDULE['成年猫年度接种'].vaccines;
      reminders.push('建议每年进行加强接种');
      reminders.push('咨询兽医确定具体的接种频率（1-3年）');
    }

    for (const [stage, info] of Object.entries(VACCINE_SCHEDULE)) {
      schedule.push({
        stage,
        age: info.age,
        vaccines: info.vaccines,
        notes: info.notes,
      });
    }

    reminders.push('接种前确保猫咪健康状况良好');
    reminders.push('接种后观察是否有不良反应');
    reminders.push('保存好疫苗接种记录');

    return {
      currentStage,
      recommendedVaccines,
      schedule,
      reminders,
    };
  },
});

// 图片分析工具
export const catImageAnalysisTool = createTool({
  id: 'cat-image-analysis',
  description: '分析上传的猫咪图片，识别品种、健康状况等信息',
  inputSchema: z.object({
    imageDescription: z.string().describe('图片的AI描述'),
    analysisType: z.enum(['breed', 'health', 'general']).describe('分析类型'),
  }),
  outputSchema: z.object({
    analysisType: z.string(),
    findings: z.array(z.string()),
    concerns: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { imageDescription, analysisType } = context;

    const findings: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    if (analysisType === 'breed') {
      findings.push('基于图片特征进行品种分析');
      recommendations.push('如需确认品种，建议提供多角度照片');
      recommendations.push('查看品种特征、护理要点等详细信息');
    } else if (analysisType === 'health') {
      findings.push('观察猫咪的外观健康状况');
      concerns.push('注意：图片分析不能替代兽医检查');
      recommendations.push('如发现异常，请及时就医');
      recommendations.push('定期健康检查很重要');
    } else {
      findings.push('进行综合分析');
      recommendations.push('提供更多信息可以获得更准确的建议');
    }

    return {
      analysisType,
      findings,
      concerns,
      recommendations,
    };
  },
});

// 紧急情况判断工具
export const catEmergencyAssessmentTool = createTool({
  id: 'cat-emergency-assessment',
  description: '快速判断是否为紧急情况，需要立即就医',
  inputSchema: z.object({
    symptoms: z.array(z.string()).describe('当前症状'),
    duration: z.string().optional().describe('症状持续时间'),
  }),
  outputSchema: z.object({
    isEmergency: z.boolean(),
    urgencyLevel: z.enum(['立即就医', '24小时内就医', '观察并预约', '继续观察']),
    reasons: z.array(z.string()),
    immediateActions: z.array(z.string()),
    warningMessage: z.string(),
  }),
  execute: async ({ context }) => {
    const { symptoms } = context;

    const criticalSymptoms = [
      '呼吸困难', '呼吸急促', '张口呼吸',
      '大量出血', '持续出血',
      '抽搐', '癫痫',
      '无法站立', '突然瘫痪',
      '严重外伤', '骨折',
      '误食毒物', '中毒',
      '剧烈疼痛', '哀嚎',
      '意识不清', '昏迷',
      '持续呕吐24小时以上',
      '无法排尿', '排尿困难超过12小时',
      '体温过高', '体温过低',
      '严重脱水',
      '牙龈苍白或发紫',
    ];

    const urgentSymptoms = [
      '频繁呕吐', '呕吐超过12小时',
      '持续腹泻', '血便',
      '血尿',
      '食欲废绝超过24小时',
      '精神极度沉郁',
      '发烧',
      '眼睛受伤',
      '耳朵持续摇头',
    ];

    let isEmergency = false;
    let urgencyLevel: '立即就医' | '24小时内就医' | '观察并预约' | '继续观察' = '继续观察';
    const reasons: string[] = [];
    const immediateActions: string[] = [];

    const foundCritical = symptoms.filter(s =>
      criticalSymptoms.some(cs => s.includes(cs) || cs.includes(s))
    );

    const foundUrgent = symptoms.filter(s =>
      urgentSymptoms.some(us => s.includes(us) || us.includes(s))
    );

    if (foundCritical.length > 0) {
      isEmergency = true;
      urgencyLevel = '立即就医';
      reasons.push('检测到危及生命的症状：' + foundCritical.join('、'));
      immediateActions.push('立即联系最近的宠物急诊医院');
      immediateActions.push('保持猫咪温暖和安静');
      immediateActions.push('不要喂食或给水（除非医生指示）');
      immediateActions.push('准备好猫咪的医疗记录');
      immediateActions.push('小心搬运，避免加重伤势');
    } else if (foundUrgent.length > 0) {
      urgencyLevel = '24小时内就医';
      reasons.push('检测到需要重视的症状：' + foundUrgent.join('、'));
      immediateActions.push('联系您的常规宠物医生预约就诊');
      immediateActions.push('记录症状出现的时间和频率');
      immediateActions.push('观察是否有其他异常症状');
      immediateActions.push('确保猫咪有充足的水源');
      immediateActions.push('如症状加重，立即送医');
    } else if (symptoms.length > 0) {
      urgencyLevel = '观察并预约';
      reasons.push('检测到一些症状，建议持续观察');
      immediateActions.push('密切观察症状变化');
      immediateActions.push('记录症状的详细情况');
      immediateActions.push('如症状持续或加重，及时就医');
      immediateActions.push('预约兽医进行检查');
    } else {
      urgencyLevel = '继续观察';
      reasons.push('未检测到明显异常症状');
      immediateActions.push('继续日常护理');
      immediateActions.push('定期健康体检');
    }

    const warningMessage = isEmergency
      ? '🚨 紧急情况！请立即就医，不要延误！'
      : '⚠️ 本评估仅供参考，不能替代专业兽医诊断。';

    return {
      isEmergency,
      urgencyLevel,
      reasons,
      immediateActions,
      warningMessage,
    };
  },
});
