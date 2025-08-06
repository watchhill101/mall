const mongoose = require('mongoose');
const config = require('../config/index');
const Merchant = require('../moudle/merchant/merchant');

// 连接数据库
mongoose.connect(config.mongodb.uri);

const initMerchantData = async () => {
  try {
    console.log('🚀 开始初始化商家测试数据...');

    // 检查是否已有商家数据
    const existingCount = await Merchant.countDocuments();
    console.log(`📋 当前商家数量: ${existingCount}`);

    if (existingCount > 0) {
      console.log('✅ 已有商家数据，跳过初始化');
      return;
    }

    // 创建测试商家数据
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

    // 插入数据
    const insertedMerchants = await Merchant.insertMany(testMerchants);
    console.log(`✅ 成功插入 ${insertedMerchants.length} 条商家数据`);

    // 显示插入的数据
    console.log('\n📋 插入的商家数据:');
    insertedMerchants.forEach((merchant, index) => {
      console.log(`${index + 1}. ${merchant.name} (${merchant.phone})`);
    });

    console.log('\n🎉 商家测试数据初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化商家数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
};

// 运行初始化
initMerchantData(); 