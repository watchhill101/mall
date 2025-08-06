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
import dayjs from 'dayjs'
import MerchantLayout from './MerchantLayout'
import merchantWithdrawAPI, { WITHDRAW_STATUS_LABELS } from '@/api/merchantWithdraw'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const MerchantWithdraw = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [withdrawData, setWithdrawData] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [forceUpdate, setForceUpdate] = useState(0) // 用于强制重新渲染

  // 审核模态框相关状态
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [auditAction, setAuditAction] = useState('') // 'approve' 或 'reject'

  // 数据加载函数（不使用useCallback，避免依赖问题）
  const loadWithdrawList = async (params = {}) => {
    try {
      setLoading(true)

      // 构建查询参数
      const queryParams = {
        page: params.page || pagination.current,
        pageSize: params.pageSize || pagination.pageSize
      }

      // 添加搜索条件
      const searchConditions = params.searchParams || searchParams
      if (searchConditions.merchantName) queryParams.merchantName = searchConditions.merchantName
      if (searchConditions.contactPhone) queryParams.contactPhone = searchConditions.contactPhone
      if (searchConditions.status) queryParams.status = searchConditions.status
      if (searchConditions.applicationTime && searchConditions.applicationTime.length === 2) {
        queryParams.startDate = searchConditions.applicationTime[0].format('YYYY-MM-DD')
        queryParams.endDate = searchConditions.applicationTime[1].format('YYYY-MM-DD')
      }

      console.log('📤 发送商家提现列表请求:', queryParams)
      const response = await merchantWithdrawAPI.getMerchantWithdrawList(queryParams)

      if (response && response.data) {
        // 处理数据，确保每条记录都有必要的字段
        const processedData = response.data.list.map(item => ({
          ...item,
          key: item._id,
          id: item._id,
        }))

        setWithdrawData(processedData)
        setPagination(prev => ({
          ...prev,
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: response.data.pagination?.total || 0
        }))
        setForceUpdate(prev => prev + 1) // 强制重新渲染
        console.log('✅ 获取商家提现列表成功，共', processedData.length, '条记录')
      }
    } catch (error) {
      console.error('❌ 获取商家提现列表失败:', error)
      message.error('获取商家提现列表失败: ' + (error.message || '网络错误'))
      setWithdrawData([])
    } finally {
      setLoading(false)
    }
  }

  // 初始化数据获取
  useEffect(() => {
    loadWithdrawList({ page: 1, pageSize: 10 })
  }, []) // 空依赖数组，只在组件挂载时执行一次

  // 当前页数据就是从API获取的数据，不需要再次切片
  const currentPageData = withdrawData

  // 删除客户端筛选逻辑，改为服务端筛选

  // 搜索处理
  const handleSearch = async (values) => {
    try {
      setSearchParams(values)
      setPagination(prev => ({ ...prev, current: 1 })) // 重置到第一页

      await loadWithdrawList({
        page: 1,
        pageSize: pagination.pageSize,
        searchParams: values
      })
      message.success('查询完成')
    } catch (error) {
      message.error('查询失败: ' + error.message)
    }
  }

  // 重置处理
  const handleReset = async () => {
    try {
      form.resetFields()
      setSearchParams({})
      setPagination(prev => ({ ...prev, current: 1 }))

      await loadWithdrawList({
        page: 1,
        pageSize: pagination.pageSize,
        searchParams: {}
      })
      message.info('已重置搜索条件')
    } catch (error) {
      message.error('重置失败: ' + error.message)
    }
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))

    loadWithdrawList({
      page: page,
      pageSize: pageSize || pagination.pageSize,
      searchParams: searchParams
    })
  }

  // 审核处理
  const handleAudit = (record) => {
    setSelectedRecord(record)
    setAuditModalVisible(true)
  }

  // 确认审核
  const handleAuditConfirm = async (action) => {
    try {
      setLoading(true)
      const actionText = action === 'approve' ? '通过' : '拒绝'

      await merchantWithdrawAPI.auditWithdrawApplication(selectedRecord.id, {
        action,
        remark: `管理员${actionText}提现申请`
      })

      message.success(`${actionText}成功`)
      setAuditModalVisible(false)
      setSelectedRecord(null)

      // 刷新列表数据
      await loadWithdrawList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        searchParams: searchParams
      })
    } catch (error) {
      console.error('❌ 审核失败:', error)
      message.error('审核失败: ' + (error.message || '网络错误'))
    } finally {
      setLoading(false)
    }
  }

  // 关闭审核模态框
  const handleAuditModalCancel = () => {
    setAuditModalVisible(false)
    setSelectedRecord(null)
  }

  // 刷新数据
  const handleRefresh = async () => {
    try {
      await loadWithdrawList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        searchParams: searchParams
      })
      message.info('数据已刷新')
    } catch (error) {
      message.error('刷新失败: ' + error.message)
    }
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
          reviewing: { color: 'blue', text: '审核中' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
          cancelled: { color: 'default', text: '已撤销' },
          processing: { color: 'cyan', text: '处理中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: WITHDRAW_STATUS_LABELS[status] || status }
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
            key={forceUpdate} // 确保数据更新时重新渲染
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
              pageSizeOptions={['2', '5', '10', '20', '50', '100']}
              defaultPageSize={2}
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