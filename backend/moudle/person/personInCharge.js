const mongoose = require("mongoose");

//负责人模型
const personInChargeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, //姓名
    phone: { type: String, required: true, unique: true }, //电话
    email: { type: String, required: true, unique: true }, //邮箱
    position: { type: String, required: true }, //职位
    department: { type: String }, //部门
    idCard: { type: String }, //身份证号
    
    // 关联用户账号
    account: { type: mongoose.Schema.Types.ObjectId, ref: "MerchantAccount" },
    
    // 权限级别
    level: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff"
    },
    
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "pending"]
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 添加索引
personInChargeSchema.index({ phone: 1 });
personInChargeSchema.index({ email: 1 });

const PersonInCharge = mongoose.model("PersonInCharge", personInChargeSchema, "personInCharge");
module.exports = PersonInCharge;
