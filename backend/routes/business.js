const express = require('express');
const router = express.Router();

// 导入模型
const Product = require('../moudle/goods/product');
const ProductCategory = require('../moudle/goods/productCategory');
const Merchant = require('../moudle/merchant/merchant');
const Order = require('../moudle/goodsOrder/order');
const AfterSales = require('../moudle/goodsOrder/afterSales');

// 获取商品列表
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const products = await Product.find(query)
      .populate('productCategory', 'categoryName')
      .populate('merchant', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      code: 200,
      message: '获取商品列表成功',
      data: {
        products,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败',
      error: error.message
    });
  }
});

// 获取商家列表
router.get('/merchants', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const merchants = await Merchant.find(query)
      .populate('personInCharge', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Merchant.countDocuments(query);

    res.json({
      code: 200,
      message: '获取商家列表成功',
      data: {
        merchants,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取商家列表失败',
      error: error.message
    });
  }
});

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .populate('merchant', 'name')
      .populate('products.product', 'productName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      code: 200,
      message: '获取订单列表成功',
      data: {
        orders,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败',
      error: error.message
    });
  }
});

// 获取售后列表
router.get('/after-sales', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};

    const afterSales = await AfterSales.find(query)
      .populate('order', 'orderId')
      .populate('merchant', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AfterSales.countDocuments(query);

    res.json({
      code: 200,
      message: '获取售后列表成功',
      data: {
        afterSales,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取售后列表失败',
      error: error.message
    });
  }
});

// 获取商品分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = await ProductCategory.find({})
      .populate('createBy', 'name')
      .sort({ sortOrder: 1 });

    res.json({
      code: 200,
      message: '获取商品分类成功',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取商品分类失败',
      error: error.message
    });
  }
});

// 获取数据统计
router.get('/statistics', async (req, res) => {
  try {
    const [
      totalProducts,
      totalMerchants,
      totalOrders,
      totalAfterSales,
      totalCategories,
      onSaleProducts,
      activeMerchants,
      pendingOrders
    ] = await Promise.all([
      Product.countDocuments(),
      Merchant.countDocuments(),
      Order.countDocuments(),
      AfterSales.countDocuments(),
      ProductCategory.countDocuments(),
      Product.countDocuments({ status: 'onSale' }),
      Merchant.countDocuments({ status: 'active' }),
      Order.countDocuments({ orderStatus: 'pending' })
    ]);

    res.json({
      code: 200,
      message: '获取统计数据成功',
      data: {
        products: {
          total: totalProducts,
          onSale: onSaleProducts,
          offSale: totalProducts - onSaleProducts
        },
        merchants: {
          total: totalMerchants,
          active: activeMerchants,
          inactive: totalMerchants - activeMerchants
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          others: totalOrders - pendingOrders
        },
        afterSales: {
          total: totalAfterSales
        },
        categories: {
          total: totalCategories
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

module.exports = router;
