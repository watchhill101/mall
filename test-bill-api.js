const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试函数
const testBillAPI = async () => {
  console.log('🧪 开始测试结算账单API...\n');

  try {
    // 1. 测试基础连接
    console.log('1️⃣ 测试基础连接...');
    const testResponse = await axios.get(`${BASE_URL}/bill/test`);
    console.log('✅ 基础连接测试成功:', testResponse.data);
    console.log('');

    // 2. 测试获取账单列表
    console.log('2️⃣ 测试获取账单列表...');
    const listResponse = await axios.get(`${BASE_URL}/bill/list`, {
      params: {
        page: 1,
        pageSize: 5
      }
    });
    console.log('✅ 账单列表获取成功:');
    console.log(`   总数: ${listResponse.data.data.pagination.total}`);
    console.log(`   当前页: ${listResponse.data.data.pagination.current}`);
    console.log(`   每页大小: ${listResponse.data.data.pagination.pageSize}`);
    console.log(`   账单数量: ${listResponse.data.data.list.length}`);
    
    if (listResponse.data.data.list.length > 0) {
      const firstBill = listResponse.data.data.list[0];
      console.log('   第一条账单信息:');
      console.log(`     ID: ${firstBill.id}`);
      console.log(`     商家: ${firstBill.merchantName}`);
      console.log(`     日期: ${firstBill.date}`);
      console.log(`     订单数: ${firstBill.orderCount}`);
      console.log(`     总金额: ¥${firstBill.orderAmount}`);
      console.log(`     状态: ${firstBill.status}`);
    }
    console.log('');

    // 3. 测试获取统计数据
    console.log('3️⃣ 测试获取统计数据...');
    const statsResponse = await axios.get(`${BASE_URL}/bill/stats`);
    console.log('✅ 统计数据获取成功:');
    console.log(`   订单总数: ${statsResponse.data.data.orderCount}`);
    console.log(`   总金额: ¥${statsResponse.data.data.totalAmount}`);
    console.log(`   销售金额: ¥${statsResponse.data.data.salesAmount}`);
    console.log(`   微信销售: ¥${statsResponse.data.data.wechatSales.amount} (${statsResponse.data.data.wechatSales.count}笔)`);
    console.log(`   余额销售: ¥${statsResponse.data.data.balanceSales.amount} (${statsResponse.data.data.balanceSales.count}笔)`);
    console.log('');

    // 4. 测试筛选功能
    console.log('4️⃣ 测试筛选功能...');
    const filterResponse = await axios.get(`${BASE_URL}/bill/list`, {
      params: {
        page: 1,
        pageSize: 10,
        merchantName: '商家', // 模糊搜索包含"商家"的商家名称
        status: 'paid'
      }
    });
    console.log('✅ 筛选功能测试成功:');
    console.log(`   筛选结果数量: ${filterResponse.data.data.list.length}`);
    console.log('');

    // 5. 测试日期范围筛选
    console.log('5️⃣ 测试日期范围筛选...');
    const dateFilterResponse = await axios.get(`${BASE_URL}/bill/list`, {
      params: {
        page: 1,
        pageSize: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ 日期筛选功能测试成功:');
    console.log(`   筛选结果数量: ${dateFilterResponse.data.data.list.length}`);
    console.log('');

    // 6. 测试获取账单详情（如果有数据的话）
    if (listResponse.data.data.list.length > 0) {
      console.log('6️⃣ 测试获取账单详情...');
      const billId = listResponse.data.data.list[0].id;
      try {
        const detailResponse = await axios.get(`${BASE_URL}/bill/detail/${billId}`);
        console.log('✅ 账单详情获取成功:');
        console.log(`   账单号: ${detailResponse.data.data.billNumber}`);
        console.log(`   商家: ${detailResponse.data.data.merchant.merchantName}`);
        console.log(`   账单周期: ${detailResponse.data.data.billPeriodStart} 至 ${detailResponse.data.data.billPeriodEnd}`);
        console.log(`   总金额: ¥${detailResponse.data.data.totalAmount}`);
        console.log(`   服务费: ¥${detailResponse.data.data.serviceFee}`);
        console.log(`   实际金额: ¥${detailResponse.data.data.actualAmount}`);
      } catch (error) {
        console.log('⚠️ 账单详情获取失败:', error.response?.data?.message || error.message);
      }
      console.log('');
    }

    console.log('🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保后端服务已启动 (npm run dev)');
    }
  }
};

// 运行测试
console.log('📋 结算账单API测试工具');
console.log('🔗 测试地址:', BASE_URL);
console.log('⏰ 开始时间:', new Date().toLocaleString());
console.log('=====================================\n');

testBillAPI().then(() => {
  console.log('\n=====================================');
  console.log('⏰ 结束时间:', new Date().toLocaleString());
}).catch(error => {
  console.error('💥 测试过程中发生错误:', error);
}); 