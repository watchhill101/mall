const mongoose = require("mongoose");

// 配货单模型
const allocationOrderSchema = new mongoose.Schema(
  {
    allocationOrderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 配货单号
    
    relatedOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }], // 关联订单
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    allocationType: {
      type: String,
      required: true,
      enum: ["order_allocation", "stock_transfer", "emergency_allocation", "bulk_allocation"]
    }, // 配货类型：订单配货、库存调拨、紧急配货、批量配货
    
    status: {
      type: String,
      required: true,
      enum: ["pending", "allocated", "confirmed", "cancelled"],
      default: "pending"
    }, // 配货状态
    
    supplier: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Supplier" 
    }, // 供应商
    
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
      sku: { 
        type: String 
      }, // SKU编码
      specifications: { 
        type: String 
      }, // 规格型号
      requiredQuantity: { 
        type: Number, 
        required: true 
      }, // 需求数量
      allocatedQuantity: { 
        type: Number, 
        default: 0 
      }, // 已配数量
      availableQuantity: { 
        type: Number, 
        default: 0 
      }, // 可用库存
      unitPrice: { 
        type: Number 
      }, // 单价
      totalAmount: { 
        type: Number 
      }, // 总金额
      unit: { 
        type: String, 
        default: "件" 
      }, // 单位
      batchNumber: { 
        type: String 
      }, // 批次号
      expiryDate: { 
        type: Date 
      }, // 有效期
      location: { 
        type: String 
      }, // 存放位置
      allocationStatus: { 
        type: String, 
        enum: ["pending", "partial", "complete", "shortage"],
        default: "pending"
      }, // 配货状态
      shortageQuantity: { 
        type: Number, 
        default: 0 
      }, // 缺货数量
      notes: { 
        type: String 
      } // 备注
    }],
    
    allocationInfo: {
      allocationDate: { 
        type: Date, 
        default: Date.now 
      }, // 配货日期
      expectedDeliveryDate: { 
        type: Date 
      }, // 预计交货日期
      allocator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 配货员
      reviewer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 审核人
      reviewTime: { 
        type: Date 
      } // 审核时间
    },
    
    summary: {
      totalItems: { 
        type: Number, 
        default: 0 
      }, // 总商品种数
      totalRequiredQuantity: { 
        type: Number, 
        default: 0 
      }, // 需求总数量
      totalAllocatedQuantity: { 
        type: Number, 
        default: 0 
      }, // 已配总数量
      totalShortageQuantity: { 
        type: Number, 
        default: 0 
      }, // 总缺货数量
      totalAmount: { 
        type: Number, 
        default: 0 
      }, // 总金额
      allocationRate: { 
        type: Number, 
        default: 0 
      } // 配货率
    },
    
    deliveryInfo: {
      deliveryMethod: { 
        type: String, 
        enum: ["self_pickup", "delivery", "express"] 
      }, // 配送方式
      deliveryAddress: { 
        type: String 
      }, // 配送地址
      contactPerson: { 
        type: String 
      }, // 联系人
      contactPhone: { 
        type: String 
      }, // 联系电话
      deliveryNote: { 
        type: String 
      } // 配送备注
    },
    
    urgentInfo: {
      isUrgent: { 
        type: Boolean, 
        default: false 
      }, // 是否紧急
      urgentReason: { 
        type: String 
      }, // 紧急原因
      urgentLevel: { 
        type: Number, 
        enum: [1, 2, 3], 
        default: 1 
      } // 紧急程度
    },
    
    notes: { 
      type: String 
    }, // 备注
    
    attachments: [{ 
      type: String 
    }], // 附件
    
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
allocationOrderSchema.index({ allocationOrderId: 1 });
allocationOrderSchema.index({ merchant: 1 });
allocationOrderSchema.index({ status: 1 });
allocationOrderSchema.index({ allocationType: 1 });
allocationOrderSchema.index({ "allocationInfo.allocationDate": -1 });
allocationOrderSchema.index({ "urgentInfo.isUrgent": 1 });

module.exports = mongoose.model("AllocationOrder", allocationOrderSchema);
