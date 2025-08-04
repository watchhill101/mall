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
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Title } = Typography;
const { Sider, Content } = Layout;

const GoodsLayout = ({ children }) => {
  console.log(children, 'children~~~');
  const navigate = useNavigate();
  const location = useLocation();

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

  // 获取当前选中的菜单
  const selectedKey = location.pathname;

  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
    console.log(key, '111111000000');
    navigate(key);
  };
  console.log(React.isValidElement(children), 'children-----');

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
              商品管理
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
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
          {/* <Outlet /> */}
        </Content>
      </Layout>
    </div>
  );
};

export default GoodsLayout;
