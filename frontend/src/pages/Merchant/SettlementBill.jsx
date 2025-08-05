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
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const SettlementBill = () => {
  const [sharedForm] = Form.useForm() // 共享的表单
  const [loading, setLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [filteredHistoryData, setFilteredHistoryData] = useState([])
  const [searchParams, setSearchParams] = useState({}) // 共享的搜索参数
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
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
      merchantName: '清风超市',
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

  // 计算统计数据（基于筛选后的历史数据）
  const currentStats = useMemo(() => {
    const stats = filteredHistoryData.reduce((acc, item) => {
      acc.orderCount += item.orderCount || 0
      acc.totalAmount += item.orderAmount || 0
      acc.refundOrderCount += item.refundOrderCount || 0
      acc.refundAmount += item.refundAmount || 0

      // 微信销售数据
      acc.wechatSales.count += item.wechatSales || 0
      acc.wechatSales.amount += item.wechatSalesAmount || 0

      // 微信退款数据
      acc.wechatRefund.count += item.wechatRefund || 0
      acc.wechatRefund.amount += item.wechatRefundAmount || 0

      return acc
    }, {
      orderCount: 0,
      totalAmount: 0,
      refundOrderCount: 0,
      refundAmount: 0,
      rechargeAmount: 0, // 这个需要从其他地方获取或计算
      salesAmount: 0,
      salesCount: 0,
      wechatSales: { amount: 0, count: 0 },
      balanceSales: { amount: 0, count: 0 }, // 这个需要从其他地方获取
      totalRefundAmount: 0,
      totalRefundCount: 0,
      wechatRefund: { amount: 0, count: 0 },
      balanceRefund: { amount: 0, count: 0 } // 这个需要从其他地方获取
    })

    // 计算总销售数据
    stats.salesAmount = stats.wechatSales.amount + stats.balanceSales.amount
    stats.salesCount = stats.wechatSales.count + stats.balanceSales.count
    stats.totalRefundAmount = stats.wechatRefund.amount + stats.balanceRefund.amount
    stats.totalRefundCount = stats.wechatRefund.count + stats.balanceRefund.count
    stats.rechargeAmount = stats.totalAmount // 假设充值金额等于订单总额

    return stats
  }, [filteredHistoryData])

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

  // 共享查询处理
  const handleSearch = (values) => {
    console.log('查询条件:', values)
    setLoading(true)
    setSearchParams(values)

    setTimeout(() => {
      const filtered = filterHistoryData(historyData, values)
      setFilteredHistoryData(filtered)
      setPagination(prev => ({ ...prev, current: 1, total: filtered.length }))
      setLoading(false)
      message.success(`查询完成，找到 ${filtered.length} 条记录`)
    }, 500)
  }

  // 重置查询
  const handleReset = () => {
    sharedForm.resetFields()
    setSearchParams({})
    setFilteredHistoryData(historyData)
    setPagination(prev => ({ ...prev, current: 1, total: historyData.length }))
    message.info('已重置查询条件')
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
    try {
      // 创建工作簿
      const workBook = XLSX.utils.book_new()

      // 1. 创建统计数据工作表
      const statisticsData = [
        { '统计项目': '订单总数', '数值': currentStats.orderCount + ' 单' },
        { '统计项目': '订单总金额', '数值': '¥' + currentStats.totalAmount.toFixed(2) },
        { '统计项目': '退款订单数', '数值': currentStats.refundOrderCount + ' 单' },
        { '统计项目': '退款金额', '数值': '¥' + currentStats.refundAmount.toFixed(2) },
        { '统计项目': '充值金额', '数值': '¥' + currentStats.rechargeAmount.toFixed(2) },
        { '统计项目': '总销售金额', '数值': '¥' + currentStats.salesAmount.toFixed(2) },
        { '统计项目': '总销售笔数', '数值': currentStats.salesCount + ' 笔' },
        { '统计项目': '微信销售金额', '数值': '¥' + currentStats.wechatSales.amount.toFixed(2) },
        { '统计项目': '微信销售笔数', '数值': currentStats.wechatSales.count + ' 笔' },
        { '统计项目': '总退款金额', '数值': '¥' + currentStats.totalRefundAmount.toFixed(2) },
        { '统计项目': '总退款笔数', '数值': currentStats.totalRefundCount + ' 笔' },
        { '统计项目': '微信退款金额', '数值': '¥' + currentStats.wechatRefund.amount.toFixed(2) },
        { '统计项目': '微信退款笔数', '数值': currentStats.wechatRefund.count + ' 笔' }
      ]

      const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData)
      statisticsSheet['!cols'] = [
        { wch: 20 },  // 统计项目
        { wch: 20 }   // 数值
      ]
      XLSX.utils.book_append_sheet(workBook, statisticsSheet, '营业统计')

      // 2. 创建历史账单明细工作表
      const detailData = filteredHistoryData.map((item, index) => ({
        '序号': index + 1,
        '日期': item.date,
        '商家名称': item.merchantName,
        '订单总数': item.orderCount || 0,
        '订单总额': item.orderAmount || 0,
        '退款订单': item.refundOrderCount || 0,
        '退款金额': item.refundAmount || 0,
        '微信销量': item.wechatSales || '',
        '微信销售额': item.wechatSalesAmount || '',
        '微信退款量': item.wechatRefund || '',
        '微信退款额': item.wechatRefundAmount || ''
      }))

      const detailSheet = XLSX.utils.json_to_sheet(detailData)
      detailSheet['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 12 },  // 日期
        { wch: 20 },  // 商家名称
        { wch: 12 },  // 订单总数
        { wch: 12 },  // 订单总额
        { wch: 12 },  // 退款订单
        { wch: 12 },  // 退款金额
        { wch: 12 },  // 微信销量
        { wch: 12 },  // 微信销售额
        { wch: 12 },  // 微信退款量
        { wch: 12 }   // 微信退款额
      ]
      XLSX.utils.book_append_sheet(workBook, detailSheet, '历史账单明细')

      // 3. 生成文件名
      const now = dayjs().format('YYYY-MM-DD_HH-mm-ss')
      let fileName = `结算账单_${now}`

      // 根据筛选条件添加文件名后缀
      const filters = []
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        filters.push(`${searchParams.dateRange[0].format('YYYY-MM-DD')}至${searchParams.dateRange[1].format('YYYY-MM-DD')}`)
      }
      if (searchParams.merchantName) {
        filters.push(searchParams.merchantName)
      }

      if (filters.length > 0) {
        fileName += `_${filters.join('_')}`
      }

      fileName += '.xlsx'

      // 4. 导出文件
      XLSX.writeFile(workBook, fileName)

      message.success(`成功导出Excel文件：${fileName}，包含 ${detailData.length} 条账单记录`)

    } catch (error) {
      console.error('导出Excel时出错:', error)
      message.error('导出Excel失败，请重试')
    }
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
      title: '微信数据',
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
          title: '退款量',
          dataIndex: 'wechatRefund',
          key: 'wechatRefund',
          width: 80,
          align: 'center',
          render: (value) => value || ''
        },
        {
          title: '退款额',
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
              {/* 共享查询表单 */}
              <Form form={sharedForm} onFinish={handleSearch} layout="vertical">
                <Row gutter={16}>
                  <Col span={10}>
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
                  <Col span={6}>
                    <Form.Item label=" " colon={false}>
                      <Space style={{ marginTop: '6px' }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          size="small"
                        >
                          查询
                        </Button>
                        <Button
                          onClick={handleReset}
                          size="small"
                        >
                          重置
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              <Divider />

              {/* 数据关联提示 */}

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

          {/* 右侧：历史账单数据 */}
          <Col span={13}>
            <Card title="历史账单数据" style={{ height: '100%' }}>
              {/* 筛选结果提示 */}
              {searchParams.merchantName || (searchParams.dateRange && searchParams.dateRange.length > 0) ? (
                <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                  <span>筛选结果：共 {pagination.total} 条记录</span>
                  {searchParams.merchantName && <span>（商家：{searchParams.merchantName}）</span>}
                  {(searchParams.dateRange && searchParams.dateRange.length === 2) &&
                    <span>（日期：{searchParams.dateRange[0].format('YYYY-MM-DD')} 至 {searchParams.dateRange[1].format('YYYY-MM-DD')}）</span>
                  }
                </div>
              ) : null}

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
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      onClick={() => handleSearch(searchParams)}
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

              {/* 历史数据表格 */}
              <Table
                columns={historyColumns}
                dataSource={currentPageData}
                rowKey="id"
                pagination={false}
                loading={loading}
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
                  pageSizeOptions={['2', '5', '10', '20', '50', '100']}
                  defaultPageSize={2}
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