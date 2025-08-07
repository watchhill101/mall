const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');

// 导入模型
const MerchantAccount = require('../moudle/merchant/merchantAccount');
const Merchant = require('../moudle/merchant/merchant');
const PersonInCharge = require('../moudle/person/personInCharge');
const Role = require('../moudle/role/role');

async function initMerchantAccountData() {
  try {
    console.log('🔄 连接数据库...');
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ 数据库连接成功');

    // 清理现有商户账号数据
    console.log('🧹 清理现有商户账号数据...');
    await MerchantAccount.deleteMany({});
    console.log('✅ 商户账号数据清理完成');

    // 获取现有的商户、负责人和角色数据
    console.log('📋 获取现有数据...');
    const merchants = await Merchant.find().limit(8);
    const persons = await PersonInCharge.find().limit(5);
    const roles = await Role.find().limit(4);

    if (merchants.length === 0 || persons.length === 0 || roles.length === 0) {
      console.log('❌ 缺少基础数据，请先运行 init-test-data.js');
      return;
    }

    console.log(`📊 找到数据: ${merchants.length} 个商户, ${persons.length} 个负责人, ${roles.length} 个角色`);

    // 创建商户账号数据
    console.log('👤 创建商户账号数据...');

    const accountsData = [
      {
        loginAccount: 'alibaba001',
        userNickname: '阿里管理员',
        contactPhone: '400-800-1001',
        password: '123456',
        merchant: merchants[0]._id,
        personInCharge: persons[0]._id,
        role: roles[0]._id,
        status: 'active'
      },
      {
        loginAccount: 'jd002',
        userNickname: '京东经理',
        contactPhone: '400-800-1002',
        password: '123456',
        merchant: merchants[1]._id,
        personInCharge: persons[1]._id,
        role: roles[1]._id,
        status: 'active'
      },
      {
        loginAccount: 'tencent003',
        userNickname: '腾讯客服',
        contactPhone: '400-800-1003',
        password: '123456',
        merchant: merchants[2]._id,
        personInCharge: persons[2]._id,
        role: roles[2]._id,
        status: 'disabled'
      },
      {
        loginAccount: 'baidu004',
        userNickname: '百度主管',
        contactPhone: '400-800-1004',
        password: '123456',
        merchant: merchants[3]._id,
        personInCharge: persons[3]._id,
        role: roles[2]._id,
        status: 'active'
      },
      {
        loginAccount: 'meituan005',
        userNickname: '美团运营',
        contactPhone: '400-800-1005',
        password: '123456',
        merchant: merchants[4]._id,
        personInCharge: persons[4]._id,
        role: roles[3]._id,
        status: 'locked'
      }
    ];

    // 如果有更多商户，继续创建账号
    if (merchants.length > 5) {
      accountsData.push(
        {
          loginAccount: 'xiaomi006',
          userNickname: '小米助理',
          contactPhone: '400-800-1006',
          password: '123456',
          merchant: merchants[5]._id,
          personInCharge: persons[0]._id, // 复用负责人
          role: roles[1]._id,
          status: 'active'
        },
        {
          loginAccount: 'huawei007',
          userNickname: '华为专员',
          contactPhone: '400-800-1007',
          password: '123456',
          merchant: merchants[6]._id,
          personInCharge: persons[1]._id,
          role: roles[0]._id,
          status: 'active'
        }
      );
    }

    if (merchants.length > 7) {
      accountsData.push({
        loginAccount: 'pdd008',
        userNickname: '拼多多客服',
        contactPhone: '400-800-1008',
        password: '123456',
        merchant: merchants[7]._id,
        personInCharge: persons[2]._id,
        role: roles[2]._id,
        status: 'pending'
      });
    }

    // 加密密码并创建账号
    const encryptedAccounts = await Promise.all(
      accountsData.map(async (account) => ({
        ...account,
        password: await bcrypt.hash(account.password, 10)
      }))
    );

    const createdAccounts = await MerchantAccount.insertMany(encryptedAccounts);
    console.log(`✅ 创建了 ${createdAccounts.length} 个商户账号`);

    // 显示创建的账号信息
    console.log('\n📋 创建的账号信息:');
    for (const account of createdAccounts) {
      const populatedAccount = await MerchantAccount.findById(account._id)
        .populate('merchant', 'name')
        .populate('personInCharge', 'name')
        .select('-password');

      console.log(`  - ${populatedAccount.loginAccount} (${populatedAccount.userNickname}) - ${populatedAccount.merchant.name} - ${populatedAccount.status}`);
    }

    console.log('\n🎉 商户账号测试数据初始化完成！');
    console.log('📊 数据统计:');
    console.log(`   - 商户账号: ${createdAccounts.length} 个`);
    console.log(`   - 默认密码: 123456`);
    console.log('\n💡 你现在可以测试商户账号管理功能了！');

  } catch (error) {
    console.error('❌ 初始化商户账号数据失败:', error);
    console.error('错误详情:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initMerchantAccountData();
}

module.exports = initMerchantAccountData; 