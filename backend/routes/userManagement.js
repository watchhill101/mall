const express = require("express");
const router = express.Router();

// 导入模型
const User = require("../moudle/user/user");

// 用户管理相关接口

// 获取用户列表（分页查询）
router.get("/users", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以查看用户列表）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以查看用户列表",
      });
    }

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
      query.role = role;
    }

    // 计算跳过的数量
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 查询用户列表
    const users = await User.find(query)
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

// 获取用户详情
router.get("/users/:id", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以查看用户详情）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以查看用户详情",
      });
    }

    const user = await User.findById(req.params.id).select('-password');
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

// 创建新用户
router.post("/users", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以创建用户）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以创建用户",
      });
    }

    const { username, password, email, phone, role = 'user' } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({
        code: 400,
        message: "用户名、密码和邮箱是必填项",
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

    const newUser = new User({ 
      username, 
      password, 
      email, 
      phone,
      role,
      status: 'active',
      createdAt: new Date()
    });
    
    await newUser.save();

    // 返回时不包含密码
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.json({
      code: 201,
      message: "用户创建成功",
      data: userResponse,
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

// 更新用户信息
router.put("/users/:id", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以更新用户信息）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以更新用户信息",
      });
    }

    const userId = req.params.id;
    const { username, email, phone, role, status } = req.body;
    
    // 构建更新数据
    const updateData = {
      updatedAt: new Date()
    };
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
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
    ).select('-password');

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

// 修改用户权限
router.put("/users/:id/permissions", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以修改权限）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以修改用户权限",
      });
    }

    const userId = req.params.id;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        code: 400,
        message: "权限数据格式不正确",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        FirstLevelNavigationID: permissions,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

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

// 重置用户密码
router.put("/users/:id/reset-password", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以重置用户密码）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以重置用户密码",
      });
    }

    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        code: 400,
        message: "新密码不能为空",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        password: newPassword,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

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

// 删除用户
router.delete("/users/:id", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以删除用户）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以删除用户",
      });
    }

    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    
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

// 批量删除用户
router.delete("/users/batch-delete", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以批量删除用户）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以批量删除用户",
      });
    }

    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "请提供要删除的用户ID列表",
      });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });
    
    res.json({
      code: 200,
      message: `成功删除 ${result.deletedCount} 个用户`,
      data: { deletedCount: result.deletedCount },
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

// 获取用户统计信息
router.get("/stats", async (req, res) => {
  try {
    // 检查当前用户权限（只有管理员可以查看统计信息）
    const currentUserId = req.auth.id || req.auth.userId;
    const currentUser = await User.findById(currentUserId).select('-password');
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足，只有管理员可以查看统计信息",
      });
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // 获取本月新注册用户
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // 假设VIP用户为角色为admin的用户
    const vipUsers = await User.countDocuments({ role: 'admin' });

    res.json({
      code: 200,
      message: "获取统计信息成功",
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        vipUsers
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

module.exports = router;
