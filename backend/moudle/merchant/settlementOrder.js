const mongoose = require("mongoose");

//结算订单模型
const settlementOrderSchema = new mongoose.Schema(
  {
    orderNumber: { 
      type: String, 
      required: true, 
      unique: true,
      default: function() {
        return 'SO' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
      }
    }, //订单号，自动生成
    
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    requiredOutlet: { type: String, required: true }, //所需网点
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, //关联商品
    
    // 订单详情
    specification: { type: String, required: true }, //规格
    supplyPrice: { type: Number, required: true }, //供货价
    quantity: { type: Number, required: true, min: 1 }, //数量
    totalAmount: { type: Number, required: true }, //总金额
    
    // 配送信息
    deliveryAddress: { type: String, required: true }, //配送地址
    deliveryPhone: { type: String, required: true }, //配送联系电话
    deliveryContact: { type: String, required: true }, //配送联系人
    expectedDeliveryDate: { type: Date }, //期望配送日期
    
    // 订单状态
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "rejected", "cancelled", "approved", "shipped", "delivered", "completed"]
    }, //状态
    
    // 时间信息
    paymentTime: { type: Date }, //支付时间
    settlementTime: { type: Date }, //结算时间
    deliveryTime: { type: Date }, //发货时间
    completedTime: { type: Date }, //完成时间
    
    // 审核信息
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" }, //审核人
    reviewTime: { type: Date }, //审核时间
    reviewRemark: { type: String }, //审核备注
    
    // 备注信息
    orderRemark: { type: String }, //订单备注
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
settlementOrderSchema.index({ merchant: 1 });
settlementOrderSchema.index({ product: 1 });
settlementOrderSchema.index({ status: 1 });
settlementOrderSchema.index({ orderNumber: 1 });
settlementOrderSchema.index({ createdAt: -1 });

// 中间件：保存前计算总金额
settlementOrderSchema.pre('save', function(next) {
  this.totalAmount = this.supplyPrice * this.quantity;
  next();
});

const SettlementOrder = mongoose.model("SettlementOrder", settlementOrderSchema, "settlementOrder");
module.exports = SettlementOrder;
