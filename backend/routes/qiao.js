var express = require('express');
var router = express.Router();
require('../moudle/index'); // 确保用户模型被加载
var { Product } = require('../moudle/goods');
/* GET home page. */
// router.get('/products', function (req, res, next) {
//     res.render('index', { title: 'Express' });
// });
// 获取商品列表


router.get('/products', async function (req, res, next) {

    const products = await Product.find({});





});


module.exports = router;
