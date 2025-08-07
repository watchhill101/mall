const express = require("express");
const router = express.Router();
const Role = require("../moudle/role");
const FirstLevelNavigation = require("../moudle/navigation/firstLevelNavigation");
const SecondaryNavigation = require("../moudle/navigation/secondaryNavigation");

// 获取角色下导航数据
router.get("/navigation/role/:roleId", async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(roleId);

    const firstLevelNavs = await Promise.all(
      role.FirstLevelNavigationID.map((id) => FirstLevelNavigation.findById(id))
    );

    const secondaryNavs = await Promise.all(
      role.SecondaryNavigationID.map((id) => SecondaryNavigation.findById(id))
    );
    const navigationData = [];

    for (const firstNav of firstLevelNavs) {
      navigationData.push({
        _id: firstNav._id,
        title: firstNav.title,
        icon: firstNav.icon,
        url: firstNav.url,
        subTitle: firstNav.subTitle,
        subText: firstNav.subText,
        children: secondaryNavs.map(
          (nav) => nav.firstLevelNavigationID === firstNav._id
        ),
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

// // 获取一级导航
// router.get("/navigation/first-level", async (req, res) => {
//   try {
//     const firstLevelNavs = await FirstLevelNavigation.find({});
//     res.json({
//       code: 200,
//       message: "获取一级导航成功",
//       data: firstLevelNavs,
//     });
//   } catch (error) {
//     console.error("获取一级导航失败:", error);
//     res.status(500).json({
//       code: 500,
//       message: "获取一级导航失败",
//       error: error.message,
//     });
//   }
// });

// // 获取二级导航
// router.get("/navigation/secondary/:firstLevelId?", async (req, res) => {
//   try {
//     const { firstLevelId } = req.params;
//     const query = firstLevelId ? { firstLevelNavigationID: firstLevelId } : {};

//     const secondaryNavs = await SecondaryNavigation.find(query);
//     res.json({
//       code: 200,
//       message: "获取二级导航成功",
//       data: secondaryNavs,
//     });
//   } catch (error) {
//     console.error("获取二级导航失败:", error);
//     res.status(500).json({
//       code: 500,
//       message: "获取二级导航失败",
//       error: error.message,
//     });
//   }
// });

module.exports = router;
