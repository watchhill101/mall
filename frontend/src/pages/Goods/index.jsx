import React from 'react';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import GoodsLayout from '../Goods_S/Goods_Layout/Goods_Layout';
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

const { Title } = Typography;

const Goods = () => {
  const navigate = useNavigate();

  // 二级导航菜单项
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
      icon: <CheckSquareOutlined />,
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
        <div>
          {/* <div
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
            <Typography.Title level={2}>商品管理中心</Typography.Title>
            <p style={{ color: '#666', fontSize: '16px' }}>
              请从左侧菜单选择要管理的功能模块，或点击下方快捷入口
            </p>
          </div> */}

          {/* 快捷入口卡片 */}
          {/* <div
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
          </div> */}
        </div>
      </div>
    </GoodsLayout>
  );
};

export default Goods;
