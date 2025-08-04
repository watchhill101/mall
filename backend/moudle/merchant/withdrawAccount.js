const mongoose = require("mongoose");

//提现账号模型
const withdrawAccountSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    
    accountType: {
      type: String,
      required: true,
      enum: ["unionpay", "wechat", "alipay"]
    }, //账户类型：银联/微信/支付宝
    
    accountNumber: { type: String, required: true }, //账户号码
    accountName: { type: String, required: true }, //账户名称
    
    // 银行信息（仅银联卡需要）
    bankName: { type: String }, //银行名称
    bankCode: { type: String }, //银行代码
    branchName: { type: String }, //支行名称
    
    platformSettlementFee: {
      type: Number,
      required: true,
      default: 0.02, // 默认2%
      min: 0,
      max: 0.1
    }, //平台结算服务费率
    
    // 限额设置
    dailyLimit: { type: Number, default: 50000 }, //日限额
    monthlyLimit: { type: Number, default: 1000000 }, //月限额
    singleLimit: { type: Number, default: 10000 }, //单笔限额
    
    // 使用统计
    totalWithdraws: { type: Number, default: 0 }, //总提现次数
    totalAmount: { type: Number, default: 0 }, //总提现金额
    lastUsedTime: { type: Date }, //最后使用时间
    
    // 验证状态
    isVerified: { type: Boolean, default: false }, //是否已验证
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" }, //验证人
    verifiedAt: { type: Date }, //验证时间
    
    status: {
      type: String,
      default: "normal",
      enum: ["normal", "disabled", "pending", "locked"]
    }, //状态：正常/禁用
    
    // 创建人信息
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "MerchantAccount", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加复合索引
withdrawAccountSchema.index({ merchant: 1, accountType: 1 });
withdrawAccountSchema.index({ accountNumber: 1, accountType: 1 }, { unique: true });

const WithdrawAccount = mongoose.model("WithdrawAccount", withdrawAccountSchema, "withdrawAccount");
module.exports = WithdrawAccount;
