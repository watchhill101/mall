const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/qiao',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 获取命令行参数
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');
const shouldStats = args.includes('--stats');

async function generateWorkOrderData() {
  try {
    console.log('🚀 开始生成作业单测试数据...');

    // 清空现有数据（如果指定了 --clear 参数）
    if (shouldClear) {
      console.log('🗑️ 清空现有作业单数据...');
      const clearResponse = await api.delete('/work-orders/clear-test-data');
      console.log(`✅ 已清空 ${clearResponse.data.data.count} 条作业单记录`);
    }

    // 生成作业单数据
    console.log('📦 生成作业单数据...');
    const response = await api.post('/work-orders/generate-test-data', {
      count: 10
    });

    if (response.data.code === 200) {
      console.log(`✅ ${response.data.message}`);
      console.log(`📊 生成了 ${response.data.data.count} 条作业单记录`);

      if (response.data.data.records && response.data.data.records.length > 0) {
        console.log('\n📋 示例记录:');
        response.data.data.records.slice(0, 2).forEach((record, index) => {
          console.log(`${index + 1}. ${record.workOrderId} - ${record.workType} - ${record.status}`);
        });
      }
    } else {
      console.error('❌ 生成失败:', response.data.message);
    }

    // 显示统计信息（如果指定了 --stats 参数）
    if (shouldStats) {
      console.log('\n📈 获取作业单统计信息...');
      const statsResponse = await api.get('/work-orders?pageSize=1');
      if (statsResponse.data.code === 200) {
        console.log(`📊 当前作业单总数: ${statsResponse.data.data.total}`);
      }
    }

    console.log('\n🎉 作业单数据生成完成！');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 生成作业单数据失败: 无法连接到后端服务，请确保服务已启动');
      console.log('💡 请先运行: cd backend && npm start');
    } else if (error.response) {
      console.error('❌ 生成作业单数据失败:', error.response.data?.message || error.response.statusText);
    } else {
      console.error('❌ 生成作业单数据失败:', error.message);
    }
    process.exit(1);
  }
}

// 显示使用说明
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
作业单数据生成工具

使用方法:
  node generate-work-order-data.js [选项]

选项:
  --clear    清空现有作业单数据后再生成
  --stats    显示生成后的统计信息
  --help     显示此帮助信息

示例:
  node generate-work-order-data.js                    # 直接生成数据
  node generate-work-order-data.js --clear            # 清空后生成
  node generate-work-order-data.js --clear --stats    # 清空后生成并显示统计
  `);
  process.exit(0);
}

generateWorkOrderData(); 