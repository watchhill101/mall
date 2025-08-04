const mongoose = require("mongoose");

//结账单模型
const billSchema = new mongoose.Schema(
  {
    billNumber: { 
      type: String, 
      required: true, 
      unique: true,
      default: function() {
        return 'BILL' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
      }
    }, //结账单号，自动生成
    
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    
    // 关联的结算订单
    settlementOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "SettlementOrder" }], //关联的结算订单
    
    // 金额信息
    totalAmount: { type: Number, required: true }, //总金额
    serviceFee: { type: Number, required: true }, //服务费
    serviceFeeRate: { type: Number, required: true }, //服务费率
    actualAmount: { type: Number, required: true }, //实际金额
    
    // 账单周期
    billPeriodStart: { type: Date, required: true }, //账单周期开始
    billPeriodEnd: { type: Date, required: true }, //账单周期结束
    
    // 统计信息
    orderCount: { type: Number, default: 0 }, //订单数量
    totalQuantity: { type: Number, default: 0 }, //商品总数量
    
    // 账单状态
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "disputed", "paid", "overdue"]
    }, //状态：待确认/已确认/有争议/已支付/逾期
    
    // 确认信息
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "MerchantAccount" }, //确认人
    confirmedAt: { type: Date }, //确认时间
    
    // 支付信息
    paymentMethod: { 
      type: String,
      enum: ["balance", "bank_transfer", "online_payment"]
    }, //支付方式
    paidAt: { type: Date }, //支付时间
    paymentReference: { type: String }, //支付参考号
    
    // 争议信息
    disputeReason: { type: String }, //争议原因
    disputeStatus: {
      type: String,
      enum: ["none", "pending", "resolved", "escalated"]
    }, //争议状态
    
    // 备注信息
    remark: { type: String }, //备注
    internalNotes: { type: String }, //内部备注
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
billSchema.index({ merchant: 1 });
billSchema.index({ status: 1 });
billSchema.index({ billNumber: 1 });
billSchema.index({ billPeriodStart: 1, billPeriodEnd: 1 });
billSchema.index({ createdAt: -1 });

// 中间件：保存前计算实际金额
billSchema.pre('save', function(next) {
  this.serviceFee = this.totalAmount * this.serviceFeeRate;
  this.actualAmount = this.totalAmount - this.serviceFee;
  next();
});

const Bill = mongoose.model("Bill", billSchema, "bill");
module.exports = Bill;
