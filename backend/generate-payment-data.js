const axios = require('axios');

// API配置
const BASE_URL = 'http://localhost:3001/qiao';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30秒超时
});

// 等待函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 生成收款记录测试数据
async function generatePaymentRecordData() {
  console.log('🚀 开始生成收款记录测试数据...\n');

  try {
    // 等待后端服务启动
    console.log('⏳ 等待后端服务启动...');
    await sleep(3000);

    // 测试连接
    let retries = 5;
    while (retries > 0) {
      try {
        await api.get('/products');
        console.log('✅ 后端服务连接成功');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('无法连接到后端服务，请确保服务已启动');
        }
        console.log(`⏳ 等待后端服务... (剩余重试次数: ${retries})`);
        await sleep(2000);
      }
    }

    // 1. 生成收款记录测试数据
    console.log('📦 生成收款记录测试数据...');
    const response = await api.post('/payment-records/generate-test-data', {
      count: 10 // 生成10条测试数据
    });

    if (response.data.code === 200) {
      console.log('✅', response.data.message);
      console.log('📊 生成数量:', response.data.data?.count);

      // 显示一些示例数据
      if (response.data.data?.records && response.data.data.records.length > 0) {
        console.log('\n📝 示例数据:');
        response.data.data.records.slice(0, 3).forEach((record, index) => {
          console.log(`   ${index + 1}. 收款单号: ${record.paymentId}`);
          console.log(`      支付金额: ¥${record.paymentInfo?.paymentAmount}`);
          console.log(`      支付方式: ${record.paymentInfo?.paymentMethod}`);
          console.log(`      支付状态: ${record.paymentStatus}`);
          console.log(`      客户电话: ${record.customer?.customerPhone}`);
          console.log('');
        });
      }
    } else {
      console.log('⚠️', response.data.message);
    }

    // 2. 验证数据是否生成成功
    console.log('🔍 验证数据生成结果...');
    const listResponse = await api.get('/payment-records', {
      params: {
        page: 1,
        pageSize: 10
      }
    });

    if (listResponse.data.code === 200) {
      const total = listResponse.data.data?.total || 0;
      const list = listResponse.data.data?.list || [];

      console.log(`✅ 数据验证成功: 共 ${total} 条收款记录`);
      console.log(`📋 当前页显示: ${list.length} 条记录`);

      if (list.length > 0) {
        console.log('\n📊 数据样本:');
        const sample = list[0];
        console.log(`   收款单号: ${sample.paymentId}`);
        console.log(`   关联订单: ${sample.orderId}`);
        console.log(`   所属商家: ${sample.merchantName}`);
        console.log(`   支付方式: ${sample.paymentMethod}`);
        console.log(`   订单金额: ¥${sample.paymentAmount}`);
        console.log(`   实收金额: ¥${sample.actualAmount}`);
        console.log(`   支付状态: ${sample.paymentStatus}`);
        console.log(`   支付时间: ${sample.paymentTime}`);
        console.log(`   客户电话: ${sample.customerPhone}`);
      }

      // 3. 测试搜索功能
      console.log('\n🔎 测试搜索功能...');

      // 按支付方式搜索
      const searchResponse = await api.get('/payment-records', {
        params: {
          paymentMethod: 'wechat',
          page: 1,
          pageSize: 5
        }
      });

      if (searchResponse.data.code === 200) {
        const wechatRecords = searchResponse.data.data?.list || [];
        console.log(`   微信支付记录: ${wechatRecords.length} 条`);
      }

      // 按支付状态搜索
      const statusResponse = await api.get('/payment-records', {
        params: {
          paymentStatus: 'success',
          page: 1,
          pageSize: 5
        }
      });

      if (statusResponse.data.code === 200) {
        const successRecords = statusResponse.data.data?.list || [];
        console.log(`   成功支付记录: ${successRecords.length} 条`);
      }

      console.log('\n🎉 收款记录测试数据生成完成！');
      console.log('💡 提示:');
      console.log('   1. 现在可以启动前端应用测试收款记录页面');
      console.log('   2. 使用 PowerShell 启动前端: cd frontend; npm start');
      console.log('   3. 访问收款记录页面查看生成的数据');
      console.log('   4. 可以测试搜索、筛选、分页等功能');

    } else {
      console.log('❌ 数据验证失败:', listResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 生成测试数据失败:', error.response?.data || error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 解决方案:');
      console.log('1. 确保后端服务已启动: npm start');
      console.log('2. 检查端口是否被占用: netstat -ano | findstr :3001');
      console.log('3. 确保 MongoDB 数据库已连接');
    } else if (error.response?.status === 500) {
      console.log('\n💡 可能的原因:');
      console.log('1. 数据库连接问题');
      console.log('2. 模型定义问题');
      console.log('3. 数据依赖关系问题');
    }
  }
}

// 清空收款记录测试数据
async function clearPaymentRecordData() {
  console.log('🧹 开始清空收款记录测试数据...\n');

  try {
    // 等待后端服务启动
    console.log('⏳ 等待后端服务启动...');
    await sleep(2000);

    const response = await api.delete('/payment-records/clear-test-data');

    if (response.data.code === 200) {
      console.log('✅', response.data.message);
      console.log('📊 清空数量:', response.data.data?.deletedCount);
    } else {
      console.log('⚠️', response.data.message);
    }

  } catch (error) {
    console.error('❌ 清空测试数据失败:', error.response?.data || error.message);
  }
}

// 显示数据统计信息
async function showDataStats() {
  console.log('📊 获取数据统计信息...\n');

  try {
    const response = await api.get('/payment-records', {
      params: {
        page: 1,
        pageSize: 1
      }
    });

    if (response.data.code === 200) {
      const total = response.data.data?.total || 0;
      console.log(`📋 收款记录总数: ${total} 条`);

      if (total > 0) {
        // 按支付方式统计
        const methods = ['wechat', 'alipay', 'cash', 'bank_card', 'bank_transfer'];
        console.log('\n💳 按支付方式统计:');

        for (const method of methods) {
          try {
            const methodResponse = await api.get('/payment-records', {
              params: {
                paymentMethod: method,
                page: 1,
                pageSize: 1
              }
            });
            const count = methodResponse.data.data?.total || 0;
            const methodName = {
              wechat: '微信支付',
              alipay: '支付宝',
              cash: '现金',
              bank_card: '银行卡',
              bank_transfer: '银行转账'
            }[method];
            console.log(`   ${methodName}: ${count} 条`);
          } catch (err) {
            console.log(`   ${method}: 0 条`);
          }
        }

        // 按支付状态统计
        const statuses = ['success', 'pending', 'failed', 'refunded'];
        console.log('\n📈 按支付状态统计:');

        for (const status of statuses) {
          try {
            const statusResponse = await api.get('/payment-records', {
              params: {
                paymentStatus: status,
                page: 1,
                pageSize: 1
              }
            });
            const count = statusResponse.data.data?.total || 0;
            const statusName = {
              success: '已支付',
              pending: '待支付',
              failed: '支付失败',
              refunded: '已退款'
            }[status];
            console.log(`   ${statusName}: ${count} 条`);
          } catch (err) {
            console.log(`   ${status}: 0 条`);
          }
        }
      }
    } else {
      console.log('❌ 获取统计信息失败:', response.data.message);
    }

  } catch (error) {
    console.error('❌ 获取统计信息失败:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--clear')) {
    await clearPaymentRecordData();
  } else if (args.includes('--stats')) {
    await showDataStats();
  } else {
    await generatePaymentRecordData();
  }

  process.exit(0);
}

// 运行脚本
main().catch(console.error);

module.exports = {
  generatePaymentRecordData,
  clearPaymentRecordData,
  showDataStats
}; 