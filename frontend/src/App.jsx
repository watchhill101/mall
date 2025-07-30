import React, { Suspense, useEffect } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUserInfoAsync } from './store/reducers/userSlice'
import { getToken } from './utils/auth'
import Loading from '@/components/Loadings'
import constantRoutes from './router'

export default function App() {
  const permissionRoutes = useSelector((state) => state.permission.permissionRoutes)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // 动态路由
  const dynamicRoutes = useRoutes([...constantRoutes, ...permissionRoutes])

  useEffect(() => {
    // 检查是否禁用认证验证（开发环境配置）
    const disableAuth = process.env.REACT_APP_DISABLE_AUTH === 'true'
    
    if (disableAuth) {
      console.log('🔓 Token 验证已禁用 (开发模式)')
      return
    }
    
    // 正常的路由守卫逻辑
    if (getToken()) {
      // 有token，如果在登录页则跳转到首页
      if (location.pathname === '/login') {
        navigate('/')
      }
      // 可选：获取用户信息
      dispatch(getUserInfoAsync()).catch(() => {
        console.log('获取用户信息失败，但不影响访问')
      })
    } else {
      // 没有token，如果不在登录页则跳转到登录页
      if (location.pathname !== '/login') {
        navigate('/login')
      }
    }
  }, [dispatch, navigate, location.pathname])

  return <Suspense fallback={<Loading />}>{dynamicRoutes}</Suspense>
}
