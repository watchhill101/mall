import React, { useState, useEffect, useMemo } from 'react'
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

const { Title } = Typography
const { Option } = Select

const WithdrawAccount = () => {
  const [form] = Form.useForm()
  const [modalForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
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

  // 模拟提现账号数据
  const mockWithdrawAccountData = [
    {
      id: 1,
      merchantName: '商家名称商家名称',
      accountType: 'union',
      bankName: '中国农业银行',
      accountNumber: '123212321313213',
      serviceFeeRate: 5,
      status: 'active',
      createTime: '2023-12-12 12:12:12',
      updateTime: '2023-12-12 12:12:12'
    },
    {
      id: 2,
      merchantName: '商家名称商家名称',
      accountType: 'wechat',
      bankName: '',
      accountNumber: '123212321313213',
      serviceFeeRate: 5,
      status: 'active',
      createTime: '2023-12-12 12:12:12',
      updateTime: '2023-12-12 12:12:12'
    },
    {
      id: 3,
      merchantName: '商家名称商家名称',
      accountType: 'alipay',
      bankName: '',
      accountNumber: '123212321313213',
      serviceFeeRate: 5,
      status: 'disabled',
      createTime: '2023-12-12 12:12:12',
      updateTime: '2023-12-12 12:12:12'
    },
    {
      id: 4,
      merchantName: '清风超市',
      accountType: 'union',
      bankName: '中国工商银行',
      accountNumber: '987654321098765',
      serviceFeeRate: 3,
      status: 'active',
      createTime: '2023-12-13 10:30:00',
      updateTime: '2023-12-13 10:30:00'
    }
  ]

  // 计算当前页数据
  const currentPageData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, pagination.current, pagination.pageSize])

  // 检查并修正分页状态
  useEffect(() => {
    if (filteredData.length > 0) {
      const totalPages = Math.ceil(filteredData.length / pagination.pageSize)
      if (pagination.current > totalPages) {
        setPagination(prev => ({ ...prev, current: totalPages }))
      }
    }
  }, [filteredData.length, pagination.current, pagination.pageSize])

  useEffect(() => {
    setAllData(mockWithdrawAccountData)
    setFilteredData(mockWithdrawAccountData)
    setPagination(prev => ({ ...prev, total: mockWithdrawAccountData.length }))
  }, [])

  // 筛选数据
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false
      }

      return true
    })
  }

  // 搜索处理
  const handleSearch = (values) => {
    console.log('搜索条件:', values)
    setLoading(true)
    setSearchParams(values)

    setTimeout(() => {
      const filtered = filterData(allData, values)
      setFilteredData(filtered)
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }))
      setLoading(false)
    }, 500)
  }

  // 重置处理
  const handleReset = () => {
    form.resetFields()
    setSearchParams({})
    setFilteredData(allData)
    setPagination(prev => ({ ...prev, current: 1, total: allData.length }))
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))
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
      onOk: () => {
        const updatedData = allData.map(item =>
          item.id === record.id ? { ...item, status: newStatus, updateTime: new Date().toLocaleString() } : item
        )
        setAllData(updatedData)

        const filtered = filterData(updatedData, searchParams)
        setFilteredData(filtered)
        setPagination(prev => ({ ...prev, total: filtered.length }))

        message.success(`${actionText}成功`)
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
      onOk: () => {
        const updatedData = allData.filter(item => item.id !== record.id)
        setAllData(updatedData)

        const filtered = filterData(updatedData, searchParams)
        setFilteredData(filtered)
        setPagination(prev => ({ ...prev, total: filtered.length }))

        message.success('删除成功')
      }
    })
  }

  // 保存模态框数据
  const handleModalOk = (values) => {
    if (modalType === 'add') {
      const newRecord = {
        id: Date.now(),
        ...values,
        status: 'active',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString()
      }
      const updatedData = [...allData, newRecord]
      setAllData(updatedData)

      const filtered = filterData(updatedData, searchParams)
      setFilteredData(filtered)
      setPagination(prev => ({ ...prev, total: filtered.length }))

      message.success('添加成功')
    } else {
      const updatedData = allData.map(item =>
        item.id === selectedRecord.id ? { ...item, ...values, updateTime: new Date().toLocaleString() } : item
      )
      setAllData(updatedData)

      const filtered = filterData(updatedData, searchParams)
      setFilteredData(filtered)

      message.success('修改成功')
    }
    setModalVisible(false)
  }

  // 关闭模态框
  const handleModalCancel = () => {
    setModalVisible(false)
    setSelectedRecord(null)
    modalForm.resetFields()
  }

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      const filtered = filterData(allData, searchParams)
      setFilteredData(filtered)
      setPagination(prev => ({ ...prev, total: filtered.length }))
      setLoading(false)
    }, 500)
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
        const typeMap = {
          union: '银联',
          wechat: '微信',
          alipay: '支付宝',
          bank: '银行卡'
        }
        return typeMap[type] || type
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
        const statusMap = {
          active: { color: 'green', text: '正常' },
          disabled: { color: 'red', text: '禁用' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
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
                  <Select placeholder="搜索" showSearch style={{ width: '100%' }}>
                    <Option value="商家名称商家名称">商家名称商家名称</Option>
                    <Option value="清风超市">清风超市</Option>
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
            dataSource={currentPageData}
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
              pageSizeOptions={['10', '20', '50', '100']}
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
                  rules={[{ required: true, message: '请输入商家名称' }]}
                >
                  <Input placeholder="请输入商家名称" />
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