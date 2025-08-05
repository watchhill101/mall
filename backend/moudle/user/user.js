var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 定义用户的Schema
const userSchema = new mongoose.Schema({
  loginAccount: { type: String, required: true }, // 登录账号
  password: { type: String, required: true }, // 密码
  email: { type: String, required: true }, // 邮箱
  FirstLevelNavigationID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FirstLevelNavigation",
    },
  ], // ✅ 修正：对象数组引用的正确写法
});

// 保存前加密密码
userSchema.pre("save", async function (next) {
  // 如果密码没有被修改，则跳过加密
  if (!this.isModified("password")) return next();

  try {
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码的实例方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("user", userSchema, "user");

module.exports = User;
