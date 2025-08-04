import React from 'react'
import { Card, Typography } from 'antd'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography

const WithdrawAccount = () => {
  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0 }}>提现账号</Title>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>管理商家提现账号信息</p>
          </div>

          <div style={{
            background: '#f0f2f5',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Title level={4}>提现账号管理</Title>
            <p>此页面用于管理商家提现账号相关功能</p>
            <p style={{ color: '#999' }}>功能开发中...</p>
          </div>
        </Card>
      </div>
    </MerchantLayout>
  )
}

export default WithdrawAccount 