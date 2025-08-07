const mongoose = require("mongoose");

// 商品分类模型
const productCategorySchema = new mongoose.Schema(
  {
    businessType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "manufacturer", "distributor"]
    }, // 业务类型

    categoryLevel: {
      type: Number,
      required: true,
      enum: [1, 2] // 1-一级分类, 2-二级分类
    }, // 分类级别

    categoryId: {
      type: String,
      required: true,
      unique: true
    }, // 分类ID

    categoryName: {
      type: String,
      required: true
    }, // 分类名称

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null
    }, // 上级分类（一级分类时为null）

    categoryLevel1: {
      type: String
    }, // 一级分类名称

    categoryImages: {
      icon: { type: String }, // 分类图标
      banner: { type: String } // 分类横幅
    },

    sortOrder: {
      type: Number,
      default: 0
    }, // 排序天数

    productRank: {
      type: Number,
      default: 0
    }, // 分类排序

    productCount: {
      type: Number,
      default: 0
    }, // 商品数量

    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "deleted"],
      default: "active"
    }, // 状态：正常、禁用、已删除

    description: {
      type: String
    }, // 分类描述

    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // default: "6891c594711bbd8f373159c3"
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
productCategorySchema.index({ businessType: 1 });
productCategorySchema.index({ categoryLevel: 1 });
productCategorySchema.index({ parentCategory: 1 });
productCategorySchema.index({ status: 1 });

module.exports = mongoose.model("ProductCategory", productCategorySchema);
