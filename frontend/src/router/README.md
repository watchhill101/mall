# 路由配置

## 文件说明
- `index.js` - 主路由配置文件

## 路由结构
```javascript
const routes = [
  {
    path: '/login',
    element: <Login />,
    title: '登录'
  },
  {
    path: '/',
    element: <Layout />,
    title: '首页',
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <Home />,
        title: '首页'
      }
      // 其他业务路由
    ]
  }
]
```

## 特性支持

### 路由懒加载
使用 React.lazy 进行代码分割：
```javascript
const Home = lazy(() => import('@/pages/Home'))
```

### 嵌套路由
支持多级路由嵌套：
```javascript
{
  path: '/system',
  element: <SystemLayout />,
  children: [
    {
      path: 'user',
      element: <UserPage />
    }
  ]
}
```

### 路由守卫
在 App.jsx 中实现路由守卫：
- 登录状态检查
- 权限验证
- 自动跳转

### 动态路由
支持基于权限的动态路由生成：
- 根据用户权限显示菜单
- 动态加载路由组件
- 权限控制访问

## 开发指南

### 新增路由
1. 在 pages 目录创建页面组件
2. 在 router/index.js 添加路由配置
3. 配置正确的路径和标题
4. 如需权限控制，配置相应权限

### 路由参数
```javascript
// 动态路由
{ path: '/user/:id', element: <UserDetail /> }

// 查询参数
const [searchParams] = useSearchParams()
const id = searchParams.get('id')
```

### 路由跳转
```javascript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// 编程式导航
navigate('/home')
navigate('/user', { state: { id: 1 } })
navigate(-1) // 返回上一页
```

## 路由最佳实践
1. 使用语义化的路由路径
2. 保持路由结构清晰
3. 合理使用路由懒加载
4. 处理路由错误和 404 情况
5. 考虑 SEO 和浏览器兼容性
