var express = require('express');
var router = express.Router();
require('../moudle/index'); // 确保用户模型被加载

/* GET home page. */
router.get('/products', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
