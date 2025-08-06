const mongoose = require('mongoose');
const config = require('./config/index');
const SettlementOrder = require('./moudle/merchant/settlementOrder');
const Merchant = require('./moudle/merchant/merchant');

async function debugData() {
  try {
    console.log('🔍 开始调试数据库数据...');

    // 连接数据库
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ 数据库连接成功');

    // 1. 检查结算订单数据
    console.log('\n📋 检查结算订单数据:');
    const orderCount = await SettlementOrder.countDocuments();
    console.log(`订单总数: ${orderCount}`);

    if (orderCount > 0) {
      const orders = await SettlementOrder.find().limit(3);
      console.log('\n前3条订单数据:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. 订单号: ${order.orderNumber}`);
        console.log(`   商家ID: ${order.merchant}`);
        console.log(`   规格: ${order.specification}`);
        console.log(`   状态: ${order.status}`);
        console.log(`   总金额: ${order.totalAmount}`);
        console.log('---');
      });
    }

    // 2. 检查商家数据
    console.log('\n📋 检查商家数据:');
    const merchantCount = await Merchant.countDocuments();
    console.log(`商家总数: ${merchantCount}`);

    if (merchantCount > 0) {
      const merchants = await Merchant.find().limit(3);
      console.log('\n前3个商家数据:');
      merchants.forEach((merchant, index) => {
        console.log(`${index + 1}. 商家名称: ${merchant.name}`);
        console.log(`   ID: ${merchant._id}`);
        console.log(`   电话: ${merchant.phone}`);
        console.log('---');
      });
    }

    // 3. 测试聚合查询
    console.log('\n📋 测试聚合查询:');
    const pipeline = [
      // 关联商家信息
      {
        $lookup: {
          from: 'merchant',
          localField: 'merchant',
          foreignField: '_id',
          as: 'merchantInfo'
        }
      },
      {
        $unwind: '$merchantInfo'
      },
      // 添加计算字段
      {
        $addFields: {
          orderNo: '$orderNumber',
          merchantName: '$merchantInfo.name',
          networkPoint: '$requiredOutlet',
          productName: '$specification', // 直接使用规格作为商品名称
          specifications: '$specification',
          supplyPrice: '$supplyPrice',
          quantity: '$quantity',
          totalPrice: '$totalAmount',
          settlementStatus: {
            $switch: {
              branches: [
                { case: { $in: ['$status', ['pending', 'confirmed', 'approved', 'shipped', 'delivered']] }, then: 'unsettled' },
                { case: { $eq: ['$status', 'completed'] }, then: 'settled' },
                { case: { $in: ['$status', ['rejected', 'cancelled']] }, then: 'failed' }
              ],
              default: 'unsettled'
            }
          }
        }
      },
      // 投影需要的字段
      {
        $project: {
          id: { $toString: '$_id' },
          orderNo: 1,
          merchantName: 1,
          networkPoint: 1,
          productName: 1,
          specifications: 1,
          supplyPrice: 1,
          quantity: 1,
          totalPrice: 1,
          settlementStatus: 1,
          paymentTime: 1,
          settlementTime: 1
        }
      },
      { $limit: 3 }
    ];

    const aggregateResult = await SettlementOrder.aggregate(pipeline);
    console.log(`聚合查询结果数量: ${aggregateResult.length}`);

    if (aggregateResult.length > 0) {
      console.log('\n聚合查询结果示例:');
      console.log(JSON.stringify(aggregateResult[0], null, 2));
    }

    console.log('\n🎉 调试完成！');

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 运行调试
debugData(); 