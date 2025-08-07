import React from 'react';
import { Typography } from 'antd';
import {
  ShoppingCartOutlined,
  AuditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  CheckSquareOutlined,
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GoodsLayout from '../Goods_S/Goods_Layout/Goods_Layout';

const { Title } = Typography;

const Goods = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 检查是否在子路由页面
  const isSubRoute = location.pathname !== '/goods';

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/goods/product-list',
      icon: <ShoppingCartOutlined />,
      label: t('menu.product-list'),
    },
    {
      key: '/goods/audit-list',
      icon: <AuditOutlined />,
      label: t('menu.audit-list'),
    },
    {
      key: '/goods/recycle-bin',
      icon: <DeleteOutlined />,
      label: t('menu.recycle-bin'),
    },
    {
      key: '/goods/product-category',
      icon: <AppstoreOutlined />,
      label: t('menu.product-category'),
    },
    {
      key: '/goods/external-product',
      icon: <DatabaseOutlined />,
      label: t('menu.external-product'),
    },
    {
      key: '/goods/inventory/current-stock',
      icon: <CheckSquareOutlined />,
      label: t('menu.current-stock'),
    },
    {
      key: '/goods/inventory/stock-in',
      icon: <ImportOutlined />,
      label: t('menu.stock-in'),
    },
    {
      key: '/goods/inventory/stock-out',
      icon: <ExportOutlined />,
      label: t('menu.stock-out'),
    },
    {
      key: '/goods/inventory/stocktake',
      icon: <FileTextOutlined />,
      label: t('menu.stocktake'),
    },
    {
      key: '/goods/inventory/stock-details',
      icon: <FileTextOutlined />,
      label: t('menu.stock-details'),
    },
  ];

  return (
    <GoodsLayout>
      {isSubRoute ? (
        <Outlet />
      ) : (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              {t('goods.title')}
            </Title>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              {t('goods.description')}
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
      )}
    </GoodsLayout>
  );
};

export default Goods;
