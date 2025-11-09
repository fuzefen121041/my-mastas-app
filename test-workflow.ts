/**
 * 测试猫咪咨询Workflow
 *
 * 演示完整的咨询流程：图片上传 → 症状描述 → AI分析 → 生成建议
 */

import { mastra } from './src/mastra/index.js';

async function testCatConsultationWorkflow() {
  console.log('='.repeat(70));
  console.log('测试猫咪咨询Workflow - 完整流程');
  console.log('='.repeat(70));
  console.log();

  const workflow = mastra.workflows.catConsultationWorkflow;

  // 测试场景：猫咪出现呕吐症状
  const testCase = {
    catName: '小橘',
    age: 3,
    weight: 5.2,
    breed: '中华田园猫',
    hasImage: false, // 此测试暂不包含实际图片
    imageDescription: '橘色短毛猫，体型健壮，眼睛明亮，毛发光泽',
    symptoms: ['呕吐', '食欲不振'],
    symptomsDuration: '2天',
    behaviorChanges: '精神比平时差一些，不太爱玩',
    consultationType: 'health' as const,
    additionalNotes: '昨天可能吃了一些人类食物',
  };

  console.log('📋 测试用例：');
  console.log(JSON.stringify(testCase, null, 2));
  console.log();
  console.log('🚀 开始执行Workflow...');
  console.log();

  try {
    const result = await workflow.execute({
      triggerData: testCase,
    });

    console.log('✅ Workflow执行成功！');
    console.log();
    console.log('='.repeat(70));
    console.log('📊 执行结果：');
    console.log('='.repeat(70));
    console.log();

    // 打印各个步骤的结果
    console.log('【步骤1】初始化咨询：');
    console.log(JSON.stringify(result.results?.['initialize-consultation'], null, 2));
    console.log();

    console.log('【步骤2】图片分析：');
    console.log(JSON.stringify(result.results?.['analyze-image'], null, 2));
    console.log();

    console.log('【步骤3】紧急情况评估：');
    console.log(JSON.stringify(result.results?.['assess-emergency'], null, 2));
    console.log();

    console.log('【步骤4】症状分析：');
    console.log(JSON.stringify(result.results?.['analyze-symptoms'], null, 2));
    console.log();

    console.log('【步骤5】生成建议：');
    console.log(JSON.stringify(result.results?.['generate-recommendations'], null, 2));
    console.log();

    console.log('【步骤6】最终报告：');
    console.log(JSON.stringify(result.results?.['generate-final-report'], null, 2));
    console.log();

    console.log('='.repeat(70));
    console.log('🎉 测试完成！');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ Workflow执行失败：', error);
    throw error;
  }
}

// 测试Agent + 图片咨询
async function testAgentWithImage() {
  console.log('\n\n');
  console.log('='.repeat(70));
  console.log('测试Agent - 图片咨询功能');
  console.log('='.repeat(70));
  console.log();

  const agent = mastra.agents.catConsultantAgent;

  console.log('📝 测试场景：品种识别 + 健康咨询');
  console.log();
  console.log('⚠️  注意：实际使用时需要提供真实的图片URL或base64数据');
  console.log('   当前测试使用文字描述模拟图片内容');
  console.log();

  try {
    const response = await agent.generate({
      messages: [{
        role: 'user',
        content: `我的猫咪最近有些症状，需要帮助分析：

猫咪信息：
- 名字：小白
- 年龄：2岁
- 体重：4.5公斤
- 品种：未知（想通过描述识别）

外观描述（代替图片）：
- 全身白色短毛
- 圆脸，橙色眼睛
- 体型强壮，肌肉发达
- 毛发干净有光泽

症状：
- 打喷嚏（持续3天）
- 流清鼻涕
- 眼睛有少量分泌物
- 食欲正常，精神还好

请帮我：
1. 识别可能的品种
2. 评估健康状况
3. 提供建议
`
      }]
    });

    console.log('🤖 AI回复：');
    console.log('-'.repeat(70));
    console.log(response.text);
    console.log('-'.repeat(70));
    console.log();
    console.log('✅ Agent测试完成！');

  } catch (error) {
    console.error('❌ Agent测试失败：', error);
  }
}

// 运行所有测试
async function runAllTests() {
  try {
    // 测试1: Workflow
    await testCatConsultationWorkflow();

    // 测试2: Agent
    await testAgentWithImage();

    console.log('\n\n');
    console.log('='.repeat(70));
    console.log('🎊 所有测试完成！');
    console.log('='.repeat(70));
    console.log();
    console.log('💡 下一步：');
    console.log('   1. 启动服务：npm run dev');
    console.log('   2. 访问Playground：http://localhost:4111/playground');
    console.log('   3. 选择 catConsultantAgent');
    console.log('   4. 上传真实猫咪图片并咨询');
    console.log('   5. 或访问演示页面：http://localhost:4111/index.html（需配置）');
    console.log();
  } catch (error) {
    console.error('\n❌ 测试失败：', error);
    process.exit(1);
  }
}

// 执行测试
runAllTests();
