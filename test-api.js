/**
 * 测试 Workers API
 */

const API_URL = 'https://cat-consultation-ai.fuzefen121.workers.dev';

async function testHealth() {
  console.log('Testing health endpoint...');
  const response = await fetch(`${API_URL}/api/health`);
  const data = await response.json();
  console.log('Health:', data);
  return data;
}

async function testConsultation() {
  console.log('\nTesting consultation endpoint...');
  const response = await fetch(`${API_URL}/api/consultation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consultationType: 'general',
      additionalNotes: '你好，请简单介绍一下你自己，说明你能提供什么服务'
    })
  });

  const data = await response.json();
  console.log('Consultation response:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  try {
    await testHealth();
    await testConsultation();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
