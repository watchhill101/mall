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
import merchantApplicationAPI from '../../api/merchantApplication'
import { maskPhone } from '@/utils/maskUtils'

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

  // 加载数据
  const loadData = async (params = {}) => {
    try {
      setLoading(true)
      const response = await merchantApplicationAPI.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      })

      if (response.code === 200) {
        setAllData(response.data.list)
        setFilteredData(response.data.list)
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          current: response.data.pagination.current
        }))
      } else {
        message.error(response.message || '获取数据失败')
      }
    } catch (error) {
      console.error('获取商家申请列表失败:', error)
      message.error('获取数据失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  // 当前页数据就是filteredData，因为后端已经处理了分页
  const currentPageData = filteredData



  useEffect(() => {
    loadData()
  }, [])



  // 搜索处理
  const handleSearch = async (values) => {
    console.log('搜索条件:', values)
    setSearchParams(values)

    // 处理日期范围
    const searchParams = { ...values }
    if (values.auditTime && values.auditTime.length === 2) {
      searchParams.auditTime = JSON.stringify([
        values.auditTime[0].format('YYYY-MM-DD'),
        values.auditTime[1].format('YYYY-MM-DD')
      ])
    }

    await loadData(searchParams)
  }

  // 重置处理
  const handleReset = () => {
    form.resetFields()
    setSearchParams({})
    setPagination(prev => ({ ...prev, current: 1 }))
    loadData()
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))

    // 重新加载数据
    loadData({
      ...searchParams,
      page,
      pageSize: pageSize || pagination.pageSize
    })
  }

  // 审核处理
  const handleAudit = (record, action) => {
    setSelectedRecord(record)
    setAuditAction(action)
    setAuditModalVisible(true)
  }

  // 确认审核
  const handleAuditConfirm = async () => {
    try {
      const actionText = auditAction === 'approve' ? '通过' : '拒绝'

      const auditData = {
        action: auditAction,
        reviewResult: `申请${actionText}`,
        rejectionReason: auditAction === 'reject' ? `申请${actionText}` : undefined
      }

      const response = await merchantApplicationAPI.audit(selectedRecord.id, auditData)

      if (response.code === 200) {
        message.success(`${actionText}成功`)
        // 重新加载数据
        await loadData(searchParams)
      } else {
        message.error(response.message || `${actionText}失败`)
      }
    } catch (error) {
      console.error('审核失败:', error)
      message.error('审核失败，请检查网络连接')
    } finally {
      setAuditModalVisible(false)
      setSelectedRecord(null)
      setAuditAction('')
    }
  }

  // 关闭审核模态框
  const handleAuditModalCancel = () => {
    setAuditModalVisible(false)
    setSelectedRecord(null)
    setAuditAction('')
  }

  // 刷新数据
  const handleRefresh = () => {
    loadData(searchParams)
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
          <div style={{ color: '#999', fontSize: '12px' }}>
            <Tooltip title={record.contactPhone || '暂无手机号'}>
              {maskPhone(record.contactPhone)}
            </Tooltip>
          </div>
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
                <p><strong>联系电话：</strong>{maskPhone(selectedRecord.contactPhone)}</p>
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