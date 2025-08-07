const express = require("express");
const router = express.Router();

// 导入模型
const User = require("../moudle/user/user");
const { FirstLevelNavigation, SecondLevelNavigation } = require("../moudle/navigation");

/**
 * 获取当前用户权限信息
 */
router.get("/my-permissions", async (req, res) => {
  try {
    // 从JWT token中获取用户ID，可能是id或userId字段
    const userId = req.auth.id || req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "用户信息不存在",
        data: null
      });
    }

    // 获取用户信息
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null
      });
    }

    // 获取用户的权限
    let permissions = [];
    if (user.FirstLevelNavigationID && user.FirstLevelNavigationID.length > 0) {
      permissions = user.FirstLevelNavigationID;
    }

    res.json({
      code: 200,
      message: "获取权限成功",
      data: {
        userId: user._id,
        username: user.username,
        role: user.role,
        permissions: permissions,
        status: user.status
      }
    });
  } catch (error) {
    console.error("获取用户权限失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户权限失败",
      error: error.message
    });
  }
});

/**
 * 获取用户可访问的路由
 */
router.get("/user-routes", async (req, res) => {
  try {
    const userId = req.auth.id || req.auth.userId;
    
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "用户信息不存在",
        data: null
      });
    }

    // 获取用户信息
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null
      });
    }

    // 获取用户权限对应的导航信息
    let routes = [];
    if (user.FirstLevelNavigationID && user.FirstLevelNavigationID.length > 0) {
      // 获取一级导航
      const firstLevelNavs = await FirstLevelNavigation.find({
        _id: { $in: user.FirstLevelNavigationID }
      });

      // 获取对应的二级导航
      for (const firstNav of firstLevelNavs) {
        const secondLevelNavs = await SecondLevelNavigation.find({
          firstLevelNavigationID: firstNav._id
        });

        routes.push({
          id: firstNav._id,
          name: firstNav.name,
          url: firstNav.url,
          icon: firstNav.icon,
          children: secondLevelNavs.map(secondNav => ({
            id: secondNav._id,
            name: secondNav.name,
            url: secondNav.url,
            icon: secondNav.icon
          }))
        });
      }
    }

    res.json({
      code: 200,
      message: "获取路由成功",
      data: {
        routes: routes
      }
    });
  } catch (error) {
    console.error("获取用户路由失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户路由失败",
      error: error.message
    });
  }
});

/**
 * 获取所有权限模块（管理员权限）
 */
router.get("/modules", async (req, res) => {
  try {
    // 检查用户权限（只有管理员可以访问）
    const userId = req.auth.id || req.auth.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足",
        data: null
      });
    }

    // 获取所有一级导航
    const firstLevelNavs = await FirstLevelNavigation.find({}).sort({ order: 1 });
    
    const modules = [];
    for (const firstNav of firstLevelNavs) {
      // 获取对应的二级导航
      const secondLevelNavs = await SecondLevelNavigation.find({
        firstLevelNavigationID: firstNav._id
      }).sort({ order: 1 });

      modules.push({
        title: firstNav.name,
        key: firstNav._id.toString(),
        children: secondLevelNavs.map(secondNav => ({
          title: secondNav.name,
          key: secondNav._id.toString(),
          url: secondNav.url
        }))
      });
    }

    res.json({
      code: 200,
      message: "获取权限模块成功",
      data: modules
    });
  } catch (error) {
    console.error("获取权限模块失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取权限模块失败",
      error: error.message
    });
  }
});

/**
 * 获取角色权限模板
 */
router.get("/role-templates", async (req, res) => {
  try {
    // 检查用户权限（只有管理员可以访问）
    const userId = req.auth.id || req.auth.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足",
        data: null
      });
    }

    // 获取所有一级导航ID
    const allFirstLevelNavs = await FirstLevelNavigation.find({});
    const allPermissions = allFirstLevelNavs.map(nav => nav._id.toString());
    
    // 定义角色权限模板
    const templates = {
      admin: {
        name: '超级管理员',
        description: '拥有系统所有权限',
        color: '#f50',
        permissions: allPermissions
      },
      merchant: {
        name: '商户',
        description: '商户相关权限',
        color: '#2db7f5',
        permissions: allPermissions.filter((_, index) => 
          // 给商户一些基础权限，具体根据实际需求调整
          index < Math.floor(allPermissions.length * 0.6)
        )
      },
      operator: {
        name: '操作员',
        description: '操作员权限',
        color: '#87d068',
        permissions: allPermissions.filter((_, index) => 
          // 给操作员一些基础权限
          index < Math.floor(allPermissions.length * 0.4)
        )
      },
      user: {
        name: '普通用户',
        description: '基础只读权限',
        color: '#108ee9',
        permissions: allPermissions.filter((_, index) => 
          // 给普通用户少量权限
          index < Math.floor(allPermissions.length * 0.2)
        )
      }
    };

    res.json({
      code: 200,
      message: "获取角色模板成功",
      data: templates
    });
  } catch (error) {
    console.error("获取角色模板失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取角色模板失败",
      error: error.message
    });
  }
});

/**
 * 检查用户权限
 */
router.post("/check-permission", async (req, res) => {
  try {
    const { permissions } = req.body;
    const userId = req.auth.id || req.auth.userId;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        code: 400,
        message: "权限参数格式不正确",
        data: null
      });
    }

    // 获取用户信息
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        data: null
      });
    }

    // 检查用户是否有所需权限
    const userPermissions = user.FirstLevelNavigationID || [];
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    res.json({
      code: 200,
      message: "权限检查完成",
      data: {
        hasPermission: hasPermission,
        userPermissions: userPermissions,
        requiredPermissions: permissions
      }
    });
  } catch (error) {
    console.error("权限检查失败:", error);
    res.status(500).json({
      code: 500,
      message: "权限检查失败",
      error: error.message
    });
  }
});

/**
 * 获取权限统计信息（管理员权限）
 */
router.get("/stats", async (req, res) => {
  try {
    // 检查用户权限（只有管理员可以访问）
    const userId = req.auth.id || req.auth.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "权限不足",
        data: null
      });
    }

    // 统计各种权限分布
    const totalUsers = await User.countDocuments({});
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const merchantUsers = await User.countDocuments({ role: 'merchant' });
    const operatorUsers = await User.countDocuments({ role: 'operator' });
    const normalUsers = await User.countDocuments({ role: 'user' });
    
    // 统计有权限的用户数量
    const usersWithPermissions = await User.countDocuments({
      FirstLevelNavigationID: { $exists: true, $ne: [] }
    });

    res.json({
      code: 200,
      message: "获取权限统计成功",
      data: {
        totalUsers,
        roleDistribution: {
          admin: adminUsers,
          merchant: merchantUsers,
          operator: operatorUsers,
          user: normalUsers
        },
        usersWithPermissions,
        usersWithoutPermissions: totalUsers - usersWithPermissions
      }
    });
  } catch (error) {
    console.error("获取权限统计失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取权限统计失败",
      error: error.message
    });
  }
});

module.exports = router;
