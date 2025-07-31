var mongoose = require("mongoose");
// 定义用户的Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // 用户名
  password: { type: String, required: true }, // 密码
  email: { type: String, required: true }, // 邮箱
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, // 角色
});

const User = mongoose.model("user", userSchema, "users");

module.exports = User;
