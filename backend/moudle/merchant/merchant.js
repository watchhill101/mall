const mongoose = require("mongoose");

//商家模型
const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, //商家名称
    merchantType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "manufacturer", "distributor"]
    }, //商家类型
    isSelfOperated: { type: Boolean, default: false }, //是否自营
    phone: { type: String, required: true, unique: true }, //商家电话
    address: { type: String, required: true }, //商家地址
    logoUrl: { type: String, required: true }, //商家logo (修正字段名)

    // 关联负责人模型，而不是简单的字符串
    personInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonInCharge",
      required: true
    }, //负责人ID

    serviceCharge: {
      type: Number, //服务费率
      required: true,
      default: 0.1, // 默认10%
      min: 0,
      max: 1
    },

    status: {
      type: String,
      default: "inReview", // 新注册默认为审核中
      enum: ["active", "inactive", "inReview", "suspended"],
    }, //商家状态

    // 业务统计字段
    totalOrders: { type: Number, default: 0 }, //总订单数
    totalRevenue: { type: Number, default: 0 }, //总收入

    // 认证信息
    businessLicense: { type: String }, //营业执照
    taxNumber: { type: String }, //税号

    // 审核信息
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" }, //审核人
    approvedAt: { type: Date }, //审核时间
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引优化查询性能
merchantSchema.index({ name: 1 });
// merchantSchema.index({ phone: 1 }); // 移除重复索引，phone 已经通过 unique: true 自动创建
merchantSchema.index({ status: 1 });
merchantSchema.index({ merchantType: 1 });

const Merchant = mongoose.model("merchant", merchantSchema, "merchant");
module.exports = Merchant;