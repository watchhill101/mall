const mongoose = require("mongoose");

// 外部商品库模型
const externalProductSchema = new mongoose.Schema(
  {
    externalId: { 
      type: String, 
      required: true 
    }, // 外部商品ID
    
    sourceSystem: { 
      type: String, 
      required: true 
    }, // 来源系统
    
    businessType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "manufacturer", "distributor"]
    }, // 业务类型
    
    productInfo: {
      productName: { 
        type: String, 
        required: true 
      }, // 商品名称
      productCode: { 
        type: String 
      }, // 商品编码
      description: { 
        type: String 
      }, // 商品描述
      specifications: { 
        type: String 
      }, // 规格型号
      brand: { 
        type: String 
      }, // 品牌
      model: { 
        type: String 
      }, // 型号
      unit: { 
        type: String, 
        default: "件" 
      }, // 单位
      images: [{ 
        type: String 
      }] // 商品图片
    },
    
    categoryInfo: {
      categoryName: { 
        type: String 
      }, // 分类名称
      categoryPath: { 
        type: String 
      } // 分类路径
    },
    
    pricing: {
      marketPrice: { 
        min: { type: Number },
        max: { type: Number }
      }, // 市场价格范围
      suggestedPrice: { 
        type: Number 
      }, // 建议售价
      currency: { 
        type: String, 
        default: "CNY" 
      } // 货币单位
    },
    
    supplier: {
      supplierId: { 
        type: String 
      }, // 供应商ID
      supplierName: { 
        type: String 
      }, // 供应商名称
      contact: { 
        type: String 
      } // 联系方式
    },
    
    availability: {
      isAvailable: { 
        type: Boolean, 
        default: true 
      }, // 是否可用
      stockStatus: { 
        type: String, 
        enum: ["in_stock", "out_of_stock", "limited", "unknown"],
        default: "unknown"
      }, // 库存状态
      leadTime: { 
        type: Number 
      } // 交货周期（天）
    },
    
    syncInfo: {
      lastSyncTime: { 
        type: Date, 
        default: Date.now 
      }, // 最后同步时间
      syncStatus: { 
        type: String, 
        enum: ["success", "failed", "pending"],
        default: "success"
      }, // 同步状态
      syncErrors: [{ 
        type: String 
      }] // 同步错误信息
    },
    
    importStatus: {
      isImported: { 
        type: Boolean, 
        default: false 
      }, // 是否已导入
      importedProduct: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" 
      }, // 导入后的商品ID
      importTime: { 
        type: Date 
      }, // 导入时间
      importBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      } // 导入人
    },
    
    qualityInfo: {
      qualityGrade: { 
        type: String, 
        enum: ["A", "B", "C", "D"]
      }, // 质量等级
      certifications: [{ 
        type: String 
      }], // 认证信息
      safetyStandards: [{ 
        type: String 
      }] // 安全标准
    },
    
    metadata: {
      tags: [{ 
        type: String 
      }], // 标签
      attributes: { 
        type: mongoose.Schema.Types.Mixed 
      }, // 扩展属性
      dataVersion: { 
        type: String 
      } // 数据版本
    }
  },
  {
    timestamps: true
  }
);

// 复合索引
externalProductSchema.index({ externalId: 1, sourceSystem: 1 }, { unique: true });
externalProductSchema.index({ businessType: 1 });
externalProductSchema.index({ "syncInfo.lastSyncTime": -1 });
externalProductSchema.index({ "availability.isAvailable": 1 });
externalProductSchema.index({ "importStatus.isImported": 1 });

module.exports = mongoose.model("ExternalProduct", externalProductSchema);
