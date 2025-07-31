var mongoose = require("mongoose");
// 定义用户角色的Schema
// 用户角色包含名称
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 角色名称
});

const Role = mongoose.model("role", roleSchema, "role");

module.exports = Role;
