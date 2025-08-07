const mongoose = require("mongoose");

// 商品模型
const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true
    }, // 商品ID

    productName: {
      type: String,
      required: false
    }, // 商品名称

    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: false
    }, // 商品分类

    businessType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "manufacturer", "distributor"]
    }, // 业务类型

    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true
    }, // 所属商家

    productInfo: {
      description: { type: String }, // 商品描述
      specifications: { type: String }, // 规格型号
      brand: { type: String }, // 品牌
      model: { type: String }, // 型号
      unit: { type: String, default: "件" }, // 单位
      images: [{ type: String }] // 商品图片数组
    },

    pricing: {
      salePrice: {
        min: { type: Number, required: true },
        max: { type: Number }
      }, // 销售价格范围
      marketPrice: {
        type: Number
      }, // 市场售价
      cost: {
        type: Number
      } // 成本价
    },

    inventory: {
      currentStock: {
        type: Number,
        required: true,
        default: 0
      }, // 当前库存
      totalStock: {
        type: Number,
        default: 0
      }, // 总库存
      reservedStock: {
        type: Number,
        default: 0
      } // 预留库存
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "onSale", "offSale", "deleted"],
      default: "pending"
    }, // 商品状态：待审核、已通过、已拒绝、在售、下架、已删除

    auditInfo: {
      auditReason: { type: String }, // 审核原因
      auditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }, // 审核人
      auditTime: { type: Date } // 审核时间
    },

    isExternal: {
      type: Boolean,
      default: false
    }, // 是否为外部商品

    externalInfo: {
      sourceSystem: { type: String }, // 来源系统
      externalId: { type: String }, // 外部ID
      syncTime: { type: Date } // 同步时间
    },

    salesData: {
      totalSales: {
        type: Number,
        default: 0
      }, // 总销量
      monthlyStock: {
        type: Number,
        default: 0
      } // 月库存
    },

    warehouseInfo: {
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse"
      }, // 所属仓库
      location: { type: String } // 存放位置
    },

    lastUpdateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }, // 最后更新人

    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    } // 创建人
  },
  {
    timestamps: true // 自动添加createdAt和updatedAt字段
  }
);

// 索引
// productSchema.index({ productId: 1 }); // 移除重复索引，productId 已经通过 unique: true 自动创建
productSchema.index({ merchant: 1 });
productSchema.index({ productCategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ "inventory.currentStock": 1 });

module.exports = mongoose.model("Product", productSchema);