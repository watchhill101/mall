const express = require("express");
const router = express.Router();
const Role = require("../moudle/role/role");
const { FirstLevelNavigation, SecondaryNavigation } = require("../moudle/navigation");

// 权限检查中间件 - 只有超级管理员可以管理角色
const checkSuperAdmin = async (req, res, next) => {
  try {
    const User = require("../moudle/user/user");
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).populate("role");

    if (!currentUser || !currentUser.role || currentUser.role.name !== "超级管理员") {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有超级管理员可以管理角色",
      });
    }

    next();
  } catch (error) {
    console.error("权限检查失败:", error);
    res.status(500).json({
      code: 500,
      message: "权限检查失败",
      error: error.message,
    });
  }
};

// 获取角色详情（包含权限信息）
router.get("/roles/:id", checkSuperAdmin, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("FirstLevelNavigationID", "name")
      .populate("SecondaryNavigationID", "name");

    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "角色未找到",
      });
    }

    res.json({
      code: 200,
      message: "获取角色详情成功",
      data: role,
    });
  } catch (error) {
    console.error("获取角色详情失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取角色详情失败",
      error: error.message,
    });
  }
});

// 更新角色权限
router.put("/roles/:id/permissions", checkSuperAdmin, async (req, res) => {
  try {
    const { FirstLevelNavigationID, SecondaryNavigationID } = req.body;

    console.log("📥 更新角色权限请求:", {
      roleId: req.params.id,
      FirstLevelNavigationID,
      SecondaryNavigationID
    });

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        FirstLevelNavigationID: FirstLevelNavigationID || [],
        SecondaryNavigationID: SecondaryNavigationID || []
      },
      { new: true }
    )
      .populate("FirstLevelNavigationID", "name")
      .populate("SecondaryNavigationID", "name");

    if (!updatedRole) {
      return res.status(404).json({
        code: 404,
        message: "角色未找到",
      });
    }

    console.log("✅ 角色权限更新成功:", updatedRole);

    res.json({
      code: 200,
      message: "角色权限更新成功",
      data: updatedRole,
    });
  } catch (error) {
    console.error("更新角色权限失败:", error);
    res.status(500).json({
      code: 500,
      message: "更新角色权限失败",
      error: error.message,
    });
  }
});

// 获取导航数据
router.get("/navigations", checkSuperAdmin, async (req, res) => {
  try {
    // 从数据库查询真实的导航数据
    const firstLevel = await FirstLevelNavigation.find({});
    const secondLevel = await SecondaryNavigation.find({});

    const navigationData = {
      firstLevel: firstLevel.map(nav => ({
        _id: nav._id,
        name: nav.title || nav.name // 兼容不同的字段名
      })),
      secondLevel: secondLevel.map(nav => ({
        _id: nav._id,
        name: nav.name,
        parentId: nav.firstLevelNavigationID
      }))
    };

    res.json({
      code: 200,
      message: "获取导航数据成功",
      data: navigationData,
    });
  } catch (error) {
    console.error("获取导航数据失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取导航数据失败",
      error: error.message,
    });
  }
});

// 创建新角色
router.post("/roles", checkSuperAdmin, async (req, res) => {
  try {
    const { name, FirstLevelNavigationID, SecondaryNavigationID } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: "角色名称不能为空",
      });
    }

    // 检查角色名称是否已存在
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        code: 400,
        message: "角色名称已存在",
      });
    }

    const newRole = new Role({
      name,
      FirstLevelNavigationID: FirstLevelNavigationID || [],
      SecondaryNavigationID: SecondaryNavigationID || []
    });

    await newRole.save();

    const savedRole = await Role.findById(newRole._id)
      .populate("FirstLevelNavigationID", "name")
      .populate("SecondaryNavigationID", "name");

    res.json({
      code: 201,
      message: "角色创建成功",
      data: savedRole,
    });
  } catch (error) {
    console.error("创建角色失败:", error);
    res.status(500).json({
      code: 500,
      message: "创建角色失败",
      error: error.message,
    });
  }
});

module.exports = router;