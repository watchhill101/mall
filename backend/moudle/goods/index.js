// 商品模块所有模型的统一导出文件

const Product = require('./product');
const ProductCategory = require('./productCategory');
const ProductAudit = require('./productAudit');
const InventoryDetail = require('./inventoryDetail');
const InboundOrder = require('./inboundOrder');
const OutboundOrder = require('./outboundOrder');
const StocktakingOrder = require('./stocktakingOrder');
const ExternalProduct = require('./externalProduct');
const ProductRecycleBin = require('./productRecycleBin');

module.exports = {
  Product,
  ProductCategory,
  ProductAudit,
  InventoryDetail,
  InboundOrder,
  OutboundOrder,
  StocktakingOrder,
  ExternalProduct,
  ProductRecycleBin
};
