const mongoose = require("mongoose");

// 库存明细模型
const inventoryDetailSchema = new mongoose.Schema(
  {
    detailId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 明细ID
    
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    }, // 关联商品
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    operationType: {
      type: String,
      required: true,
      enum: ["inbound", "outbound", "adjustment", "stocktaking"]
    }, // 操作类型：入库、出库、调整、盘点
    
    operationReason: {
      type: String,
      required: true,
      enum: [
        "purchase", "return", "transfer_in", "production", // 入库原因
        "sale", "damage", "transfer_out", "loss", // 出库原因
        "correction", "system_adjust", // 调整原因
        "periodic_check", "spot_check" // 盘点原因
      ]
    }, // 操作原因
    
    quantity: { 
      type: Number, 
      required: true 
    }, // 数量变化（正数为增加，负数为减少）
    
    unitPrice: { 
      type: Number 
    }, // 单价
    
    totalAmount: { 
      type: Number 
    }, // 总金额
    
    beforeQuantity: { 
      type: Number, 
      required: true 
    }, // 操作前数量
    
    afterQuantity: { 
      type: Number, 
      required: true 
    }, // 操作后数量
    
    unit: { 
      type: String, 
      default: "件" 
    }, // 单位
    
    relatedOrder: { 
      type: mongoose.Schema.Types.ObjectId, 
      refPath: "relatedOrderType" 
    }, // 关联单据
    
    relatedOrderType: {
      type: String,
      enum: ["PurchaseOrder", "SaleOrder", "TransferOrder", "StocktakingOrder"]
    }, // 关联单据类型
    
    operator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // 操作人
    
    operationTime: { 
      type: Date, 
      default: Date.now 
    }, // 操作时间
    
    remarks: { 
      type: String 
    }, // 备注
    
    warehouse: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warehouse" 
    }, // 所属仓库
    
    location: { 
      type: String 
    } // 存放位置
  },
  {
    timestamps: true
  }
);

// 索引
inventoryDetailSchema.index({ product: 1, operationTime: -1 });
inventoryDetailSchema.index({ merchant: 1 });
inventoryDetailSchema.index({ operationType: 1 });
inventoryDetailSchema.index({ operationTime: -1 });

module.exports = mongoose.model("InventoryDetail", inventoryDetailSchema);
