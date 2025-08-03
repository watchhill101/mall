import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const Layout = lazy(() => import('@/Layout'))
const Home = lazy(() => import('@/pages/Home'))
const Shops = lazy(() => import('@/pages/Shops'))
const Goods = lazy(() => import('@/pages/Goods'))
const ListOfCommodities = lazy(() => import('@/pages/Goods_S/ListOfCommodities'));
const ClassificationOfCommodities = lazy(() => import('@/pages/Goods_S/Classification of Commodities'));
const Inventory = lazy(() => import('@/pages/Goods_S/inventory'))
const Price = lazy(() => import("@/pages/Goods_S/price"))
const Orders = lazy(() => import('@/pages/Orders'))
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
        menuPath: '/orders'
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