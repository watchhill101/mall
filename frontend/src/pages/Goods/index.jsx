import React from 'react'
import { Card, Statistic, Row, Col, Typography } from 'antd'
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  RiseOutlined,
  TagOutlined 
} from '@ant-design/icons'

const { Title } = Typography

const Goods = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <ShoppingCartOutlined style={{ marginRight: '8px' }} />
        商品管理
      </Title>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={1128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在售商品"
              value={856}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={112893}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="月增长率"
              value={9.3}
              prefix={<RiseOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card title="商品管理功能" style={{ marginBottom: '16px' }}>
        <p>📦 商品列表管理</p>
        <p>➕ 新增商品</p>
        <p>✏️ 编辑商品信息</p>
        <p>🏷️ 商品分类管理</p>
        <p>📊 库存管理</p>
        <p>💰 价格管理</p>
      </Card>
    </div>
  )
}

export default Goods
