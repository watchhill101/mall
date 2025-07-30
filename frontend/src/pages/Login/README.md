# 登录页面开发指南

## 当前状态
登录页面已被清空，现在是一个简洁的模板页面，您可以在此基础上实现自己的登录功能。

## 可用的工具和方法

### 1. Redux Store 操作
```javascript
import { useDispatch } from 'react-redux'
import { loginAsync } from '@/store/reducers/userSlice'

const dispatch = useDispatch()

// 调用登录方法
await dispatch(loginAsync(loginData))
```

### 2. Token 存储工具
```javascript
import { setToken, getToken, removeToken } from '@/utils/auth'

// 存储 token
setToken('your-token-here')

// 获取 token
const token = getToken()

// 移除 token
removeToken()
```

### 3. 路由跳转
```javascript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// 登录成功后跳转
navigate('/home', { replace: true })
```

### 4. HTTP 请求
```javascript
import request from '@/utils/request'

// 发送登录请求
const response = await request({
  url: '/auth/login',
  method: 'POST',
  data: {
    username: 'admin',
    password: '123456'
  }
})
```

## 建议的登录流程

1. **用户输入账号密码**
2. **表单验证**
3. **发送登录请求**
4. **处理登录响应**
   - 成功：存储 token，更新 Redux 状态，跳转到首页
   - 失败：显示错误信息
5. **设置用户信息**（可选）

## 示例登录组件结构

```jsx
import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducers/userSlice'
import { setToken } from '@/utils/auth'
import request from '@/utils/request'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 发送登录请求
      const response = await request({
        url: '/auth/login',
        method: 'POST',
        data: values
      })
      
      // 存储 token
      setToken(response.data.token)
      
      // 更新 Redux 状态
      dispatch(login({
        token: response.data.token,
        refreshToken: response.data.refreshToken
      }))
      
      // 跳转到首页
      navigate('/home', { replace: true })
      
      message.success('登录成功')
    } catch (error) {
      message.error('登录失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card title="用户登录" className="login-card">
        <Form onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
```

## 注意事项

1. **环境变量配置**：确保 `.env.development` 中的 API 地址正确
2. **错误处理**：添加适当的错误处理和用户提示
3. **表单验证**：实现客户端和服务端验证
4. **安全性**：确保密码传输安全（HTTPS、加密等）
5. **用户体验**：添加加载状态、记住密码等功能

## 当前简化的功能

- 响应拦截器已简化，移除了复杂的 token 刷新逻辑
- userSlice 中的登录方法已简化为模板方法
- App.jsx 中的路由守卫已简化
- 登录页面已清空，等待您的实现

您现在可以专注于实现符合您需求的登录功能，而不受原有复杂逻辑的限制。
