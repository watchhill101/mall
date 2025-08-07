import React from 'react';
import { Typography } from 'antd';
import {
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  SortAscendingOutlined,
  DollarOutlined,
  SwapOutlined,
  ToolOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import OrderLayout from '../Order_layout/Order_layout';

const { Title } = Typography;

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();

  // 检查是否在子路由页面
  const isSubRoute = location.pathname !== '/orders';

  // 如果在子路由页面，直接渲染子路由内容
  if (isSubRoute) {
    return <Outlet />;
  }

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/orders/orders-list',
      icon: <ShoppingCartOutlined />,
      label: '订单列表',
    },
    {
      key: '/orders/afterSales',
      icon: <CustomerServiceOutlined />,
      label: '售后管理',
    },
    {
      key: '/orders/tallySheet',
      icon: <FileTextOutlined />,
      label: '理货单',
    },
    {
      key: '/orders/SortingList',
      icon: <SortAscendingOutlined />,
      label: '分拣单',
    },
    {
      key: '/orders/payment-record',
      icon: <DollarOutlined />,
      label: '收款记录',
    },
    {
      key: '/orders/allocation-order',
      icon: <SwapOutlined />,
      label: '配货单',
    },
    {
      key: '/orders/work-order',
      icon: <ToolOutlined />,
      label: '作业单',
    },
    {
      key: '/orders/logistics-order',
      icon: <TruckOutlined />,
      label: '物流单',
    },
  ];

  return (
    <OrderLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            订单管理
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            管理平台所有订单相关业务流程
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '16px',
          marginTop: '24px'
        }}>
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
              <div style={{ fontSize: '24px', marginBottom: '8px', color: '#1890ff' }}>
                {item.icon}
              </div>
              <div style={{ fontWeight: 'bold' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </OrderLayout>
  );
}
