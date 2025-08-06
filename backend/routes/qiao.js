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
        const products = await Product.find({}); // 获取全部商
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
// 分页版本
router.get('/searchProducts', async function (req, res) {
    try {
        const { name, category, status, page = 1, pageSize = 10 } = req.query;
        const query = {};
        // ... 构建查询条件（同上）

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
                totalPages: Math.ceil(total / pageSize)
            },
            message: '搜索成功'
        });
    } catch (error) {
        // ... 错误处理（同上）
    }
});
module.exports = router;
