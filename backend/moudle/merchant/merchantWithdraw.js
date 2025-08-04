const mongoose = require("mongoose");

//商家提现模型
const merchantWithdrawSchema = new mongoose.Schema(
  {
    orderNumber: { 
      type: String, 
      required: true, 
      unique: true,
      default: function() {
        return 'WD' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
      }
    }, //订单号，自动生成
    
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    withdrawAccount: { type: mongoose.Schema.Types.ObjectId, ref: "WithdrawAccount", required: true }, //关联提现账号
    
    // 金额信息
    withdrawAmount: { type: Number, required: true, min: 0.01 }, //提现金额
    serviceFeeRate: { type: Number, required: true }, //服务费率
    serviceFeeAmount: { type: Number, required: true }, //服务费金额
    actualAmount: { type: Number, required: true }, //到账金额
    
    // 申请信息
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "MerchantAccount", required: true }, //申请人
    applicationTime: { type: Date, default: Date.now }, //申请时间
    applicationRemark: { type: String }, //申请备注
    
    // 审核信息
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewing", "rejected", "cancelled", "approved", "processing", "completed", "failed"]
    }, //状态
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" }, //审核人
    reviewTime: { type: Date }, //审核时间
    reviewRemark: { type: String }, //审核备注
    
    // 处理信息
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" }, //处理人
    processedTime: { type: Date }, //处理时间
    transactionId: { type: String }, //交易流水号
    
    // 银行信息（从withdrawAccount获取，但记录快照）
    bankInfo: {
      accountType: { type: String, enum: ["unionpay", "wechat", "alipay"] },
      accountNumber: { type: String },
      accountName: { type: String }
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
merchantWithdrawSchema.index({ merchant: 1 });
merchantWithdrawSchema.index({ status: 1 });
merchantWithdrawSchema.index({ orderNumber: 1 });
merchantWithdrawSchema.index({ applicationTime: -1 });

// 中间件：保存前计算实际金额
merchantWithdrawSchema.pre('save', function(next) {
  this.serviceFeeAmount = this.withdrawAmount * this.serviceFeeRate;
  this.actualAmount = this.withdrawAmount - this.serviceFeeAmount;
  next();
});

const MerchantWithdraw = mongoose.model("MerchantWithdraw", merchantWithdrawSchema, "merchantWithdraw");
module.exports = MerchantWithdraw;
