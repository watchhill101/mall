const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSettlementOrderAPI() {
  console.log('🧪 开始测试结算订单API连接...\n');

  try {
    // 测试基础连接
    console.log('1. 测试后端基础连接...');
    const baseResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ 后端连接成功:', baseResponse.data);
    console.log('');

    // 测试结算订单接口
    console.log('2. 测试结算订单API...');
    const settlementResponse = await axios.get(`${BASE_URL}/settlement-order/test`);
    console.log('✅ 结算订单API连接成功:', settlementResponse.data);
    console.log('');

    // 测试获取结算订单列表
    console.log('3. 测试获取结算订单列表...');
    const listResponse = await axios.get(`${BASE_URL}/settlement-order/list`, {
      params: {
        page: 1,
        pageSize: 10
      }
    });
    console.log('✅ 获取结算订单列表成功:');
    console.log('   - 总数:', listResponse.data.data.pagination.total);
    console.log('   - 当前页数据量:', listResponse.data.data.list.length);
    console.log('   - 分页信息:', listResponse.data.data.pagination);
    
    if (listResponse.data.data.list.length > 0) {
      console.log('   - 第一条数据示例:', JSON.stringify(listResponse.data.data.list[0], null, 2));
    }
    console.log('');

    // 如果有数据，测试获取详情
    if (listResponse.data.data.list.length > 0) {
      const firstOrderId = listResponse.data.data.list[0].id;
      console.log('4. 测试获取结算订单详情...');
      try {
        const detailResponse = await axios.get(`${BASE_URL}/settlement-order/detail/${firstOrderId}`);
        console.log('✅ 获取结算订单详情成功:', detailResponse.data.message);
        console.log('   - 订单号:', detailResponse.data.data.orderNumber);
        console.log('   - 商家信息:', detailResponse.data.data.merchant);
      } catch (detailError) {
        console.log('⚠️ 获取详情失败（可能数据库中没有相关联的数据）:', detailError.response?.data?.message || detailError.message);
      }
    } else {
      console.log('4. 跳过详情测试（没有订单数据）');
    }

    console.log('\n🎉 结算订单API测试完成！');
    console.log('\n📝 测试结果总结:');
    console.log('   ✅ 后端基础连接: 正常');
    console.log('   ✅ 结算订单API: 正常');
    console.log('   ✅ 列表查询接口: 正常');
    console.log('   ✅ API路由注册: 正常');
    
    if (listResponse.data.data.list.length === 0) {
      console.log('\n💡 提示: 数据库中暂无结算订单数据，可以通过管理后台或API添加测试数据');
    }

  } catch (error) {
    console.error('❌ API测试失败:');
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', error.response.data);
    } else if (error.request) {
      console.error('   网络错误: 无法连接到后端服务');
      console.error('   请确保后端服务正在运行在', BASE_URL);
    } else {
      console.error('   错误详情:', error.message);
    }
    process.exit(1);
  }
}

// 运行测试
testSettlementOrderAPI(); 