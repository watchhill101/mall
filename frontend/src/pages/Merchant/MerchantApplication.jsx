import React from 'react'
import { Card, Typography } from 'antd'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography

const MerchantApplication = () => {
  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0 }}>商家申请</Title>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>审核和管理商家入驻申请</p>
          </div>
          
          <div style={{ 
            background: '#f0f2f5', 
            padding: '40px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Title level={4}>商家申请审核</Title>
            <p>此页面用于审核商家申请相关功能</p>
            <p style={{ color: '#999' }}>功能开发中...</p>
          </div>
        </Card>
      </div>
    </MerchantLayout>
  )
}

export default MerchantApplication 