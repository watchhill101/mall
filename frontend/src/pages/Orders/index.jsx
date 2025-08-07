import React from 'react';
import { Typography } from 'antd';
import {
  ShoppingCartOutlined,
  AuditOutlined,
  ContainerOutlined,
  SolutionOutlined,
  MoneyCollectOutlined,
  DeploymentUnitOutlined,
  FileOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OrderLayout from '../order_S/Order_layout/Order_layout';

const { Title } = Typography;

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 检查是否在子路由页面
  const isSubRoute = location.pathname !== '/orders';

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/orders/orders-list',
      icon: <ShoppingCartOutlined />,
      label: t('menu.orders-list'),
    },
    {
      key: '/orders/afterSales',
      icon: <AuditOutlined />,
      label: t('menu.afterSales'),
    },
    {
      key: '/orders/tallySheet',
      icon: <ContainerOutlined />,
      label: t('menu.tallySheet'),
    },
    {
      key: '/orders/SortingList',
      icon: <SolutionOutlined />,
      label: t('menu.sortingList'),
    },
    {
      key: '/orders/payment-record',
      icon: <MoneyCollectOutlined />,
      label: t('menu.payment-record'),
    },
    {
      key: '/orders/allocation-order',
      icon: <DeploymentUnitOutlined />,
      label: t('menu.allocation-order'),
    },
    {
      key: '/orders/work-order',
      icon: <FileOutlined />,
      label: t('menu.work-order'),
    },
    {
      key: '/orders/logistics-order',
      icon: <TruckOutlined />,
      label: t('menu.logistics-order'),
    },
  ];

  return (
    <OrderLayout>
      {isSubRoute ? (
        <Outlet />
      ) : (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              {t('orders.title')}
            </Title>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              {t('orders.description')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            {menuItems.map((item) => (
              <div
                key={item.key}
                style={{
                  padding: '24px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onClick={() => navigate(item.key)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    marginBottom: '8px',
                    color: '#1890ff',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ fontWeight: 'bold' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OrderLayout>
  );
};

export default Orders;
