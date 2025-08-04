const mongoose = require("mongoose");

// 分拣单模型
const sortingOrderSchema = new mongoose.Schema(
  {
    sortingOrderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 分拣单编号
    
    relatedOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }], // 关联订单
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    sortingType: {
      type: String,
      required: true,
      enum: ["order_picking", "batch_sorting", "return_sorting", "damage_sorting"]
    }, // 分拣类型：订单拣货、批量分拣、退货分拣、报损分拣
    
    status: {
      type: String,
      required: true,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    }, // 分拣状态
    
    priority: {
      type: Number,
      default: 1,
      enum: [1, 2, 3, 4, 5] // 1-最低, 5-最高
    }, // 优先级
    
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse" 
    }, // 仓库
    
    sourceLocation: { 
      type: String 
    }, // 源位置
    
    targetLocation: { 
      type: String 
    }, // 目标位置
    
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
      requiredQuantity: { 
        type: Number, 
        required: true 
      }, // 需求数量
      pickedQuantity: { 
        type: Number, 
        default: 0 
      }, // 已拣数量
      unit: { 
        type: String, 
        default: "件" 
      }, // 单位
      sourceLocation: { 
        type: String 
      }, // 源位置
      targetLocation: { 
        type: String 
      }, // 目标位置
      batchNumber: { 
        type: String 
      }, // 批次号
      expiryDate: { 
        type: Date 
      }, // 有效期
      pickingOrder: { 
        type: Number 
      }, // 拣货顺序
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
      picker: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 拣货员
      checker: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 复核员
      equipment: { 
        type: String 
      } // 使用设备
    },
    
    pickingRoute: {
      routeId: { 
        type: String 
      }, // 路线ID
      routeDistance: { 
        type: Number 
      }, // 路线距离
      estimatedTime: { 
        type: Number 
      }, // 预计用时(分钟)
      actualTime: { 
        type: Number 
      } // 实际用时(分钟)
    },
    
    qualityCheck: {
      isChecked: { 
        type: Boolean, 
        default: false 
      }, // 是否复核
      checkBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 复核员
      checkTime: { 
        type: Date 
      }, // 复核时间
      checkResult: { 
        type: String, 
        enum: ["pass", "fail", "partial_pass"] 
      }, // 复核结果
      errorItems: [{ 
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product" 
        },
        errorType: { 
          type: String, 
          enum: ["quantity_error", "product_error", "location_error", "quality_error"] 
        },
        description: { 
          type: String 
        }
      }] // 错误项目
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
      totalPickedQuantity: { 
        type: Number, 
        default: 0 
      }, // 已拣总数量
      completionRate: { 
        type: Number, 
        default: 0 
      }, // 完成率
      accuracy: { 
        type: Number, 
        default: 0 
      } // 准确率
    },
    
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
// sortingOrderSchema.index({ sortingOrderId: 1 }); // 移除重复索引，sortingOrderId 已经通过 unique: true 自动创建
sortingOrderSchema.index({ merchant: 1 });
sortingOrderSchema.index({ status: 1 });
sortingOrderSchema.index({ sortingType: 1 });
sortingOrderSchema.index({ priority: -1 });
sortingOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SortingOrder", sortingOrderSchema);
