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
  DownloadOutlined,
  FileExcelOutlined
} from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const SettlementOrder = () => {
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

  // 详情模态框相关状态
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // 模拟结算订单数据
  const mockSettlementOrderData = [
    {
      id: 1,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      networkPoint: '网点名称网点名称',
      productName: '商品名称商品名称',
      specifications: '规格名称规格名称',
      supplyPrice: 196,
      quantity: 1,
      totalPrice: 196,
      settlementStatus: 'unsettled',
      paymentTime: '2023-12-12 14:23:23',
      settlementTime: ''
    },
    {
      id: 2,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      networkPoint: '网点名称网点名称',
      productName: '商品名称商品名称',
      specifications: '规格名称规格名称',
      supplyPrice: 196,
      quantity: 1,
      totalPrice: 196,
      settlementStatus: 'settled',
      paymentTime: '2023-12-12 14:23:23',
      settlementTime: ''
    },
    {
      id: 3,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      networkPoint: '网点名称网点名称',
      productName: '商品名称商品名称',
      specifications: '规格名称规格名称',
      supplyPrice: 196,
      quantity: 1,
      totalPrice: 196,
      settlementStatus: 'settled',
      paymentTime: '2023-12-12 14:23:23',
      settlementTime: '2023-12-12 14:23:23'
    },
    {
      id: 4,
      orderNo: 'SJTX-123312',
      merchantName: '商家名称商家名称',
      networkPoint: '网点名称网点名称',
      productName: '商品名称商品名称',
      specifications: '规格名称规格名称',
      supplyPrice: 196,
      quantity: 1,
      totalPrice: 196,
      settlementStatus: 'settled',
      paymentTime: '2023-12-12 14:23:23',
      settlementTime: '2023-12-12 14:23:23'
    },
    {
      id: 5,
      orderNo: 'SJTX-123313',
      merchantName: '清风超市',
      networkPoint: '清风网点一号店',
      productName: '苹果iPhone15',
      specifications: '128GB 黑色',
      supplyPrice: 5999,
      quantity: 2,
      totalPrice: 11998,
      settlementStatus: 'unsettled',
      paymentTime: '2023-12-13 10:30:00',
      settlementTime: ''
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
    setAllData(mockSettlementOrderData)
    setFilteredData(mockSettlementOrderData)
    setPagination(prev => ({ ...prev, total: mockSettlementOrderData.length }))
  }, [])

  // 筛选数据
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false
      }

      // 按网点筛选
      if (params.networkPoint && !item.networkPoint.toLowerCase().includes(params.networkPoint.toLowerCase())) {
        return false
      }

      // 按订单编号筛选
      if (params.orderNo && !item.orderNo.toLowerCase().includes(params.orderNo.toLowerCase())) {
        return false
      }

      // 按商品名称筛选
      if (params.productName && !item.productName.toLowerCase().includes(params.productName.toLowerCase())) {
        return false
      }

      // 按状态筛选
      if (params.settlementStatus && item.settlementStatus !== params.settlementStatus) {
        return false
      }

      // 按支付时间范围筛选
      if (params.paymentTime && params.paymentTime.length === 2) {
        const [startDate, endDate] = params.paymentTime
        const itemDate = new Date(item.paymentTime)

        if (startDate && itemDate < startDate.toDate()) {
          return false
        }

        if (endDate && itemDate > endDate.toDate()) {
          return false
        }
      }

      // 按结算时间范围筛选
      if (params.settlementTime && params.settlementTime.length === 2) {
        const [startDate, endDate] = params.settlementTime
        if (item.settlementTime) {
          const itemDate = new Date(item.settlementTime)

          if (startDate && itemDate < startDate.toDate()) {
            return false
          }

          if (endDate && itemDate > endDate.toDate()) {
            return false
          }
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

  // 导出数据
  const handleExport = () => {
    console.log('导出结算订单数据')
    message.success('导出成功')
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
      width: 150,
      fixed: 'left'
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150
    },
    {
      title: '所属网点',
      dataIndex: 'networkPoint',
      key: 'networkPoint',
      width: 150
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150
    },
    {
      title: '规格',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 150
    },
    {
      title: '供货价',
      dataIndex: 'supplyPrice',
      key: 'supplyPrice',
      width: 100,
      align: 'right',
      render: (price) => `¥${price.toFixed(2)}`
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center'
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (price) => (
        <span style={{ fontWeight: 'bold' }}>
          ¥{price.toFixed(2)}
        </span>
      )
    },
    {
      title: '结算状态',
      dataIndex: 'settlementStatus',
      key: 'settlementStatus',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusMap = {
          unsettled: { color: 'orange', text: '未结算' },
          settled: { color: 'cyan', text: '已结算' },
          failed: { color: 'red', text: '结算失败' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      key: 'paymentTime',
      width: 150
    },
    {
      title: '结算时间',
      dataIndex: 'settlementTime',
      key: 'settlementTime',
      width: 150,
      render: (time) => time || '-'
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
                  <Select placeholder="搜索" showSearch style={{ width: '100%' }}>
                    <Option value="商家名称商家名称">商家名称商家名称</Option>
                    <Option value="清风超市">清风超市</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="所属网点" name="networkPoint">
                  <Select placeholder="搜索" showSearch style={{ width: '100%' }}>
                    <Option value="网点名称网点名称">网点名称网点名称</Option>
                    <Option value="清风网点一号店">清风网点一号店</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="订单编号" name="orderNo">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="商品名称" name="productName">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="支付时间" name="paymentTime">
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="结算时间" name="settlementTime">
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="状态" name="settlementStatus">
                  <Select placeholder="搜索" style={{ width: '100%' }}>
                    <Option value="unsettled">未结算</Option>
                    <Option value="settled">已结算</Option>
                    <Option value="failed">结算失败</Option>
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
              <Space>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExport}
                >
                  导出
                </Button>
              </Space>
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
      </div>
    </MerchantLayout>
  )
}

export default SettlementOrder 