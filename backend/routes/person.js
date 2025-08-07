const express = require("express");
const router = express.Router();
const PersonInCharge = require("../moudle/person/personInCharge");

// 获取负责人列表
router.get("/list", async (req, res) => {
  try {
    const { page = 1, pageSize = 100 } = req.query;

    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const persons = await PersonInCharge.find({ status: "active" })
      .select("_id name phone email position department level")
      .populate("account", "loginAccount userNickname")
      .sort({ level: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PersonInCharge.countDocuments({ status: "active" });

    res.json({
      code: 200,
      message: "获取负责人列表成功",
      data: persons,
      pagination: {
        current: parseInt(page),
        pageSize: limit,
        total: total
      }
    });
  } catch (error) {
    console.error("获取负责人列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取负责人列表失败",
      data: null
    });
  }
});

// 获取单个负责人详情
router.get("/:id", async (req, res) => {
  try {
    const person = await PersonInCharge.findById(req.params.id)
      .populate("account", "loginAccount userNickname contactPhone");

    if (!person) {
      return res.status(404).json({
        code: 404,
        message: "负责人不存在",
        data: null
      });
    }

    res.json({
      code: 200,
      message: "获取负责人详情成功",
      data: person
    });
  } catch (error) {
    console.error("获取负责人详情失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取负责人详情失败",
      data: null
    });
  }
});

// 创建负责人
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, position, department, level } = req.body;

    // 校验必填字段
    if (!name || !phone || !email || !position) {
      return res.status(400).json({
        code: 400,
        message: "姓名、电话、邮箱、职位为必填字段",
        data: null
      });
    }

    // 检查电话是否已存在
    const existingPhone = await PersonInCharge.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        code: 400,
        message: "电话号码已存在",
        data: null
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await PersonInCharge.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        code: 400,
        message: "邮箱地址已存在",
        data: null
      });
    }

    const person = new PersonInCharge({
      name,
      phone,
      email,
      position,
      department: department || "",
      level: level || "staff",
      status: "active"
    });

    await person.save();

    res.json({
      code: 200,
      message: "创建负责人成功",
      data: person
    });
  } catch (error) {
    console.error("创建负责人失败:", error);
    res.status(500).json({
      code: 500,
      message: "创建负责人失败",
      data: null
    });
  }
});

// 更新负责人
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email, position, department, level, status } = req.body;
    const personId = req.params.id;

    // 检查负责人是否存在
    const existingPerson = await PersonInCharge.findById(personId);
    if (!existingPerson) {
      return res.status(404).json({
        code: 404,
        message: "负责人不存在",
        data: null
      });
    }

    // 如果电话号码有变化，检查新号码是否已被其他人使用
    if (phone && phone !== existingPerson.phone) {
      const phoneExists = await PersonInCharge.findOne({
        phone,
        _id: { $ne: personId }
      });
      if (phoneExists) {
        return res.status(400).json({
          code: 400,
          message: "电话号码已存在",
          data: null
        });
      }
    }

    // 如果邮箱有变化，检查新邮箱是否已被其他人使用
    if (email && email !== existingPerson.email) {
      const emailExists = await PersonInCharge.findOne({
        email,
        _id: { $ne: personId }
      });
      if (emailExists) {
        return res.status(400).json({
          code: 400,
          message: "邮箱地址已存在",
          data: null
        });
      }
    }

    // 更新字段
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (position) updateData.position = position;
    if (department !== undefined) updateData.department = department;
    if (level) updateData.level = level;
    if (status) updateData.status = status;

    const updatedPerson = await PersonInCharge.findByIdAndUpdate(
      personId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      code: 200,
      message: "更新负责人成功",
      data: updatedPerson
    });
  } catch (error) {
    console.error("更新负责人失败:", error);
    res.status(500).json({
      code: 500,
      message: "更新负责人失败",
      data: null
    });
  }
});

module.exports = router; 