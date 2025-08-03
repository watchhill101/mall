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
        element: <Goods />, 
        hidden: false,
        icon: 'GoodsOutlined',    // 商品图标
        menuPath: '/goods'
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