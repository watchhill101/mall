import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  CrownOutlined,
  KeyOutlined
} from '@ant-design/icons';
import userManagementAPI, {
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS
} from '@/api/userManagement';
import { maskPhone } from '@/utils/maskUtils';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const Users = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    vipUsers: 0
  });

  // 弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form] = Form.useForm();

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userManagementAPI.getUserList({
        page: currentPage,
        pageSize,
        searchText,
        status: statusFilter,
        role: roleFilter
      });
      
      if (response && response.data) {
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await userManagementAPI.getUserStats();
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, pageSize, searchText, statusFilter, roleFilter]);

  // 搜索处理
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // 筛选处理
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  // 新增用户
  const handleAdd = () => {
    setIsEditing(false);
    setEditingUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 编辑用户
  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingUser(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      role: record.role,
      status: record.status
    });
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      await userManagementAPI.deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }

    try {
      await userManagementAPI.batchDeleteUsers(selectedRowKeys);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 保存用户
  const handleSave = async (values) => {
    try {
      if (isEditing) {
        await userManagementAPI.updateUser(editingUser._id, values);
        message.success('更新成功');
      } else {
        await userManagementAPI.createUser(values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(isEditing ? '更新失败' : '创建失败');
    }
  };

  // 重置密码
  const handleResetPassword = async (id) => {
    try {
      const newPassword = '123456'; // 默认密码
      await userManagementAPI.resetUserPassword(id, newPassword);
      message.success(`密码已重置为: ${newPassword}`);
    } catch (error) {
      message.error('重置密码失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: t('userManagement.username'),
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: t('userManagement.email'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t('userManagement.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Tooltip title={phone || t('merchants.noPhone')}>
          <span>{maskPhone(phone)}</span>
        </Tooltip>
      )
    },
    {
      title: t('userManagement.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">
          {USER_ROLE_LABELS[role] || role}
        </Tag>
      )
    },
    {
      title: t('userManagement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={USER_STATUS_COLORS[status] || 'default'}>
          {USER_STATUS_LABELS[status] || status}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="重置密码">
            <Popconfirm
              title="确定要重置密码吗？"
              onConfirm={() => handleResetPassword(record._id)}
            >
              <Button type="text" icon={<KeyOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除此用户吗？"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // 分页配置
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <TeamOutlined style={{ marginRight: '8px' }} />
        {t('userManagement.title')}
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新注册用户"
              value={stats.newUsers}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="本月"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="VIP用户"
              value={stats.vipUsers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card>
        {/* 操作栏 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Search
              placeholder="搜索用户名、邮箱或手机号"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
            >
              {Object.entries(USER_STATUS_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="筛选角色"
              allowClear
              style={{ width: '100%' }}
              onChange={handleRoleFilter}
            >
              {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                刷新
              </Button>
              <Popconfirm
                title="确定要批量删除选中的用户吗？"
                onConfirm={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增用户
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={paginationConfig}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
        />
      </Card>

      {/* 用户编辑弹窗 */}
      <Modal
        title={isEditing ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          {!isEditing && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {isEditing ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
