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
import GoodsLayout from '../Goods_S/Goods_Layout/Goods_Layout';

const { Title } = Typography;

const Goods = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 检查是否在子路由页面
  const isSubRoute = location.pathname !== '/goods';

  // 如果在子路由页面，直接渲染子路由内容
  if (isSubRoute) {
    return <Outlet />;
  }

  // 快捷入口菜单项
  const menuItems = [
    {
      key: '/goods/product-list',
      icon: <ShoppingCartOutlined />,
      label: '商品列表',
    },
    {
      key: '/goods/audit-list',
      icon: <AuditOutlined />,
      label: '审核列表',
    },
    {
      key: '/goods/recycle-bin',
      icon: <DeleteOutlined />,
      label: '回收站',
    },
    {
      key: '/goods/product-category',
      icon: <AppstoreOutlined />,
      label: '商品分类',
    },
    {
      key: '/goods/external-product',
      icon: <DatabaseOutlined />,
      label: '外部商品库',
    },
    {
      key: '/goods/inventory/current-stock',
      icon: <CheckSquareOutlined />,
      label: '当前库存',
    },
    {
      key: '/goods/inventory/stock-in',
      icon: <ImportOutlined />,
      label: '入库',
    },
    {
      key: '/goods/inventory/stock-out',
      icon: <ExportOutlined />,
      label: '出库',
    },
    {
      key: '/goods/inventory/stocktake',
      icon: <FileTextOutlined />,
      label: '盘点',
    },
    {
      key: '/goods/inventory/stock-details',
      icon: <FileTextOutlined />,
      label: '出入库明细',
    },
  ];

  return (
    <GoodsLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            商品管理
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            管理平台所有商品相关信息和库存
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
    </GoodsLayout>
  );
};

export default Goods;
