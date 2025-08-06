const mongoose = require("mongoose");

// 商品回收站模型
const productRecycleBinSchema = new mongoose.Schema(
  {
    originalProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    }, // 原商品ID

    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      // required: true 
    }, // 所属商家

    productSnapshot: {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      productCategory: { type: String },
      businessType: { type: String },
      pricing: {
        salePrice: {
          min: { type: Number },
          max: { type: Number }
        },
        marketPrice: { type: Number }
      },
      inventory: {
        currentStock: { type: Number },
        totalStock: { type: Number }
      },
      productInfo: {
        description: { type: String },
        specifications: { type: String },
        brand: { type: String },
        images: [{ type: String }]
      }
    }, // 商品快照数据

    deleteReason: {
      type: String,
      required: true,
      enum: [
        "discontinued", // 停产
        "expired", // 过期
        "quality_issue", // 质量问题
        "policy_violation", // 违规
        "merchant_request", // 商家要求
        "system_cleanup", // 系统清理
        "duplicate", // 重复
        "other" // 其他
      ]
    }, // 删除原因

    deleteReasonDetail: {
      type: String
    }, // 删除原因详情

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true 
    }, // 删除人

    deletedAt: {
      type: Date,
      default: Date.now
    }, // 删除时间

    isRestorable: {
      type: Boolean,
      default: true
    }, // 是否可恢复

    autoDeleteAt: {
      type: Date
    }, // 自动删除时间（过期自动清理）

    restoreInfo: {
      isRestored: {
        type: Boolean,
        default: false
      }, // 是否已恢复
      restoredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }, // 恢复人
      restoredAt: {
        type: Date
      }, // 恢复时间
      newProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      } // 恢复后的新商品ID
    },

    relatedData: {
      orderCount: {
        type: Number,
        default: 0
      }, // 关联订单数
      totalSales: {
        type: Number,
        default: 0
      }, // 总销售额
      lastOrderDate: {
        type: Date
      } // 最后订单日期
    },

    adminNotes: {
      type: String
    }, // 管理员备注

    tags: [{
      type: String
    }] // 标签
  },
  {
    timestamps: true
  }
);

// 索引
productRecycleBinSchema.index({ merchant: 1 });
productRecycleBinSchema.index({ deletedAt: -1 });
productRecycleBinSchema.index({ "restoreInfo.isRestored": 1 });
// productRecycleBinSchema.index({ autoDeleteAt: 1 }); // 移除重复索引，下面的 TTL 索引已经包含了这个字段
productRecycleBinSchema.index({ isRestorable: 1 });

// 自动删除过期数据的TTL索引
productRecycleBinSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ProductRecycleBin", productRecycleBinSchema);
