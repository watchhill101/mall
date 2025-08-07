import React, { Suspense, useEffect } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUserInfoAsync } from './store/reducers/userSlice'
import { getToken, getRefreshToken } from './utils/auth'
import Loading from '@/components/Loadings'
import constantRoutes from './router'

export default function App() {
  const permissionRoutes = useSelector((state) => state.permission.permissionRoutes)
  const token = useSelector((state) => state.user.token) // 从Redux获取token状态
  const userinfo = useSelector((state) => state.user.userinfo) // 获取用户信息
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
      // 在禁用认证的情况下，如果是根路径，重定向到首页
      if (location.pathname === '/') {
        navigate('/home')
      }
      return
    }
    
    // 正常的路由守卫逻辑
    // 同时检查localStorage和Redux中的token状态
    const localToken = getToken()
    const hasValidToken = token && localToken
    
    console.log('🔐 Token检查:', { 
      reduxToken: !!token, 
      localToken: !!localToken, 
      hasValidToken,
      currentPath: location.pathname 
    })
    
    if (hasValidToken) {
      // 有token，如果在登录页则跳转到首页
      if (location.pathname === '/login') {
        console.log('📍 有token且在登录页，跳转到首页')
        navigate('/home')
      }
      // 如果在根路径，重定向到首页
      else if (location.pathname === '/') {
        console.log('📍 有token且在根路径，跳转到首页')
        navigate('/home')
      }
      // 可选：获取用户信息
      // 如果有token但没有用户信息，或者用户信息不完整，则获取用户信息
      if (!userinfo._id || !userinfo.username) {
        console.log('🔄 获取用户信息...')
        dispatch(getUserInfoAsync()).catch((error) => {
          console.log('获取用户信息失败:', error)
        })
      }
    } else {
      // 没有token，如果不在登录页则跳转到登录页
      if (location.pathname !== '/login') {
        console.log('📍 无token且不在登录页，跳转到登录页')
        navigate('/login')
      }
    }
  }, [dispatch, navigate, location.pathname, token, userinfo._id, userinfo.username])

  // 监听localStorage变化（跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ACCESS-TOKEN') {
        console.log('🔄 检测到localStorage中token变化:', e.newValue)
        // 如果token被删除，清除Redux状态并跳转登录页
        if (!e.newValue && token) {
          console.log('🚪 Token被删除，执行登出')
          dispatch({ type: 'user/logout' })
        }
        // 如果token被添加，恢复Redux状态
        else if (e.newValue && !token) {
          console.log('🔄 Token被添加，恢复登录状态')
          const refreshToken = getRefreshToken()
          if (refreshToken) {
            dispatch({ type: 'user/login', payload: { token: e.newValue, refreshToken } })
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [token, dispatch])

  return <Suspense fallback={<Loading />}>{dynamicRoutes}</Suspense>
}
