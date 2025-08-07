var mongoose = require("mongoose");
// 定义用户角色的Schema
// 用户角色包含名称
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 角色名称
  // 权限
  FirstLevelNavigationID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FirstLevelNavigation",
    },
  ], // 一级导航权限
  SecondaryNavigationID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecondaryNavigation",
    },
  ], // 二级导航ID数组
});

const Role = mongoose.model("role", roleSchema, "role");

module.exports = Role;
