const mongoose = require("mongoose");

// 售后模型
const afterSalesSchema = new mongoose.Schema(
  {
    afterSalesId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 售后单号
    
    order: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    }, // 关联订单
    
    merchant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Merchant", 
      required: true 
    }, // 所属商家
    
    afterSalesType: {
      type: String,
      required: true,
      enum: ["refund", "exchange", "repair", "complaint"]
    }, // 售后类型：退款、换货、维修、投诉
    
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "approved", "rejected", "completed"],
      default: "pending"
    }, // 处理状态
    
    customer: {
      customerId: { type: String }, // 客户ID
      customerName: { type: String, required: true }, // 客户姓名
      customerPhone: { type: String, required: true }, // 客户电话
      customerAddress: { type: String } // 客户地址
    }, // 客户信息
    
    products: [{
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" 
      }, // 商品
      productName: { 
        type: String, 
        required: true 
      }, // 商品名称
      quantity: { 
        type: Number, 
        required: true 
      }, // 数量
      unitPrice: { 
        type: Number 
      }, // 单价
      totalAmount: { 
        type: Number 
      }, // 总金额
      reason: { 
        type: String 
      } // 售后原因
    }],
    
    applicationInfo: {
      applicationTime: { 
        type: Date, 
        default: Date.now 
      }, // 申请时间
      applicationReason: { 
        type: String, 
        required: true 
      }, // 申请原因
      description: { 
        type: String 
      }, // 问题描述
      images: [{ 
        type: String 
      }] // 问题图片
    },
    
    processingInfo: {
      processor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 处理人
      processingTime: { 
        type: Date 
      }, // 处理时间
      processingNote: { 
        type: String 
      }, // 处理说明
      solution: { 
        type: String 
      } // 解决方案
    },
    
    refundInfo: {
      refundAmount: { 
        type: Number, 
        default: 0 
      }, // 退款金额
      refundMethod: { 
        type: String, 
        enum: ["original", "cash", "voucher"] 
      }, // 退款方式
      refundTime: { 
        type: Date 
      }, // 退款时间
      refundStatus: { 
        type: String, 
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
      } // 退款状态
    },
    
    logistics: {
      returnTrackingNumber: { 
        type: String 
      }, // 退货物流单号
      returnLogistics: { 
        type: String 
      }, // 退货物流公司
      exchangeTrackingNumber: { 
        type: String 
      }, // 换货物流单号
      exchangeLogistics: { 
        type: String 
      } // 换货物流公司
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
// afterSalesSchema.index({ afterSalesId: 1 }); // 移除重复索引，afterSalesId 已经通过 unique: true 自动创建
afterSalesSchema.index({ order: 1 });
afterSalesSchema.index({ merchant: 1 });
afterSalesSchema.index({ status: 1 });
afterSalesSchema.index({ afterSalesType: 1 });
afterSalesSchema.index({ "applicationInfo.applicationTime": -1 });

module.exports = mongoose.model("AfterSales", afterSalesSchema);
