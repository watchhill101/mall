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
  Tag,
  Row,
  Col,
  Typography,
  Tooltip,
  Drawer,
  Transfer,
  Tree,
  Divider,
  Avatar,
  Badge
} from 'antd';
import {
  SettingOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  SafetyOutlined,
  KeyOutlined,
  TeamOutlined,
  BranchesOutlined,
  ApartmentOutlined,
  UnlockOutlined,
  LockOutlined
} from '@ant-design/icons';
import userManagementAPI, {
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS
} from '@/api/userManagement';
import { maskPhone } from '@/utils/maskUtils';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const UserRoot = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // 权限相关状态
  const [isPermissionDrawerVisible, setIsPermissionDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [permissionTree, setPermissionTree] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [form] = Form.useForm();

  // 权限树数据 - 模拟数据，实际应该从后端获取
  const mockPermissionTree = [
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '用户管理', key: 'user_management' },
        { title: '角色管理', key: 'role_management' },
        { title: '权限管理', key: 'permission_management' },
        { title: '系统设置', key: 'system_settings' }
      ]
    },
    {
      title: '商家管理',
      key: 'merchant',
      children: [
        { title: '商家列表', key: 'merchant_list' },
        { title: '商家审核', key: 'merchant_audit' },
        { title: '商家账号', key: 'merchant_account' },
        { title: '提现管理', key: 'withdraw_management' }
      ]
    },
    {
      title: '商品管理',
      key: 'goods',
      children: [
        { title: '商品列表', key: 'goods_list' },
        { title: '商品分类', key: 'goods_category' },
        { title: '库存管理', key: 'inventory_management' },
        { title: '商品审核', key: 'goods_audit' }
      ]
    },
    {
      title: '订单管理',
      key: 'order',
      children: [
        { title: '订单列表', key: 'order_list' },
        { title: '售后管理', key: 'after_sales' },
        { title: '物流管理', key: 'logistics' },
        { title: '结算管理', key: 'settlement' }
      ]
    },
    {
      title: '财务管理',
      key: 'finance',
      children: [
        { title: '账户明细', key: 'account_detail' },
        { title: '提现审核', key: 'withdraw_audit' },
        { title: '对账管理', key: 'reconciliation' },
        { title: '财务报表', key: 'financial_report' }
      ]
    }
  ];

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

  useEffect(() => {
    fetchUsers();
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

  // 管理权限
  const handleManagePermissions = (record) => {
    setCurrentUser(record);
    setSelectedPermissions(record.FirstLevelNavigationID || []);
    setIsPermissionDrawerVisible(true);
  };

  // 保存权限
  const handleSavePermissions = async () => {
    try {
      await userManagementAPI.updateUserPermissions(currentUser._id, selectedPermissions);
      message.success('权限更新成功');
      setIsPermissionDrawerVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('权限更新失败');
    }
  };

  // 权限树选择处理
  const handlePermissionCheck = (checkedKeys) => {
    setSelectedPermissions(checkedKeys);
  };

  // 快速设置权限
  const handleQuickPermission = (permissionType) => {
    let permissions = [];
    switch (permissionType) {
      case 'admin':
        // 管理员拥有所有权限
        permissions = getAllPermissionKeys();
        break;
      case 'merchant':
        // 商户权限
        permissions = ['goods_list', 'goods_category', 'inventory_management', 'order_list', 'account_detail'];
        break;
      case 'operator':
        // 操作员权限
        permissions = ['order_list', 'after_sales', 'logistics'];
        break;
      case 'readonly':
        // 只读权限
        permissions = ['goods_list', 'order_list'];
        break;
      default:
        permissions = [];
    }
    setSelectedPermissions(permissions);
  };

  // 获取所有权限键
  const getAllPermissionKeys = () => {
    const keys = [];
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.children) {
          traverse(node.children);
        } else {
          keys.push(node.key);
        }
      });
    };
    traverse(mockPermissionTree);
    return keys;
  };

  // 权限状态显示
  const renderPermissionStatus = (permissions) => {
    const total = getAllPermissionKeys().length;
    const current = permissions ? permissions.length : 0;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    let status = 'default';
    let text = '无权限';
    
    if (percentage === 100) {
      status = 'success';
      text = '全部权限';
    } else if (percentage >= 50) {
      status = 'processing';
      text = '部分权限';
    } else if (percentage > 0) {
      status = 'warning';
      text = '少量权限';
    }

    return (
      <Badge status={status} text={`${text} (${current}/${total})`} />
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
      render: (role) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {USER_ROLE_LABELS[role] || role}
        </Tag>
      )
    },
    {
      title: '权限状态',
      key: 'permissions',
      render: (_, record) => renderPermissionStatus(record.FirstLevelNavigationID)
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
      title: '权限操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="管理权限">
            <Button
              type="primary"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleManagePermissions(record)}
            >
              权限设置
            </Button>
          </Tooltip>
          
          <Tooltip title="快速权限">
            <Button.Group size="small">
              <Tooltip title="设为管理员权限">
                <Button 
                  icon={<SafetyOutlined />} 
                  onClick={() => {
                    setCurrentUser(record);
                    handleQuickPermission('admin');
                  }}
                />
              </Tooltip>
              <Tooltip title="清空所有权限">
                <Button 
                  icon={<LockOutlined />} 
                  onClick={() => {
                    setCurrentUser(record);
                    handleQuickPermission('none');
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
        用户权限管理
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
              <Button type="primary" icon={<BranchesOutlined />}>
                权限模板
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

      {/* 权限管理抽屉 */}
      <Drawer
        title={
          <Space>
            <SafetyOutlined />
            <span>权限管理 - {currentUser?.username}</span>
          </Space>
        }
        placement="right"
        onClose={() => setIsPermissionDrawerVisible(false)}
        open={isPermissionDrawerVisible}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setIsPermissionDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" onClick={handleSavePermissions}>
              保存权限
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
                      {USER_ROLE_LABELS[currentUser.role]}
                    </Tag>
                  </div>
                  <Text type="secondary">{currentUser.email}</Text>
                </div>
              </Space>
            </Card>

            {/* 快速权限设置 */}
            <Card size="small" title="快速权限设置" style={{ marginBottom: 16 }}>
              <Space wrap>
                <Button 
                  size="small" 
                  icon={<SafetyOutlined />}
                  onClick={() => handleQuickPermission('admin')}
                >
                  管理员权限
                </Button>
                <Button 
                  size="small" 
                  icon={<TeamOutlined />}
                  onClick={() => handleQuickPermission('merchant')}
                >
                  商户权限
                </Button>
                <Button 
                  size="small" 
                  icon={<UserOutlined />}
                  onClick={() => handleQuickPermission('operator')}
                >
                  操作员权限
                </Button>
                <Button 
                  size="small" 
                  icon={<UnlockOutlined />}
                  onClick={() => handleQuickPermission('readonly')}
                >
                  只读权限
                </Button>
                <Button 
                  size="small" 
                  danger
                  icon={<LockOutlined />}
                  onClick={() => handleQuickPermission('none')}
                >
                  清空权限
                </Button>
              </Space>
            </Card>

            <Divider />

            {/* 权限树 */}
            <div>
              <Title level={5}>
                <ApartmentOutlined style={{ marginRight: 8 }} />
                详细权限设置
              </Title>
              <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                请选择用户可以访问的功能模块
              </Text>
              
              <Tree
                checkable
                checkedKeys={selectedPermissions}
                onCheck={handlePermissionCheck}
                treeData={mockPermissionTree}
                style={{ 
                  background: '#fafafa', 
                  padding: 16, 
                  borderRadius: 6,
                  border: '1px solid #d9d9d9'
                }}
              />
            </div>

            {/* 当前权限统计 */}
            <Card size="small" style={{ marginTop: 16 }} title="权限统计">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">已选权限:</Text>
                  <div style={{ fontSize: '24px', color: '#1890ff' }}>
                    {selectedPermissions.length}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">总权限数:</Text>
                  <div style={{ fontSize: '24px', color: '#52c41a' }}>
                    {getAllPermissionKeys().length}
                  </div>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default UserRoot;
