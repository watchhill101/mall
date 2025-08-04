const mongoose = require("mongoose");

//商家申请模型
const merchantApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return 'APP' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
      }
    }, //申请编号，自动生成
    
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    personInCharge: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge", required: true }, //关联负责人
    
    applicationType: { 
      type: String, 
      required: true,
      enum: ["registration", "modification", "termination", "activation", "suspension"] 
    }, //申请类型：注册/修改/终止/激活/暂停
    
    // 申请内容
    applicationData: {
      type: mongoose.Schema.Types.Mixed, //申请的具体内容（JSON格式）
    },
    
    remark: { type: String }, //备注
    urgency: {
      type: String,
      default: "normal",
      enum: ["low", "normal", "high", "urgent"]
    }, //紧急程度
    
    // 申请状态
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewing", "approved", "rejected", "cancelled", "expired"]
    }, //状态：待审核/审核中/已通过/已拒绝/已取消/已过期
    
    // 时间信息
    applicationTime: { type: Date, default: Date.now }, //申请时间
    expectedProcessTime: { type: Date }, //期望处理时间
    expiryTime: { type: Date }, //申请过期时间
    
    // 审核信息
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge", default: null }, //审核人
    reviewTime: { type: Date }, //审核时间
    reviewResult: { type: String }, //审核结果
    rejectionReason: { type: String }, //拒绝原因
    
    // 附件信息
    attachments: [{ 
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileType: { type: String, required: true },
      fileSize: { type: Number },
      uploadTime: { type: Date, default: Date.now }
    }], //申请附件
    
    // 工作流信息
    workflowSteps: [{
      stepName: { type: String, required: true },
      processor: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" },
      processTime: { type: Date },
      result: { type: String, enum: ["pending", "approved", "rejected"] },
      comment: { type: String }
    }], //工作流步骤
    
    // 历史记录
    statusHistory: [{
      status: { type: String, required: true },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge" },
      changedAt: { type: Date, default: Date.now },
      comment: { type: String }
    }], //状态变更历史
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
merchantApplicationSchema.index({ merchant: 1 });
merchantApplicationSchema.index({ personInCharge: 1 });
merchantApplicationSchema.index({ status: 1 });
merchantApplicationSchema.index({ applicationType: 1 });
merchantApplicationSchema.index({ applicationNumber: 1 });
merchantApplicationSchema.index({ applicationTime: -1 });

const MerchantApplication = mongoose.model("MerchantApplication", merchantApplicationSchema, "merchantApplication");
module.exports = MerchantApplication;
