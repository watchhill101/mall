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

const MerchantApplication = () => {
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

  // 模拟商家申请数据
  const mockApplicationData = [
    {
      id: 1,
      contactPerson: '木鱼',
      contactPhone: '18979881656',
      merchantType: '文旅',
      city: '江西省南昌市红谷滩区',
      remark1: '备注内容备注内容',
      remark2: '备注内容备注内容',
      status: 'rejected',
      applicationTime: '2023-12-12 12:12:12',
      auditor: '木鱼',
      auditTime: '2023-12-12 12:12:12'
    },
    {
      id: 2,
      contactPerson: '木鱼',
      contactPhone: '18979881656',
      merchantType: '家政',
      city: '江西省南昌市红谷滩区',
      remark1: '备注内容备注内容',
      remark2: '备注内容备注内容',
      status: 'approved',
      applicationTime: '2023-12-12 12:12:12',
      auditor: '木鱼',
      auditTime: '2023-12-12 12:12:12'
    },
    {
      id: 3,
      contactPerson: '木鱼',
      contactPhone: '18979881656',
      merchantType: '零售',
      city: '江西省南昌市红谷滩区',
      remark1: '备注内容备注内容',
      remark2: '备注内容备注内容',
      status: 'pending',
      applicationTime: '2023-12-12 12:12:12',
      auditor: '',
      auditTime: ''
    },
    {
      id: 4,
      contactPerson: '张三',
      contactPhone: '13800138000',
      merchantType: '餐饮',
      city: '江西省九江市浔阳区',
      remark1: '备注内容备注内容',
      remark2: '备注内容备注内容',
      status: 'pending',
      applicationTime: '2023-12-13 10:30:00',
      auditor: '',
      auditTime: ''
    },
    {
      id: 5,
      contactPerson: '李四',
      contactPhone: '13900139000',
      merchantType: '教育',
      city: '江西省上饶市信州区',
      remark1: '备注内容备注内容',
      remark2: '备注内容备注内容',
      status: 'pending',
      applicationTime: '2023-12-14 14:20:00',
      auditor: '',
      auditTime: ''
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
    setAllData(mockApplicationData)
    setFilteredData(mockApplicationData)
    setPagination(prev => ({ ...prev, total: mockApplicationData.length }))
  }, [])

  // 筛选数据
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按联系电话筛选
      if (params.contactPhone && !item.contactPhone.includes(params.contactPhone)) {
        return false
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false
      }

      // 按审核时间范围筛选
      if (params.auditTime && params.auditTime.length === 2) {
        const [startDate, endDate] = params.auditTime
        const itemDate = new Date(item.auditTime)

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
  const handleAudit = (record, action) => {
    setSelectedRecord(record)
    setAuditAction(action)
    setAuditModalVisible(true)
  }

  // 确认审核
  const handleAuditConfirm = () => {
    const newStatus = auditAction === 'approve' ? 'approved' : 'rejected'
    const actionText = auditAction === 'approve' ? '通过' : '拒绝'

    const updatedData = allData.map(item =>
      item.id === selectedRecord.id ? {
        ...item,
        status: newStatus,
        auditor: '木鱼', // 这里应该是当前登录用户
        auditTime: new Date().toLocaleString()
      } : item
    )
    setAllData(updatedData)

    const filtered = filterData(updatedData, searchParams)
    setFilteredData(filtered)
    setPagination(prev => ({ ...prev, total: filtered.length }))

    message.success(`${actionText}成功`)
    setAuditModalVisible(false)
    setSelectedRecord(null)
    setAuditAction('')
  }

  // 关闭审核模态框
  const handleAuditModalCancel = () => {
    setAuditModalVisible(false)
    setSelectedRecord(null)
    setAuditAction('')
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '联系人',
      key: 'contact',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.contactPerson}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{record.contactPhone}</div>
        </div>
      )
    },
    {
      title: '商家类型',
      dataIndex: 'merchantType',
      key: 'merchantType',
      width: 100,
      align: 'center'
    },
    {
      title: '所在城市',
      dataIndex: 'city',
      key: 'city',
      width: 200
    },
    {
      title: '备注',
      dataIndex: 'remark1',
      key: 'remark1',
      width: 150
    },
    {
      title: '备注',
      dataIndex: 'remark2',
      key: 'remark2',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusMap = {
          pending: { color: 'blue', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' }
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
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
      width: 100,
      render: (auditor) => auditor || '-'
    },
    {
      title: '审核时间',
      dataIndex: 'auditTime',
      key: 'auditTime',
      width: 150,
      render: (time) => time || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <Space>
              <Button
                type="link"
                size="small"
                onClick={() => handleAudit(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleAudit(record, 'reject')}
              >
                拒绝
              </Button>
            </Space>
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
              <Col span={8}>
                <Form.Item label="审核时间" name="auditTime">
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="联系电话" name="contactPhone">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="状态" name="status">
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Option value="pending">待审核</Option>
                    <Option value="approved">已通过</Option>
                    <Option value="rejected">已拒绝</Option>
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
              商家申请管理
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
            scroll={{ x: 1400 }}
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

        {/* 审核确认模态框 */}
        <Modal
          title={`确认${auditAction === 'approve' ? '通过' : '拒绝'}申请`}
          open={auditModalVisible}
          onCancel={handleAuditModalCancel}
          onOk={handleAuditConfirm}
          okText={auditAction === 'approve' ? '通过' : '拒绝'}
          cancelText="取消"
          okType={auditAction === 'approve' ? 'primary' : 'danger'}
        >
          {selectedRecord && (
            <div>
              <p>确定要{auditAction === 'approve' ? '通过' : '拒绝'}以下申请吗？</p>
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginTop: '12px' }}>
                <p><strong>申请人：</strong>{selectedRecord.contactPerson}</p>
                <p><strong>联系电话：</strong>{selectedRecord.contactPhone}</p>
                <p><strong>商家类型：</strong>{selectedRecord.merchantType}</p>
                <p><strong>所在城市：</strong>{selectedRecord.city}</p>
                <p><strong>申请时间：</strong>{selectedRecord.applicationTime}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MerchantLayout>
  )
}

export default MerchantApplication 