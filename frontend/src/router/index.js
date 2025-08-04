import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const Layout = lazy(() => import('@/Layout'))
const Home = lazy(() => import('@/pages/Home'))
const Shops = lazy(() => import('@/pages/Shops'))
const Goods = lazy(() => import('@/pages/Goods'))
const Orders = lazy(() => import('@/pages/Orders'))
const Users = lazy(() => import('@/pages/Users'))
const Login = lazy(() => import('@/pages/Login'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Merchants = lazy(() => import('@/pages/Merchant/Merchant'))
const MerchantAccount = lazy(() => import('@/pages/Merchant/MerchantAccount'))
const WithdrawAccount = lazy(() => import('@/pages/Merchant/WithdrawAccount'))
const AccountDetail = lazy(() => import('@/pages/Merchant/AccountDetail'))
const MerchantWithdraw = lazy(() => import('@/pages/Merchant/MerchantWithdraw'))
const SettlementOrder = lazy(() => import('@/pages/Merchant/SettlementOrder'))
const SettlementBill = lazy(() => import('@/pages/Merchant/SettlementBill'))
const MerchantApplication = lazy(() => import('@/pages/Merchant/MerchantApplication'))
const DeviceManagement = lazy(() => import('@/pages/Merchant/DeviceManagement'))

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