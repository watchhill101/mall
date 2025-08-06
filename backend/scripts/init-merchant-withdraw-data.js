const mongoose = require('mongoose');
require('../moudle/index'); // 连接数据库

const MerchantWithdraw = require('../moudle/merchant/merchantWithdraw');
const Merchant = require('../moudle/merchant/merchant');
const WithdrawAccount = require('../moudle/merchant/withdrawAccount');

// 测试提现申请数据
const testWithdrawData = [
  {
    withdrawAmount: 1000,
    serviceFeeRate: 0.02, // 2%
    applicationRemark: '申请提现到微信账户',
    status: 'pending'
  },
  {
    withdrawAmount: 2500,
    serviceFeeRate: 0.02,
    applicationRemark: '月底结算提现',
    status: 'approved'
  },
  {
    withdrawAmount: 800,
    serviceFeeRate: 0.02,
    applicationRemark: '紧急提现申请',
    status: 'rejected'
  },
  {
    withdrawAmount: 1500,
    serviceFeeRate: 0.02,
    applicationRemark: '日常运营资金提现',
    status: 'pending'
  },
  {
    withdrawAmount: 3200,
    serviceFeeRate: 0.02,
    applicationRemark: '季度收益提现',
    status: 'approved'
  },
  {
    withdrawAmount: 600,
    serviceFeeRate: 0.02,
    applicationRemark: '小额快速提现',
    status: 'cancelled'
  },
  {
    withdrawAmount: 4500,
    serviceFeeRate: 0.02,
    applicationRemark: '大额提现申请',
    status: 'pending'
  },
  {
    withdrawAmount: 1200,
    serviceFeeRate: 0.02,
    applicationRemark: '支付宝提现',
    status: 'approved'
  }
];

async function initMerchantWithdrawData() {
  try {
    console.log('🚀 开始初始化商家提现数据...');

    // 清除现有数据
    await MerchantWithdraw.deleteMany({});
    console.log('✅ 清除现有商家提现数据');

    // 获取商家和提现账号
    const merchants = await Merchant.find().limit(testWithdrawData.length);
    const withdrawAccounts = await WithdrawAccount.find().limit(testWithdrawData.length);

    if (merchants.length === 0) {
      console.log('❌ 没有找到商家数据，请先初始化商家数据');
      return;
    }

    if (withdrawAccounts.length === 0) {
      console.log('❌ 没有找到提现账号数据，请先初始化提现账号数据');
      return;
    }

    console.log(`📊 找到 ${merchants.length} 个商家和 ${withdrawAccounts.length} 个提现账号`);

        // 为每个申请创建提现记录，手动计算必需字段
    const withdrawsToCreate = testWithdrawData.slice(0, Math.min(merchants.length, withdrawAccounts.length)).map((data, index) => {
      const merchant = merchants[index % merchants.length];
      const withdrawAccount = withdrawAccounts[index % withdrawAccounts.length];
      
      // 手动计算服务费和实际金额
      const serviceFeeAmount = data.withdrawAmount * data.serviceFeeRate;
      const actualAmount = data.withdrawAmount - serviceFeeAmount;
      
      return {
        ...data,
        merchant: merchant._id,
        withdrawAccount: withdrawAccount._id,
        applicant: merchant._id, // 暂时使用商家ID作为申请人
        serviceFeeAmount: serviceFeeAmount,
        actualAmount: actualAmount,
        applicationTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 过去30天内的随机时间
        reviewTime: ['approved', 'rejected'].includes(data.status) ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) : undefined,
        bankInfo: {
          accountType: withdrawAccount.accountType,
          accountNumber: withdrawAccount.accountNumber,
          accountName: withdrawAccount.accountName
        }
      };
    });

    // 批量插入
    const createdWithdraws = await MerchantWithdraw.insertMany(withdrawsToCreate);

    console.log(`✅ 成功创建 ${createdWithdraws.length} 条商家提现记录`);

    // 显示创建的数据摘要
    for (let i = 0; i < createdWithdraws.length; i++) {
      const withdraw = createdWithdraws[i];
      const merchant = merchants[i % merchants.length];
      console.log(`📝 ${merchant.name}: ¥${withdraw.withdrawAmount} (${withdraw.status}) - ${withdraw.orderNumber}`);
    }

    console.log('🎉 商家提现数据初始化完成！');

  } catch (error) {
    console.error('❌ 初始化商家提现数据失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行初始化
initMerchantWithdrawData(); 