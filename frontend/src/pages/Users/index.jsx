import React from 'react'
import { Card, Statistic, Row, Col, Typography } from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  UserAddOutlined,
  CrownOutlined 
} from '@ant-design/icons'

const { Title } = Typography

const Users = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <TeamOutlined style={{ marginRight: '8px' }} />
        用户管理
      </Title>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={12865}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={8947}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新注册用户"
              value={325}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="本月"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="VIP用户"
              value={1547}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="用户管理功能" style={{ marginBottom: '16px' }}>
        <p>👥 用户列表管理</p>
        <p>🔍 用户信息查询</p>
        <p>✏️ 用户信息编辑</p>
        <p>🚫 用户状态管理</p>
        <p>👑 VIP会员管理</p>
        <p>📊 用户行为分析</p>
      </Card>
    </div>
  )
}

export default Users
