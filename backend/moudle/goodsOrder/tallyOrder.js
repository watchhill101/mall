const mongoose = require("mongoose");

// 理货单模型
const tallyOrderSchema = new mongoose.Schema(
  {
    tallyOrderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 理货单编号
    
    relatedOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }], // 关联订单
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    tallyType: {
      type: String,
      required: true,
      enum: ["inbound", "outbound", "transfer", "adjustment"]
    }, // 理货类型：入库、出库、调拨、调整
    
    status: {
      type: String,
      required: true,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    }, // 理货状态
    
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse" 
    }, // 仓库
    
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
      productCode: { 
        type: String 
      }, // 商品编码
      plannedQuantity: { 
        type: Number, 
        required: true 
      }, // 计划数量
      actualQuantity: { 
        type: Number, 
        default: 0 
      }, // 实际数量
      unit: { 
        type: String, 
        default: "件" 
      }, // 单位
      location: { 
        type: String 
      }, // 存放位置
      condition: { 
        type: String, 
        enum: ["good", "damaged", "expired", "defective"],
        default: "good"
      }, // 商品状态
      notes: { 
        type: String 
      } // 备注
    }],
    
    operationInfo: {
      planStartTime: { 
        type: Date 
      }, // 计划开始时间
      planEndTime: { 
        type: Date 
      }, // 计划结束时间
      actualStartTime: { 
        type: Date 
      }, // 实际开始时间
      actualEndTime: { 
        type: Date 
      }, // 实际结束时间
      operator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 操作员
      supervisor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      } // 监督员
    },
    
    summary: {
      totalPlannedItems: { 
        type: Number, 
        default: 0 
      }, // 计划商品种数
      totalActualItems: { 
        type: Number, 
        default: 0 
      }, // 实际商品种数
      totalPlannedQuantity: { 
        type: Number, 
        default: 0 
      }, // 计划总数量
      totalActualQuantity: { 
        type: Number, 
        default: 0 
      }, // 实际总数量
      differenceQuantity: { 
        type: Number, 
        default: 0 
      } // 差异数量
    },
    
    qualityCheck: {
      isQualityChecked: { 
        type: Boolean, 
        default: false 
      }, // 是否质检
      qualityCheckBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 质检员
      qualityCheckTime: { 
        type: Date 
      }, // 质检时间
      qualityResult: { 
        type: String, 
        enum: ["pass", "fail", "conditional_pass"] 
      }, // 质检结果
      qualityNotes: { 
        type: String 
      } // 质检备注
    },
    
    attachments: [{ 
      type: String 
    }], // 附件
    
    notes: { 
      type: String 
    }, // 备注
    
    createBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // 创建人
    
    lastUpdateBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    } // 最后更新人
  },
  {
    timestamps: true
  }
);

// 索引
tallyOrderSchema.index({ tallyOrderId: 1 });
tallyOrderSchema.index({ merchant: 1 });
tallyOrderSchema.index({ status: 1 });
tallyOrderSchema.index({ tallyType: 1 });
tallyOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("TallyOrder", tallyOrderSchema);
