const mongoose = require('mongoose');
const config = require('./config/index');

// 导入模型
const Merchant = require('./moudle/merchant/merchant');
const SettlementOrder = require('./moudle/merchant/settlementOrder');

async function addTestData() {
  try {
    console.log('🚀 开始添加测试数据...');

    // 连接数据库
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ 数据库连接成功');

    // 1. 检查并添加商家数据
    console.log('\n📋 第一步：检查商家数据');
    let merchants = await Merchant.find().limit(5);

    if (merchants.length === 0) {
      console.log('创建商家数据...');
      const merchantData = [
        {
          name: '阿里巴巴集团',
          businessLicense: '91330000000000001X',
          phone: '13800138001',
          address: '杭州市余杭区文一西路969号',
          contactPerson: '张三',
          email: 'zhangsan@alibaba.com',
          status: 'active'
        },
        {
          name: '腾讯科技有限公司',
          businessLicense: '91440300000000002Y',
          phone: '13800138002',
          address: '深圳市南山区科技中一路腾讯大厦',
          contactPerson: '李四',
          email: 'lisi@tencent.com',
          status: 'active'
        },
        {
          name: '百度网讯科技',
          businessLicense: '91110000000000003Z',
          phone: '13800138003',
          address: '北京市海淀区上地十街10号百度大厦',
          contactPerson: '王五',
          email: 'wangwu@baidu.com',
          status: 'active'
        }
      ];

      merchants = await Merchant.insertMany(merchantData);
      console.log(`✅ 成功创建 ${merchants.length} 个商家`);
    } else {
      console.log(`✅ 已有 ${merchants.length} 个商家，使用现有数据`);
    }

    // 2. 清除现有结算订单数据并添加新数据
    console.log('\n📋 第二步：添加结算订单数据');
    await SettlementOrder.deleteMany({});
    console.log('✅ 清除现有结算订单数据');

    // 创建结算订单数据
    const orderData = [
      {
        merchant: merchants[0]._id,
        requiredOutlet: '杭州西湖网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'iPhone 15 Pro 256GB 深空黑',
        supplyPrice: 7999,
        quantity: 1,
        deliveryAddress: '杭州市西湖区文三路123号',
        deliveryPhone: '13800138001',
        deliveryContact: '张三',
        status: 'completed',
        paymentTime: new Date('2024-01-10T10:30:00'),
        settlementTime: new Date('2024-01-15T16:20:00'),
        orderRemark: '高端手机订单'
      },
      {
        merchant: merchants[1]._id,
        requiredOutlet: '深圳南山网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'MacBook Pro 14寸 M3 512GB',
        supplyPrice: 15999,
        quantity: 1,
        deliveryAddress: '深圳市南山区科技园南区',
        deliveryPhone: '13800138002',
        deliveryContact: '李四',
        status: 'delivered',
        paymentTime: new Date('2024-01-12T14:20:00'),
        orderRemark: '笔记本电脑订单'
      },
      {
        merchant: merchants[2]._id,
        requiredOutlet: '北京海淀网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'iPad Air 256GB WiFi版',
        supplyPrice: 4599,
        quantity: 2,
        deliveryAddress: '北京市海淀区中关村大街1号',
        deliveryPhone: '13800138003',
        deliveryContact: '王五',
        status: 'pending',
        paymentTime: new Date('2024-01-14T09:15:00'),
        orderRemark: '平板电脑批量订单'
      },
      {
        merchant: merchants[0]._id,
        requiredOutlet: '北京朝阳网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'AirPods Pro 第二代',
        supplyPrice: 1899,
        quantity: 5,
        deliveryAddress: '北京市朝阳区建国门外大街1号',
        deliveryPhone: '13800138004',
        deliveryContact: '赵六',
        status: 'cancelled',
        paymentTime: new Date('2024-01-13T11:45:00'),
        orderRemark: '耳机批量订单'
      },
      {
        merchant: merchants[1]._id,
        requiredOutlet: '北京望京网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'Apple Watch Series 9 45mm',
        supplyPrice: 3199,
        quantity: 3,
        deliveryAddress: '北京市朝阳区望京SOHO',
        deliveryPhone: '13800138005',
        deliveryContact: '钱七',
        status: 'shipped',
        paymentTime: new Date('2024-01-15T13:30:00'),
        deliveryTime: new Date('2024-01-16T10:00:00'),
        orderRemark: '智能手表订单'
      },
      {
        merchant: merchants[2]._id,
        requiredOutlet: '杭州滨江网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'iPhone 15 128GB 粉色',
        supplyPrice: 5999,
        quantity: 2,
        deliveryAddress: '杭州市滨江区网商路699号',
        deliveryPhone: '13800138006',
        deliveryContact: '孙八',
        status: 'completed',
        paymentTime: new Date('2024-01-16T15:20:00'),
        settlementTime: new Date('2024-01-20T11:30:00'),
        orderRemark: '标准版手机订单'
      },
      {
        merchant: merchants[0]._id,
        requiredOutlet: '深圳福田网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'MacBook Air 13寸 M2 256GB',
        supplyPrice: 8999,
        quantity: 1,
        deliveryAddress: '深圳市福田区深南大道1006号',
        deliveryPhone: '13800138007',
        deliveryContact: '周九',
        status: 'approved',
        paymentTime: new Date('2024-01-17T09:45:00'),
        orderRemark: '轻薄笔记本订单'
      },
      {
        merchant: merchants[1]._id,
        requiredOutlet: '北京西城网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'iMac 24寸 M3 512GB',
        supplyPrice: 13999,
        quantity: 1,
        deliveryAddress: '北京市西城区金融街35号',
        deliveryPhone: '13800138008',
        deliveryContact: '吴十',
        status: 'pending',
        paymentTime: new Date('2024-01-18T16:10:00'),
        orderRemark: '一体机电脑订单'
      },
      {
        merchant: merchants[2]._id,
        requiredOutlet: '上海浦东网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'iPad Pro 12.9寸 1TB',
        supplyPrice: 10999,
        quantity: 1,
        deliveryAddress: '上海市浦东新区陆家嘴环路1000号',
        deliveryPhone: '13800138009',
        deliveryContact: '郑十一',
        status: 'shipped',
        paymentTime: new Date('2024-01-19T14:25:00'),
        deliveryTime: new Date('2024-01-20T09:15:00'),
        orderRemark: '专业平板订单'
      },
      {
        merchant: merchants[0]._id,
        requiredOutlet: '广州天河网点',
        product: new mongoose.Types.ObjectId(),
        specification: 'Mac Studio M2 Ultra',
        supplyPrice: 39999,
        quantity: 1,
        deliveryAddress: '广州市天河区珠江新城花城大道85号',
        deliveryPhone: '13800138010',
        deliveryContact: '王十二',
        status: 'completed',
        paymentTime: new Date('2024-01-20T11:10:00'),
        settlementTime: new Date('2024-01-25T16:45:00'),
        orderRemark: '高性能工作站订单'
      }
    ];

    // 为每个订单计算总金额
    const ordersWithTotal = orderData.map(order => ({
      ...order,
      totalAmount: order.supplyPrice * order.quantity
    }));

    const orders = await SettlementOrder.insertMany(ordersWithTotal);
    console.log(`✅ 成功创建 ${orders.length} 个结算订单`);

    // 3. 显示统计信息
    console.log('\n📊 数据统计:');
    console.log(`   商家总数: ${merchants.length}`);
    console.log(`   结算订单总数: ${orders.length}`);

    // 按状态统计
    const statusStats = {};
    orders.forEach(order => {
      statusStats[order.status] = (statusStats[order.status] || 0) + 1;
    });

    console.log('\n📈 订单状态分布:');
    const statusMap = {
      pending: '待处理',
      confirmed: '已确认',
      approved: '已审批',
      shipped: '已发货',
      delivered: '已送达',
      completed: '已完成',
      cancelled: '已取消',
      rejected: '已拒绝'
    };

    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   ${statusMap[status] || status}: ${count} 单`);
    });

    // 计算总金额
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log(`\n💰 订单总金额: ¥${totalAmount.toLocaleString()}`);

    console.log('\n🎉 测试数据添加完成！');
    console.log('\n💡 现在可以：');
    console.log('   1. 访问前端结算订单页面查看数据');
    console.log('   2. 使用搜索和筛选功能');
    console.log('   3. 测试分页和导出功能');

  } catch (error) {
    console.error('❌ 添加测试数据失败:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 运行脚本
addTestData(); 