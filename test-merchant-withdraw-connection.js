const axios = require('axios');

async function testMerchantWithdrawConnection() {
  console.log('🧪 开始测试商家提现API连接...\n');

  const baseURL = 'http://localhost:3001';

  try {
    // 1. 测试商家提现模块连接
    console.log('1. 测试商家提现模块连接...');
    try {
      const response = await axios.get(`${baseURL}/merchant-withdraw/test`);
      console.log('✅ 商家提现模块连接成功:', response.data);
    } catch (error) {
      console.log('❌ 商家提现模块连接失败:', error.message);
    }

    // 2. 测试商家提现列表API
    console.log('\n2. 测试商家提现列表API...');
    try {
      const response = await axios.get(`${baseURL}/merchant-withdraw/list?page=1&pageSize=10`);
      console.log('✅ 商家提现列表API成功:', {
        code: response.data.code,
        message: response.data.message,
        recordCount: response.data.data?.list?.length || 0,
        total: response.data.data?.pagination?.total || 0
      });

      // 显示前几条数据
      if (response.data.data?.list?.length > 0) {
        console.log('📋 提现记录样例:');
        response.data.data.list.slice(0, 2).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.merchantName} - ¥${item.withdrawAmount} (${item.status})`);
        });
      }
    } catch (error) {
      console.log('❌ 商家提现列表API失败:', error.response?.data || error.message);
    }

    // 3. 测试筛选功能
    console.log('\n3. 测试筛选功能...');
    try {
      const response = await axios.get(`${baseURL}/merchant-withdraw/list?status=pending`);
      console.log('✅ 状态筛选成功:', {
        待审核记录数: response.data.data?.list?.length || 0
      });
    } catch (error) {
      console.log('❌ 筛选功能失败:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('🚨 测试过程中发生错误:', error.message);
  }

  console.log('\n🏁 商家提现API测试完成!');
}

// 执行测试
testMerchantWithdrawConnection(); 