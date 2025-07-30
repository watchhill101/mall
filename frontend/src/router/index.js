import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// 路由懒加载
const Layout = lazy(() => import('@/Layout'))
const Home = lazy(() => import('@/pages/Home'))
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
      { path: 'home', title: '首页', element: <Home />, hidden: false }
    ]
  },
  { path: '*', title: '404页面', element: <NotFound /> }
]

export default constantRoutes
