import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons'
import './Home.module.scss'

const Home = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    sales: 0,
    views: 0
  })

  useEffect(() => {
    // 这里可以调用API获取首页数据
    // const fetchData = async () => {
    //   try {
    //     const response = await homeApi.dashboard.getStats()
    //     setStats(response.data)
    //   } catch (error) {
    //     console.error('获取首页数据失败:', error)
    //   }
    // }
    // fetchData()
    
    // 模拟数据
    setStats({
      users: 1234,
      orders: 567,
      sales: 89012,
      views: 3456
    })
  }, [])

  return (
    <div className="home-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="销售额"
              value={stats.sales}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="访问量"
              value={stats.views}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="欢迎使用管理系统模板">
            <p>这是一个基于 React + Ant Design 的管理系统模板。</p>
            <p>您可以在此基础上快速开发您的业务功能。</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
