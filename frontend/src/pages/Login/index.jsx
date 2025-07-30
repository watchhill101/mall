import React from 'react'
import { Card } from 'antd'
import './Login.module.scss'

const Login = () => {
  return (
    <div className="login-container">
      <Card 
        title="用户登录" 
        className="login-card"
        style={{ width: 400, margin: '100px auto' }}
      >
        <div className="login-content">
          <p>请在此处实现您的登录功能</p>
          <p>这里是一个空白的登录页面模板</p>
        </div>
      </Card>
    </div>
  )
}

export default Login
