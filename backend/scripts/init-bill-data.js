const mongoose = require('mongoose');
const config = require('../config/index');
const Bill = require('../moudle/merchant/bill');
const Merchant = require('../moudle/merchant/merchant');
const SettlementOrder = require('../moudle/merchant/settlementOrder');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 初始化结算账单数据
const initBillData = async () => {
  try {
    console.log('🧹 清空现有账单数据...');
    await Bill.deleteMany({});

    // 获取现有商家数据
    const merchants = await Merchant.find({}).limit(5);
    if (merchants.length === 0) {
      console.log('❌ 没有找到商家数据，请先初始化商家数据');
      return;
    }

    console.log(`📦 找到 ${merchants.length} 个商家，开始创建账单数据...`);

    const bills = [];

    // 为每个商家创建多个账单
    for (let i = 0; i < merchants.length; i++) {
      const merchant = merchants[i];

      // 为每个商家创建3-5个账单
      const billCount = Math.floor(Math.random() * 3) + 3;

      for (let j = 0; j < billCount; j++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (j + 1) * 7); // 每周一个账单

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const totalAmount = Math.floor(Math.random() * 50000) + 10000; // 10000-60000
        const serviceFeeRate = 0.03; // 3% 服务费率
        const serviceFee = totalAmount * serviceFeeRate;
        const actualAmount = totalAmount - serviceFee;

        const orderCount = Math.floor(Math.random() * 100) + 20; // 20-120个订单
        const totalQuantity = Math.floor(Math.random() * 500) + 100; // 100-600个商品

        // 随机状态
        const statuses = ['pending', 'confirmed', 'paid', 'overdue'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const billData = {
          merchant: merchant._id,
          settlementOrders: [], // 暂时为空，可以后续关联
          totalAmount: totalAmount,
          serviceFee: serviceFee,
          serviceFeeRate: serviceFeeRate,
          actualAmount: actualAmount,
          billPeriodStart: startDate,
          billPeriodEnd: endDate,
          orderCount: orderCount,
          totalQuantity: totalQuantity,
          status: status,
          remark: `${merchant.merchantName}的第${j + 1}期结算账单`,
          internalNotes: `系统自动生成的测试数据 - ${new Date().toISOString()}`
        };

        // 根据状态设置相关时间戳
        if (status === 'confirmed' || status === 'paid') {
          billData.confirmedAt = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 账单期开始后1天确认
        }

        if (status === 'paid') {
          billData.paidAt = new Date(startDate.getTime() + 48 * 60 * 60 * 1000); // 确认后1天支付
          billData.paymentMethod = ['balance', 'bank_transfer', 'online_payment'][Math.floor(Math.random() * 3)];
          billData.paymentReference = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        }

        bills.push(billData);
      }
    }

    console.log(`💾 插入 ${bills.length} 条账单数据...`);
    const result = await Bill.insertMany(bills);

    console.log(`✅ 成功创建 ${result.length} 条账单数据`);

    // 显示统计信息
    const stats = await Bill.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    console.log('\n📊 账单状态统计:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 条, 总金额: ¥${stat.totalAmount.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ 初始化账单数据失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await initBillData();

  console.log('\n🎉 账单数据初始化完成!');
  process.exit(0);
};

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { initBillData }; 