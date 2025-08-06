const http = require('http');

const testAPI = (path, callback) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api${path}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (error) {
        callback(error, null);
      }
    });
  });

  req.on('error', (error) => {
    callback(error, null);
  });

  req.end();
};

console.log('🧪 测试结算账单API...\n');

// 测试基础连接
console.log('1️⃣ 测试基础连接...');
testAPI('/bill/test', (error, data) => {
  if (error) {
    console.error('❌ 基础连接失败:', error.message);
    return;
  }
  console.log('✅ 基础连接成功:', data);

  // 测试获取账单列表
  console.log('\n2️⃣ 测试获取账单列表...');
  testAPI('/bill/list?page=1&pageSize=2', (error, data) => {
    if (error) {
      console.error('❌ 获取账单列表失败:', error.message);
      return;
    }
    console.log('✅ 账单列表获取成功:');
    console.log(`   总数: ${data.data.pagination.total}`);
    console.log(`   当前页: ${data.data.pagination.current}`);
    console.log(`   每页大小: ${data.data.pagination.pageSize}`);
    console.log(`   账单数量: ${data.data.list.length}`);

    if (data.data.list.length > 0) {
      const firstBill = data.data.list[0];
      console.log('   第一条账单信息:');
      console.log(`     ID: ${firstBill.id}`);
      console.log(`     商家: ${firstBill.merchantName}`);
      console.log(`     日期: ${firstBill.date}`);
      console.log(`     订单数: ${firstBill.orderCount}`);
      console.log(`     总金额: ¥${firstBill.orderAmount}`);
      console.log(`     状态: ${firstBill.status}`);
    }

    // 测试获取统计数据
    console.log('\n3️⃣ 测试获取统计数据...');
    testAPI('/bill/stats', (error, data) => {
      if (error) {
        console.error('❌ 获取统计数据失败:', error.message);
        return;
      }
      console.log('✅ 统计数据获取成功:');
      console.log(`   订单总数: ${data.data.orderCount}`);
      console.log(`   总金额: ¥${data.data.totalAmount}`);
      console.log(`   销售金额: ¥${data.data.salesAmount}`);
      console.log(`   微信销售: ¥${data.data.wechatSales.amount} (${data.data.wechatSales.count}笔)`);

      console.log('\n🎉 所有API测试完成！');
    });
  });
}); 