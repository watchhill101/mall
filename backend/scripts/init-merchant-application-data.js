const mongoose = require('mongoose');
const MerchantApplication = require('../moudle/merchant/merchantApplication');
const Merchant = require('../moudle/merchant/merchant');
const PersonInCharge = require('../moudle/person/personInCharge');
const config = require('../config');

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 创建测试负责人数据
async function createPersonInCharge() {
  const persons = [
    {
      name: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      position: '总经理',
      department: '管理部',
      level: 'admin',
      status: 'active'
    },
    {
      name: '李四',
      phone: '13800138002',
      email: 'lisi@example.com',
      position: '业务经理',
      department: '业务部',
      level: 'manager',
      status: 'active'
    },
    {
      name: '王五',
      phone: '13800138003',
      email: 'wangwu@example.com',
      position: '客户经理',
      department: '客户部',
      level: 'staff',
      status: 'active'
    },
    {
      name: '赵六',
      phone: '13800138004',
      email: 'zhaoliu@example.com',
      position: '运营经理',
      department: '运营部',
      level: 'manager',
      status: 'active'
    },
    {
      name: '钱七',
      phone: '13800138005',
      email: 'qianqi@example.com',
      position: '销售经理',
      department: '销售部',
      level: 'manager',
      status: 'active'
    }
  ];

  const createdPersons = [];
  for (const person of persons) {
    try {
      const existingPerson = await PersonInCharge.findOne({
        $or: [{ phone: person.phone }, { email: person.email }]
      });

      if (!existingPerson) {
        const newPerson = new PersonInCharge(person);
        await newPerson.save();
        createdPersons.push(newPerson);
        console.log(`✅ 创建负责人: ${person.name}`);
      } else {
        createdPersons.push(existingPerson);
        console.log(`📝 负责人已存在: ${person.name}`);
      }
    } catch (error) {
      console.error(`❌ 创建负责人失败 ${person.name}:`, error.message);
    }
  }

  return createdPersons;
}

// 创建测试商家数据
async function createMerchants(persons) {
  const merchants = [
    {
      name: '阿里巴巴集团',
      merchantType: 'manufacturer',
      phone: '400-800-1688',
      address: '浙江省杭州市余杭区',
      logoUrl: 'https://example.com/logo1.png',
      personInCharge: persons[0]._id,
      role: new mongoose.Types.ObjectId(),
      serviceCharge: 0.05,
      status: 'active'
    },
    {
      name: '京东商城',
      merchantType: 'retail',
      phone: '400-606-5500',
      address: '北京市朝阳区北辰世纪中心',
      logoUrl: 'https://example.com/logo2.png',
      personInCharge: persons[1]._id,
      role: new mongoose.Types.ObjectId(),
      serviceCharge: 0.08,
      status: 'active'
    },
    {
      name: '苏宁易购',
      merchantType: 'retail',
      phone: '95177',
      address: '江苏省南京市玄武区',
      logoUrl: 'https://example.com/logo3.png',
      personInCharge: persons[2]._id,
      role: new mongoose.Types.ObjectId(),
      serviceCharge: 0.06,
      status: 'inReview'
    },
    {
      name: '华为技术有限公司',
      merchantType: 'manufacturer',
      phone: '400-822-9999',
      address: '广东省深圳市龙岗区',
      logoUrl: 'https://example.com/logo4.png',
      personInCharge: persons[3]._id,
      role: new mongoose.Types.ObjectId(),
      serviceCharge: 0.04,
      status: 'active'
    },
    {
      name: '小米科技',
      merchantType: 'manufacturer',
      phone: '400-100-5678',
      address: '北京市海淀区清河中街68号',
      logoUrl: 'https://example.com/logo5.png',
      personInCharge: persons[4]._id,
      role: new mongoose.Types.ObjectId(),
      serviceCharge: 0.07,
      status: 'suspended'
    }
  ];

  const createdMerchants = [];
  for (const merchant of merchants) {
    try {
      const existingMerchant = await Merchant.findOne({ phone: merchant.phone });

      if (!existingMerchant) {
        const newMerchant = new Merchant(merchant);
        await newMerchant.save();
        createdMerchants.push(newMerchant);
        console.log(`✅ 创建商家: ${merchant.name}`);
      } else {
        createdMerchants.push(existingMerchant);
        console.log(`📝 商家已存在: ${merchant.name}`);
      }
    } catch (error) {
      console.error(`❌ 创建商家失败 ${merchant.name}:`, error.message);
    }
  }

  return createdMerchants;
}

// 创建商家申请测试数据
async function createMerchantApplications(merchants, persons) {
  const applications = [
    {
      merchant: merchants[0]._id,
      personInCharge: persons[0]._id,
      applicationType: 'registration',
      applicationData: {
        businessScope: '电子商务平台',
        expectedLaunchDate: '2024-12-01'
      },
      remark: '申请开通电商平台服务',
      urgency: 'normal',
      status: 'pending',
      applicationTime: new Date('2024-01-15')
    },
    {
      merchant: merchants[1]._id,
      personInCharge: persons[1]._id,
      applicationType: 'modification',
      applicationData: {
        changeType: '业务范围扩展',
        newBusinessScope: '增加跨境电商业务'
      },
      remark: '申请扩展业务范围',
      urgency: 'high',
      status: 'approved',
      applicationTime: new Date('2024-01-10'),
      reviewer: persons[4]._id,
      reviewTime: new Date('2024-01-12'),
      reviewResult: '申请通过，业务范围已更新'
    },
    {
      merchant: merchants[2]._id,
      personInCharge: persons[2]._id,
      applicationType: 'activation',
      applicationData: {
        reason: '完成整改，申请重新激活账户'
      },
      remark: '账户暂停期间已完成系统升级',
      urgency: 'urgent',
      status: 'rejected',
      applicationTime: new Date('2024-01-08'),
      reviewer: persons[3]._id,
      reviewTime: new Date('2024-01-09'),
      reviewResult: '申请拒绝',
      rejectionReason: '整改材料不完整，需补充相关证明文件'
    },
    {
      merchant: merchants[3]._id,
      personInCharge: persons[3]._id,
      applicationType: 'registration',
      applicationData: {
        businessScope: '智能设备制造与销售',
        expectedLaunchDate: '2024-11-15'
      },
      remark: '华为官方旗舰店申请',
      urgency: 'high',
      status: 'approved',
      applicationTime: new Date('2024-01-05'),
      reviewer: persons[0]._id,
      reviewTime: new Date('2024-01-06'),
      reviewResult: '申请通过，欢迎入驻'
    },
    {
      merchant: merchants[4]._id,
      personInCharge: persons[4]._id,
      applicationType: 'suspension',
      applicationData: {
        reason: '主动申请暂停业务，进行系统维护'
      },
      remark: '预计维护时间1个月',
      urgency: 'normal',
      status: 'pending',
      applicationTime: new Date('2024-01-20')
    },
    {
      merchant: merchants[0]._id,
      personInCharge: persons[0]._id,
      applicationType: 'modification',
      applicationData: {
        changeType: '联系信息更新',
        newContactInfo: '新的客服热线：400-800-1699'
      },
      remark: '更新客服联系方式',
      urgency: 'low',
      status: 'approved',
      applicationTime: new Date('2024-01-18'),
      reviewer: persons[1]._id,
      reviewTime: new Date('2024-01-19'),
      reviewResult: '联系信息已更新'
    },
    {
      merchant: merchants[1]._id,
      personInCharge: persons[1]._id,
      applicationType: 'termination',
      applicationData: {
        reason: '业务调整，暂停电商业务'
      },
      remark: '计划6个月后重新申请',
      urgency: 'normal',
      status: 'pending',
      applicationTime: new Date('2024-01-22')
    },
    {
      merchant: merchants[2]._id,
      personInCharge: persons[2]._id,
      applicationType: 'registration',
      applicationData: {
        businessScope: '家电零售',
        expectedLaunchDate: '2024-12-10'
      },
      remark: '苏宁易购官方申请',
      urgency: 'high',
      status: 'approved',
      applicationTime: new Date('2024-01-12'),
      reviewer: persons[4]._id,
      reviewTime: new Date('2024-01-14'),
      reviewResult: '申请通过，已开通相关权限'
    }
  ];

  let createdCount = 0;
  for (const application of applications) {
    try {
      // 检查是否已存在相同的申请
      const existingApplication = await MerchantApplication.findOne({
        merchant: application.merchant,
        personInCharge: application.personInCharge,
        applicationType: application.applicationType,
        applicationTime: application.applicationTime
      });

      if (!existingApplication) {
        const newApplication = new MerchantApplication(application);
        await newApplication.save();
        createdCount++;
        console.log(`✅ 创建申请: ${merchants.find(m => m._id.equals(application.merchant))?.name} - ${application.applicationType}`);
      } else {
        console.log(`📝 申请已存在: ${merchants.find(m => m._id.equals(application.merchant))?.name} - ${application.applicationType}`);
      }
    } catch (error) {
      console.error(`❌ 创建申请失败:`, error.message);
    }
  }

  return createdCount;
}

// 主函数
async function initMerchantApplicationData() {
  try {
    await connectDB();

    console.log('🚀 开始初始化商家申请测试数据...\n');

    // 1. 创建负责人
    console.log('📝 创建负责人数据...');
    const persons = await createPersonInCharge();
    console.log(`✅ 负责人数据创建完成，共 ${persons.length} 条\n`);

    // 2. 创建商家
    console.log('🏢 创建商家数据...');
    const merchants = await createMerchants(persons);
    console.log(`✅ 商家数据创建完成，共 ${merchants.length} 条\n`);

    // 3. 创建商家申请
    console.log('📋 创建商家申请数据...');
    const applicationCount = await createMerchantApplications(merchants, persons);
    console.log(`✅ 商家申请数据创建完成，共 ${applicationCount} 条\n`);

    // 4. 统计信息
    const totalApplications = await MerchantApplication.countDocuments();
    const pendingCount = await MerchantApplication.countDocuments({ status: 'pending' });
    const approvedCount = await MerchantApplication.countDocuments({ status: 'approved' });
    const rejectedCount = await MerchantApplication.countDocuments({ status: 'rejected' });

    console.log('📊 数据统计:');
    console.log(`   总申请数: ${totalApplications}`);
    console.log(`   待审核: ${pendingCount}`);
    console.log(`   已通过: ${approvedCount}`);
    console.log(`   已拒绝: ${rejectedCount}`);

    console.log('\n🎉 商家申请测试数据初始化完成！');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📝 数据库连接已关闭');
    process.exit(0);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initMerchantApplicationData();
}

module.exports = { initMerchantApplicationData }; 