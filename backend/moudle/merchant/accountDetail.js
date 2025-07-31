const mongoose = require("mongoose");

//账户明细模型
const accountDetailSchema = new mongoose.Schema(
  {
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "merchant", 
      required: true,
      unique: true // 一个商家只有一个账户明细
    }, //关联商家
    
    // 账户余额信息
    accountBalance: { type: Number, default: 0, min: 0 }, //账户余额
    withdrawnAmount: { type: Number, default: 0, min: 0 }, //已提现总额
    unsettledAmount: { type: Number, default: 0, min: 0 }, //未结算金额
    withdrawingAmount: { type: Number, default: 0, min: 0 }, //提现中金额
    serviceFee: { type: Number, default: 0, min: 0 }, //累计服务费
    
    // 冻结金额
    frozenAmount: { type: Number, default: 0, min: 0 }, //冻结金额
    
    // 最后更新信息
    lastUpdateBy: { type: mongoose.Schema.Types.ObjectId, ref: "MerchantAccount" }, //最后更新人
    lastTransactionId: { type: String }, //最后交易ID
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
accountDetailSchema.index({ merchant: 1 });

const AccountDetail = mongoose.model("AccountDetail", accountDetailSchema, "accountDetail");
module.exports = AccountDetail;
