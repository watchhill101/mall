import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/reducers/userSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Home = () => {
  const userInfo = useSelector(state => state.user.userinfo);
  const token = useSelector(state => state.user.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="欢迎来到管理系统" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle">
          <Title level={3}>登录成功！</Title>
          <Text>欢迎回来，{userInfo.username || '用户'}！</Text>
          <Text type="secondary">邮箱: {userInfo.email || '未设置'}</Text>
          <Text type="secondary">用户ID: {userInfo.userId || '未知'}</Text>
          <Text type="secondary">Token: {token ? token.substring(0, 20) + '...' : '无'}</Text>
        </Space>
      </Card>
      
      <Card title="操作">
        <Space>
          <Button type="primary" onClick={() => window.location.reload()}>
            刷新页面
          </Button>
          <Button danger onClick={handleLogout}>
            退出登录
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Home;