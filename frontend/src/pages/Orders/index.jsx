import React, { useState } from 'react'
import { Card, Statistic, Row, Col, Typography, Menu } from 'antd'
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  InboxOutlined,
  SortAscendingOutlined
} from '@ant-design/icons'

const { Title } = Typography

const Orders = () => {
  const [activeMenu, setActiveMenu] = useState('orders')

  // 二级导航菜单配置
  const sideMenuItems = [
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '订单',
    },
    {
      key: 'aftersales', 
      icon: <CustomerServiceOutlined />,
      label: '售后',
    },
    {
      key: 'tally',
      icon: <InboxOutlined />,
      label: '理货单',
    },
    {
      key: 'sorting',
      icon: <SortAscendingOutlined />,
      label: '分拣单',
    }
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'orders':
        return (
          <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
              <FileTextOutlined style={{ marginRight: '8px' }} />
              订单管理
            </Title>
            
            {/* 统计卡片 */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="订单总数"
                    value={2568}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="已完成订单"
                    value={2103}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="待处理订单"
                    value={465}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="订单总额"
                    value={298567}
                    prefix={<DollarCircleOutlined />}
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                    suffix="元"
                  />
                </Card>
              </Col>
            </Row>
            
            <Card>
              <p>订单列表内容区域...</p>
            </Card>
          </div>
        )
      case 'aftersales':
        return (
          <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
              <CustomerServiceOutlined style={{ marginRight: '8px' }} />
              售后管理
            </Title>
            <Card>
              <p>售后管理内容区域...</p>
            </Card>
          </div>
        )
      case 'tally':
        return (
          <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
              <InboxOutlined style={{ marginRight: '8px' }} />
              理货单管理
            </Title>
            <Card>
              <p>理货单管理内容区域...</p>
            </Card>
          </div>
        )
      case 'sorting':
        return (
          <div>
            <Title level={2} style={{ marginBottom: '24px' }}>
              <SortAscendingOutlined style={{ marginRight: '8px' }} />
              分拣单管理
            </Title>
            <Card>
              <p>分拣单管理内容区域...</p>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* 二级侧边导航 */}
      <div style={{ 
        width: '200px', 
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #d9d9d9'
      }}>
        <Menu
          mode="vertical"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => setActiveMenu(key)}
          items={sideMenuItems}
          style={{ 
            border: 'none',
            backgroundColor: 'transparent',
            height: '100%'
          }}
        />
      </div>
      
      {/* 内容区域 */}
      <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  )
}

export default Orders
