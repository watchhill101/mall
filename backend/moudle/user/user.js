var mongoose = require("mongoose");
// 定义用户的Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // 用户名
  password: { type: String, required: true }, // 密码
  email: { type: String, required: true }, // 邮箱
  FirstLevelNavigationID: {
    type: Array, // 一级导航ID数组
    enum: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FirstLevelNavigation",
      },
    ], // 允许的一级导航ID列表
    default: [], // 默认值为空数组
  },
});

const User = mongoose.model("user", userSchema, "user");

module.exports = User;
