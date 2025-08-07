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
  const [forceUpdate, setForceUpdate] = useState(0) // 用于确保状态更新后正确渲染

  // 加载商户账号数据 - 优化后的版本
  const loadAccountData = useCallback(async (params = {}) => {
    try {
      setLoading(true);

      // 构建查询参数
      const queryParams = {
        page: params.page || pagination.current,
        pageSize: params.pageSize || pagination.pageSize
      };

      // 添加搜索条件（只添加非空值）
      if (params.merchantId && params.merchantId.trim()) {
        queryParams.merchantId = params.merchantId.trim(); // 登录账号搜索
      }
      if (params.contactPhone && params.contactPhone.trim()) {
        queryParams.contactPhone = params.contactPhone.trim();
      }
      if (params.merchant && params.merchant.trim()) {
        queryParams.merchant = params.merchant.trim(); // 商户名称搜索
      }
      if (params.status) {
        queryParams.status = params.status;
      }

      console.log('🔍 发送账号列表查询请求:', queryParams);
      const response = await merchantAccountAPI.getMerchantAccountList(queryParams);

      if (response.code === 200) {
        const accounts = response.data.list.map(item => ({
          ...item,
          key: item._id,
          id: item._id, // 确保使用后端返回的 _id 作为 id
          merchantId: item.merchant?._id || item.merchant || '未设置', // 商户ID（用于内部逻辑）
          merchantName: item.merchant?.name || '未设置',
          roleName: item.role?.name || '未设置',
          personName: item.personInCharge?.name || '未设置',
          createTime: new Date(item.createdAt).toLocaleString(),
          updateTime: new Date(item.updatedAt).toLocaleString()
        }));

        setAccountData(accounts);
        setPagination(prev => ({
          ...prev,
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: response.data.pagination.total
        }));
        setForceUpdate(prev => prev + 1); // 强制重新渲染
        console.log('✅ 获取商户账号列表成功，共', accounts.length, '条记录');
      }
    } catch (error) {
      console.error('❌ 获取商户账号列表失败:', error);

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
      setAccountData([]);
    } finally {
      setLoading(false);
    }
  }, []); // 移除依赖项，通过参数传递

  // 加载选项数据
  const loadOptions = useCallback(async () => {
    try {
      console.log('🔄 开始加载选项数据...');

      // 并行加载商户、角色、负责人选项
      const [merchantResponse, roleResponse, personResponse] = await Promise.all([
        merchantAPI.getMerchantList({ pageSize: 100 }),
        fetch('/api/role/list').then(res => res.json()),
        fetch('/api/person/list').then(res => res.json())
      ]);

      // 设置商户选项
      if (merchantResponse.code === 200) {
        const merchants = merchantResponse.data.list.map(item => ({
          value: item._id,
          label: item.name
        }));
        setMerchantOptions(merchants);
        console.log('✅ 商户选项加载成功:', merchants.length, '个');
      }

      // 设置角色选项（使用职位作为角色）
      if (roleResponse.code === 200) {
        const roles = roleResponse.data.map(item => ({
          value: item.name, // 使用职位名称作为值
          label: item.name
        }));
        setRoleOptions(roles);
        console.log('✅ 角色选项加载成功:', roles.length, '个');
      }

      // 设置负责人选项
      if (personResponse.code === 200) {
        const persons = personResponse.data.map(item => ({
          value: item._id,
          label: `${item.name} (${item.position})`
        }));
        setPersonOptions(persons);
        console.log('✅ 负责人选项加载成功:', persons.length, '个');
      }

    } catch (error) {
      console.error('❌ 加载选项数据失败:', error);

      // 设置一些默认的测试数据以便调试
      console.log('🔧 设置测试数据...');
      setRoleOptions([
        { value: '超级管理员', label: '超级管理员' },
        { value: '部门经理', label: '部门经理' },
        { value: '操作员', label: '操作员' },
        { value: '财务专员', label: '财务专员' }
      ]);

      setPersonOptions([
        { value: '507f1f77bcf86cd799439011', label: '张三 (超级管理员)' },
        { value: '507f1f77bcf86cd799439015', label: '李四 (部门经理)' },
        { value: '507f1f77bcf86cd799439016', label: '王五 (操作员)' }
      ]);

      message.warning('部分选项数据加载失败，已设置默认数据');
    }
  }, []);

  // 存储当前搜索参数的状态
  const [currentSearchParams, setCurrentSearchParams] = useState({});

  // 初始化加载数据
  useEffect(() => {
    loadAccountData({ page: 1, pageSize: 10 });
  }, [loadAccountData]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // 搜索处理 - 优化后的版本
  const handleSearch = async (values) => {
    try {
      console.log('🔍 执行搜索，条件:', values);

      // 过滤空值参数
      const filteredValues = Object.keys(values).reduce((acc, key) => {
        if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      console.log('🔍 过滤后的搜索条件:', filteredValues);

      // 保存搜索参数
      setCurrentSearchParams(filteredValues);

      // 重置到第一页并执行搜索
      const searchParams = {
        page: 1,
        pageSize: pagination.pageSize,
        ...filteredValues
      };

      await loadAccountData(searchParams);
      message.success('搜索完成');
    } catch (error) {
      message.error('搜索失败: ' + error.message);
    }
  };

  // 重置处理 - 优化后的版本
  const handleReset = async () => {
    try {
      form.resetFields();
      setCurrentSearchParams({});

      // 重置分页并加载所有数据
      const resetParams = {
        page: 1,
        pageSize: pagination.pageSize
      };

      await loadAccountData(resetParams);
      message.info('已重置搜索条件');
    } catch (error) {
      message.error('重置失败: ' + error.message);
    }
  };

  // 分页处理 - 优化后的版本
  const handlePaginationChange = (page, pageSize) => {
    const newPageSize = pageSize || pagination.pageSize;

    // 构建分页参数，包含当前搜索条件
    const paginationParams = {
      page: page,
      pageSize: newPageSize,
      ...currentSearchParams // 保持当前搜索条件
    };

    // 更新分页状态并重新加载数据
    loadAccountData(paginationParams);
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
      role: record.role?.name || record.role, // 使用角色名称
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
          // 重新加载数据，保持当前搜索条件和分页
          const refreshParams = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            ...currentSearchParams
          };
          loadAccountData(refreshParams);
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
          // 重新加载数据，保持当前搜索条件和分页
          const refreshParams = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            ...currentSearchParams
          };
          loadAccountData(refreshParams);
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
      console.log('💾 提交表单数据:', values);

      if (modalType === 'add') {
        // 添加密码字段（默认密码）
        const accountData = {
          ...values,
          password: '123456' // 默认密码
        };

        console.log('📝 创建账号数据:', accountData);
        const response = await merchantAccountAPI.createMerchantAccount(accountData);
        console.log('✅ 创建账号成功:', response);
        message.success('添加成功');
      } else {
        console.log('📝 更新账号数据:', values);
        await merchantAccountAPI.updateMerchantAccount(selectedRecord.id, values);
        message.success('修改成功');
      }

      setModalVisible(false);
      // 重新加载数据，保持当前搜索条件和分页
      const refreshParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...currentSearchParams
      };
      loadAccountData(refreshParams);
    } catch (error) {
      console.error('❌ 操作失败:', error);

      let errorMessage = modalType === 'add' ? '添加账号失败' : '修改账号失败';

      if (error.response && error.response.data) {
        const { data } = error.response;
        errorMessage = data.message || errorMessage;

        // 处理具体的错误类型
        if (data.data) {
          if (data.data.conflictField) {
            const fieldNames = {
              'loginAccount': '登录账号',
              'contactPhone': '联系电话'
            };
            const fieldName = fieldNames[data.data.conflictField] || data.data.conflictField;
            errorMessage = `${fieldName}已存在：${data.data.value}`;
          } else if (data.data.missing && data.data.missing.length > 0) {
            errorMessage = `请填写必填字段：${data.data.missing.join(', ')}`;
          } else if (data.data.validationErrors) {
            errorMessage = data.data.validationErrors.map(err => err.message).join('; ');
          }
        }

        console.log('📋 详细错误信息:', data);
      } else if (error.message) {
        errorMessage = error.message;
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

  // 刷新数据 - 优化后的版本
  const handleRefresh = () => {
    // 使用当前搜索条件和分页状态刷新数据
    const refreshParams = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...currentSearchParams
    };
    loadAccountData(refreshParams);
    message.info('数据已刷新');
  };

  // 表格列定义
  const columns = [
    {
      title: '商户名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 160,
      ellipsis: true,
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
      width: 110,
      render: (text) => text || '未设置'
    },
    {
      title: '负责人',
      dataIndex: 'personName',
      key: 'personName',
      width: 110,
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
      width: 260,
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
                <Form.Item label="登录账号" name="merchantId">
                  <Input placeholder="请输入登录账号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="联系电话" name="contactPhone">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="商户名称" name="merchant">
                  <Input placeholder="搜索商户名称" />
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

        {/* 搜索结果提示 */}
        {Object.keys(currentSearchParams).length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '8px 16px',
            background: '#f0f0f0',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#666' }}>
              筛选结果：共找到 {pagination.total} 条记录
              {currentSearchParams.merchantId && <span>（登录账号："{currentSearchParams.merchantId}"）</span>}
              {currentSearchParams.contactPhone && <span>（联系电话："{currentSearchParams.contactPhone}"）</span>}
              {currentSearchParams.merchant && <span>（商户名称："{currentSearchParams.merchant}"）</span>}
              {currentSearchParams.status && <span>（状态：{ACCOUNT_STATUS_LABELS[currentSearchParams.status]}）</span>}
            </span>
            <Button
              size="small"
              type="link"
              onClick={handleReset}
              style={{ color: '#1890ff' }}
            >
              清除筛选
            </Button>
          </div>
        )}

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
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                (包含完整的商户、角色、负责人信息)
              </span>
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
            key={forceUpdate} // 确保数据更新时重新渲染
            pagination={false}
            loading={loading}
            scroll={{ x: 1400 }}
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
            <div className="pagination-info" key={`pagination-${forceUpdate}`}>
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