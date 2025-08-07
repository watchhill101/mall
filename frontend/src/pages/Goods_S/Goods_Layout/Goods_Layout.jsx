import React from 'react';
import { Typography, Layout, Menu } from 'antd';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Sider, Content } = Layout;

const GoodsLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 二级导航菜单项
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
      icon: <CheckSquareOutlined />,
      label: t('menu.stocktake'),
    },
    {
      key: '/goods/inventory/stock-details',
      icon: <FileTextOutlined />,
      label: t('menu.stock-details'),
    },
  ];

  // 获取当前选中的菜单
  const selectedKey = location.pathname;

  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
    console.log(key, '111111000000');
    navigate(key);
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Layout style={{ background: '#fff', borderRadius: '8px' }}>
        {/* 二级侧导航栏 */}
        <Sider
          width={200}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              <ShoppingCartOutlined style={{ marginRight: '8px' }} />
              {t('menu.goods')}
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              height: 'calc(100vh - 200px)',
            }}
          />
        </Sider>

        {/* 主内容区域 */}
        <Content style={{ padding: '0' }}>
          {children}
        </Content>
      </Layout>
    </div>
  );
};

export default GoodsLayout;
