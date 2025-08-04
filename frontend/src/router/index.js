import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const Layout = lazy(() => import('@/Layout'))
const Home = lazy(() => import('@/pages/Home'))
const Shops = lazy(() => import('@/pages/Shops'))
const Goods = lazy(() => import('@/pages/Goods'))
const ListOfCommodities = lazy(() => import('@/pages/Goods_S/ListOfCommodities'));
const ClassificationOfCommodities = lazy(() => import('@/pages/Goods_S/Classification of Commodities'));
const Inventory = lazy(() => import('@/pages/Goods_S/inventory'))
const CurrentInventory = lazy(() => import('@/pages/Goods_S/inventory/CurrentInventory/CurrentInventory'))
const EnterTheWarehouse = lazy(() => import("@/pages/Goods_S/inventory/enterTheWarehouse/enterTheWarehouse"))
const ExWarehouse = lazy(() => import("@/pages/Goods_S/inventory/exWarehouse/exWarehouse"))
const Stocktaking = lazy(() => import("@/pages/Goods_S/inventory/stocktaking/stocktaking"))
const DetailsOfStockInAndstockOut = lazy(() => import("@/pages/Goods_S/inventory/DetailsOfStockInAndstockOut/DetailsOfStockInAndstockOut"))
const Price = lazy(() => import("@/pages/Goods_S/price"))
const Orders = lazy(() => import('@/pages/Orders'))
const OrdersS = lazy(() => import('@/pages/order_S/Orders'))
const AfterSales = lazy(() => import('@/pages/order_S/afterSales'))
const TallySheet = lazy(() => import('@/pages/order_S/tallySheet'))
const SortingList = lazy(() => import('@/pages/order_S/sortingList'))
const Users = lazy(() => import('@/pages/Users'))
const Login = lazy(() => import('@/pages/Login'))
const NotFound = lazy(() => import('@/pages/NotFound'))

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
        menuPath: '/shops'
      },
      {
        path: 'goods',
        title: '商品',
        element: <Goods></Goods>,
        hidden: false,
        icon: 'GoodsOutlined',    // 商品图标
        menuPath: '/goods',
        children: [
          { index: true, element: <Navigate to={'/goods/ListOfCommodities'} replace /> },
          {
            path: "/goods/ListOfCommodities",
            title: "商品列表",
            element: <ListOfCommodities />,
          },
          {
            path: "/goods/ClassificationOfCommodities",
            title: "商品分类",
            element: <ClassificationOfCommodities />,
          },
          {
            path: "/goods/inventory",
            title: "库存管理",
            element: <Inventory />,
            children: [
              {
                path: "/goods/inventory/CurrentInventory",
                title: "当前库存",
                element: <CurrentInventory></CurrentInventory>
              },
              {
                path: "/goods/inventory/enterTheWarehouse",
                title: "入库",
                element: <EnterTheWarehouse></EnterTheWarehouse>
              },
              {
                path: "/goods/inventory/exWarehouse",
                title: "出库",
                element: <ExWarehouse></ExWarehouse>
              },
              {
                path: "/goods/inventory/Stocktaking",
                title: "盘点",
                element: <Stocktaking></Stocktaking>
              },
              {
                path: "/goods/inventory/DetailsOfStockInAndStockOut",
                title: "出入库明细",
                element: <DetailsOfStockInAndstockOut></DetailsOfStockInAndstockOut>
              },

            ]
          },
          {
            path: "/goods/price",
            title: "价格管理",
            element: <Price />,
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
          { index: true, element: <Navigate to={'/orders/list'} replace /> },
          {
            path: '/orders/list',
            title: '订单',
            element: <OrdersS />,
          },
          {
            path: "/orders/afterSales",
            title: "售后",
            element: <AfterSales />,
          },
          {
            path: "/orders/tallySheet",
            title: "理货单",
            element: <TallySheet />,
          },
          {
            path: "/orders/sortingList",
            title: "分拣单",
            element: <SortingList />,
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