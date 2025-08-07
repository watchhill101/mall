const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3001/api/qiao';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 测试函数
async function testPaymentRecordAPI() {
  console.log('开始测试收款记录API...\n');

  try {
    // 1. 生成测试数据
    console.log('1. 生成测试数据...');
    const generateResponse = await api.post('/payment-records/generate-test-data', {
      count: 20
    });
    console.log('生成测试数据结果:', generateResponse.data.message);
    console.log('生成数量:', generateResponse.data.data?.count, '\n');

    // 2. 获取收款记录列表
    console.log('2. 获取收款记录列表...');
    const listResponse = await api.get('/payment-records', {
      params: {
        page: 1,
        pageSize: 10
      }
    });
    console.log('获取列表结果:', listResponse.data.message);
    console.log('总数量:', listResponse.data.data?.total);
    console.log('当前页数据量:', listResponse.data.data?.list?.length, '\n');

    // 3. 测试搜索功能
    if (listResponse.data.data?.list?.length > 0) {
      const firstRecord = listResponse.data.data.list[0];
      console.log('3. 测试搜索功能...');

      // 按收款单号搜索
      const searchResponse = await api.get('/payment-records', {
        params: {
          paymentId: firstRecord.paymentId.substring(0, 10), // 部分匹配
          page: 1,
          pageSize: 10
        }
      });
      console.log('按收款单号搜索结果:', searchResponse.data.data?.list?.length, '条记录');

      // 按支付方式搜索
      const methodSearchResponse = await api.get('/payment-records', {
        params: {
          paymentMethod: firstRecord.paymentMethod,
          page: 1,
          pageSize: 10
        }
      });
      console.log('按支付方式搜索结果:', methodSearchResponse.data.data?.list?.length, '条记录');

      // 4. 获取详情
      console.log('\n4. 获取收款记录详情...');
      const detailResponse = await api.get(`/payment-records/${firstRecord.id}`);
      console.log('获取详情结果:', detailResponse.data.message);
      console.log('详情数据:', {
        paymentId: detailResponse.data.data?.paymentId,
        merchantName: detailResponse.data.data?.merchantName,
        paymentAmount: detailResponse.data.data?.paymentAmount
      }, '\n');

      // 5. 更新状态
      console.log('5. 测试更新状态...');
      const updateResponse = await api.put(`/payment-records/${firstRecord.id}/status`, {
        paymentStatus: 'processing',
        notes: '测试更新状态'
      });
      console.log('更新状态结果:', updateResponse.data.message, '\n');

      // 6. 测试批量操作
      console.log('6. 测试批量操作...');
      const recordIds = listResponse.data.data.list.slice(0, 3).map(record => record.id);
      const batchResponse = await api.post('/payment-records/batch', {
        recordIds,
        action: 'reconcile',
        data: {
          batchNumber: 'TEST_BATCH_001'
        }
      });
      console.log('批量操作结果:', batchResponse.data.message);
      console.log('操作数量:', batchResponse.data.data?.modifiedCount, '\n');
    }

    // 7. 获取统计信息（验证数据完整性）
    console.log('7. 验证数据完整性...');
    const finalListResponse = await api.get('/payment-records', {
      params: {
        page: 1,
        pageSize: 5
      }
    });

    if (finalListResponse.data.data?.list?.length > 0) {
      const sample = finalListResponse.data.data.list[0];
      console.log('数据样本:', {
        paymentId: sample.paymentId,
        orderId: sample.orderId,
        merchantName: sample.merchantName,
        paymentMethod: sample.paymentMethod,
        paymentAmount: sample.paymentAmount,
        paymentStatus: sample.paymentStatus,
        paymentTime: sample.paymentTime,
        customerPhone: sample.customerPhone
      });
    }

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);

    // 如果是连接错误，提供帮助信息
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 请确保：');
      console.log('1. 后端服务已启动 (npm start 或 node app.js)');
      console.log('2. 服务运行在端口 3001');
      console.log('3. MongoDB 数据库已连接');
    }
  }
}

// 清理测试数据的函数
async function clearTestData() {
  try {
    console.log('清理测试数据...');
    const response = await api.delete('/payment-records/clear-test-data');
    console.log('清理结果:', response.data.message);
  } catch (error) {
    console.error('清理失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--clear')) {
    await clearTestData();
  } else {
    await testPaymentRecordAPI();
  }
}

// 运行测试
main().catch(console.error);

module.exports = {
  testPaymentRecordAPI,
  clearTestData
}; 