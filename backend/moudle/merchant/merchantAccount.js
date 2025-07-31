const mongoose = require("mongoose");

//商家账号模型
const merchantAccountSchema = new mongoose.Schema(
  {
    loginAccount: { type: String, required: true, unique: true }, //登录账号
    nickname: { type: String, required: true }, //用户昵称
    password: { type: String, required: true }, //密码
    
    // 多重关联关系
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, //角色
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant", required: true }, //关联商家
    personInCharge: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInCharge", required: true }, //关联负责人
    
    // 账号安全
    lastLoginTime: { type: Date }, //最后登录时间
    lastLoginIP: { type: String }, //最后登录IP
    loginAttempts: { type: Number, default: 0 }, //登录尝试次数
    lockUntil: { type: Date }, //锁定到期时间
    
    status: {
      type: String,
      default: "normal",
      enum: ["normal", "disabled", "locked", "pending"]
    }, //状态
    
    // 权限控制
    permissions: [{
      module: { type: String, required: true }, //模块名
      actions: [{ type: String }] //允许的操作
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
merchantAccountSchema.index({ loginAccount: 1 });
merchantAccountSchema.index({ merchant: 1 });
merchantAccountSchema.index({ status: 1 });

const MerchantAccount = mongoose.model("MerchantAccount", merchantAccountSchema, "merchantAccount");
module.exports = MerchantAccount;
