const mongoose = require("mongoose");

// 出库单模型
const outboundOrderSchema = new mongoose.Schema(
  {
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 出库单号
    
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
      enum: ["sale", "damage", "transfer", "return", "adjustment"]
    }, // 出库类型：销售出库、报损出库、调拨出库、退货出库、调整出库
    
    businessType: {
      type: String,
      required: true,
      enum: ["outbound"]
    }, // 业务类型
    
    orderDate: { 
      type: Date, 
      default: Date.now 
    }, // 出库日期
    
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
      }, // 出库数量
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
    }, // 源仓库
    
    customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Customer" 
    }, // 客户（销售出库时使用）
    
    relatedOrder: { 
      type: mongoose.Schema.Types.ObjectId, 
      refPath: "relatedOrderType" 
    }, // 关联单据
    
    relatedOrderType: {
      type: String,
      enum: ["SaleOrder", "DamageOrder", "TransferOrder", "ReturnOrder"]
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
outboundOrderSchema.index({ orderId: 1 });
outboundOrderSchema.index({ merchant: 1 });
outboundOrderSchema.index({ orderDate: -1 });
outboundOrderSchema.index({ status: 1 });

module.exports = mongoose.model("OutboundOrder", outboundOrderSchema);
