const express = require("express");
const router = express.Router();
const Role = require("../moudle/role/role");

// 导入模型
const User = require("../moudle/user/user");

// 权限检查中间件
const checkPermission = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const currentUserId = req.auth.id || req.auth.userId;
      const currentUser = await User.findById(currentUserId)
        .populate("role")
        .select("-password");

      if (!currentUser) {
        return res.status(401).json({
          code: 401,
          message: "用户不存在",
        });
      }

      // 获取用户的角色名称（单个角色）
      const userRole = currentUser.role ? currentUser.role.name : null;

      // 检查是否有所需权限
      const hasPermission = requiredRoles.includes(userRole);

      if (!hasPermission) {
        return res.status(403).json({
          code: 403,
          message: "权限不足",
        });
      }

      req.currentUser = currentUser;
      req.userRole = userRole;
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
};

// 用户管理相关接口

// 获取用户列表（分页查询）- 登录用户即可查看
router.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      searchText = "",
      status = "",
      role = "",
    } = req.query;

    // 构建查询条件
    const query = {};

    if (searchText) {
      query.$or = [
        { username: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { phone: { $regex: searchText, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (role) {
      // 如果按角色筛选，需要先查找角色ID
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        query.role = roleDoc._id;
      }
    }

    // 计算跳过的数量
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 查询用户列表，填充角色信息
    const users = await User.find(query)
      .populate("role", "name")
      .select("-password") // 不返回密码字段
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    // 获取总数
    const total = await User.countDocuments(query);

    res.json({
      code: 200,
      message: "获取用户列表成功",
      data: {
        users,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户列表失败",
      error: error.message,
    });
  }
});

// 获取用户详情 - 登录用户即可查看
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("role", "name")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户未找到",
      });
    }

    res.json({
      code: 200,
      message: "获取用户详情成功",
      data: user,
    });
  } catch (error) {
    console.error("获取用户详情失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户详情失败",
      error: error.message,
    });
  }
});

// 创建新用户 - 普通管理员或超级管理员可创建
router.post(
  "/users",
  checkPermission(["普通管理员", "超级管理员"]),
  async (req, res) => {
    try {
      console.log("📥 创建用户请求:", {
        body: req.body,
        userRole: req.userRole,
        currentUser: req.currentUser?.username
      });

      const { username, password, email, phone, roleName } = req.body;

      if (!username || !password || !email) {
        console.log("❌ 必填项验证失败:", { username, password: !!password, email });
        return res.status(400).json({
          code: 400,
          message: "用户名、密码和邮箱是必填项",
        });
      }

      // 检查是否要设置为普通管理员或超级管理员
      const privilegedRoles = ["普通管理员", "超级管理员"];
      const hasPrivilegedRole = privilegedRoles.includes(roleName);

      if (hasPrivilegedRole && req.userRole !== "超级管理员") {
        return res.status(403).json({
          code: 403,
          message:
            "权限不足，只有超级管理员才能设置用户为普通管理员或超级管理员",
        });
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: "用户名或邮箱已存在",
        });
      }

      // 查找角色ID（单个角色）
      let roleId = null;
      if (roleName) {
        console.log("🔍 查找角色:", roleName);
        const role = await Role.findOne({ name: roleName });
        console.log("🔍 角色查找结果:", role);
        if (!role) {
          console.log("❌ 角色不存在:", roleName);
          return res.status(400).json({
            code: 400,
            message: `角色不存在: ${roleName}`,
          });
        }
        roleId = role._id;
        console.log("✅ 角色ID:", roleId);
      }

      console.log("🔄 创建用户对象:", {
        username,
        email,
        phone,
        roleId,
        hasPassword: !!password
      });

      const newUser = new User({
        username,
        loginAccount: username, // 设置loginAccount字段，避免null值重复
        password,
        email,
        phone,
        role: roleId,
        status: "active",
        createdAt: new Date(),
      });

      console.log("💾 保存用户到数据库...");
      
      // 验证数据库连接
      console.log("🔍 数据库连接状态:", require('mongoose').connection.readyState);
      
      await newUser.save();
      console.log("✅ 用户保存成功:", newUser._id);

      // 填充角色信息并返回
      const savedUser = await User.findById(newUser._id)
        .populate("role", "name")
        .select("-password");

      res.json({
        code: 201,
        message: "用户创建成功",
        data: savedUser,
      });
    } catch (error) {
      console.error("❌ 创建用户失败 - 详细错误信息:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        errors: error.errors // Mongoose验证错误
      });
      
      // 如果是Mongoose验证错误，返回更具体的错误信息
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          code: 400,
          message: "数据验证失败",
          errors: validationErrors,
        });
      }
      
      // 如果是重复键错误
      if (error.code === 11000) {
        return res.status(400).json({
          code: 400,
          message: "用户名或邮箱已存在",
          error: error.message,
        });
      }
      
      res.status(500).json({
        code: 500,
        message: "创建用户失败",
        error: error.message,
      });
    }
  }
);

// 更新用户信息 - 普通管理员或超级管理员可更新
router.put(
  "/users/:id",
  checkPermission(["普通管理员", "超级管理员"]),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { username, email, phone, status } = req.body;

      // 构建更新数据
      const updateData = {
        updatedAt: new Date(),
      };

      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (status) updateData.status = status;

      // 如果更新用户名或邮箱，检查是否冲突
      if (username || email) {
        const query = { _id: { $ne: userId } };
        if (username && email) {
          query.$or = [{ username }, { email }];
        } else if (username) {
          query.username = username;
        } else if (email) {
          query.email = email;
        }

        const existingUser = await User.findOne(query);
        if (existingUser) {
          return res.status(400).json({
            code: 400,
            message: "用户名或邮箱已存在",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      })
        .populate("role", "name")
        .select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          code: 404,
          message: "用户未找到",
        });
      }

      res.json({
        code: 200,
        message: "用户信息更新成功",
        data: updatedUser,
      });
    } catch (error) {
      console.error("更新用户信息失败:", error);
      res.status(500).json({
        code: 500,
        message: "更新用户信息失败",
        error: error.message,
      });
    }
  }
);

// 修改用户权限（角色）- 只有超级管理员可修改
router.put(
  "/users/:id/permissions",
  checkPermission(["超级管理员"]),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { roleName } = req.body;

      console.log("📥 后端接收到角色更新请求:", {
        userId,
        roleName,
        roleNameType: typeof roleName,
        requestBody: req.body,
      });

      if (!roleName || typeof roleName !== "string") {
        console.log("❌ 角色名称验证失败:", {
          roleName,
          type: typeof roleName,
        });
        return res.status(400).json({
          code: 400,
          message: "角色名称不能为空",
        });
      }

      // 查找角色ID（单个角色）
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        return res.status(400).json({
          code: 400,
          message: `角色不存在: ${roleName}`,
        });
      }

      console.log("🔄 开始更新用户角色:", {
        userId,
        roleName,
        roleId: role._id,
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: role._id,
          updatedAt: new Date(),
        },
        { new: true }
      )
        .populate("role", "name")
        .select("-password");

      if (!updatedUser) {
        console.log("❌ 用户未找到:", userId);
        return res.status(404).json({
          code: 404,
          message: "用户未找到",
        });
      }

      console.log("✅ 用户角色更新成功:", {
        userId: updatedUser._id,
        username: updatedUser.username,
        newRole: updatedUser.role,
      });

      res.json({
        code: 200,
        message: "用户权限更新成功",
        data: updatedUser,
      });
    } catch (error) {
      console.error("更新用户权限失败:", error);
      res.status(500).json({
        code: 500,
        message: "更新用户权限失败",
        error: error.message,
      });
    }
  }
);

// 重置用户密码 - 只有超级管理员可以重置
router.put(
  "/users/:id/reset-password",
  checkPermission(["超级管理员"]),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          code: 400,
          message: "新密码不能为空",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          code: 400,
          message: "密码长度不能少于6位",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          password: newPassword,
          updatedAt: new Date(),
        },
        { new: true }
      )
        .populate("role", "name")
        .select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          code: 404,
          message: "用户未找到",
        });
      }

      res.json({
        code: 200,
        message: "密码重置成功",
        data: updatedUser,
      });
    } catch (error) {
      console.error("重置密码失败:", error);
      res.status(500).json({
        code: 500,
        message: "重置密码失败",
        error: error.message,
      });
    }
  }
);

// 删除用户 - 只有超级管理员可以删除
router.delete(
  "/users/:id",
  checkPermission(["超级管理员"]),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // 防止删除自己
      const currentUserId = req.auth.id || req.auth.userId;
      if (userId === currentUserId) {
        return res.status(400).json({
          code: 400,
          message: "不能删除自己的账户",
        });
      }

      // 使用软删除，将状态设置为deleted
      const deletedUser = await User.findByIdAndUpdate(
        userId,
        {
          status: "deleted",
          updatedAt: new Date(),
        },
        { new: true }
      )
        .populate("role", "name")
        .select("-password");

      if (!deletedUser) {
        return res.status(404).json({
          code: 404,
          message: "用户未找到",
        });
      }

      res.json({
        code: 200,
        message: "用户删除成功",
        data: deletedUser,
      });
    } catch (error) {
      console.error("删除用户失败:", error);
      res.status(500).json({
        code: 500,
        message: "删除用户失败",
        error: error.message,
      });
    }
  }
);

// 批量删除用户 - 只有超级管理员可以批量删除
router.delete(
  "/users/batch-delete",
  checkPermission(["超级管理员"]),
  async (req, res) => {
    try {
      const { ids } = req.body;
      const currentUserId = req.auth.id || req.auth.userId;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: "请提供要删除的用户ID列表",
        });
      }

      // 防止删除自己
      if (ids.includes(currentUserId)) {
        return res.status(400).json({
          code: 400,
          message: "不能删除自己的账户",
        });
      }

      // 使用软删除，将状态设置为deleted
      const result = await User.updateMany(
        { _id: { $in: ids } },
        {
          status: "deleted",
          updatedAt: new Date(),
        }
      );

      res.json({
        code: 200,
        message: `成功删除 ${result.modifiedCount} 个用户`,
        data: { deletedCount: result.modifiedCount },
      });
    } catch (error) {
      console.error("批量删除用户失败:", error);
      res.status(500).json({
        code: 500,
        message: "批量删除用户失败",
        error: error.message,
      });
    }
  }
);

// 获取用户统计信息 - 普通管理员或超级管理员可查看
router.get(
  "/stats",
  checkPermission(["普通管理员", "超级管理员"]),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({
        status: { $ne: "deleted" },
      });
      const activeUsers = await User.countDocuments({ status: "active" });

      // 获取本月新注册用户
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const newUsers = await User.countDocuments({
        createdAt: { $gte: startOfMonth },
        status: { $ne: "deleted" },
      });

      // 获取VIP用户数量（假设isVip为true的用户）
      const vipUsers = await User.countDocuments({
        isVip: true,
        status: { $ne: "deleted" },
      });

      // 获取各角色用户统计
      const roleStats = await User.aggregate([
        { $match: { status: { $ne: "deleted" }, role: { $ne: null } } },
        {
          $lookup: {
            from: "role",
            localField: "role",
            foreignField: "_id",
            as: "roleInfo",
          },
        },
        { $unwind: "$roleInfo" },
        { $group: { _id: "$roleInfo.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      res.json({
        code: 200,
        message: "获取统计信息成功",
        data: {
          totalUsers,
          activeUsers,
          newUsers,
          vipUsers,
          roleStats,
        },
      });
    } catch (error) {
      console.error("获取统计信息失败:", error);
      res.status(500).json({
        code: 500,
        message: "获取统计信息失败",
        error: error.message,
      });
    }
  }
);

// 获取所有角色列表 - 登录用户即可查看
router.get("/roles", async (req, res) => {
  try {
    const roles = await Role.find({}).select("name");

    res.json({
      code: 200,
      message: "获取角色列表成功",
      data: roles,
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取角色列表失败",
      error: error.message,
    });
  }
});

module.exports = router;
