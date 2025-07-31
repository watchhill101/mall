var mongoose = require("mongoose");
// 定义一级导航的Schema
// 一级导航包含名称、图标、路径、二级标题和二级文本
const firstLevelNavigationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 名称
  icon: { type: String, required: true }, // 图标
  url: { type: String, required: true }, // 路径
  subTitle: { type: String, required: true }, // 二级标题
  subText: { type: String, required: true }, // 二级文本
  roleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  }, // 角色ID
});
const FirstLevelNavigation = mongoose.model(
  "firstLevelNavigation",
  firstLevelNavigationSchema,
  "firstLevelNavigations"
);

module.exports = FirstLevelNavigation;
