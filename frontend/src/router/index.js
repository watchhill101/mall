import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const Layout = lazy(() => import('@/Layout'))
const Home = lazy(() => import('@/pages/Home_X'))
const Shops = lazy(() => import('@/pages/Shops'))
const Goods = lazy(() => import('@/pages/Goods'))
const Orders = lazy(() => import('@/pages/Orders'))
const Users = lazy(() => import('@/pages/Users'))
const Login = lazy(() => import('@/pages/Login'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// 商家相关页面
const Merchants = lazy(() => import('@/pages/Merchant/Merchant'))
const MerchantAccount = lazy(() => import('@/pages/Merchant/MerchantAccount'))
const WithdrawAccount = lazy(() => import('@/pages/Merchant/WithdrawAccount'))
const AccountDetail = lazy(() => import('@/pages/Merchant/AccountDetail'))
const MerchantWithdraw = lazy(() => import('@/pages/Merchant/MerchantWithdraw'))
const SettlementOrder = lazy(() => import('@/pages/Merchant/SettlementOrder'))
const SettlementBill = lazy(() => import('@/pages/Merchant/SettlementBill'))
const MerchantApplication = lazy(() => import('@/pages/Merchant/MerchantApplication'))
const DeviceManagement = lazy(() => import('@/pages/Merchant/DeviceManagement'))

// 商品相关页面
const ListOfCommodities = lazy(() => import('@/pages/Goods_S/ListOfCommodities'))

const AuditList = lazy(() => import('@/pages/Goods_S/ListOfCommodities')) // 暂时使用商品列表组件
const RecycleBin = lazy(() => import('@/pages/Goods_S/Trash/Trash')) // 回收站
const ProductCategory = lazy(() => import('@/pages/Goods_S/Classification of Commodities/index'))
const ExternalProduct = lazy(() => import('@/pages/Goods_S/ListOfCommodities')) // 暂时使用商品列表组件

// 库存相关页面
const CurrentStock = lazy(() => import('@/pages/Goods_S/inventory/CurrentInventory/CurrentInventory'))
const StockIn = lazy(() => import('@/pages/Goods_S/inventory/enterTheWarehouse/enterTheWarehouse'))
const StockOut = lazy(() => import('@/pages/Goods_S/inventory/exWarehouse/exWarehouse'))
const Stocktake = lazy(() => import('@/pages/Goods_S/inventory/stocktaking/stocktaking'))
const StockDetails = lazy(() => import('@/pages/Goods_S/inventory/DetailsOfStockInAndstockOut/DetailsOfStockInAndstockOut'))
// 订单相关页面
const OrdersList = lazy(() => import('@/pages/order_S/Orders'))
const AfterSales = lazy(() => import('@/pages/order_S/afterSales'))
const TallySheet = lazy(() => import('@/pages/order_S/tallySheet'))
const SortingList = lazy(() => import('@/pages/order_S/sortingList'))
const constantRoutes = [
  { path: '/login', title: '登录', element: <Login /> },
  {
    path: '/',
    title: '首页',
    hidden: true,
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to={'/home'} replace /> },
      {
        path: 'home',
        title: '首页',
        element: <Home />,
        hidden: false,
        icon: 'HomeOutlined',    // 确认图标名称正确
        menuPath: '/home'
      },
      {
        path: 'shops',
        title: '商家',
        element: <Shops />,
        hidden: false,
        icon: 'ShopOutlined',    // 使用存在的图标
        menuPath: '/shops',
        children: [
          { index: true, element: <Navigate to={'/shops/merchants'} replace /> },
          {
            path: 'merchants',
            title: '商家管理',
            element: <Merchants />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/merchants'
          },
          {
            path: 'merchant-account',
            title: '商家账号',
            element: <MerchantAccount />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/merchant-account'
          },
          {
            path: 'withdraw-account',
            title: '提现账号',
            element: <WithdrawAccount />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/withdraw-account'
          },
          {
            path: 'account-detail',
            title: '账户明细',
            element: <AccountDetail />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/account-detail'
          },
          {
            path: 'merchant-withdraw',
            title: '商家提现',
            element: <MerchantWithdraw />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/merchant-withdraw'
          },
          {
            path: 'settlement-order',
            title: '结算订单',
            element: <SettlementOrder />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/settlement-order'
          },
          {
            path: 'settlement-bill',
            title: '结账单',
            element: <SettlementBill />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/settlement-bill'
          },
          {
            path: 'merchant-application',
            title: '商家申请',
            element: <MerchantApplication />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/merchant-application'
          },
          {
            path: 'device-management',
            title: '设备管理',
            element: <DeviceManagement />,
            hidden: false,
            icon: 'component',
            menuPath: '/shops/device-management'
          }
        ]
      },
      {
        path: 'goods',
        title: '商品',
        element: <Goods />,
        hidden: false,
        icon: 'GoodsOutlined',    // 商品图标
        menuPath: '/goods',
        children: [
          { index: true, element: <Navigate to={'/goods/product-list'} replace /> },
          {
            path: 'product-list',
            title: '商品列表',
            element: <ListOfCommodities />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/product-list'
          },
          {
            path: 'audit-list',
            title: '审核列表',
            element: <AuditList />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/audit-list'
          },
          {
            path: 'recycle-bin',
            title: '回收站',
            element: <RecycleBin />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/recycle-bin'
          },
          {
            path: 'product-category',
            title: '商品分类',
            element: <ProductCategory />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/product-category'
          },
          {
            path: 'external-product',
            title: '外部商品库',
            element: <ExternalProduct />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/external-product'
          },
          {
            path: 'inventory/current-stock',
            title: '当前库存',
            element: <CurrentStock />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/inventory/current-stock'
          },
          {
            path: 'inventory/stock-in',
            title: '入库',
            element: <StockIn />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/inventory/stock-in'
          },
          {
            path: 'inventory/stock-out',
            title: '出库',
            element: <StockOut />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/inventory/stock-out'
          },
          {
            path: 'inventory/stocktake',
            title: '盘点',
            element: <Stocktake />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/inventory/stocktake'
          },
          {
            path: 'inventory/stock-details',
            title: '出入库明细',
            element: <StockDetails />,
            hidden: false,
            icon: 'component',
            menuPath: '/goods/inventory/stock-details'
          }
        ]
      },
      {
        path: 'orders',
        title: '订单',
        element: <Orders />,
        hidden: false,
        icon: 'OrdersOutlined',    // 订单图标
        menuPath: '/orders',
        children: [
          {
            path: 'orders-list',
            title: '订单',
            element: <OrdersList />,
            hidden: false,
            icon: 'component',
            menuPath: '/orders/orders-list'
          },
          {
            path: 'afterSales',
            title: '售后',
            element: <AfterSales />,
            hidden: false,
            icon: 'component',
            menuPath: '/orders/afterSales'
          },
          {
            path: 'tallySheet',
            title: '理货单',
            element: <TallySheet />,
            hidden: false,
            icon: 'component',
            menuPath: '/orders/tallySheet'
          },
          {
            path: 'SortingList',
            title: '分拣单',
            element: <SortingList />,
            hidden: false,
            icon: 'component',
            menuPath: '/orders/SortingList '
          }
        ]
      },
      {
        path: 'users',
        title: '用户',
        element: <Users />,
        hidden: false,
        icon: 'UsersOutlined',    // 用户图标
        menuPath: '/users'
      }
    ]
  },
  { path: '*', title: '404页面', element: <NotFound /> }
]

export default constantRoutes