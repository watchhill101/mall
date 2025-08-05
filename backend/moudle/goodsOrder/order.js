const mongoose = require("mongoose");

// 主订单模型
const orderSchema = new mongoose.Schema(
  {
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 订单编号
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    orderType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "custom", "group"]
    }, // 订单类型：零售、批发、定制、团购
    
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "pending", // 待确认
        "confirmed", // 已确认
        "paid", // 已支付
        "processing", // 处理中
        "shipped", // 已发货
        "delivered", // 已配送
        "completed", // 已完成
        "cancelled", // 已取消
        "refunded" // 已退款
      ],
      default: "pending"
    }, // 订单状态
    
    customer: {
      customerId: { type: String }, // 客户ID
      customerName: { type: String, required: true }, // 客户名称
      customerPhone: { type: String, required: true }, // 客户电话
      customerAddress: { type: String } // 客户地址
    }, // 客户信息
    
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
      specifications: { 
        type: String 
      }, // 规格型号
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      }, // 数量
      unitPrice: { 
        type: Number, 
        required: true 
      }, // 单价
      totalPrice: { 
        type: Number, 
        required: true 
      }, // 小计
      discount: { 
        type: Number, 
        default: 0 
      }, // 折扣
      unit: { 
        type: String, 
        default: "件" 
      } // 单位
    }],
    
    pricing: {
      subtotal: { 
        type: Number, 
        required: true 
      }, // 商品小计
      discountAmount: { 
        type: Number, 
        default: 0 
      }, // 折扣金额
      shippingFee: { 
        type: Number, 
        default: 0 
      }, // 运费
      totalAmount: { 
        type: Number, 
        required: true 
      }, // 订单总额
      paidAmount: { 
        type: Number, 
        default: 0 
      } // 已付金额
    },
    
    delivery: {
      deliveryMethod: { 
        type: String, 
        enum: ["self_pickup", "home_delivery", "express"],
        default: "home_delivery"
      }, // 配送方式
      deliveryAddress: { 
        type: String 
      }, // 配送地址
      deliveryTime: { 
        type: Date 
      }, // 配送时间
      deliveryNote: { 
        type: String 
      } // 配送备注
    },
    
    payment: {
      paymentMethod: { 
        type: String, 
        enum: ["cash", "wechat", "alipay", "card", "bank_transfer"],
        default: "cash"
      }, // 支付方式
      paymentStatus: { 
        type: String, 
        enum: ["unpaid", "partial", "paid", "refunding", "refunded"],
        default: "unpaid"
      }, // 支付状态
      paymentTime: { 
        type: Date 
      } // 支付时间
    },
    
    notes: { 
      type: String 
    }, // 订单备注
    
    createBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // 创建人
    
    lastUpdateBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // 最后更新人
    
    // 关联其他单据
    relatedDocuments: {
      tallyOrderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "TallyOrder" 
      }, // 理货单
      sortingOrderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SortingOrder" 
      }, // 分拣单
      allocationOrderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "AllocationOrder" 
      }, // 配货单
      workOrderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "WorkOrder" 
      }, // 作业单
      logisticsOrderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "LogisticsOrder" 
      } // 物流单
    }
  },
  {
    timestamps: true
  }
);

// 索引
// orderSchema.index({ orderId: 1 }); // 移除重复索引，orderId 已经通过 unique: true 自动创建
orderSchema.index({ merchant: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "customer.customerPhone": 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);