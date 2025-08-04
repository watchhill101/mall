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
  DatePicker,
  Modal,
  message
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FullscreenOutlined,
  ColumnHeightOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const MerchantWithdraw = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 审核模态框相关状态
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [auditAction, setAuditAction] = useState('') // 'approve' 或 'reject'

  // 模拟商家提现数据
  const mockWithdrawData = [
    {
      id: 1,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      contactPhone: '18979881656',
      accountType: 'wechat',
      withdrawAmount: 200,
      serviceFeeRate: 2,
      receivedAmount: 196,
      status: 'pending',
      applicationTime: '2023-12-12 14:23:23',
      reviewTime: '',
      reviewAccount: '财务'
    },
    {
      id: 2,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      contactPhone: '18979881656',
      accountType: 'alipay',
      withdrawAmount: 200,
      serviceFeeRate: 2,
      receivedAmount: 196,
      status: 'rejected',
      applicationTime: '2023-12-12 14:23:23',
      reviewTime: '2023-12-12 14:23:23',
      reviewAccount: '财务'
    },
    {
      id: 3,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      contactPhone: '18979881656',
      accountType: 'wechat',
      withdrawAmount: 200,
      serviceFeeRate: 2,
      receivedAmount: 196,
      status: 'cancelled',
      applicationTime: '2023-12-12 14:23:23',
      reviewTime: '',
      reviewAccount: '财务'
    },
    {
      id: 4,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      contactPhone: '18979881656',
      accountType: 'alipay',
      withdrawAmount: 200,
      serviceFeeRate: 2,
      receivedAmount: 196,
      status: 'approved',
      applicationTime: '2023-12-12 14:23:23',
      reviewTime: '2023-12-12 14:23:23',
      reviewAccount: 'admin'
    },
    {
      id: 5,
      orderNo: 'SJTX-123313',
      merchantName: '清风超市',
      contactPhone: '13800138000',
      accountType: 'wechat',
      withdrawAmount: 500,
      serviceFeeRate: 2,
      receivedAmount: 490,
      status: 'pending',
      applicationTime: '2023-12-13 10:30:00',
      reviewTime: '',
      reviewAccount: '财务'
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
    setAllData(mockWithdrawData)
    setFilteredData(mockWithdrawData)
    setPagination(prev => ({ ...prev, total: mockWithdrawData.length }))
  }, [])

  // 筛选数据
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false
      }

      // 按联系电话筛选
      if (params.contactPhone && !item.contactPhone.includes(params.contactPhone)) {
        return false
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false
      }

      // 按申请时间范围筛选
      if (params.applicationTime && params.applicationTime.length === 2) {
        const [startDate, endDate] = params.applicationTime
        const itemDate = new Date(item.applicationTime)

        if (startDate && itemDate < startDate.toDate()) {
          return false
        }

        if (endDate && itemDate > endDate.toDate()) {
          return false
        }
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

  // 审核处理
  const handleAudit = (record) => {
    setSelectedRecord(record)
    setAuditModalVisible(true)
  }

  // 确认审核
  const handleAuditConfirm = (action) => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const actionText = action === 'approve' ? '通过' : '拒绝'

    const updatedData = allData.map(item =>
      item.id === selectedRecord.id ? {
        ...item,
        status: newStatus,
        reviewTime: new Date().toLocaleString(),
        reviewAccount: 'admin' // 这里应该是当前登录用户
      } : item
    )
    setAllData(updatedData)

    const filtered = filterData(updatedData, searchParams)
    setFilteredData(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length }))

    message.success(`${actionText}成功`)
    setAuditModalVisible(false)
    setSelectedRecord(null)
  }

  // 关闭审核模态框
  const handleAuditModalCancel = () => {
    setAuditModalVisible(false)
    setSelectedRecord(null)
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
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 140
    },
    {
      title: '账号类型',
      dataIndex: 'accountType',
      key: 'accountType',
      width: 100,
      align: 'center',
      render: (type) => {
        const typeMap = {
          wechat: { color: 'green', text: '微信' },
          alipay: { color: 'blue', text: '支付宝' },
          bank: { color: 'orange', text: '银行卡' }
        }
        const typeInfo = typeMap[type] || { color: 'default', text: type }
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
      }
    },
    {
      title: '提现金额',
      dataIndex: 'withdrawAmount',
      key: 'withdrawAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '平台结算服务费',
      key: 'serviceFee',
      width: 150,
      align: 'center',
      render: (_, record) => `${record.serviceFeeRate}%`
    },
    {
      title: '到账金额',
      dataIndex: 'receivedAmount',
      key: 'receivedAmount',
      width: 120,
      align: 'right',
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          ¥{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'cyan', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
          cancelled: { color: 'default', text: '已撤销' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '申请时间',
      dataIndex: 'applicationTime',
      key: 'applicationTime',
      width: 150
    },
    {
      title: '审核时间',
      dataIndex: 'reviewTime',
      key: 'reviewTime',
      width: 150,
      render: (time) => time || '-'
    },
    {
      title: '审核帐号',
      dataIndex: 'reviewAccount',
      key: 'reviewAccount',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => handleAudit(record)}
            >
              审核
            </Button>
          )
        }
        return '-'
      }
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
                <Form.Item label="所属商家" name="merchantName">
                  <Input placeholder="搜索" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="申请时间" name="applicationTime">
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="联系电话" name="contactPhone">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="状态" name="status">
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Option value="pending">待审核</Option>
                    <Option value="approved">已通过</Option>
                    <Option value="rejected">已拒绝</Option>
                    <Option value="cancelled">已撤销</Option>
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
              商家提现管理
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
            scroll={{ x: 1500 }}
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

        {/* 审核模态框 */}
        <Modal
          title="审核提现申请"
          open={auditModalVisible}
          onCancel={handleAuditModalCancel}
          footer={null}
          width={600}
        >
          {selectedRecord && (
            <div>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>订单号：</strong>{selectedRecord.orderNo}</p>
                    <p><strong>商家名称：</strong>{selectedRecord.merchantName}</p>
                    <p><strong>联系电话：</strong>{selectedRecord.contactPhone}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>提现金额：</strong>¥{selectedRecord.withdrawAmount.toFixed(2)}</p>
                    <p><strong>服务费率：</strong>{selectedRecord.serviceFeeRate}%</p>
                    <p><strong>到账金额：</strong>¥{selectedRecord.receivedAmount.toFixed(2)}</p>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <p><strong>申请时间：</strong>{selectedRecord.applicationTime}</p>
                  </Col>
                </Row>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Space size="large">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleAuditConfirm('approve')}
                  >
                    通过
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleAuditConfirm('reject')}
                  >
                    拒绝
                  </Button>
                  <Button onClick={handleAuditModalCancel}>
                    取消
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MerchantLayout>
  )
}

export default MerchantWithdraw 