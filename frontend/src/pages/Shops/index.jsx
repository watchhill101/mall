import React from 'react'
import { Card, Typography, Row, Col, Statistic } from 'antd'
import { ShopOutlined, ShoppingCartOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons'

const { Title } = Typography

const Shops = () => {
  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '20px', marginBottom: '24px' }}>
          <ShopOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2}>商城管理</Title>
          <p style={{ color: '#666', fontSize: '16px' }}>这里是商城管理页面</p>
        </div>
        
        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="商品总数"
                value={1234}
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={567}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="销售额"
                value={89012}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="用户总数"
                value={3456}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Shops
