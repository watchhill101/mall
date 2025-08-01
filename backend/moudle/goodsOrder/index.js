// 订单模块所有模型的统一导出文件

const Order = require('./order');
const AfterSales = require('./afterSales');
const TallyOrder = require('./tallyOrder');
const SortingOrder = require('./sortingOrder');
const PaymentRecord = require('./paymentRecord');
const AllocationOrder = require('./allocationOrder');
const WorkOrder = require('./workOrder');
const LogisticsOrder = require('./logisticsOrder');

module.exports = {
  Order,
  AfterSales,
  TallyOrder,
  SortingOrder,
  PaymentRecord,
  AllocationOrder,
  WorkOrder,
  LogisticsOrder
};
