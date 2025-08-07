import React, { useState, useEffect } from 'react';
import {
  Dropdown,
  Space,
  Avatar,
  Badge,
  Modal,
  Drawer,
  List,
  Card,
  Switch,
  Divider,
  Button,
  message,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SettingOutlined,
  BellOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  SafetyOutlined,
  SunOutlined,
  MoonOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const EnhancedUserDropdown = ({ onLogout, onPersonalCenter, onResetPassword }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userinfo = useSelector((state) => state.user.userinfo);
  
  // 状态管理
  const [messageVisible, setMessageVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // 模拟未读消息数
  const [darkMode, setDarkMode] = useState(false);

  // 切换语言
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    message.success(lng === 'zh' ? '已切换到中文' : 'Switched to English');
  };

  // 切换主题
  const toggleTheme = (checked) => {
    setDarkMode(checked);
    // 这里可以添加主题切换逻辑
    document.body.setAttribute('data-theme', checked ? 'dark' : 'light');
    message.success(t(checked ? 'theme.switchedToDark' : 'theme.switchedToLight'));
  };

  // 快捷操作列表
  const quickActions = [
    {
      title: t('quickActions.addProduct'),
      icon: <AppstoreOutlined />,
      action: () => navigate('/goods/product-list?action=add')
    },
    {
      title: t('quickActions.processOrder'),
      icon: <ThunderboltOutlined />,
      action: () => navigate('/orders/orders-list?status=pending')
    },
    {
      title: t('quickActions.exportData'),
      icon: <DashboardOutlined />,
      action: () => message.info(t('quickActions.exportStarted'))
    }
  ];

  // 帮助文档列表
  const helpItems = [
    {
      title: t('help.userGuide'),
      description: t('help.userGuideDesc'),
      action: () => window.open('/help/user-guide', '_blank')
    },
    {
      title: t('help.shortcuts'),
      description: t('help.shortcutsDesc'),
      action: () => Modal.info({
        title: t('help.shortcuts'),
        content: (
          <div>
            <p>Ctrl + S: {t('help.save')}</p>
            <p>Ctrl + F: {t('help.search')}</p>
            <p>Ctrl + N: {t('help.new')}</p>
          </div>
        )
      })
    },
    {
      title: t('help.contact'),
      description: t('help.contactDesc'),
      action: () => message.info(t('help.contactInfo'))
    }
  ];

  // 模拟消息数据
  const messages = [
    {
      id: 1,
      title: t('messages.orderAlert'),
      content: t('messages.orderAlertContent'),
      time: '5分钟前',
      type: 'warning'
    },
    {
      id: 2,
      title: t('messages.systemUpdate'),
      content: t('messages.systemUpdateContent'),
      time: '1小时前',
      type: 'info'
    },
    {
      id: 3,
      title: t('messages.auditReminder'),
      content: t('messages.auditReminderContent'),
      time: '2小时前',
      type: 'success'
    }
  ];

  // 用户下拉菜单项
  const dropdownMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 'bold' }}>{userinfo.username || 'User'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{userinfo.email || 'user@example.com'}</div>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: 'personal-center',
      label: (
        <div onClick={onPersonalCenter}>
          <UserOutlined /> {t('common.personalCenter')}
        </div>
      ),
    },
    {
      key: 'my-dashboard',
      label: (
        <div onClick={() => navigate('/dashboard/personal')}>
          <DashboardOutlined /> {t('menu.myDashboard')}
        </div>
      ),
    },
    {
      key: 'workspace',
      label: (
        <div onClick={() => navigate('/workspace')}>
          <AppstoreOutlined /> {t('menu.workspace')}
        </div>
      ),
    },
    {
      type: 'divider'
    },
    {
      key: 'messages',
      label: (
        <div onClick={() => setMessageVisible(true)}>
          <Badge count={unreadCount} size="small">
            <BellOutlined /> {t('menu.messageCenter')}
          </Badge>
        </div>
      ),
    },
    {
      key: 'quick-actions',
      label: (
        <div onClick={() => setQuickActionsVisible(true)}>
          <ThunderboltOutlined /> {t('menu.quickActions')}
        </div>
      ),
    },
    {
      key: 'settings',
      label: (
        <div onClick={() => setSettingsVisible(true)}>
          <SettingOutlined /> {t('menu.systemSettings')}
        </div>
      ),
    },
    {
      type: 'divider'
    },
    {
      key: 'security',
      label: (
        <div onClick={() => navigate('/security')}>
          <SafetyOutlined /> {t('menu.securityCenter')}
        </div>
      ),
    },
    {
      key: 'help',
      label: (
        <div onClick={() => setHelpVisible(true)}>
          <QuestionCircleOutlined /> {t('menu.helpSupport')}
        </div>
      ),
    },
    {
      type: 'divider'
    },
    {
      key: 'language',
      label: (
        <div>
          <GlobalOutlined /> {t('common.language')}
        </div>
      ),
      children: [
        {
          key: 'zh',
          label: (
            <div onClick={() => changeLanguage('zh')}>
              🇨🇳 中文
            </div>
          ),
        },
        {
          key: 'en',
          label: (
            <div onClick={() => changeLanguage('en')}>
              🇺🇸 English
            </div>
          ),
        }
      ]
    },
    {
      key: 'reset-password',
      label: (
        <div onClick={onResetPassword}>
          <SafetyOutlined /> {t('system.resetPassword')}
        </div>
      ),
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <div onClick={onLogout} style={{ color: '#ff4d4f' }}>
          <LogoutOutlined /> {t('common.logout')}
        </div>
      ),
    }
  ];

  return (
    <>
      <Dropdown
        menu={{ items: dropdownMenuItems }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Space style={{ cursor: 'pointer', padding: '0 16px' }}>
          <Avatar 
            size="small" 
            src={userinfo.avatar} 
            icon={<UserOutlined />} 
          />
          <span style={{ color: '#fff' }}>{userinfo.username || 'User'}</span>
          <DownOutlined style={{ color: '#fff', fontSize: '12px' }} />
        </Space>
      </Dropdown>

      {/* 消息中心抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('menu.messageCenter')}</span>
            <Button 
              type="link" 
              size="small"
              onClick={() => setUnreadCount(0)}
            >
              {t('messages.markAllRead')}
            </Button>
          </div>
        }
        placement="right"
        onClose={() => setMessageVisible(false)}
        open={messageVisible}
        width={400}
      >
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item>
              <Card size="small" style={{ width: '100%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {item.content}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  {item.time}
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Drawer>

      {/* 系统设置抽屉 */}
      <Drawer
        title={t('menu.systemSettings')}
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={350}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <h4>{t('settings.appearance')}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span>
                {darkMode ? <MoonOutlined /> : <SunOutlined />}
                {t('settings.darkMode')}
              </span>
              <Switch checked={darkMode} onChange={toggleTheme} />
            </div>
          </div>
          
          <Divider />
          
          <div style={{ marginBottom: '24px' }}>
            <h4>{t('settings.notifications')}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span>{t('settings.orderNotifications')}</span>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span>{t('settings.systemNotifications')}</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </Drawer>

      {/* 快捷操作模态框 */}
      <Modal
        title={t('menu.quickActions')}
        open={quickActionsVisible}
        onCancel={() => setQuickActionsVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              hoverable
              style={{ textAlign: 'center' }}
              onClick={() => {
                action.action();
                setQuickActionsVisible(false);
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {action.icon}
              </div>
              <div>{action.title}</div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* 帮助支持模态框 */}
      <Modal
        title={t('menu.helpSupport')}
        open={helpVisible}
        onCancel={() => setHelpVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={helpItems}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={item.action}>
                  {t('help.view')}
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default EnhancedUserDropdown;