const mongoose = require('mongoose');
require('../moudle/index'); // 连接数据库

const WithdrawAccount = require('../moudle/merchant/withdrawAccount');
const Merchant = require('../moudle/merchant/merchant');

// 测试数据
const testWithdrawAccountData = [
  {
    accountType: 'unionpay',
    accountNumber: '6228480402637874213',
    accountName: '京东超市对公账户',
    bankName: '中国农业银行',
    bankCode: 'ABC',
    branchName: '北京朝阳支行',
    platformSettlementFee: 0.05, // 5%
    status: 'normal'
  },
  {
    accountType: 'wechat',
    accountNumber: 'wx_tencent_digital_2024',
    accountName: '腾讯数码专营店',
    bankName: '',
    platformSettlementFee: 0.03, // 3%
    status: 'normal'
  },
  {
    accountType: 'alipay',
    accountNumber: 'alipay_baidu_smart_2024',
    accountName: '百度智能设备',
    bankName: '',
    platformSettlementFee: 0.04, // 4%
    status: 'disabled'
  },
  {
    accountType: 'unionpay',
    accountNumber: '6222024000012345678',
    accountName: '美团外卖商家',
    bankName: '中国建设银行',
    bankCode: 'CCB',
    branchName: '上海浦东支行',
    platformSettlementFee: 0.035, // 3.5%
    status: 'normal'
  },
  {
    accountType: 'unionpay',
    accountNumber: '6217000000000012345',
    accountName: '华为商城',
    bankName: '中国工商银行',
    bankCode: 'ICBC',
    branchName: '深圳南山支行',
    platformSettlementFee: 0.025, // 2.5%
    status: 'normal'
  },
  {
    accountType: 'alipay',
    accountNumber: 'pdd_youxuan_2024',
    accountName: '拼多多优选',
    bankName: '',
    platformSettlementFee: 0.045, // 4.5%
    status: 'normal'
  },
  {
    accountType: 'wechat',
    accountNumber: 'wx_xiaomi_store_2024',
    accountName: '小米之家专营店',
    bankName: '',
    platformSettlementFee: 0.04, // 4%
    status: 'disabled'
  }
];

async function initWithdrawAccountData() {
  try {
    console.log('🚀 开始初始化提现账号数据...');

    // 清除现有数据
    await WithdrawAccount.deleteMany({});
    console.log('✅ 清除现有提现账号数据');

    // 获取所有商家
    const merchants = await Merchant.find().limit(testWithdrawAccountData.length);

    if (merchants.length === 0) {
      console.log('❌ 没有找到商家数据，请先初始化商家数据');
      return;
    }

    console.log(`📊 找到 ${merchants.length} 个商家，准备创建提现账号`);

    // 为每个商家创建提现账号
    const withdrawAccountsToCreate = testWithdrawAccountData.slice(0, merchants.length).map((data, index) => ({
      ...data,
      merchant: merchants[index]._id,
      createdBy: merchants[index]._id // 使用商家ID作为创建人
    }));

    // 批量插入
    const createdWithdrawAccounts = await WithdrawAccount.insertMany(withdrawAccountsToCreate);

    console.log(`✅ 成功创建 ${createdWithdrawAccounts.length} 条提现账号记录`);

    // 显示创建的数据摘要
    for (let i = 0; i < createdWithdrawAccounts.length; i++) {
      const account = createdWithdrawAccounts[i];
      const merchant = merchants[i];
      console.log(`📝 ${merchant.name}: ${account.accountType} - ${account.accountNumber} (费率: ${(account.platformSettlementFee * 100).toFixed(1)}%)`);
    }

    console.log('🎉 提现账号数据初始化完成！');

  } catch (error) {
    console.error('❌ 初始化提现账号数据失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行初始化
initWithdrawAccountData(); 