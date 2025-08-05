const mongoose = require("mongoose");

// 收款记录模型
const paymentRecordSchema = new mongoose.Schema(
  {
    paymentId: { 
      type: String, 
      required: true, 
      unique: true 
    }, // 收款单号
    
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
    
    customer: {
      customerId: { type: String }, // 客户ID
      customerName: { type: String, required: true }, // 客户姓名
      customerPhone: { type: String, required: true } // 客户电话
    }, // 客户信息
    
    paymentInfo: {
      paymentMethod: { 
        type: String, 
        required: true,
        enum: ["cash", "wechat", "alipay", "bank_card", "bank_transfer", "voucher"]
      }, // 支付方式
      paymentAmount: { 
        type: Number, 
        required: true 
      }, // 支付金额
      receivedAmount: { 
        type: Number, 
        required: true 
      }, // 实收金额
      changeAmount: { 
        type: Number, 
        default: 0 
      }, // 找零金额
      discountAmount: { 
        type: Number, 
        default: 0 
      }, // 优惠金额
      currency: { 
        type: String, 
        default: "CNY" 
      } // 货币类型
    },
    
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "processing", "success", "failed", "cancelled", "refunded"],
      default: "pending"
    }, // 支付状态
    
    transactionInfo: {
      transactionId: { 
        type: String 
      }, // 交易流水号
      thirdPartyOrderId: { 
        type: String 
      }, // 第三方订单号
      bankName: { 
        type: String 
      }, // 银行名称
      cardNumber: { 
        type: String 
      }, // 卡号(脱敏)
      authCode: { 
        type: String 
      }, // 授权码
      paymentTime: { 
        type: Date, 
        default: Date.now 
      }, // 支付时间
      confirmTime: { 
        type: Date 
      } // 确认时间
    },
    
    refundInfo: {
      isRefunded: { 
        type: Boolean, 
        default: false 
      }, // 是否已退款
      refundAmount: { 
        type: Number, 
        default: 0 
      }, // 退款金额
      refundTime: { 
        type: Date 
      }, // 退款时间
      refundReason: { 
        type: String 
      }, // 退款原因
      refundTransactionId: { 
        type: String 
      } // 退款流水号
    },
    
    businessDetails: {
      businessType: { 
        type: String, 
        enum: ["retail", "wholesale", "group_buy", "custom"],
        required: true 
      }, // 业务类型
      salesChannel: { 
        type: String, 
        enum: ["online", "offline", "mobile", "phone"] 
      }, // 销售渠道
      promotionId: { 
        type: String 
      }, // 促销活动ID
      couponId: { 
        type: String 
      } // 优惠券ID
    },
    
    operatorInfo: {
      cashier: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      }, // 收银员
      reviewer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 复核员
      terminal: { 
        type: String 
      }, // 收银终端
      location: { 
        type: String 
      } // 收款地点
    },
    
    reconciliation: {
      isReconciled: { 
        type: Boolean, 
        default: false 
      }, // 是否已对账
      reconciledBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }, // 对账人
      reconciledTime: { 
        type: Date 
      }, // 对账时间
      batchNumber: { 
        type: String 
      } // 对账批次号
    },
    
    notes: { 
      type: String 
    }, // 备注
    
    attachments: [{ 
      type: String 
    }], // 附件(如支付凭证等)
    
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
// paymentRecordSchema.index({ paymentId: 1 }); // 移除重复索引，paymentId 已经通过 unique: true 自动创建
paymentRecordSchema.index({ order: 1 });
paymentRecordSchema.index({ merchant: 1 });
paymentRecordSchema.index({ paymentStatus: 1 });
paymentRecordSchema.index({ "paymentInfo.paymentMethod": 1 });
paymentRecordSchema.index({ "transactionInfo.paymentTime": -1 });
paymentRecordSchema.index({ "operatorInfo.cashier": 1 });

module.exports = mongoose.model("PaymentRecord", paymentRecordSchema);
