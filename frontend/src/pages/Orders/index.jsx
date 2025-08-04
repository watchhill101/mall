import React from 'react';
import { Typography } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  CalculatorOutlined,
  FileOutlined,
  AuditOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OrderLayout from '../order_S/Order_layout/Order_layout';

const { Title } = Typography;

const Orders = () => {
  const navigate = useNavigate();

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/orders/orders-list',
      icon: <TeamOutlined />,
      label: '订单',
    },
    {
      key: '/orders/afterSales',
      icon: <UserOutlined />,
      label: '售后',
    },
    {
      key: '/orders/tallySheet',
      icon: <BankOutlined />,
      label: '理货单',
    },
    {
      key: '/orders/SortingList',
      icon: <FileTextOutlined />,
      label: '分拣单',
    },
  ];

  return (
    <OrderLayout>
      <div style={{ padding: '24px' }}>
        <div>
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                color: '#1890ff',
                marginBottom: '16px',
              }}
            >
              🏪
            </div>
            <Typography.Title level={2}>商家管理中心</Typography.Title>
            <p style={{ color: '#666', fontSize: '16px' }}>
              请从左侧菜单选择要管理的功能模块，或点击下方快捷入口
            </p>
          </div>

          {/* 快捷入口卡片 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onClick={() => navigate(item.key)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(0,0,0,0.15)';
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
      </div>
    </OrderLayout>
  );
};

export default Orders;
