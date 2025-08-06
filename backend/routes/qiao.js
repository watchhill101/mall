var express = require('express');
var router = express.Router();
require('../moudle/index'); // 确保用户模型被加载
var { Product, ProductAudit, ProductRecycleBin, ProductCategory } = require('../moudle/goods');
var Merchant = require('../moudle/merchant/merchant');
/* GET home page. */
// router.get('/products', function (req, res, next) {
//     res.render('index', { title: 'Express' });
// });
// 获取商品列表

// 获取商品列表
router.get('/products', async function (req, res) {
    try {
        const products = await Product.find({}); // 获取全部商'
        res.json({ success: true, data: products });
    } catch (err) {

        console.log(err, '2')
    }

});
// 修改商品状态接口
router.put('/updateProductStatus', async (req, res) => {
    try {
        const { productId, status } = req.body;

        // 基本参数验证
        if (!productId || !status) {
            return res.status(400).json({ success: false, message: '商品ID和状态不能为空' });
        }

        // 验证状态值
        if (!["pending", "approved", "rejected", "onSale", "offSale", "deleted"].includes(status)) {
            return res.status(400).json({ success: false, message: '状态值只能是0、1或2' });
        }

        // 更新商品状态
        const result = await Product.findOneAndUpdate(
            { productId },
            { status },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: '未找到该商品' });
        } res.json({ success: true, message: '商品状态更新成功', data: result });
    } catch (error) {
        console.error('修改商品状态失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取审核列表数据
// 获取商品列表
router.get('/productAudit', async function (req, res) {
    try {
        // 关联查询 merchant、auditor 和 submitter 字段
        const productAudits = await ProductAudit.find({})
            .populate('merchant', 'name')  // 关联商家，只返回名称
            .populate('auditor', 'loginAccount')  // 关联审核人，只返回名称



        // 处理分类ID转名称
        // 提取所有分类ID
        const categoryIds = [...new Set(productAudits.map(item => item.productInfo.productCategory))];
        // 查询分类信息
        const categories = await ProductCategory.find({
            categoryId: { $in: categoryIds }
        }).select('categoryId categoryName');
        // 创建分类ID到名称的映射
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.categoryId] = category.categoryName;
        });

        // 替换分类ID为名称
        const result = productAudits.map(item => {
            const productInfo = { ...item.productInfo };
            if (productInfo.productCategory) {
                productInfo.productCategory = categoryMap[productInfo.productCategory] || productInfo.productCategory;
            }
            return {
                ...item._doc,
                productInfo
            };
        });

        console.log(result, '1');
        res.json({ success: true, data: result });
    } catch (err) {
        console.log(err, '2');
    }
});
// 加入回收站
router.post('/addProductRecycleBin', async function (req, res) {
    try {
        const {
            originalProduct,
            merchant,
            productSnapshot,
            deleteReason,
            deleteReasonDetail,
            deletedBy,
            autoDeleteAt
        } = req.body;
        console.log(req.body, 'req.body')
        // 创建回收站记录
        const recycleBinItem = new ProductRecycleBin({
            originalProduct,
            merchant,
            productSnapshot,
            deleteReason,
            deleteReasonDetail,
            deletedBy,
            autoDeleteAt
        });

        await recycleBinItem.save();
        // 将原商品标记为已删除
        await Product.findByIdAndUpdate(originalProduct, { status: 'deleted' });

        res.send({ success: true, message: '商品已成功加入回收站' });
    } catch (error) {
        res.send(error)

    }
})
// 获取回收站数据
router.get('/getProductRecycleBin', async function (req, res) {
    try {
        const productRecycleBins = await ProductRecycleBin.find({}); // 获取全部商
        res.send({
            success: 200,
            data: productRecycleBins
        })
    } catch (err) {
        console.log(err, '2')
        res.send(err)
    }

});
// 新增商品审核记录
router.post('/addProductAudit', async function (req, res) {
    try {
        // console.log(req.body, 'req.body')
        const newProduct = new ProductAudit(req.body);
        await newProduct.save();
        res.send({
            success: 200,
            data: newProduct
        })
    } catch (err) {
        console.log(err, '1')
        res.send(err)
    }
});
// 从回收站中恢复商品
router.post('/restoreProductFromRecycleBin', async function (req, res) {
    try {
        // 1. 获取请求参数
        const { productId, restoredBy } = req.body;
        console.log(req.body, '恢复请求参数')

        // 2. 参数验证
        if (!productId) {
            return res.status(400).json({ success: false, message: '回收站原商品ID不能为空' });
        }

        // 3. 查找回收站记录
        const recycleItem = await ProductRecycleBin.findOne({ originalProduct: productId });
        if (!recycleItem) {
            return res.status(404).json({ success: false, message: '未找到该回收站记录' });
        }

        // 4. 获取原商品ID
        const originalProductId = recycleItem.originalProduct;
        if (!originalProductId) {
            return res.status(400).json({ success: false, message: '无法获取原商品ID' });
        }

        // 5. 恢复原商品
        const restoredProduct = await Product.findByIdAndUpdate(
            originalProductId,
            { status: 'pending' }, // 恢复后设为待审核状态
            { new: true }
        );

        if (!restoredProduct) {
            return res.status(404).json({ success: false, message: '未找到原商品' });
        }

        // 6. 删除回收站记录
        await ProductRecycleBin.findByIdAndDelete(recycleItem._id);

        // 7. 返回成功响应
        res.json({
            success: true,
            message: '商品恢复成功并已从回收站移除',
            data: {
                productId: restoredProduct._id,
                productName: restoredProduct.productName
            }
        });
    } catch (error) {
        console.error('恢复商品失败:', error);
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    }
});
// 更新审核状态接口
router.put('/updateAuditStatus', async (req, res) => {
    try {
        const {
            auditId,
            auditStatus,
            auditComments,
            auditTime,
            auditor
        } = req.body;

        // 基本参数验证
        if (!auditId || !auditStatus) {
            return res.status(400).json({ success: false, message: '审核ID和审核结果不能为空' });
        }

        // 验证状态值
        if (!['approved', 'rejected'].includes(auditStatus)) {
            return res.status(400).json({ success: false, message: '审核结果只能是通过或拒绝' });
        }

        // 更新审核记录
        const result = await ProductAudit.findOneAndUpdate(
            { auditId },
            {
                auditStatus,
                auditComments,
                auditTime,
                auditor
            },
            { new: true }
        ).populate('merchant', 'name')
            .populate('auditor', 'loginAccount')
            .populate('submitter', 'loginAccount');

        if (!result) {
            return res.status(404).json({ success: false, message: '未找到该审核记录' });
        }

        // 如果审核通过，更新商品状态
        if (auditStatus === 'approved' && result.product) {
            await Product.findByIdAndUpdate(
                result.product,
                { status: 'onSale' }, // 假设通过后状态为上架
                { new: true }
            );
        }

        res.json({ success: true, message: '审核更新成功', data: result });
    } catch (error) {
        console.error('更新审核状态失败:', error);
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    }
});


router.get('/searchProducts', async function (req, res) {
    try {
        const { name, category, status, inStock, page = 1, pageSize = 10 } = req.query;

        const query = {};

        // 商品名称模糊匹配
        if (name) {
            query.productName = { $regex: name, $options: 'i' };
        }

        // 分类精确匹配（后端字段是字符串，如 "A01"）
        if (category) {
            query.productCategory = category;
        }

        // 状态精确匹配
        if (status) {
            query.status = status;
        }

        // 是否有库存：判断 inventory.currentStock 字段
        if (inStock === '1') {
            query['inventory.currentStock'] = { $gt: 0 };
        } else if (inStock === '0') {
            query['inventory.currentStock'] = { $lte: 0 };
        }

        const skip = (page - 1) * pageSize;

        const products = await Product.find(query)
            .skip(skip)
            .limit(Number(pageSize));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: Number(page),
                pageSize: Number(pageSize),
                totalPages: Math.ceil(total / pageSize),
            },
            message: '搜索成功',
        });
    } catch (error) {
        console.error('搜索商品失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message,
        });
    }
});
// 编辑商品列表
router.put('/updateProductInfo', async (req, res) => {
    try {
        const { productId, ...updateData } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: '商品ID不能为空'
            });
        }

        // 查找商品
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '未找到该商品'
            });
        }

        // 更新商品信息
        const updatedProduct = await Product.findOneAndUpdate(
            { productId },
            { $set: { ...updateData, updatedAt: new Date() } },
            { new: true }
        );

        res.json({
            success: true,
            data: updatedProduct,
            message: '商品信息更新成功'
        });
    } catch (error) {
        console.error('更新商品信息失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});
// 创建新商品API
router.post('/createProduct', async (req, res) => {
    try {
        const { productInfo, merchant, businessType, pricing, inventory, createBy } = req.body;

        // 基本参数验证
        // if (!productInfo || !productInfo.productName || !merchant || !businessType || !createBy) {
        //     return res.status(400).json({ success: false, message: '必要参数缺失' });
        // }

        // 生成商品ID（可以根据实际需求调整生成规则）
        const productId = 'PROD' + Date.now() + Math.floor(Math.random() * 1000);

        // 创建新商品
        const newProduct = new Product({
            productId,
            productName: productInfo.productName,
            productCategory: productInfo.productCategory,
            businessType,
            merchant,
            productInfo,
            pricing: pricing || {},
            inventory: inventory || { currentStock: 0, totalStock: 0, reservedStock: 0 },
            status: 'onSale', // 默认为上架状态
            createBy
        });

        await newProduct.save();
        res.json({ success: true, message: '商品创建成功', data: newProduct });
    } catch (error) {
        console.error('创建商品失败:', error);
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    }
});
// 从回收站中永久删除商品
router.delete('/deleteProductFromRecycleBin/:id', async function (req, res) {
    try {
        // 1. 获取请求参数
        const { id } = req.params;

        // 2. 参数验证
        if (!id) {
            return res.status(400).json({ success: false, message: '回收站记录ID不能为空' });
        }

        // 3. 查找并删除回收站记录
        const deletedItem = await ProductRecycleBin.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: '未找到该回收站记录' });
        }

        // 4. 返回成功响应
        res.json({
            success: true,
            message: '商品已从回收站永久删除',
            data: {
                productId: deletedItem.originalProduct,
                productName: deletedItem.productSnapshot?.productName
            }
        });
    } catch (error) {
        console.error('删除回收站商品失败:', error);
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    }
});

module.exports = router;
// 获取商品分类数据
router.get('/productCategories', async function (req, res) {
    try {
        // 获取查询参数
        const {
            businessType,
            categoryLevel,
            status,
            parentCategory,
            name,
            page = 1,
            pageSize = 10
        } = req.query;

        // 构建查询条件
        const query = {};

        // 业务类型过滤
        if (businessType) {
            query.businessType = businessType;
        }

        // 分类级别过滤
        if (categoryLevel) {
            query.categoryLevel = Number(categoryLevel);
        }

        // 状态过滤
        if (status) {
            query.status = status;
        }

        // 父分类过滤
        if (parentCategory) {
            query.parentCategory = parentCategory;
        } else if (parentCategory === 'null') {
            // 支持查询一级分类（无父分类）
            query.parentCategory = null;
        }

        // 分类名称模糊搜索
        if (name) {
            query.categoryName = { $regex: name, $options: 'i' };
        }

        // 计算分页参数
        const skip = (Number(page) - 1) * Number(pageSize);

        // 查询分类数据
        const categories = await ProductCategory.find(query)
            .skip(skip)
            .limit(Number(pageSize))
            .sort({ sortOrder: 1, createdAt: -1 }); // 按排序号和创建时间排序

        // 查询总数
        const total = await ProductCategory.countDocuments(query);

        // 对于二级分类，可能需要补充一级分类名称
        if (categories.length > 0) {
            // 提取所有一级分类ID
            const level1Ids = [...new Set(categories
                .filter(cat => cat.categoryLevel === 2 && cat.categoryLevel1)
                .map(cat => cat.categoryLevel1))];

            if (level1Ids.length > 0) {
                // 查询一级分类信息
                const level1Categories = await ProductCategory.find({
                    categoryId: { $in: level1Ids }
                }).select('categoryId categoryName');

                // 创建一级分类ID到名称的映射
                const level1Map = {};
                level1Categories.forEach(cat => {
                    level1Map[cat.categoryId] = cat.categoryName;
                });

                // 补充一级分类名称
                categories.forEach(cat => {
                    if (cat.categoryLevel === 2 && cat.categoryLevel1) {
                        cat.level1CategoryName = level1Map[cat.categoryLevel1] || cat.categoryLevel1;
                    }
                });
            }
        }

        // 返回成功响应
        res.json({
            success: true,
            data: categories,
            pagination: {
                total,
                page: Number(page),
                pageSize: Number(pageSize),
                totalPages: Math.ceil(total / Number(pageSize))
            },
            message: '获取分类数据成功'
        });
    } catch (error) {
        console.error('获取商品分类数据失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
})

// 增加商品分类接口
router.post('/productCategories', async function (req, res) {
    try {
        // 获取请求参数
        const {
            categoryName,
            businessType,
            parentCategory = null,
            sortOrder = 0,
            status = 'active',
            categoryImages = {}
        } = req.body;

        // 基本参数验证
        if (!categoryName || !businessType) {
            return res.status(400).json({
                success: false,
                message: '分类名称和业务类型不能为空'
            });
        }

        // 验证业务类型
        const validBusinessTypes = ['retail', 'wholesale', 'manufacturer', 'distributor'];
        if (!validBusinessTypes.includes(businessType)) {
            return res.status(400).json({
                success: false,
                message: '业务类型只能是retail、wholesale、manufacturer或distributor'
            });
        }

        // 验证状态
        const validStatuses = ['active', 'inactive', 'deleted'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: '状态只能是active、inactive或deleted'
            });
        }

        // 确定分类级别和一级分类
        let categoryLevel = 1;
        let categoryLevel1 = null;

        if (parentCategory) {
            // 查找父分类
            const parentCat = await ProductCategory.findOne({
                categoryId: parentCategory
            });

            if (!parentCat) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的父分类'
                });
            }

            // 设置分类级别
            categoryLevel = parentCat.categoryLevel + 1;

            // 确保分类级别不超过2级
            if (categoryLevel > 2) {
                return res.status(400).json({
                    success: false,
                    message: '分类级别不能超过2级'
                });
            }

            // 设置一级分类
            categoryLevel1 = parentCat.categoryLevel === 1 ? parentCat.categoryId : parentCat.categoryLevel1;
        }

        // 生成分类ID
        const categoryId = 'CAT' + Date.now() + Math.floor(Math.random() * 1000);

        // 创建新分类
        const newCategory = new ProductCategory({
            categoryId,
            categoryName,
            businessType,
            categoryLevel,
            parentCategory: parentCategory || null,
            categoryLevel1,
            sortOrder,
            status,
            categoryImages,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newCategory.save();

        // 返回成功响应
        res.json({
            success: true,
            message: '商品分类创建成功',
            data: newCategory
        });
    } catch (error) {
        console.error('创建商品分类失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
});

module.exports = router;