const express = require("express");
const router = express.Router();

// 导入模型
const User = require("../moudle/user/user");

// 用户管理相关接口
// 获取用户列表
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      code: 200,
      message: "获取用户列表成功",
      data: users,
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

// 创建新用户
router.post("/users", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({
        code: 400,
        message: "用户名、密码和邮箱是必填项",
      });
    }

    const newUser = new User({ username, password, email });
    await newUser.save();

    res.json({
      code: 201,
      message: "用户创建成功",
      data: newUser,
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

//修改用户权限
router.put("/users/:id/permissions", async (req, res) => {
  try {
    const userId = req.params.id;
    const { permissions } = req.body; // 假设前端传递的权限数据在请求体中

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        code: 400,
        message: "权限数据格式不正确",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { FirstLevelNavigationID: permissions },
      { new: true }
    );

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
// 删除用户
router.delete("/users/:id", async (req, res) => {
  try {
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
