var mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://grh991221:AaKU8nle060TcZRs@cluster0.diduzgp.mongodb.net/mall"
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// 导入所有模型
const User =require("./user/user");
const Role = require("./role/role");
const FirstLevelNavigation = require("./navigation/firstLevelNavigation");
const SecondaryNavigation = require("./navigation/secondaryNavigation");
const Goods = require("./goods");
const Order = require("./goodsOrder/order");
const Merchant = require("./merchant/merchant");

// 新增的商家相关模型
const PersonInCharge = require("./person/personInCharge");
const MerchantAccount = require("./merchant/merchantAccount");
const WithdrawAccount = require("./merchant/withdrawAccount");
const AccountDetail = require("./merchant/accountDetail");
const MerchantWithdraw = require("./merchant/merchantWithdraw");
const Product = require("./goods/product");
const SettlementOrder = require("./merchant/settlementOrder");
const Bill = require("./merchant/bill");
const MerchantApplication = require("./merchant/merchantApplication");

module.exports = {
  User,
  Role,
  FirstLevelNavigation,
  SecondaryNavigation,
  Goods,
  Order,
  Merchant,
  PersonInCharge,
  MerchantAccount,
  WithdrawAccount,
  AccountDetail,
  MerchantWithdraw,
  Product,
  SettlementOrder,
  Bill,
  MerchantApplication,
};

