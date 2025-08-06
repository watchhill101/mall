import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Card,
  Typography,
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Pagination,
  Tooltip,
  Tag,
  Row,
  Col,
  Modal,
  message
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FullscreenOutlined,
  ColumnHeightOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined
} from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'
import merchantAccountAPI, {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_COLORS
} from '@/api/merchantAccount'
import merchantAPI from '@/api/merchant'

const { Title } = Typography
const { Option } = Select

const MerchantAccount = () => {
  const [form] = Form.useForm()
  const [modalForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [accountData, setAccountData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [contactPhoneFilter, setContactPhoneFilter] = useState('')
  const [merchantFilter, setMerchantFilter] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 模态框相关状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' 或 'edit'
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // 商户和角色选项
  const [merchantOptions, setMerchantOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [personOptions, setPersonOptions] = useState([])

  // 加载商户账号数据
  const loadAccountData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        merchantId: searchText,
        contactPhone: contactPhoneFilter,
        merchant: merchantFilter,
        status: statusFilter
      };

      const response = await merchantAccountAPI.getMerchantAccountList(params);

      if (response.code === 200) {
        const accounts = response.data.list.map(item => ({
          ...item,
          key: item._id,
          id: item._id,
          merchantId: item.merchant?._id || '',
          merchantName: item.merchant?.name || '未设置',
          roleName: item.role?.name || '未设置',
          personName: item.personInCharge?.name || '未设置',
          createTime: new Date(item.createdAt).toLocaleString(),
          updateTime: new Date(item.updatedAt).toLocaleString()
        }));

        setAccountData(accounts);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('获取商户账号列表失败:', error);

      let errorMessage = '获取商户账号列表失败';
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          errorMessage = '登录已过期，请重新登录';
        } else if (status === 403) {
          errorMessage = '权限不足，无法访问';
        } else if (status === 500) {
          errorMessage = '服务器错误，请稍后重试';
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, contactPhoneFilter, merchantFilter, statusFilter]);

  // 加载选项数据
  const loadOptions = useCallback(async () => {
    try {
      // 加载商户选项
      const merchantResponse = await merchantAPI.getMerchantList({ pageSize: 100 });
      if (merchantResponse.code === 200) {
        setMerchantOptions(merchantResponse.data.list.map(item => ({
          value: item._id,
          label: item.name
        })));
      }
    } catch (error) {
      console.error('加载选项数据失败:', error);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // 搜索和筛选变化时重新加载数据（使用防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.current === 1) {
        loadAccountData();
      } else {
        setPagination(prev => ({ ...prev, current: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, contactPhoneFilter, merchantFilter, statusFilter]);

  // 搜索处理
  const handleSearch = (values) => {
    console.log('搜索条件:', values);
    setSearchText(values.merchantId || '');
    setContactPhoneFilter(values.contactPhone || '');
    setMerchantFilter(values.merchant || '');
    setStatusFilter(values.status || '');
  };

  // 重置处理
  const handleReset = () => {
    form.resetFields();
    setSearchText('');
    setContactPhoneFilter('');
    setMerchantFilter('');
    setStatusFilter('');
  };

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  // 新增账号
  const handleAdd = () => {
    setModalType('add');
    setSelectedRecord(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  // 修改账号
  const handleEdit = (record) => {
    setModalType('edit');
    setSelectedRecord(record);
    modalForm.setFieldsValue({
      loginAccount: record.loginAccount,
      userNickname: record.userNickname,
      contactPhone: record.contactPhone,
      merchant: record.merchantId,
      role: record.role?._id,
      personInCharge: record.personInCharge?._id
    });
    setModalVisible(true);
  };

  // 启用/禁用账号
  const handleToggleStatus = (record) => {
    const newStatus = record.status === 'active' ? 'disabled' : 'active';
    const actionText = newStatus === 'active' ? '启用' : '禁用';

    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText}商家账号 "${record.userNickname}" 吗？`,
      onOk: async () => {
        try {
          await merchantAccountAPI.updateMerchantAccountStatus(record.id, newStatus);
          message.success(`${actionText}成功`);
          loadAccountData(); // 重新加载数据
        } catch (error) {
          console.error(`${actionText}账号失败:`, error);

          let errorMessage = `${actionText}账号失败`;
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }

          message.error(errorMessage);
        }
      }
    });
  };

  // 删除账号
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商家账号 "${record.userNickname}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        try {
          await merchantAccountAPI.deleteMerchantAccount(record.id);
          message.success('删除成功');
          loadAccountData(); // 重新加载数据
        } catch (error) {
          console.error('删除账号失败:', error);

          let errorMessage = '删除账号失败';
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }

          message.error(errorMessage);
        }
      }
    });
  };

  // 重置密码
  const handleResetPassword = (record) => {
    Modal.confirm({
      title: '确认重置密码',
      content: `确定要重置商家账号 "${record.userNickname}" 的密码吗？`,
      onOk: async () => {
        try {
          const response = await merchantAccountAPI.resetMerchantAccountPassword(record.id);
          if (response.code === 200) {
            message.success(`密码重置成功，新密码：${response.data.newPassword}`);
          }
        } catch (error) {
          console.error('重置密码失败:', error);

          let errorMessage = '重置密码失败';
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }

          message.error(errorMessage);
        }
      }
    });
  };

  // 保存模态框数据
  const handleModalOk = async (values) => {
    try {
      setConfirmLoading(true);

      if (modalType === 'add') {
        // 添加密码字段（默认密码）
        const accountData = {
          ...values,
          password: '123456' // 默认密码
        };

        await merchantAccountAPI.createMerchantAccount(accountData);
        message.success('添加成功');
      } else {
        await merchantAccountAPI.updateMerchantAccount(selectedRecord.id, values);
        message.success('修改成功');
      }

      setModalVisible(false);
      loadAccountData(); // 重新加载数据
    } catch (error) {
      console.error('操作失败:', error);

      let errorMessage = modalType === 'add' ? '添加账号失败' : '修改账号失败';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      message.error(errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  // 关闭模态框
  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRecord(null);
    setConfirmLoading(false);
    modalForm.resetFields();
  };

  // 刷新数据
  const handleRefresh = () => {
    loadAccountData();
  };

  // 表格列定义
  const columns = [
    {
      title: '商户ID',
      dataIndex: 'merchantId',
      key: 'merchantId',
      width: 100,
      render: (text) => text || '未设置'
    },
    {
      title: '登录帐号',
      dataIndex: 'loginAccount',
      key: 'loginAccount',
      width: 120
    },
    {
      title: '用户昵称',
      dataIndex: 'userNickname',
      key: 'userNickname',
      width: 120
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 140
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 120,
      render: (text) => text || '未设置'
    },
    {
      title: '商家',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150,
      render: (text) => text || '未设置'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusInfo = {
          color: ACCOUNT_STATUS_COLORS[status] || 'default',
          text: ACCOUNT_STATUS_LABELS[status] || status
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            修改
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === ACCOUNT_STATUS.ACTIVE ? '禁用' : '启用'}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
        </Space>
      )
    }
  ]

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索表单 */}
        <Card className="search-card" style={{ marginBottom: '16px' }}>
          <Form form={form} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="商户ID" name="merchantId">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="联系电话" name="contactPhone">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="商家" name="merchant">
                  <Input placeholder="搜索" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="状态" name="status">
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Option value={ACCOUNT_STATUS.ACTIVE}>{ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.ACTIVE]}</Option>
                    <Option value={ACCOUNT_STATUS.DISABLED}>{ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.DISABLED]}</Option>
                    <Option value={ACCOUNT_STATUS.LOCKED}>{ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.LOCKED]}</Option>
                    <Option value={ACCOUNT_STATUS.PENDING}>{ACCOUNT_STATUS_LABELS[ACCOUNT_STATUS.PENDING]}</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label=" " colon={false}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      htmlType="submit"
                      loading={loading}
                    >
                      搜索
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleReset}
                    >
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 数据表格 */}
        <Card className="table-card">
          <div className="table-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div className="table-title" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              商家账号管理
            </div>
            <div className="table-actions">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增
                </Button>
                <Tooltip title="刷新">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                  />
                </Tooltip>
                <Tooltip title="放大">
                  <Button type="text" icon={<EyeOutlined />} />
                </Tooltip>
                <Tooltip title="全屏">
                  <Button type="text" icon={<FullscreenOutlined />} />
                </Tooltip>
                <Tooltip title="密度">
                  <Button type="text" icon={<ColumnHeightOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={accountData}
            rowKey="id"
            pagination={false}
            loading={loading}
            scroll={{ x: 1200 }}
            size="middle"
            className="data-table"
            locale={{
              emptyText: '暂无商户账号数据'
            }}
          />

          {/* 分页 */}
          <div className="pagination-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <div className="pagination-info">
              <span>共 {pagination.total} 条</span>
            </div>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
              }
              onChange={handlePaginationChange}
              pageSizeOptions={['5', '10', '20', '50', '100']}
              defaultPageSize={10}
            />
          </div>
        </Card>

        {/* 新增/编辑模态框 */}
        <Modal
          title={modalType === 'add' ? '新增商家账号' : '编辑商家账号'}
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
          confirmLoading={confirmLoading}
        >
          <Form
            form={modalForm}
            layout="vertical"
            onFinish={handleModalOk}
            initialValues={{
              status: ACCOUNT_STATUS.ACTIVE
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="登录帐号"
                  name="loginAccount"
                  rules={[{ required: true, message: '请输入登录帐号' }]}
                >
                  <Input placeholder="请输入登录帐号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="用户昵称"
                  name="userNickname"
                  rules={[{ required: true, message: '请输入用户昵称' }]}
                >
                  <Input placeholder="请输入用户昵称" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="联系电话"
                  name="contactPhone"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="角色"
                  name="role"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select placeholder="请选择角色">
                    {roleOptions.map(role => (
                      <Option key={role.value} value={role.value}>{role.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="商家"
                  name="merchant"
                  rules={[{ required: true, message: '请选择商家' }]}
                >
                  <Select placeholder="请选择商家">
                    {merchantOptions.map(merchant => (
                      <Option key={merchant.value} value={merchant.value}>{merchant.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="负责人"
                  name="personInCharge"
                  rules={[{ required: true, message: '请选择负责人' }]}
                >
                  <Select placeholder="请选择负责人">
                    {personOptions.map(person => (
                      <Option key={person.value} value={person.value}>{person.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                  <Space>
                    <Button onClick={handleModalCancel}>
                      取消
                    </Button>
                    <Button type="primary" htmlType="submit" loading={confirmLoading}>
                      确定
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </MerchantLayout>
  )
}

export default MerchantAccount 