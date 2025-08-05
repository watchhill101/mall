const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testWithdrawAccountAPI() {
  console.log('🧪 开始测试提现账号API...');

  try {
    // 1. 测试基础接口
    console.log('\n1. 测试基础接口...');
    const testResponse = await axios.get(`${BASE_URL}/withdraw-account/test`);
    console.log('✅ 基础接口测试成功:', testResponse.data);

    // 2. 测试商家列表接口
    console.log('\n2. 测试商家列表接口...');
    const merchantsResponse = await axios.get(`${BASE_URL}/withdraw-account/merchants`);
    console.log('✅ 商家列表接口测试成功:', {
      message: merchantsResponse.data.message,
      merchantCount: merchantsResponse.data.data?.length || 0
    });

    if (merchantsResponse.data.data?.length > 0) {
      console.log('📊 示例商家:', merchantsResponse.data.data[0]);
    }

    // 3. 测试提现账号列表接口
    console.log('\n3. 测试提现账号列表接口...');
    const listResponse = await axios.get(`${BASE_URL}/withdraw-account/list?page=1&pageSize=5`);
    console.log('✅ 列表接口测试成功:', {
      message: listResponse.data.message,
      totalRecords: listResponse.data.data?.pagination?.total || 0,
      currentPageRecords: listResponse.data.data?.list?.length || 0
    });

    if (listResponse.data.data?.list?.length > 0) {
      console.log('📊 示例提现账号:', listResponse.data.data.list[0]);
    }

    // 4. 测试筛选功能
    console.log('\n4. 测试筛选功能...');
    const filterResponse = await axios.get(`${BASE_URL}/withdraw-account/list?status=active`);
    console.log('✅ 筛选接口测试成功:', {
      message: filterResponse.data.message,
      activeRecords: filterResponse.data.data?.list?.length || 0
    });

    // 5. 测试详情接口（如果有数据的话）
    if (listResponse.data.data?.list?.length > 0) {
      console.log('\n5. 测试详情接口...');
      const firstAccountId = listResponse.data.data.list[0].id;
      const detailResponse = await axios.get(`${BASE_URL}/withdraw-account/detail/${firstAccountId}`);
      console.log('✅ 详情接口测试成功:', {
        message: detailResponse.data.message,
        accountType: detailResponse.data.data?.accountType || '',
        merchantName: detailResponse.data.data?.merchantName || ''
      });
    }

    console.log('\n🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ API测试失败:', {
      url: error.config?.url || '未知',
      status: error.response?.status || '网络错误',
      message: error.response?.data?.message || error.message
    });
  }
}

// 运行测试
testWithdrawAccountAPI(); 