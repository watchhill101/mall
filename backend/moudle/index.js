var mongoose = require("mongoose");
const config = require("../config");

mongoose
  .connect(config.mongodb.uri)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// 导入所有模型 - 方式一：分别导入
const User = require("./user/user");
const Role = require("./role/role");

// 导入模块化的子模块
const Navigation = require("./navigation");
const GoodsOrder = require("./goodsOrder");
const Goods = require("./goods");
const Merchant = require("./merchant");
const Person = require("./person");

module.exports = {
  // 单独模型
  User,
  Role,

  // 解构导出各模块的所有模型
  ...Navigation, // FirstLevelNavigation, SecondaryNavigation
  ...GoodsOrder, // Order, AfterSales, TallyOrder, etc.
  ...Goods, // Product, ProductCategory, ProductAudit, etc.
  ...Merchant, // Merchant, MerchantAccount, MerchantApplication, etc.
  ...Person, // PersonInCharge
};