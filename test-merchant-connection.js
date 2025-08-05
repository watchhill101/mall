const axios = require('axios');

const baseURL = 'http://localhost:3001';
const api = axios.create({ baseURL });

async function testMerchantConnection() {
  try {
    console.log('🧪 测试Merchant API连接...\n');

    // 步骤1: 生成验证码
    console.log('1️⃣ 生成验证码...');
    const captchaResponse = await api.get('/captcha/generate');
    const sessionId = captchaResponse.data.data.sessionId;
    console.log('✅ 验证码生成成功\n');

    // 步骤2: 登录获取Token
    console.log('2️⃣ 登录获取Token...');
    const loginResponse = await api.post('/auth/login', {
      loginAccount: 'admin',
      password: '123456',
      captcha: 'TEST', // 在实际环境中需要真实验证码
      sessionId: sessionId
    });

    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ 登录成功，Token获取成功\n');
    console.log('📋 Token:', accessToken.substring(0, 50) + '...\n');

    // 步骤3: 使用Token调用merchant API
    console.log('3️⃣ 测试merchant/list接口...');

    // 方法1: 使用Authorization header（推荐）
    const listResponse = await api.get('/merchant/list', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        page: 1,
        pageSize: 10
      }
    });

    console.log('✅ merchant/list 调用成功!');
    console.log('📊 返回数据:', {
      总记录数: listResponse.data.data.pagination.total,
      当前页数据: listResponse.data.data.list.length,
      状态码: listResponse.data.code
    });

    console.log('\n🎉 所有测试通过！API连接正常！');

  } catch (error) {
    console.error('\n❌ 测试失败:');

    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data?.message || error.message);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('网络错误:', error.message);
    }
  }
}

// 运行测试
testMerchantConnection();

module.exports = testMerchantConnection; 