const axios = require('axios');

async function testBackendConnection() {
  console.log('🧪 开始测试后端连接...\n');

  const baseURL = 'http://localhost:3001';

  try {
    // 1. 测试基本连接
    console.log('1. 测试基本连接...');
    try {
      const response = await axios.get(`${baseURL}/test`);
      console.log('✅ 基本连接成功:', response.data);
    } catch (error) {
      console.log('❌ 基本连接失败:', error.message);
    }

    // 2. 测试账户明细模块
    console.log('\n2. 测试账户明细模块...');
    try {
      const response = await axios.get(`${baseURL}/account-detail/test`);
      console.log('✅ 账户明细模块连接成功:', response.data);
    } catch (error) {
      console.log('❌ 账户明细模块连接失败:', error.message);
    }

    // 3. 测试账户明细列表API
    console.log('\n3. 测试账户明细列表API...');
    try {
      const response = await axios.get(`${baseURL}/account-detail/list?page=1&pageSize=10`);
      console.log('✅ 账户明细列表API成功:', {
        code: response.data.code,
        message: response.data.message,
        recordCount: response.data.data?.list?.length || 0,
        total: response.data.data?.pagination?.total || 0
      });
    } catch (error) {
      console.log('❌ 账户明细列表API失败:', error.response?.data || error.message);
    }

    // 4. 测试账户统计API
    console.log('\n4. 测试账户统计API...');
    try {
      const response = await axios.get(`${baseURL}/account-detail/stats`);
      console.log('✅ 账户统计API成功:', {
        code: response.data.code,
        message: response.data.message,
        stats: response.data.data
      });
    } catch (error) {
      console.log('❌ 账户统计API失败:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('🚨 测试过程中发生错误:', error.message);
  }

  console.log('\n🏁 测试完成!');
}

// 执行测试
testBackendConnection(); 