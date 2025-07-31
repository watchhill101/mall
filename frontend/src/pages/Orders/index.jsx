import React from 'react'
import { Card, Statistic, Row, Col, Typography } from 'antd'
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarCircleOutlined 
} from '@ant-design/icons'

const { Title } = Typography

const Orders = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <FileTextOutlined style={{ marginRight: '8px' }} />
        订单管理
      </Title>
      
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

      <Card title="订单管理功能" style={{ marginBottom: '16px' }}>
        <p>📋 订单列表查看</p>
        <p>🔍 订单搜索与筛选</p>
        <p>✅ 订单状态更新</p>
        <p>📦 发货管理</p>
        <p>💳 支付状态跟踪</p>
        <p>📊 订单统计分析</p>
      </Card>
    </div>
  )
}

export default Orders
