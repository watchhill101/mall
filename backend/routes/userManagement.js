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
        .populate('role')
        .select('-password');
      
      if (!currentUser) {
        return res.status(401).json({
          code: 401,
          message: "用户不存在",
        });
      }

      // 获取用户的角色名称（现在是单个角色）
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
      searchText = '',
      status = '',
      role = ''
    } = req.query;

    // 构建查询条件
    const query = {};

    if (searchText) {
      query.$or = [
        { username: { $regex: searchText, $options: 'i' } },
        { email: { $regex: searchText, $options: 'i' } },
        { phone: { $regex: searchText, $options: 'i' } }
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
      .populate('role', 'name')
      .select('-password') // 不返回密码字段
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
        pageSize: parseInt(pageSize)
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
      .populate('role', 'name')
      .select('-password');
      
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

// 创建新用户 - 管理员或超级管理员可创建
router.post("/users", checkPermission(['admin', 'super_admin']), async (req, res) => {
  try {
    const { username, password, email, phone, roleNames = [] } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({
        code: 400,
        message: "用户名、密码和邮箱是必填项",
      });
    }

    // 检查是否要设置为管理员或超级管理员
    const privilegedRoles = ['admin', 'super_admin'];
    const hasPrivilegedRole = roleNames.some(roleName => privilegedRoles.includes(roleName));
    
    if (hasPrivilegedRole && !req.userRoles.includes('super_admin')) {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有超级管理员才能设置用户为管理员或超级管理员",
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: "用户名或邮箱已存在",
      });
    }

    // 查找角色ID
    let roleIds = [];
    if (roleNames.length > 0) {
      const roles = await Role.find({ name: { $in: roleNames } });
      roleIds = roles.map(role => role._id);
      
      // 检查是否所有角色都找到了
      if (roles.length !== roleNames.length) {
        const foundRoleNames = roles.map(role => role.name);
        const notFoundRoles = roleNames.filter(name => !foundRoleNames.includes(name));
        return res.status(400).json({
          code: 400,
          message: `角色不存在: ${notFoundRoles.join(', ')}`,
        });
      }
    }

    const newUser = new User({ 
      username, 
      password, 
      email, 
      phone,
      role: roleIds,
      status: 'active',
      createdAt: new Date()
    });
    
    await newUser.save();

    // 填充角色信息并返回
    const savedUser = await User.findById(newUser._id)
      .populate('role', 'name')
      .select('-password');

    res.json({
      code: 201,
      message: "用户创建成功",
      data: savedUser,
    });
  } catch (error) {
    console.error("创建用户失败:", error);
    res.status(500).json({
      code: 500,
      message: "创建用户失败",
      error: error.message,
    });
  }
});

// 更新用户信息 - 管理员或超级管理员可更新
router.put("/users/:id", checkPermission(['admin', 'super_admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, phone, status } = req.body;
    
    // 构建更新数据
    const updateData = {
      updatedAt: new Date()
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).populate('role', 'name').select('-password');

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
});

// 修改用户权限（角色）- 管理员或超级管理员可修改
router.put("/users/:id/permissions", checkPermission(['admin', 'super_admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { roleNames } = req.body;

    if (!roleNames || !Array.isArray(roleNames)) {
      return res.status(400).json({
        code: 400,
        message: "角色数据格式不正确，应为角色名称数组",
      });
    }

    // 检查是否要设置为管理员或超级管理员
    const privilegedRoles = ['admin', 'super_admin'];
    const hasPrivilegedRole = roleNames.some(roleName => privilegedRoles.includes(roleName));
    
    if (hasPrivilegedRole && !req.userRoles.includes('super_admin')) {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有超级管理员才能设置用户为管理员或超级管理员",
      });
    }

    // 查找角色ID
    let roleIds = [];
    if (roleNames.length > 0) {
      const roles = await Role.find({ name: { $in: roleNames } });
      roleIds = roles.map(role => role._id);
      
      // 检查是否所有角色都找到了
      if (roles.length !== roleNames.length) {
        const foundRoleNames = roles.map(role => role.name);
        const notFoundRoles = roleNames.filter(name => !foundRoleNames.includes(name));
        return res.status(400).json({
          code: 400,
          message: `角色不存在: ${notFoundRoles.join(', ')}`,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        role: roleIds,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('role', 'name').select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        code: 404,
        message: "用户未找到",
      });
    }

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
});

// 重置用户密码 - 只有超级管理员可以重置
router.put("/users/:id/reset-password", checkPermission(['super_admin']), async (req, res) => {
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
        updatedAt: new Date()
      },
      { new: true }
    ).populate('role', 'name').select('-password');

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
});

// 删除用户 - 只有超级管理员可以删除
router.delete("/users/:id", checkPermission(['super_admin']), async (req, res) => {
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
        status: 'deleted',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('role', 'name').select('-password');
    
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
});

// 批量删除用户 - 只有超级管理员可以批量删除
router.delete("/users/batch-delete", checkPermission(['super_admin']), async (req, res) => {
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
        status: 'deleted',
        updatedAt: new Date()
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
});

// 获取用户统计信息 - 管理员或超级管理员可查看
router.get("/stats", checkPermission(['admin', 'super_admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ status: { $ne: 'deleted' } });
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // 获取本月新注册用户
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'deleted' }
    });
    
    // 获取VIP用户数量（假设isVip为true的用户）
    const vipUsers = await User.countDocuments({ 
      isVip: true,
      status: { $ne: 'deleted' }
    });

    // 获取各角色用户统计
    const roleStats = await User.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $unwind: '$role' },
      { $lookup: { from: 'role', localField: 'role', foreignField: '_id', as: 'roleInfo' } },
      { $unwind: '$roleInfo' },
      { $group: { _id: '$roleInfo.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      code: 200,
      message: "获取统计信息成功",
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        vipUsers,
        roleStats
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
});

// 获取所有角色列表 - 登录用户即可查看
router.get("/roles", async (req, res) => {
  try {
    const roles = await Role.find({}).select('name');
    
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
