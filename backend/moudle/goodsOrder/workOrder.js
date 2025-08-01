const mongoose = require("mongoose");

// 作业单模型
const workOrderSchema = new mongoose.Schema(
  {
    workOrderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 作业单号
    
    relatedOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }], // 关联订单
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    workType: {
      type: String,
      required: true,
      enum: ["picking", "packing", "loading", "unloading", "inspection", "maintenance", "cleaning"]
    }, // 作业类型：拣货、包装、装车、卸货、检验、维护、清洁
    
    status: {
      type: String,
      required: true,
      enum: ["pending", "assigned", "in_progress", "completed", "paused", "cancelled"],
      default: "pending"
    }, // 作业状态
    
    priority: {
      type: Number,
      default: 1,
      enum: [1, 2, 3, 4, 5] // 1-最低, 5-最高
    }, // 优先级
    
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse" 
    }, // 仓库
    
    workLocation: { 
      type: String 
    }, // 作业地点
    
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
      unitPrice: { 
        type: Number 
      }, // 单价
      totalAmount: { 
        type: Number 
      }, // 总金额
      workStatus: { 
        type: String, 
        enum: ["pending", "in_progress", "completed", "exception"],
        default: "pending"
      }, // 作业状态
      quality: { 
        type: String, 
        enum: ["good", "damaged", "expired", "defective"],
        default: "good"
      }, // 质量状态
      notes: { 
        type: String 
      } // 备注
    }],
    
    workPlan: {
      planStartTime: { 
        type: Date 
      }, // 计划开始时间
      planEndTime: { 
        type: Date 
      }, // 计划结束时间
      estimatedDuration: { 
        type: Number 
      }, // 预计用时(分钟)
      plannedWorkers: { 
        type: Number, 
        default: 1 
      }, // 计划人数
      requiredSkills: [{ 
        type: String 
      }], // 所需技能
      requiredEquipment: [{ 
        type: String 
      }] // 所需设备
    },
    
    workExecution: {
      actualStartTime: { 
        type: Date 
      }, // 实际开始时间
      actualEndTime: { 
        type: Date 
      }, // 实际结束时间
      actualDuration: { 
        type: Number 
      }, // 实际用时(分钟)
      workers: [{ 
        worker: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User" 
        },
        role: { 
          type: String, 
          enum: ["leader", "member", "assistant"] 
        },
        startTime: { 
          type: Date 
        },
        endTime: { 
          type: Date 
        }
      }], // 参与人员
      equipment: [{ 
        equipmentId: { 
          type: String 
        },
        equipmentName: { 
          type: String 
        },
        usageTime: { 
          type: Number 
        }
      }], // 使用设备
      supervisor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      } // 监督人
    },
    
    qualityControl: {
      isInspected: { 
        type: Boolean, 
        default: false 
      }, // 是否检验
      inspector: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 检验员
      inspectionTime: { 
        type: Date 
      }, // 检验时间
      inspectionResult: { 
        type: String, 
        enum: ["pass", "fail", "conditional_pass"] 
      }, // 检验结果
      defects: [{ 
        defectType: { 
          type: String 
        },
        description: { 
          type: String 
        },
        severity: { 
          type: String, 
          enum: ["minor", "major", "critical"] 
        }
      }], // 缺陷记录
      correctionActions: { 
        type: String 
      } // 纠正措施
    },
    
    performance: {
      efficiency: { 
        type: Number, 
        default: 0 
      }, // 效率(%)
      accuracy: { 
        type: Number, 
        default: 0 
      }, // 准确率(%)
      completionRate: { 
        type: Number, 
        default: 0 
      }, // 完成率(%)
      costPerUnit: { 
        type: Number, 
        default: 0 
      } // 单位成本
    },
    
    summary: {
      totalItems: { 
        type: Number, 
        default: 0 
      }, // 总商品种数
      totalPlannedQuantity: { 
        type: Number, 
        default: 0 
      }, // 计划总数量
      totalActualQuantity: { 
        type: Number, 
        default: 0 
      }, // 实际总数量
      totalAmount: { 
        type: Number, 
        default: 0 
      } // 总金额
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
workOrderSchema.index({ workOrderId: 1 });
workOrderSchema.index({ merchant: 1 });
workOrderSchema.index({ status: 1 });
workOrderSchema.index({ workType: 1 });
workOrderSchema.index({ priority: -1 });
workOrderSchema.index({ "workPlan.planStartTime": 1 });

module.exports = mongoose.model("WorkOrder", workOrderSchema);
