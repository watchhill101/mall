const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAccountDetailAPI() {
  console.log('🧪 开始测试账户明细API...');

  try {
    // 1. 测试基础接口
    console.log('\n1. 测试基础接口...');
    const testResponse = await axios.get(`${BASE_URL}/account-detail/test`);
    console.log('✅ 基础接口测试成功:', testResponse.data);

    // 2. 测试账户明细列表接口
    console.log('\n2. 测试账户明细列表接口...');
    const listResponse = await axios.get(`${BASE_URL}/account-detail/list?page=1&pageSize=5`);
    console.log('✅ 列表接口测试成功:', {
      message: listResponse.data.message,
      totalRecords: listResponse.data.data?.pagination?.total || 0,
      currentPageRecords: listResponse.data.data?.list?.length || 0
    });

    if (listResponse.data.data?.list?.length > 0) {
      console.log('📊 示例记录:', listResponse.data.data.list[0]);
    }

    // 3. 测试统计信息接口
    console.log('\n3. 测试统计信息接口...');
    const statsResponse = await axios.get(`${BASE_URL}/account-detail/stats`);
    console.log('✅ 统计接口测试成功:', statsResponse.data.data);

    // 4. 测试筛选功能
    console.log('\n4. 测试筛选功能...');
    const filterResponse = await axios.get(`${BASE_URL}/account-detail/list?merchantType=电子`);
    console.log('✅ 筛选接口测试成功:', {
      message: filterResponse.data.message,
      filteredRecords: filterResponse.data.data?.list?.length || 0
    });

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
testAccountDetailAPI(); 