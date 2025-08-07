var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 定义用户的Schema
const userSchema = new mongoose.Schema({
  // 基本信息
  username: { type: String, required: true, unique: true }, // 用户名
  loginAccount: { type: String }, // 登录账号（保持兼容性）
  password: { type: String, required: true }, // 密码
  email: { type: String, required: true, unique: true }, // 邮箱
  phone: { type: String }, // 手机号

  // 角色和状态
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "role",
  },
  // 用户角色
  status: {
    type: String,
    enum: ["active", "inactive", "suspended", "deleted"],
    default: "active",
  }, // 用户状态

  // 时间戳
  createdAt: { type: Date, default: Date.now }, // 创建时间
  updatedAt: { type: Date, default: Date.now }, // 更新时间
  lastLoginAt: { type: Date }, // 最后登录时间

  // 其他信息
  avatar: { type: String }, // 头像URL
  nickname: { type: String }, // 昵称
  isVip: { type: Boolean, default: false }, // 是否VIP
});

// 创建复合索引以提高查询效率
userSchema.index({ username: 1, email: 1 });
userSchema.index({ status: 1, role: 1 });
userSchema.index({ createdAt: -1 });

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

// 更新前自动设置updatedAt
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 验证密码的实例方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 转换为JSON时排除敏感信息
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("user", userSchema, "user");

module.exports = User;
