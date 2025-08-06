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
  DeleteOutlined
} from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'
import withdrawAccountAPI, { ACCOUNT_TYPE_LABELS, ACCOUNT_STATUS_COLORS } from '@/api/withdrawAccount'

const { Title } = Typography
const { Option } = Select

const WithdrawAccount = () => {
  const [form] = Form.useForm()
  const [modalForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [withdrawAccountData, setWithdrawAccountData] = useState([])
  const [merchantList, setMerchantList] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 模态框相关状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' 或 'edit'
  const [selectedRecord, setSelectedRecord] = useState(null)

  // API调用函数
  const fetchWithdrawAccountList = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const queryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      }

      // 添加搜索条件
      if (searchParams.merchantName) queryParams.merchantName = searchParams.merchantName
      if (searchParams.status) queryParams.status = searchParams.status

      console.log('📤 发送提现账号列表请求:', queryParams)
      const response = await withdrawAccountAPI.getWithdrawAccountList(queryParams)

      if (response && response.data) {
        setWithdrawAccountData(response.data.list || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0
        }))
        console.log('✅ 获取提现账号列表成功，共', response.data.list?.length || 0, '条记录')
      }
    } catch (error) {
      console.error('❌ 获取提现账号列表失败:', error)
      message.error('获取提现账号列表失败: ' + (error.message || '网络错误'))
      setWithdrawAccountData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMerchantList = useCallback(async () => {
    try {
      const response = await withdrawAccountAPI.getMerchantList()
      if (response && response.data) {
        setMerchantList(response.data)
        console.log('✅ 获取商家列表成功，共', response.data.length, '个商家')
      }
    } catch (error) {
      console.error('❌ 获取商家列表失败:', error)
      message.error('获取商家列表失败')
    }
  }, [])

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      await Promise.all([
        fetchWithdrawAccountList(),
        fetchMerchantList()
      ])
    }
    initData()
  }, [fetchWithdrawAccountList, fetchMerchantList])

  // 搜索处理
  const handleSearch = async (values) => {
    console.log('搜索条件:', values)
    setSearchParams(values)
    setPagination(prev => ({ ...prev, current: 1 }))

    // 使用搜索条件重新获取数据
    const queryParams = { page: 1, pageSize: pagination.pageSize, ...values }
    await fetchWithdrawAccountList(queryParams)
    message.success('搜索完成')
  }

  // 重置处理
  const handleReset = async () => {
    form.resetFields()
    setSearchParams({})
    setPagination(prev => ({ ...prev, current: 1 }))

    // 获取所有数据
    const queryParams = { page: 1, pageSize: pagination.pageSize }
    await fetchWithdrawAccountList(queryParams)
    message.info('已重置搜索条件')
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))

    // 获取新页面的数据
    const queryParams = {
      page,
      pageSize: pageSize || pagination.pageSize,
      ...searchParams
    }
    fetchWithdrawAccountList(queryParams)
  }

  // 新增账号
  const handleAdd = () => {
    setModalType('add')
    setSelectedRecord(null)
    modalForm.resetFields()
    setModalVisible(true)
  }

  // 修改账号
  const handleEdit = (record) => {
    setModalType('edit')
    setSelectedRecord(record)
    modalForm.setFieldsValue(record)
    setModalVisible(true)
  }

  // 启用/禁用账号
  const handleToggleStatus = (record) => {
    const newStatus = record.status === 'active' ? 'disabled' : 'active'
    const actionText = newStatus === 'active' ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText}该提现账号吗？`,
      onOk: async () => {
        try {
          await withdrawAccountAPI.updateWithdrawAccountStatus(record.id, newStatus)
          message.success(`${actionText}成功`)

          // 刷新数据
          const queryParams = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            ...searchParams
          }
          await fetchWithdrawAccountList(queryParams)
        } catch (error) {
          message.error(`${actionText}失败: ` + error.message)
        }
      }
    })
  }

  // 删除账号
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该提现账号吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        try {
          await withdrawAccountAPI.deleteWithdrawAccount(record.id)
          message.success('删除成功')

          // 刷新数据
          const queryParams = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            ...searchParams
          }
          await fetchWithdrawAccountList(queryParams)
        } catch (error) {
          message.error('删除失败: ' + error.message)
        }
      }
    })
  }

  // 保存模态框数据
  const handleModalOk = async (values) => {
    try {
      if (modalType === 'add') {
        await withdrawAccountAPI.createWithdrawAccount(values)
        message.success('添加成功')
      } else {
        await withdrawAccountAPI.updateWithdrawAccount(selectedRecord.id, values)
        message.success('修改成功')
      }

      setModalVisible(false)

      // 刷新数据
      const queryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      }
      await fetchWithdrawAccountList(queryParams)
    } catch (error) {
      message.error((modalType === 'add' ? '添加' : '修改') + '失败: ' + error.message)
    }
  }

  // 关闭模态框
  const handleModalCancel = () => {
    setModalVisible(false)
    setSelectedRecord(null)
    modalForm.resetFields()
  }

  // 刷新数据
  const handleRefresh = async () => {
    const queryParams = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchParams
    }
    await fetchWithdrawAccountList(queryParams)
    message.success('刷新成功')
  }

  // 表格列定义
  const columns = [
    {
      title: '商家',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150
    },
    {
      title: '账户类型',
      dataIndex: 'accountType',
      key: 'accountType',
      width: 120,
      render: (type) => {
        return ACCOUNT_TYPE_LABELS[type] || type
      }
    },
    {
      title: '所属银行',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 150,
      render: (bankName) => bankName || '-'
    },
    {
      title: '对公账号',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 180
    },
    {
      title: '平台结算服务费',
      dataIndex: 'serviceFeeRate',
      key: 'serviceFeeRate',
      width: 140,
      align: 'center',
      render: (rate) => `${rate}%`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusText = status === 'active' ? '正常' : '禁用'
        const color = ACCOUNT_STATUS_COLORS[status] || 'default'
        return <Tag color={color}>{statusText}</Tag>
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
      width: 200,
      align: 'center',
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
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
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
              <Col span={8}>
                <Form.Item label="所属商家" name="merchantName">
                  <Select
                    placeholder="搜索"
                    showSearch
                    style={{ width: '100%' }}
                    filterOption={(input, option) =>
                      option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {merchantList.map(merchant => (
                      <Option key={merchant.value} value={merchant.value}>
                        {merchant.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="状态" name="status">
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Option value="active">正常</Option>
                    <Option value="disabled">禁用</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label=" " colon={false}>
                  <Space style={{ marginTop: '6px' }}>
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
            </div>
            <div className="table-actions">
              <Space>
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
            dataSource={withdrawAccountData}
            rowKey="id"
            pagination={false}
            loading={loading}
            scroll={{ x: 1200 }}
            size="middle"
            className="data-table"
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
              pageSizeOptions={['5', '10', '20', '50']}
              defaultPageSize={10}
            />
          </div>
        </Card>

        {/* 新增/编辑模态框 */}
        <Modal
          title={modalType === 'add' ? '新增提现账号' : '编辑提现账号'}
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
        >
          <Form
            form={modalForm}
            layout="vertical"
            onFinish={handleModalOk}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="商家名称"
                  name="merchantName"
                  rules={[{ required: true, message: '请选择商家名称' }]}
                >
                  <Select
                    placeholder="请选择商家"
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {merchantList.map(merchant => (
                      <Option key={merchant.value} value={merchant.value}>
                        {merchant.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="账户类型"
                  name="accountType"
                  rules={[{ required: true, message: '请选择账户类型' }]}
                >
                  <Select placeholder="请选择账户类型">
                    <Option value="union">银联</Option>
                    <Option value="wechat">微信</Option>
                    <Option value="alipay">支付宝</Option>
                    <Option value="bank">银行卡</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="所属银行"
                  name="bankName"
                >
                  <Input placeholder="请输入所属银行" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="对公账号"
                  name="accountNumber"
                  rules={[{ required: true, message: '请输入对公账号' }]}
                >
                  <Input placeholder="请输入对公账号" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="平台结算服务费(%)"
                  name="serviceFeeRate"
                  rules={[{ required: true, message: '请输入服务费率' }]}
                >
                  <Input type="number" placeholder="请输入服务费率" min="0" max="100" />
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
                    <Button type="primary" htmlType="submit">
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

export default WithdrawAccount 