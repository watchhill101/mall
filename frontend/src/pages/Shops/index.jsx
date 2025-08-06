import React from 'react'
import { Typography } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  CalculatorOutlined,
  FileOutlined,
  AuditOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import MerchantLayout from '../Merchant/MerchantLayout'

const { Title } = Typography

const Shops = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 检查是否在子路由页面
  const isSubRoute = location.pathname !== '/shops'

  // 如果在子路由页面，直接渲染子路由内容
  if (isSubRoute) {
    return <Outlet />
  }

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/shops/merchants',
      icon: <TeamOutlined />,
      label: '商家管理',
    },
    {
      key: '/shops/merchant-account',
      icon: <UserOutlined />,
      label: '商家账号',
    },
    {
      key: '/shops/withdraw-account',
      icon: <BankOutlined />,
      label: '提现账号',
    },
    {
      key: '/shops/account-detail',
      icon: <FileTextOutlined />,
      label: '账户明细',
    },
    {
      key: '/shops/merchant-withdraw',
      icon: <MoneyCollectOutlined />,
      label: '商家提现',
    },
    {
      key: '/shops/settlement-order',
      icon: <CalculatorOutlined />,
      label: '结算订单',
    },
    {
      key: '/shops/settlement-bill',
      icon: <FileOutlined />,
      label: '结账单',
    },
    {
      key: '/shops/merchant-application',
      icon: <AuditOutlined />,
      label: '商家申请',
    }
  ]

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        <div>
          <div style={{ textAlign: 'center', padding: '40px', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }}>🏪</div>
            <Typography.Title level={2}>商家管理中心</Typography.Title>
            <p style={{ color: '#666', fontSize: '16px' }}>请从左侧菜单选择要管理的功能模块，或点击下方快捷入口</p>
          </div>

          {/* 快捷入口卡片 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {menuItems.map((item) => (
              <div
                key={item.key}
                style={{
                  background: '#fff',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => navigate(item.key)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px', color: '#1890ff' }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 'bold' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

export default Shops
