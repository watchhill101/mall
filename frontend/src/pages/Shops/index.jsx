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
import { useTranslation } from 'react-i18next'
import MerchantLayout from '../Merchant/MerchantLayout'

const { Title } = Typography

const Shops = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  // 检查是否在子路由页面
  const isSubRoute = location.pathname !== '/shops'

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/shops/merchants',
      icon: <TeamOutlined />,
      label: t('menu.merchants'),
    },
    {
      key: '/shops/merchant-account',
      icon: <UserOutlined />,
      label: t('menu.merchant-account'),
    },
    {
      key: '/shops/withdraw-account',
      icon: <BankOutlined />,
      label: t('menu.withdraw-account'),
    },
    {
      key: '/shops/account-detail',
      icon: <FileTextOutlined />,
      label: t('menu.account-detail'),
    },
    {
      key: '/shops/merchant-withdraw',
      icon: <MoneyCollectOutlined />,
      label: t('menu.merchant-withdraw'),
    },
    {
      key: '/shops/settlement-order',
      icon: <CalculatorOutlined />,
      label: t('menu.settlement-order'),
    },
    {
      key: '/shops/settlement-bill',
      icon: <FileOutlined />,
      label: t('menu.settlement-bill'),
    },
    {
      key: '/shops/merchant-application',
      icon: <AuditOutlined />,
      label: t('menu.merchant-application'),
    }
  ]

  return (
    <MerchantLayout>
      {isSubRoute ? (
        <Outlet />
      ) : (
        <div style={{ padding: '24px' }}>
          <div>
            <div style={{ textAlign: 'center', padding: '40px', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }}>🏪</div>
              <Typography.Title level={2}>{t('merchants.title')}</Typography.Title>
              <p style={{ color: '#666', fontSize: '16px' }}>{t('merchants.description')}</p>
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
      )}
    </MerchantLayout>
  )
}

export default Shops
