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
  message,
  Statistic,
  Divider
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FullscreenOutlined,
  ColumnHeightOutlined,
  DownloadOutlined,
  FileExcelOutlined
} from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const SettlementBill = () => {
  const [currentForm] = Form.useForm()
  const [historyForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [currentStats, setCurrentStats] = useState({
    orderCount: 10,
    totalAmount: 3400,
    refundOrderCount: 1,
    refundAmount: 340,
    rechargeAmount: 3400,
    salesAmount: 3060,
    salesCount: 9,
    wechatSales: { amount: 2060, count: 5 },
    balanceSales: { amount: 2060, count: 5 },
    totalRefundAmount: 340,
    totalRefundCount: 1,
    wechatRefund: { amount: 2060, count: 5 },
    balanceRefund: { amount: 2060, count: 5 }
  })

  const [historyData, setHistoryData] = useState([])
  const [filteredHistoryData, setFilteredHistoryData] = useState([])
  const [historySearchParams, setHistorySearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 模拟历史账单数据
  const mockHistoryData = [
    {
      id: 1,
      date: '2024-05-16',
      merchantName: '商家名称商家名称',
      orderCount: 0,
      orderAmount: 0,
      refundOrderCount: 0,
      refundAmount: 0,
      wechatSales: 1,
      wechatSalesAmount: 1,
      wechatRefund: 1,
      wechatRefundAmount: 1
    },
    {
      id: 2,
      date: '2024-05-15',
      merchantName: '商家名称商家名称',
      orderCount: 0,
      orderAmount: 0,
      refundOrderCount: 0,
      refundAmount: 0,
      wechatSales: 2,
      wechatSalesAmount: 3,
      wechatRefund: 1,
      wechatRefundAmount: 6
    },
    {
      id: 3,
      date: '2024-05-14',
      merchantName: '商家名称商家名称',
      orderCount: 0,
      orderAmount: 0,
      refundOrderCount: 0,
      refundAmount: 0,
      wechatSales: 4,
      wechatSalesAmount: 2,
      wechatRefund: 6,
      wechatRefundAmount: ''
    },
    {
      id: 4,
      date: '2024-05-13',
      merchantName: '商家名称商家名称',
      orderCount: 0,
      orderAmount: 0,
      refundOrderCount: 0,
      refundAmount: 0,
      wechatSales: '',
      wechatSalesAmount: '',
      wechatRefund: 0,
      wechatRefundAmount: ''
    }
  ]

  // 计算当前页数据
  const currentPageData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredHistoryData.slice(startIndex, endIndex)
  }, [filteredHistoryData, pagination.current, pagination.pageSize])

  useEffect(() => {
    setHistoryData(mockHistoryData)
    setFilteredHistoryData(mockHistoryData)
    setPagination(prev => ({ ...prev, total: mockHistoryData.length }))
  }, [])

  // 筛选历史数据
  const filterHistoryData = (data, params) => {
    return data.filter(item => {
      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false
      }

      // 按日期范围筛选
      if (params.dateRange && params.dateRange.length === 2) {
        const [startDate, endDate] = params.dateRange
        const itemDate = new Date(item.date)

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

  // 当前营业情况查询
  const handleCurrentSearch = (values) => {
    console.log('当前营业情况查询:', values)
    setLoading(true)

    setTimeout(() => {
      // 这里可以调用API获取当前营业数据
      setLoading(false)
      message.success('查询成功')
    }, 500)
  }

  // 历史账单查询
  const handleHistorySearch = (values) => {
    console.log('历史账单查询:', values)
    setHistoryLoading(true)
    setHistorySearchParams(values)

    setTimeout(() => {
      const filtered = filterHistoryData(historyData, values)
      setFilteredHistoryData(filtered)
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }))
      setHistoryLoading(false)
    }, 500)
  }

  // 重置历史查询
  const handleHistoryReset = () => {
    historyForm.resetFields()
    setHistorySearchParams({})
    setFilteredHistoryData(historyData)
    setPagination(prev => ({ ...prev, current: 1, total: historyData.length }))
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))
  }

  // 导出数据
  const handleExport = () => {
    console.log('导出历史账单数据')
    message.success('导出成功')
  }

  // 打印操作
  const handlePrint = (record) => {
    console.log('打印账单:', record)
    message.success('打印成功')
  }

  // 历史表格列定义
  const historyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150
    },
    {
      title: '订单总数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      align: 'center'
    },
    {
      title: '订单总额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      width: 100,
      align: 'right',
      render: (amount) => amount || 0
    },
    {
      title: '退款订单',
      dataIndex: 'refundOrderCount',
      key: 'refundOrderCount',
      width: 100,
      align: 'center'
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 100,
      align: 'right',
      render: (amount) => amount || 0
    },
    {
      title: '微信',
      children: [
        {
          title: '销量',
          dataIndex: 'wechatSales',
          key: 'wechatSales',
          width: 80,
          align: 'center',
          render: (value) => value || ''
        },
        {
          title: '销售额',
          dataIndex: 'wechatSalesAmount',
          key: 'wechatSalesAmount',
          width: 80,
          align: 'center',
          render: (value) => value || ''
        },
        {
          title: '销量',
          dataIndex: 'wechatRefund',
          key: 'wechatRefund',
          width: 80,
          align: 'center',
          render: (value) => value || ''
        },
        {
          title: '销售额',
          dataIndex: 'wechatRefundAmount',
          key: 'wechatRefundAmount',
          width: 80,
          align: 'center',
          render: (value) => value || ''
        }
      ]
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handlePrint(record)}>
          打印
        </Button>
      )
    }
  ]

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        <Row gutter={24}>
          {/* 左侧：当前营业情况 */}
          <Col span={11}>
            <Card title="当前营业情况" style={{ height: '100%' }}>
              {/* 查询表单 */}
              <Form form={currentForm} onFinish={handleCurrentSearch} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="日期范围" name="dateRange">
                      <RangePicker
                        style={{ width: '100%' }}
                        placeholder={['开始日期', '结束日期']}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="所属商家" name="merchantName">
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value="商家名称商家名称">商家名称商家名称</Option>
                        <Option value="清风超市">清风超市</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label=" " colon={false}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{ marginTop: '6px' }}
                      >
                        查询
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              <Divider />

              {/* 统计数据 */}
              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Statistic title="订单总数" value={currentStats.orderCount} />
                </Col>
                <Col span={8}>
                  <Statistic title="订单总金额" value={currentStats.totalAmount} />
                </Col>
                <Col span={8}>
                  <Statistic title="退款订单" value={currentStats.refundOrderCount} />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                  <Statistic title="退款金额" value={currentStats.refundAmount} />
                </Col>
                <Col span={8}>
                  <Statistic title="充值金额" value={currentStats.rechargeAmount} />
                </Col>
              </Row>

              <Divider />

              {/* 销售和退款详情 */}
              <div style={{ marginBottom: '16px' }}>
                <Title level={5} style={{ color: '#52c41a' }}>
                  总销售金额：{currentStats.salesAmount}元，{currentStats.salesCount}笔
                </Title>
                <div style={{ paddingLeft: '16px' }}>
                  <p>1. 微信：{currentStats.wechatSales.amount}元，{currentStats.wechatSales.count}笔</p>
                  <p>2. 余额：{currentStats.balanceSales.amount}元，{currentStats.balanceSales.count}笔</p>
                </div>
              </div>

              <div>
                <Title level={5} style={{ color: '#f5222d' }}>
                  总退款金额：{currentStats.totalRefundAmount}元，{currentStats.totalRefundCount}笔
                </Title>
                <div style={{ paddingLeft: '16px' }}>
                  <p>1. 微信：{currentStats.wechatRefund.amount}元，{currentStats.wechatRefund.count}笔</p>
                  <p>2. 余额：{currentStats.balanceRefund.amount}元，{currentStats.balanceRefund.count}笔</p>
                </div>
              </div>
            </Card>
          </Col>

          {/* 右侧：历史账单查询 */}
          <Col span={13}>
            <Card title="历史账单查询" style={{ height: '100%' }}>
              {/* 查询表单 */}
              <Form form={historyForm} onFinish={handleHistorySearch} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="所属商家" name="merchantName">
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value="商家名称商家名称">商家名称商家名称</Option>
                        <Option value="清风超市">清风超市</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="日期范围" name="dateRange">
                      <RangePicker
                        style={{ width: '100%' }}
                        placeholder={['开始日期', '结束日期']}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label=" " colon={false}>
                      <Space style={{ marginTop: '6px' }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={historyLoading}
                        >
                          查询
                        </Button>
                        <Button onClick={handleHistoryReset}>
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              {/* 导出按钮 */}
              <div style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExport}
                  style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                >
                  导出
                </Button>
              </div>

              {/* 操作工具栏 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Space>
                  <Tooltip title="刷新">
                    <Button type="text" icon={<ReloadOutlined />} />
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

              {/* 历史数据表格 */}
              <Table
                columns={historyColumns}
                dataSource={currentPageData}
                rowKey="id"
                pagination={false}
                loading={historyLoading}
                scroll={{ x: 800 }}
                size="small"
                bordered
              />

              {/* 分页 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px'
              }}>
                <div>
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
          </Col>
        </Row>
      </div>
    </MerchantLayout>
  )
}

export default SettlementBill 