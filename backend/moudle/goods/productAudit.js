const mongoose = require("mongoose");

// 商品审核模型
const productAuditSchema = new mongoose.Schema(
  {
    auditId: {
      type: String,
      required: true,
      unique: true
    }, // 审核ID

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,

    }, // 关联商品

    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "merchant",
      required: false,

    }, // 所属商家

    productInfo: {
      productName: { type: String, required: true },
      productCategory: { type: String },
      productImages: [{ type: String }]
    }, // 商品快照信息

    auditReason: {
      type: String
    }, // 审核原因

    auditStatus: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }, // 审核状态：待审核、已通过、已拒绝

    auditType: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "restore"]
    }, // 审核类型：新增、修改、删除、恢复

    submitTime: {
      type: Date,
      default: Date.now
    }, // 提交时间

    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",

    }, // 审核人

    auditTime: {
      type: Date
    }, // 审核时间

    auditComments: {
      type: String
    }, // 审核备注

    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false
    }, // 提交人

    changeDetails: {
      type: mongoose.Schema.Types.Mixed
    }, // 变更详情（JSON格式存储变更前后的数据）

    priority: {
      type: Number,
      default: 1,
      enum: [1, 2, 3] // 1-普通, 2-重要, 3-紧急
    } // 优先级
  },
  {
    timestamps: true
  }
);

// 索引
productAuditSchema.index({ auditStatus: 1 });
productAuditSchema.index({ merchant: 1 });
productAuditSchema.index({ submitTime: -1 });
productAuditSchema.index({ auditType: 1 });

module.exports = mongoose.model("ProductAudit", productAuditSchema);
