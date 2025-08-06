const mongoose = require('mongoose');
require('../moudle/index'); // 连接数据库

const AccountDetail = require('../moudle/merchant/accountDetail');
const Merchant = require('../moudle/merchant/merchant');

// 测试数据
const testAccountDetailData = [
  {
    // 这个merchant字段会在下面根据实际merchant ID填充
    accountBalance: 15800,
    withdrawnAmount: 5200,
    unsettledAmount: 8000,
    withdrawingAmount: 2600,
    serviceFee: 1200,
    frozenAmount: 0
  },
  {
    accountBalance: 23600,
    withdrawnAmount: 8900,
    unsettledAmount: 12000,
    withdrawingAmount: 2700,
    serviceFee: 1800,
    frozenAmount: 500
  },
  {
    accountBalance: 12400,
    withdrawnAmount: 4200,
    unsettledAmount: 6800,
    withdrawingAmount: 1400,
    serviceFee: 950,
    frozenAmount: 0
  },
  {
    accountBalance: 28900,
    withdrawnAmount: 12500,
    unsettledAmount: 14000,
    withdrawingAmount: 2400,
    serviceFee: 2200,
    frozenAmount: 1000
  },
  {
    accountBalance: 8600,
    withdrawnAmount: 3100,
    unsettledAmount: 4800,
    withdrawingAmount: 700,
    serviceFee: 620,
    frozenAmount: 0
  },
  {
    accountBalance: 19200,
    withdrawnAmount: 7800,
    unsettledAmount: 9500,
    withdrawingAmount: 1900,
    serviceFee: 1450,
    frozenAmount: 300
  },
  {
    accountBalance: 31500,
    withdrawnAmount: 15200,
    unsettledAmount: 14000,
    withdrawingAmount: 2300,
    serviceFee: 2800,
    frozenAmount: 1200
  },
  {
    accountBalance: 16700,
    withdrawnAmount: 6900,
    unsettledAmount: 8200,
    withdrawingAmount: 1600,
    serviceFee: 1350,
    frozenAmount: 0
  },
  {
    accountBalance: 22800,
    withdrawnAmount: 9600,
    unsettledAmount: 11500,
    withdrawingAmount: 1700,
    serviceFee: 1900,
    frozenAmount: 400
  },
  {
    accountBalance: 18300,
    withdrawnAmount: 7200,
    unsettledAmount: 9600,
    withdrawingAmount: 1500,
    serviceFee: 1650,
    frozenAmount: 200
  }
];

async function initAccountDetailData() {
  try {
    console.log('🚀 开始初始化账户明细数据...');

    // 清除现有数据
    await AccountDetail.deleteMany({});
    console.log('✅ 清除现有账户明细数据');

    // 获取所有商家
    const merchants = await Merchant.find().limit(testAccountDetailData.length);

    if (merchants.length === 0) {
      console.log('❌ 没有找到商家数据，请先初始化商家数据');
      return;
    }

    console.log(`📊 找到 ${merchants.length} 个商家，准备创建账户明细`);

    // 为每个商家创建账户明细
    const accountDetailsToCreate = testAccountDetailData.slice(0, merchants.length).map((data, index) => ({
      ...data,
      merchant: merchants[index]._id
    }));

    // 批量插入
    const createdAccountDetails = await AccountDetail.insertMany(accountDetailsToCreate);

    console.log(`✅ 成功创建 ${createdAccountDetails.length} 条账户明细记录`);

    // 显示创建的数据摘要
    for (let i = 0; i < createdAccountDetails.length; i++) {
      const detail = createdAccountDetails[i];
      const merchant = merchants[i];
      console.log(`📝 ${merchant.name}: 余额 ¥${detail.accountBalance}, 已提现 ¥${detail.withdrawnAmount}`);
    }

    console.log('🎉 账户明细数据初始化完成！');

  } catch (error) {
    console.error('❌ 初始化账户明细数据失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行初始化
initAccountDetailData(); 