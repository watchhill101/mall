import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Tag,
  Row,
  Col,
  Typography,
  Tooltip,
  Drawer,
  Divider,
  Avatar
} from 'antd';
import {
  SettingOutlined,
  ReloadOutlined,
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  UnlockOutlined,
  LockOutlined
} from '@ant-design/icons';
import userManagementAPI, {
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  USER_ROLE_LABELS
} from '@/api/userManagement';
import { maskPhone } from '@/utils/maskUtils';
import RoleTemplateModal from '@/components/RoleTemplateModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const UserRoot = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // 角色相关状态
  const [isPermissionDrawerVisible, setIsPermissionDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]); // 复用这个状态存储选中的角色

  // 角色模板模态框状态
  const [isRoleTemplateModalVisible, setIsRoleTemplateModalVisible] = useState(false);

  // const [form] = Form.useForm();



  // 获取用户列表
  const fetchUsers = useCallback(async () => {
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
  }, [currentPage, pageSize, searchText, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // 管理角色
  const handleManageRole = (record) => {
    setCurrentUser(record);
    // 设置当前用户的角色
    const currentRoleName = typeof record.role === 'object' && record.role
      ? record.role.name
      : record.role || '';
    setSelectedPermissions([currentRoleName]); // 复用这个状态存储选中的角色
    setIsPermissionDrawerVisible(true);
  };

  // 保存角色
  const handleSaveRole = async () => {
    try {
      const selectedRole = selectedPermissions[0]; // 取第一个选中的角色
      console.log('🔍 调试信息:', {
        selectedPermissions,
        selectedRole,
        currentUser: currentUser,
        userId: currentUser?._id
      });

      if (!selectedRole) {
        message.error('请选择一个角色');
        return;
      }

      if (!currentUser?._id) {
        message.error('用户信息不完整');
        return;
      }

      console.log('🔄 开始更新用户角色:', {
        userId: currentUser._id,
        roleName: selectedRole,
        roleType: typeof selectedRole
      });

      const response = await userManagementAPI.updateUserRole(currentUser._id, selectedRole);
      console.log('✅ 角色更新响应:', response);

      message.success('角色更新成功');
      setIsPermissionDrawerVisible(false);

      // 强制刷新用户列表
      await fetchUsers();
      console.log('🔄 用户列表已刷新');

    } catch (error) {
      message.error('角色更新失败');
      console.error('❌ 角色更新失败:', error);

      // 显示更详细的错误信息
      if (error.response) {
        console.error('❌ 错误响应:', error.response.data);
        console.error('❌ 错误状态:', error.response.status);
      }
    }
  };

  // 角色选择处理
  const handleRoleChange = (value) => {
    setSelectedPermissions([value]); // 单选角色
  };

  // 快速设置角色
  const handleQuickRole = (roleName) => {
    setSelectedPermissions([roleName]);
  };

  // 打开角色模板管理
  const handleOpenRoleTemplate = () => {
    setIsRoleTemplateModalVisible(true);
  };

  // 角色模板管理成功回调
  const handleRoleTemplateSuccess = () => {
    message.success('角色模板配置已更新');
    // 可以在这里刷新相关数据
  };

  // 可用角色列表 - 与数据库中的角色名称保持一致
  const availableRoles = [
    '超级管理员',
    '普通管理员',
    '商家管理员',
    '普通商家',
    '审计员',
    '普通员工'
  ];

  // 角色状态显示
  const renderRoleStatus = (role) => {
    const roleName = typeof role === 'object' && role ? role.name : role;

    let status = 'default';
    let color = 'default';

    switch (roleName) {
      case '超级管理员':
        status = 'success';
        color = 'red';
        break;
      case '管理员':
        status = 'processing';
        color = 'blue';
        break;
      case '商户':
        status = 'warning';
        color = 'orange';
        break;
      case '操作员':
        status = 'default';
        color = 'green';
        break;
      default:
        status = 'default';
        color = 'default';
    }

    return (
      <Tag color={color}>
        {roleName || '未设置角色'}
      </Tag>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div>
              <Text strong>{record.username}</Text>
              <Tag color={USER_STATUS_COLORS[record.status]} style={{ marginLeft: 8 }}>
                {USER_STATUS_LABELS[record.status]}
              </Tag>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.email}
              </Text>
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        // 处理角色数据：如果是对象则取name字段，否则直接使用
        const roleName = typeof role === 'object' && role ? role.name : role;
        return (
          <Tag color="blue" icon={<TeamOutlined />}>
            {USER_ROLE_LABELS[roleName] || roleName || '未设置'}
          </Tag>
        );
      }
    },
    {
      title: '角色状态',
      key: 'roleStatus',
      render: (_, record) => renderRoleStatus(record.role)
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date) => date ? new Date(date).toLocaleString() : '从未登录'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '角色操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="管理角色">
            <Button
              type="primary"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleManageRole(record)}
            >
              角色设置
            </Button>
          </Tooltip>

          <Tooltip title="快速角色设置">
            <Button.Group size="small">
              <Tooltip title="设为普通管理员">
                <Button
                  icon={<SafetyOutlined />}
                  onClick={() => {
                    setCurrentUser(record);
                    handleQuickRole('普通管理员');
                  }}
                />
              </Tooltip>
              <Tooltip title="设为普通员工">
                <Button
                  icon={<UserOutlined />}
                  onClick={() => {
                    setCurrentUser(record);
                    handleQuickRole('普通员工');
                  }}
                />
              </Tooltip>
            </Button.Group>
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
        <SafetyOutlined style={{ marginRight: '8px' }} />
        用户角色管理
      </Title>

      {/* 主要内容卡片 */}
      <Card>
        {/* 操作栏 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Search
              placeholder="搜索用户名、邮箱"
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
              <Button type="primary" icon={<BranchesOutlined />} onClick={handleOpenRoleTemplate}>
                角色模板
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 角色管理抽屉 */}
      <Drawer
        title={
          <Space>
            <SafetyOutlined />
            <span>角色管理 - {currentUser?.username}</span>
          </Space>
        }
        placement="right"
        onClose={() => setIsPermissionDrawerVisible(false)}
        open={isPermissionDrawerVisible}
        width={500}
        extra={
          <Space>
            <Button onClick={() => setIsPermissionDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" onClick={handleSaveRole}>
              保存角色
            </Button>
          </Space>
        }
      >
        {currentUser && (
          <>
            {/* 用户信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space>
                <Avatar icon={<UserOutlined />} src={currentUser.avatar} />
                <div>
                  <div>
                    <Text strong>{currentUser.username}</Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {typeof currentUser.role === 'object' && currentUser.role
                        ? USER_ROLE_LABELS[currentUser.role.name] || currentUser.role.name
                        : USER_ROLE_LABELS[currentUser.role] || currentUser.role || '未设置'
                      }
                    </Tag>
                  </div>
                  <Text type="secondary">{currentUser.email}</Text>
                </div>
              </Space>
            </Card>

            {/* 快速角色设置 */}
            <Card size="small" title="快速角色设置" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Button
                  size="small"
                  icon={<SafetyOutlined />}
                  onClick={() => handleQuickRole('超级管理员')}
                >
                  超级管理员
                </Button>
                <Button
                  size="small"
                  icon={<SafetyOutlined />}
                  onClick={() => handleQuickRole('普通管理员')}
                >
                  普通管理员
                </Button>
                <Button
                  size="small"
                  icon={<TeamOutlined />}
                  onClick={() => handleQuickRole('商家管理员')}
                >
                  商家管理员
                </Button>
                <Button
                  size="small"
                  icon={<TeamOutlined />}
                  onClick={() => handleQuickRole('普通商家')}
                >
                  普通商家
                </Button>
                <Button
                  size="small"
                  icon={<UserOutlined />}
                  onClick={() => handleQuickRole('审计员')}
                >
                  审计员
                </Button>
                <Button
                  size="small"
                  icon={<UnlockOutlined />}
                  onClick={() => handleQuickRole('普通员工')}
                >
                  普通员工
                </Button>
              </Space>
            </Card>

            <Divider />

            {/* 角色选择 */}
            <div>
              <Title level={5}>
                <TeamOutlined style={{ marginRight: 8 }} />
                角色设置
              </Title>
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                请为用户选择一个角色
              </Text>

              <Select
                value={selectedPermissions[0] || ''}
                onChange={handleRoleChange}
                style={{ width: '100%', marginBottom: 16 }}
                placeholder="请选择角色"
                size="large"
              >
                {availableRoles.map(role => (
                  <Select.Option key={role} value={role}>
                    <Space>
                      <TeamOutlined />
                      {role}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* 当前角色信息 */}
            <Card size="small" style={{ marginTop: 16 }} title="角色信息">
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">当前选择的角色:</Text>
                <div style={{ fontSize: '20px', color: '#1890ff', marginTop: 8 }}>
                  {selectedPermissions[0] || '未选择'}
                </div>
              </div>
            </Card>
          </>
        )}
      </Drawer>

      {/* 角色模板管理模态框 */}
      <RoleTemplateModal
        visible={isRoleTemplateModalVisible}
        onCancel={() => setIsRoleTemplateModalVisible(false)}
        onSuccess={handleRoleTemplateSuccess}
      />
    </div>
  );
};

export default UserRoot;
