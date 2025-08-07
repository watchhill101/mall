const mongoose = require('mongoose');
const config = require('../config/index');
const SettlementOrder = require('../moudle/merchant/settlementOrder');
const Merchant = require('../moudle/merchant/merchant');

// 连接数据库
mongoose.connect(config.mongodb.uri);

const initSettlementOrderData = async () => {
  try {
    console.log('🚀 开始初始化结算订单测试数据...');

    // 清除现有数据（可选）
    await SettlementOrder.deleteMany({});
    console.log('✅ 清除现有结算订单数据');

    // 获取现有商家（如果有的话）
    const merchants = await Merchant.find().limit(3);
    console.log(`📋 找到 ${merchants.length} 个商家`);

    if (merchants.length === 0) {
      console.log('⚠️ 没有找到商家数据，请先创建商家数据');
      process.exit(1);
    }

    // 创建测试结算订单数据
    const testOrders = [
      {
        merchant: merchants[0]._id,
        requiredOutlet: '网点名称一',
        product: new mongoose.Types.ObjectId(), // 模拟商品ID
        specification: '规格A 128GB',
        supplyPrice: 2999,
        quantity: 1,
        deliveryAddress: '北京市朝阳区测试地址1号',
        deliveryPhone: '13800138001',
        deliveryContact: '张三',
        status: 'completed',
        paymentTime: new Date('2023-12-10T10:30:00'),
        settlementTime: new Date('2023-12-15T16:20:00'),
        orderRemark: '测试订单1'
      },
      {
        merchant: merchants[0]._id,
        requiredOutlet: '网点名称二',
        product: new mongoose.Types.ObjectId(),
        specification: '规格B 256GB',
        supplyPrice: 3999,
        quantity: 2,
        deliveryAddress: '上海市浦东新区测试地址2号',
        deliveryPhone: '13800138002',
        deliveryContact: '李四',
        status: 'delivered',
        paymentTime: new Date('2023-12-12T14:20:00'),
        orderRemark: '测试订单2'
      },
      {
        merchant: merchants.length > 1 ? merchants[1]._id : merchants[0]._id,
        requiredOutlet: '网点名称三',
        product: new mongoose.Types.ObjectId(),
        specification: '规格C 512GB',
        supplyPrice: 5999,
        quantity: 1,
        deliveryAddress: '广州市天河区测试地址3号',
        deliveryPhone: '13800138003',
        deliveryContact: '王五',
        status: 'pending',
        paymentTime: new Date('2023-12-14T09:15:00'),
        orderRemark: '测试订单3'
      },
      {
        merchant: merchants.length > 2 ? merchants[2]._id : merchants[0]._id,
        requiredOutlet: '网点名称四',
        product: new mongoose.Types.ObjectId(),
        specification: '规格D 1TB',
        supplyPrice: 7999,
        quantity: 1,
        deliveryAddress: '深圳市南山区测试地址4号',
        deliveryPhone: '13800138004',
        deliveryContact: '赵六',
        status: 'cancelled',
        paymentTime: new Date('2023-12-13T11:45:00'),
        orderRemark: '测试订单4'
      },
      {
        merchant: merchants[0]._id,
        requiredOutlet: '网点名称五',
        product: new mongoose.Types.ObjectId(),
        specification: '规格E 2TB',
        supplyPrice: 9999,
        quantity: 3,
        deliveryAddress: '杭州市西湖区测试地址5号',
        deliveryPhone: '13800138005',
        deliveryContact: '钱七',
        status: 'shipped',
        paymentTime: new Date('2023-12-15T13:30:00'),
        deliveryTime: new Date('2023-12-16T10:00:00'),
        orderRemark: '测试订单5'
      }
    ];

    // 插入数据
    const insertedOrders = await SettlementOrder.insertMany(testOrders);
    console.log(`✅ 成功插入 ${insertedOrders.length} 条结算订单数据`);

    // 显示插入的数据
    console.log('\n📋 插入的结算订单数据:');
    insertedOrders.forEach((order, index) => {
      console.log(`${index + 1}. 订单号: ${order.orderNumber}, 状态: ${order.status}, 金额: ¥${order.totalAmount}`);
    });

    console.log('\n🎉 结算订单测试数据初始化完成！');

  } catch (error) {
    console.error('❌ 初始化结算订单数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
};

// 运行初始化
initSettlementOrderData(); 