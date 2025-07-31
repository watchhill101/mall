const mongoose = require("mongoose");

//商品模型
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, //商品名称
    description: { type: String }, //商品描述
    category: { type: String, required: true }, //商品分类
    specifications: [{
      name: { type: String, required: true }, //规格名称
      value: { type: String, required: true }, //规格值
      price: { type: Number, required: true }, //规格价格
    }], //商品规格
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    
    // 商品图片
    images: [{ type: String }], //商品图片URL数组
    
    // 库存信息
    stockQuantity: { type: Number, default: 0 }, //库存数量
    minStockLevel: { type: Number, default: 10 }, //最低库存警戒线
    
    // 价格信息
    originalPrice: { type: Number, required: true }, //原价
    currentPrice: { type: Number, required: true }, //现价
    costPrice: { type: Number }, //成本价
    
    // 商品状态
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "outOfStock", "discontinued"]
    },
    
    // 销售统计
    totalSales: { type: Number, default: 0 }, //总销量
    totalRevenue: { type: Number, default: 0 }, //总收入
    
    // SEO信息
    tags: [{ type: String }], //商品标签
    keywords: [{ type: String }], //关键词
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
productSchema.index({ name: 1 });
productSchema.index({ merchant: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

const Product = mongoose.model("Product", productSchema, "product");
module.exports = Product;
