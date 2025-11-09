/**
 * 猫咪咨询 AI 助手 - 快速测试脚本
 *
 * 使用方式：
 * 1. 确保已配置 .env 文件并设置 OPENAI_API_KEY
 * 2. 运行: npx tsx test-cat-agent.ts
 */

import { mastra } from './src/mastra/index.js';

async function testCatConsultantAgent() {
  console.log('🐱 开始测试猫咪咨询 AI 助手...\n');

  const agent = mastra.agents.catConsultantAgent;

  // 测试 1: 基础咨询
  console.log('='.repeat(60));
  console.log('测试 1: 基础咨询 - 新手猫主');
  console.log('='.repeat(60));

  try {
    const response1 = await agent.generate({
      messages: [{
        role: 'user',
        content: '我是新手猫主，刚领养了一只3个月大的小猫，需要准备什么？有什么注意事项吗？'
      }]
    });

    console.log('\n用户: 我是新手猫主，刚领养了一只3个月大的小猫，需要准备什么？有什么注意事项吗？');
    console.log('\nAI回复:', response1.text);
    console.log('\n');
  } catch (error) {
    console.error('测试 1 失败:', error);
  }

  // 测试 2: 品种查询
  console.log('='.repeat(60));
  console.log('测试 2: 品种信息查询');
  console.log('='.repeat(60));

  try {
    const response2 = await agent.generate({
      messages: [{
        role: 'user',
        content: '请详细介绍一下英国短毛猫的品种特点、护理要点和常见健康问题。'
      }]
    });

    console.log('\n用户: 请详细介绍一下英国短毛猫的品种特点、护理要点和常见健康问题。');
    console.log('\nAI回复:', response2.text);
    console.log('\n');
  } catch (error) {
    console.error('测试 2 失败:', error);
  }

  // 测试 3: 健康评估
  console.log('='.repeat(60));
  console.log('测试 3: 健康状况评估');
  console.log('='.repeat(60));

  try {
    const response3 = await agent.generate({
      messages: [{
        role: 'user',
        content: `我的猫咪出现以下症状，请帮我评估：
        - 食欲不振已经2天
        - 今天呕吐了一次
        - 精神有点萎靡
        - 猫咪4岁，平时很活泼

        这种情况需要马上就医吗？`
      }]
    });

    console.log('\n用户: 我的猫咪出现以下症状，请帮我评估...');
    console.log('\nAI回复:', response3.text);
    console.log('\n');
  } catch (error) {
    console.error('测试 3 失败:', error);
  }

  // 测试 4: 营养咨询
  console.log('='.repeat(60));
  console.log('测试 4: 营养建议');
  console.log('='.repeat(60));

  try {
    const response4 = await agent.generate({
      messages: [{
        role: 'user',
        content: `请为我的猫制定营养计划：
        - 年龄：2岁
        - 体重：4.5公斤
        - 活动水平：中等
        - 已绝育

        每天应该喂多少？怎么喂？`
      }]
    });

    console.log('\n用户: 请为我的猫制定营养计划...');
    console.log('\nAI回复:', response4.text);
    console.log('\n');
  } catch (error) {
    console.error('测试 4 失败:', error);
  }

  // 测试 5: 行为解读
  console.log('='.repeat(60));
  console.log('测试 5: 行为问题咨询');
  console.log('='.repeat(60));

  try {
    const response5 = await agent.generate({
      messages: [{
        role: 'user',
        content: '我的猫经常在我工作的时候踩奶，还会流口水，这是什么意思？正常吗？'
      }]
    });

    console.log('\n用户: 我的猫经常在我工作的时候踩奶，还会流口水，这是什么意思？正常吗？');
    console.log('\nAI回复:', response5.text);
    console.log('\n');
  } catch (error) {
    console.error('测试 5 失败:', error);
  }

  // 测试 6: 多轮对话
  console.log('='.repeat(60));
  console.log('测试 6: 多轮对话');
  console.log('='.repeat(60));

  try {
    const messages = [];

    // 第一轮
    messages.push({
      role: 'user' as const,
      content: '我想养一只性格温顺的猫，有什么推荐吗？'
    });

    let response = await agent.generate({ messages });
    console.log('\n用户: 我想养一只性格温顺的猫，有什么推荐吗？');
    console.log('AI:', response.text);

    messages.push({
      role: 'assistant' as const,
      content: response.text
    });

    // 第二轮
    messages.push({
      role: 'user' as const,
      content: '布偶猫适合新手养吗？'
    });

    response = await agent.generate({ messages });
    console.log('\n用户: 布偶猫适合新手养吗？');
    console.log('AI:', response.text);

    messages.push({
      role: 'assistant' as const,
      content: response.text
    });

    // 第三轮
    messages.push({
      role: 'user' as const,
      content: '那每天需要花多少时间打理它的毛发？'
    });

    response = await agent.generate({ messages });
    console.log('\n用户: 那每天需要花多少时间打理它的毛发？');
    console.log('AI:', response.text);
    console.log('\n');
  } catch (error) {
    console.error('测试 6 失败:', error);
  }

  console.log('='.repeat(60));
  console.log('✅ 所有测试完成！');
  console.log('='.repeat(60));
  console.log('\n提示：');
  console.log('- 如需测试图片识别功能，请在 Playground 中上传图片');
  console.log('- 访问 http://localhost:4111/playground 使用可视化界面');
  console.log('- 查看 USAGE_EXAMPLES.md 了解更多使用方法\n');
}

// 运行测试
testCatConsultantAgent().catch(error => {
  console.error('❌ 测试过程中出现错误:', error);
  process.exit(1);
});
