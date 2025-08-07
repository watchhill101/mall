const express = require("express");
const router = express.Router();
const Role = require("../moudle/role/role");
const User = require("../moudle/user/user");
const FirstLevelNavigation = require("../moudle/navigation/firstLevelNavigation");
const SecondaryNavigation = require("../moudle/navigation/secondaryNavigation");

// 图标映射：将数据库中的图标标识转换为前端期望的图标名称
const iconMapping = {
  // 数据库中的图标标识 -> 前端期望的图标名称
  'home': 'HomeOutlined',
  'shop': 'ShopOutlined', 
  'goods': 'GoodsOutlined',
  'shopping': 'GoodsOutlined',
  'orders': 'OrdersOutlined',
  'order': 'OrdersOutlined',
  'file': 'FileTextOutlined',
  'users': 'UsersOutlined',
  'user': 'UserOutlined',
  'setting': 'SettingOutlined',
  'settings': 'SettingOutlined',
  'system': 'SettingOutlined',
  // 默认图标
  'default': 'AppstoreOutlined'
};

// 转换图标函数
const transformIcon = (iconName) => {
  if (!iconName) return iconMapping.default;
  
  // 如果已经是前端格式，直接返回
  if (iconName.endsWith('Outlined')) return iconName;
  
  // 转换为小写进行匹配
  const lowerIconName = iconName.toLowerCase();
  return iconMapping[lowerIconName] || iconMapping.default;
};

// 根据登录用户权限获取导航数据
router.get("/navigation", async (req, res) => {
  try {
    // 获取当前登录用户ID（假设从JWT token中获取）
    const currentUserId = req.auth?.id || req.auth?.userId;
    
    if (!currentUserId) {
      return res.status(401).json({
        code: 401,
        message: "用户未登录",
      });
    }

    // 获取用户信息及其角色
    const user = await User.findById(currentUserId).populate('role');
    
    if (!user || !user.role) {
      return res.status(403).json({
        code: 403,
        message: "用户角色信息不存在",
      });
    }

    const role = user.role;

    // 获取该角色有权限的一级导航
    const firstLevelNavs = await FirstLevelNavigation.find({
      _id: { $in: role.FirstLevelNavigationID }
    });

    // 获取该角色有权限的二级导航
    const secondaryNavs = await SecondaryNavigation.find({
      _id: { $in: role.SecondaryNavigationID }
    });

    // 组织导航数据结构
    const navigationData = [];

    for (const firstNav of firstLevelNavs) {
      // 找到属于当前一级导航的二级导航
      const children = secondaryNavs.filter(
        (nav) => nav.firstLevelNavigationID.toString() === firstNav._id.toString()
      );

      navigationData.push({
        _id: firstNav._id,
        title: firstNav.title,
        icon: transformIcon(firstNav.icon), // 转换图标格式
        url: firstNav.url,
        subTitle: firstNav.subTitle,
        subText: firstNav.subText,
        children: children.map(nav => ({
          _id: nav._id,
          name: nav.name,
          url: nav.url,
          firstLevelNavigationID: nav.firstLevelNavigationID
        }))
      });
    }

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

// 根据角色ID获取导航数据（管理员功能）
router.get("/navigation/role/:roleId", async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "角色不存在",
      });
    }

    // 获取该角色有权限的一级导航
    const firstLevelNavs = await FirstLevelNavigation.find({
      _id: { $in: role.FirstLevelNavigationID }
    });

    // 获取该角色有权限的二级导航
    const secondaryNavs = await SecondaryNavigation.find({
      _id: { $in: role.SecondaryNavigationID }
    });

    // 组织导航数据结构
    const navigationData = [];

    for (const firstNav of firstLevelNavs) {
      // 找到属于当前一级导航的二级导航
      const children = secondaryNavs.filter(
        (nav) => nav.firstLevelNavigationID.toString() === firstNav._id.toString()
      );

      navigationData.push({
        _id: firstNav._id,
        title: firstNav.title,
        icon: transformIcon(firstNav.icon), // 转换图标格式
        url: firstNav.url,
        subTitle: firstNav.subTitle,
        subText: firstNav.subText,
        children: children.map(nav => ({
          _id: nav._id,
          name: nav.name,
          url: nav.url,
          firstLevelNavigationID: nav.firstLevelNavigationID
        }))
      });
    }

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
// router.get('/navigation', async (req, res) => {
//   try {
//     // 获取一级导航，并关联二级导航
//     const firstLevelNavs = await FirstLevelNavigation.find({});

//     // 手动获取二级导航并组织数据结构
//     const navigationData = [];

//     for (const firstNav of firstLevelNavs) {
//       const secondaryNavs = await SecondaryNavigation.find({
//         firstLevelNavigationID: firstNav._id
//       });

//       navigationData.push({
//         _id: firstNav._id,
//         title: firstNav.title,
//         icon: firstNav.icon,
//         url: firstNav.url,
//         subTitle: firstNav.subTitle,
//         subText: firstNav.subText,
//         children: secondaryNavs.map(nav => ({
//           _id: nav._id,
//           name: nav.name,
//           url: nav.url,
//           firstLevelNavigationID: nav.firstLevelNavigationID
//         }))
//       });
//     }

//     res.json({
//       code: 200,
//       message: '获取导航数据成功',
//       data: navigationData
//     });
//   } catch (error) {
//     console.error('获取导航数据失败:', error);
//     res.status(500).json({
//       code: 500,
//       message: '获取导航数据失败',
//       error: error.message
//     });
//   }
// });

// 获取所有一级导航（管理员功能）
router.get("/navigation/first-level", async (req, res) => {
  try {
    const firstLevelNavs = await FirstLevelNavigation.find({});
    res.json({
      code: 200,
      message: "获取一级导航成功",
      data: firstLevelNavs,
    });
  } catch (error) {
    console.error("获取一级导航失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取一级导航失败",
      error: error.message,
    });
  }
});

// 获取二级导航（管理员功能）
router.get("/navigation/secondary/:firstLevelId?", async (req, res) => {
  try {
    const { firstLevelId } = req.params;
    const query = firstLevelId ? { firstLevelNavigationID: firstLevelId } : {};

    const secondaryNavs = await SecondaryNavigation.find(query);
    res.json({
      code: 200,
      message: "获取二级导航成功",
      data: secondaryNavs,
    });
  } catch (error) {
    console.error("获取二级导航失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取二级导航失败",
      error: error.message,
    });
  }
});

// 获取当前用户可访问的导航权限列表
router.get("/navigation/permissions", async (req, res) => {
  try {
    const currentUserId = req.auth?.id || req.auth?.userId;
    
    if (!currentUserId) {
      return res.status(401).json({
        code: 401,
        message: "用户未登录",
      });
    }

    const user = await User.findById(currentUserId).populate('role');
    
    if (!user || !user.role) {
      return res.status(403).json({
        code: 403,
        message: "用户角色信息不存在",
      });
    }

    res.json({
      code: 200,
      message: "获取用户导航权限成功",
      data: {
        roleName: user.role.name,
        firstLevelNavigationIDs: user.role.FirstLevelNavigationID,
        secondaryNavigationIDs: user.role.SecondaryNavigationID
      },
    });
  } catch (error) {
    console.error("获取用户导航权限失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户导航权限失败",
      error: error.message,
    });
  }
});

module.exports = router;
