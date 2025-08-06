const mongoose = require('mongoose');
const config = require('../config/index');
const Merchant = require('../moudle/merchant/merchant');
const SettlementOrder = require('../moudle/merchant/settlementOrder');

// 连接数据库
mongoose.connect(config.mongodb.uri);

const initAllTestData = async () => {
  try {
    console.log('🚀 开始初始化所有测试数据...\n');

    // 1. 初始化商家数据
    console.log('📋 第一步：初始化商家数据');
    const existingMerchantCount = await Merchant.countDocuments();
    console.log(`当前商家数量: ${existingMerchantCount}`);

    let merchants = [];
    if (existingMerchantCount === 0) {
      const testMerchants = [
        {
          name: '阿里巴巴集团',
          businessLicense: '91330000000000001X',
          phone: '13800138001',
          address: '杭州市余杭区文一西路969号',
          contactPerson: '张三',
          email: 'zhangsan@alibaba.com',
          status: 'active',
          registrationTime: new Date('2020-01-15'),
          businessScope: '电子商务、云计算服务',
          legalRepresentative: '张三'
        },
        {
          name: '腾讯科技有限公司',
          businessLicense: '91440300000000002Y',
          phone: '13800138002',
          address: '深圳市南山区科技中一路腾讯大厦',
          contactPerson: '李四',
          email: 'lisi@tencent.com',
          status: 'active',
          registrationTime: new Date('2020-03-20'),
          businessScope: '互联网信息服务、游戏开发',
          legalRepresentative: '李四'
        },
        {
          name: '百度网讯科技',
          businessLicense: '91110000000000003Z',
          phone: '13800138003',
          address: '北京市海淀区上地十街10号百度大厦',
          contactPerson: '王五',
          email: 'wangwu@baidu.com',
          status: 'active',
          registrationTime: new Date('2020-05-10'),
          businessScope: '搜索引擎、人工智能',
          legalRepresentative: '王五'
        },
        {
          name: '京东商城',
          businessLicense: '91110000000000004A',
          phone: '13800138004',
          address: '北京市朝阳区北辰世纪中心A座',
          contactPerson: '赵六',
          email: 'zhaoliu@jd.com',
          status: 'active',
          registrationTime: new Date('2020-07-25'),
          businessScope: '电子商务、物流配送',
          legalRepresentative: '赵六'
        },
        {
          name: '美团点评',
          businessLicense: '91110000000000005B',
          phone: '13800138005',
          address: '北京市朝阳区望京东路6号望京国际商业中心',
          contactPerson: '钱七',
          email: 'qianqi@meituan.com',
          status: 'active',
          registrationTime: new Date('2020-09-15'),
          businessScope: '本地生活服务、外卖配送',
          legalRepresentative: '钱七'
        }
      ];

      merchants = await Merchant.insertMany(testMerchants);
      console.log(`✅ 成功插入 ${merchants.length} 条商家数据`);
    } else {
      merchants = await Merchant.find().limit(5);
      console.log('✅ 使用现有商家数据');
      console.log(`   获取到 ${merchants.length} 个商家`);
    }

    if (merchants.length === 0) {
      console.log('❌ 没有商家数据，无法创建结算订单');
      return;
    }

    // 2. 初始化结算订单数据
    console.log('\n📋 第二步：初始化结算订单数据');
    const existingOrderCount = await SettlementOrder.countDocuments();
    console.log(`当前结算订单数量: ${existingOrderCount}`);

    // 清除现有订单数据（可选）
    if (existingOrderCount > 0) {
      await SettlementOrder.deleteMany({});
      console.log('✅ 清除现有结算订单数据');
    }

    // 创建测试结算订单数据
    const orderTemplates = [
      {
        requiredOutlet: '杭州西湖网点',
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
        requiredOutlet: '深圳南山网点',
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
        requiredOutlet: '北京海淀网点',
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
        requiredOutlet: '北京朝阳网点',
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
        requiredOutlet: '北京望京网点',
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
        requiredOutlet: '杭州滨江网点',
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
        requiredOutlet: '深圳福田网点',
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
        requiredOutlet: '北京西城网点',
        specification: 'iMac 24寸 M3 512GB',
        supplyPrice: 13999,
        quantity: 1,
        deliveryAddress: '北京市西城区金融街35号',
        deliveryPhone: '13800138008',
        deliveryContact: '吴十',
        status: 'pending',
        paymentTime: new Date('2024-01-18T16:10:00'),
        orderRemark: '一体机电脑订单'
      }
    ];

    // 为每个订单模板分配商家ID和产品ID
    const testOrders = orderTemplates.map((template, index) => ({
      ...template,
      merchant: merchants[index % merchants.length]._id,
      product: new mongoose.Types.ObjectId()
    }));

    const insertedOrders = await SettlementOrder.insertMany(testOrders);
    console.log(`✅ 成功插入 ${insertedOrders.length} 条结算订单数据`);

    // 3. 显示数据统计
    console.log('\n📊 数据统计:');
    console.log(`   商家总数: ${merchants.length}`);
    console.log(`   结算订单总数: ${insertedOrders.length}`);

    // 按状态统计订单
    const statusStats = {};
    insertedOrders.forEach(order => {
      statusStats[order.status] = (statusStats[order.status] || 0) + 1;
    });

    console.log('\n📈 订单状态分布:');
    Object.entries(statusStats).forEach(([status, count]) => {
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
      console.log(`   ${statusMap[status] || status}: ${count} 单`);
    });

    // 计算总金额
    const totalAmount = insertedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log(`\n💰 订单总金额: ¥${totalAmount.toLocaleString()}`);

    console.log('\n🎉 所有测试数据初始化完成！');
    console.log('\n💡 现在可以：');
    console.log('   1. 运行 node ../test-settlement-order-api.js 测试API');
    console.log('   2. 启动前端项目查看结算订单页面');
    console.log('   3. 通过API进行各种查询和操作测试');

  } catch (error) {
    console.error('❌ 初始化测试数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
};

// 运行初始化
initAllTestData(); 