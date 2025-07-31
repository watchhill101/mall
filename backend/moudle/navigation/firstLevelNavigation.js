const e = require("express");
var mongoose = require("mongoose");

// 定义一级导航的Schema
// 一级导航包含名称、图标、路径、二级标题和二级文本
const firstLevelNavigationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 名称
  icon: { type: String, required: true }, // 图标
  url: { type: String, required: true }, // 路径
  subTitle: { type: String, required: true }, // 二级标题
  subText: { type: String, required: true }, // 二级文本
  SecondaryNavigationID: {
    type: Array, // 二级导航ID数组
    enum: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SecondaryNavigation",
      },
    ], // 允许的二级导航ID列表
    default: [], // 默认值为空数组
  },
});
const FirstLevelNavigation = mongoose.model(
  "firstLevelNavigation",
  firstLevelNavigationSchema,
  "firstLevelNavigation"
);

module.exports = FirstLevelNavigation;
