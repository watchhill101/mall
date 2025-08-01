const mongoose = require("mongoose");

// 盘点单模型
const stocktakingOrderSchema = new mongoose.Schema(
  {
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 盘点单号
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    operator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // 操作人
    
    stocktakingType: {
      type: String,
      required: true,
      enum: ["full", "partial", "cycle"]
    }, // 盘点类型：全盘、抽盘、循环盘点
    
    businessType: {
      type: String,
      required: true,
      enum: ["stocktaking"]
    }, // 业务类型
    
    planDate: { 
      type: Date, 
      required: true 
    }, // 计划盘点日期
    
    actualDate: { 
      type: Date 
    }, // 实际盘点日期
    
    products: [{
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
      }, // 商品
      productName: { 
        type: String, 
        required: true 
      }, // 商品名称
      productCategory: { 
        type: String 
      }, // 商品分类
      systemQuantity: { 
        type: Number, 
        required: true 
      }, // 系统数量
      actualQuantity: { 
        type: Number 
      }, // 实盘数量
      differenceQuantity: { 
        type: Number, 
        default: 0 
      }, // 差异数量
      unitPrice: { 
        type: Number 
      }, // 单价
      differenceAmount: { 
        type: Number, 
        default: 0 
      }, // 差异金额
      unit: { 
        type: String, 
        default: "件" 
      }, // 单位
      reason: { 
        type: String 
      }, // 差异原因
      remarks: { 
        type: String 
      } // 备注
    }],
    
    totalSystemQuantity: { 
      type: Number, 
      default: 0 
    }, // 系统总数量
    
    totalActualQuantity: { 
      type: Number, 
      default: 0 
    }, // 实盘总数量
    
    totalDifferenceQuantity: { 
      type: Number, 
      default: 0 
    }, // 总差异数量
    
    totalDifferenceAmount: { 
      type: Number, 
      default: 0 
    }, // 总差异金额
    
    status: {
      type: String,
      required: true,
      enum: ["planned", "in_progress", "completed", "adjusted", "cancelled"],
      default: "planned"
    }, // 状态：已计划、盘点中、已完成、已调整、已取消
    
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse" 
    }, // 盘点仓库
    
    stocktakingScope: {
      type: String,
      enum: ["all", "category", "location", "custom"]
    }, // 盘点范围：全部、按分类、按位置、自定义
    
    scopeDetails: { 
      type: mongoose.Schema.Types.Mixed 
    }, // 范围详情
    
    approver: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // 审核人
    
    approveTime: { 
      type: Date 
    }, // 审核时间
    
    completeTime: { 
      type: Date 
    }, // 完成时间
    
    adjustTime: { 
      type: Date 
    }, // 调整时间
    
    remarks: { 
      type: String 
    }, // 备注
    
    attachments: [{ 
      type: String 
    }] // 附件
  },
  {
    timestamps: true
  }
);

// 索引
stocktakingOrderSchema.index({ orderId: 1 });
stocktakingOrderSchema.index({ merchant: 1 });
stocktakingOrderSchema.index({ planDate: -1 });
stocktakingOrderSchema.index({ status: 1 });

module.exports = mongoose.model("StocktakingOrder", stocktakingOrderSchema);
