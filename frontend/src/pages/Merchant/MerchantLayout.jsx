import React from 'react';
import { Typography, Layout, Menu } from 'antd';
import {
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  CalculatorOutlined,
  FileOutlined,
  AuditOutlined,

} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Sider, Content } = Layout;

const MerchantLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 二级导航菜单项
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
    },
  ];

  // 获取当前选中的菜单
  const selectedKey = location.pathname;

  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
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
              <ShopOutlined style={{ marginRight: '8px' }} />
              {t('menu.merchants')}
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
        <Content style={{ padding: '0' }}>{children}</Content>
      </Layout>
    </div>
  );
};

export default MerchantLayout;
