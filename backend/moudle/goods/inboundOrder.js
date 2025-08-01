const mongoose = require("mongoose");

// 入库单模型
const inboundOrderSchema = new mongoose.Schema(
  {
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 入库单号
    
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
    
    orderType: {
      type: String,
      required: true,
      enum: ["purchase", "return", "transfer", "production", "adjustment"]
    }, // 入库类型：采购入库、退货入库、调拨入库、生产入库、调整入库
    
    businessType: {
      type: String,
      required: true,
      enum: ["inbound"]
    }, // 业务类型
    
    orderDate: { 
      type: Date, 
      default: Date.now 
    }, // 入库日期
    
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
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      }, // 入库数量
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
      remarks: { 
        type: String 
      } // 备注
    }],
    
    totalQuantity: { 
      type: Number, 
      required: true 
    }, // 总数量
    
    totalAmount: { 
      type: Number 
    }, // 总金额
    
    status: {
      type: String,
      required: true,
      enum: ["draft", "pending", "approved", "completed", "cancelled"],
      default: "draft"
    }, // 状态：草稿、待审核、已审核、已完成、已取消
    
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse" 
    }, // 目标仓库
    
    supplier: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Supplier" 
    }, // 供应商（采购入库时使用）
    
    relatedOrder: { 
      type: mongoose.Schema.Types.ObjectId, 
      refPath: "relatedOrderType" 
    }, // 关联单据
    
    relatedOrderType: {
      type: String,
      enum: ["PurchaseOrder", "ReturnOrder", "TransferOrder"]
    }, // 关联单据类型
    
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
inboundOrderSchema.index({ orderId: 1 });
inboundOrderSchema.index({ merchant: 1 });
inboundOrderSchema.index({ orderDate: -1 });
inboundOrderSchema.index({ status: 1 });

module.exports = mongoose.model("InboundOrder", inboundOrderSchema);
