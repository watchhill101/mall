var mongoose = require("mongoose");
// 定义二级导航的Schema
// 二级导航包含名称、路径和一级导航ID
const secondaryNavigationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 名称
  url: { type: String, required: true }, // 路径

  firstLevelNavigationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FirstLevelNavigation",
    required: true,
  }, // 一级导航ID
});

const SecondaryNavigation = mongoose.model(
  "SecondaryNavigation",
  secondaryNavigationSchema,
  "secondaryNavigation"
);

module.exports = SecondaryNavigation;
