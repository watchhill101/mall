const express = require("express");
const router = express.Router();
const PersonInCharge = require("../moudle/person/personInCharge");

// 获取角色列表（使用负责人的职位作为角色）
router.get("/list", async (req, res) => {
  try {
    const { page = 1, pageSize = 100 } = req.query;

    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 获取不重复的职位列表作为角色
    const positions = await PersonInCharge.distinct("position", { status: "active" });

    // 构建角色数据
    const roles = positions.map((position, index) => ({
      _id: `role_${index + 1}`,
      name: position,
      description: `${position}角色`,
      level: getPositionLevel(position)
    }));

    // 分页处理
    const paginatedRoles = roles.slice(skip, skip + limit);

    res.json({
      code: 200,
      message: "获取角色列表成功",
      data: paginatedRoles,
      pagination: {
        current: parseInt(page),
        pageSize: limit,
        total: roles.length
      }
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取角色列表失败",
      data: null
    });
  }
});

// 根据职位获取权限级别
function getPositionLevel(position) {
  const levelMap = {
    '超级管理员': 1,
    '管理员': 2,
    '部门经理': 3,
    '操作员': 4,
    '客服主管': 3,
    '财务专员': 4
  };
  return levelMap[position] || 5;
}

// 获取单个角色详情（根据职位名称）
router.get("/:position", async (req, res) => {
  try {
    const position = decodeURIComponent(req.params.position);

    // 查找具有该职位的负责人
    const persons = await PersonInCharge.find({
      position: position,
      status: "active"
    }).select("_id name phone email department");

    if (persons.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "角色不存在",
        data: null
      });
    }

    const roleData = {
      _id: `role_${position}`,
      name: position,
      description: `${position}角色`,
      level: getPositionLevel(position),
      persons: persons,
      count: persons.length
    };

    res.json({
      code: 200,
      message: "获取角色详情成功",
      data: roleData
    });
  } catch (error) {
    console.error("获取角色详情失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取角色详情失败",
      data: null
    });
  }
});

// 注意：角色现在基于负责人的职位，不需要单独创建角色
// 角色会在创建负责人时自动生成

module.exports = router; 