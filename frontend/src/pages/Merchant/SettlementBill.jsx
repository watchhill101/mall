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
import { getBillList, getBillStats, testBillAPI } from '@/api/bill'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const SettlementBill = () => {
  const [sharedForm] = Form.useForm() // 共享的表单
  const [loading, setLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [filteredHistoryData, setFilteredHistoryData] = useState([])
  const [statsData, setStatsData] = useState({}) // 统计数据
  const [searchParams, setSearchParams] = useState({}) // 共享的搜索参数
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0
  })
  const [merchantList, setMerchantList] = useState([]) // 商家列表
  const [apiConnected, setApiConnected] = useState(false) // API连接状态

  // 移除模拟数据，直接使用后端数据

  // 使用从API获取的统计数据
  const currentStats = useMemo(() => {
    return {
      orderCount: statsData.orderCount || 0,
      totalAmount: statsData.totalAmount || 0,
      refundOrderCount: statsData.refundOrderCount || 0,
      refundAmount: statsData.refundAmount || 0,
      rechargeAmount: statsData.rechargeAmount || 0,
      salesAmount: statsData.salesAmount || 0,
      salesCount: statsData.salesCount || 0,
      wechatSales: statsData.wechatSales || { amount: 0, count: 0 },
      balanceSales: statsData.balanceSales || { amount: 0, count: 0 },
      totalRefundAmount: statsData.totalRefundAmount || 0,
      totalRefundCount: statsData.totalRefundCount || 0,
      wechatRefund: statsData.wechatRefund || { amount: 0, count: 0 },
      balanceRefund: statsData.balanceRefund || { amount: 0, count: 0 }
    }
  }, [statsData])

  // 计算当前页数据 - 现在直接使用API返回的数据
  const currentPageData = useMemo(() => {
    return filteredHistoryData
  }, [filteredHistoryData])

  // 获取商家列表
  const loadMerchantList = async () => {
    try {
      // 这里需要调用商家API获取商家列表
      // 暂时使用从账单数据中提取的商家信息
      const response = await getBillList({ page: 1, pageSize: 100 })
      if (response.code === 200) {
        const uniqueMerchants = []
        const merchantNames = new Set()
        response.data.list.forEach(bill => {
          if (!merchantNames.has(bill.merchantName)) {
            merchantNames.add(bill.merchantName)
            uniqueMerchants.push({
              value: bill.merchantName,
              label: bill.merchantName
            })
          }
        })
        setMerchantList(uniqueMerchants)
      }
    } catch (error) {
      console.error('获取商家列表失败:', error)
    }
  }

  // 测试API连接
  const testAPIConnection = async () => {
    try {
      console.log('🔗 测试账单API连接...')
      const response = await testBillAPI()
      if (response.code === 200) {
        console.log('✅ 账单API连接成功:', response.data)
        setApiConnected(true)
        return true
      }
    } catch (error) {
      console.error('❌ 账单API连接失败:', error)
      message.error('账单API连接失败，请检查后端服务')
      return false
    }
  }

  // 初始化数据加载
  useEffect(() => {
    const initData = async () => {
      const isConnected = await testAPIConnection()
      if (isConnected) {
        await Promise.all([
          loadBillData({ page: 1, pageSize: 2 }),
          loadStatsData({}),
          loadMerchantList()
        ])
      }
    }
    initData()
  }, [])

  // 加载账单列表数据
  const loadBillData = async (params = {}) => {
    try {
      setLoading(true)
      const queryParams = {
        page: params.page || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        ...params
      }

      // 移除page和pageSize，避免重复
      if (params.page) delete queryParams.page
      if (params.pageSize) delete queryParams.pageSize

      // 重新添加正确的分页参数
      queryParams.page = params.page || pagination.current
      queryParams.pageSize = params.pageSize || pagination.pageSize

      // 处理日期范围参数
      if (params.dateRange && params.dateRange.length === 2) {
        queryParams.startDate = params.dateRange[0].format('YYYY-MM-DD')
        queryParams.endDate = params.dateRange[1].format('YYYY-MM-DD')
        delete queryParams.dateRange
      }

      console.log('发送请求参数:', queryParams)
      const response = await getBillList(queryParams)

      if (response.code === 200) {
        const { list, pagination: paginationData } = response.data
        setHistoryData(list)
        setFilteredHistoryData(list)
        setPagination(prev => ({
          ...prev,
          current: paginationData.current,
          pageSize: paginationData.pageSize,
          total: paginationData.total
        }))
        console.log(`✅ 成功加载 ${list.length} 条账单数据`)
      } else {
        message.error(response.message || '获取账单列表失败')
        setHistoryData([])
        setFilteredHistoryData([])
      }
    } catch (error) {
      console.error('加载账单数据失败:', error)
      message.error('加载账单数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStatsData = async (params = {}) => {
    try {
      const queryParams = { ...params }

      // 处理日期范围参数
      if (params.dateRange && params.dateRange.length === 2) {
        queryParams.startDate = params.dateRange[0].format('YYYY-MM-DD')
        queryParams.endDate = params.dateRange[1].format('YYYY-MM-DD')
        delete queryParams.dateRange
      }

      const response = await getBillStats(queryParams)

      if (response.code === 200) {
        setStatsData(response.data)
        console.log('✅ 成功加载统计数据:', response.data)
      } else {
        message.error(response.message || '获取统计数据失败')
        setStatsData({})
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
      message.error('加载统计数据失败')
    }
  }

  // 移除客户端筛选逻辑，改为依赖后端筛选

  // 共享查询处理
  const handleSearch = async (values) => {
    console.log('查询条件:', values)
    setSearchParams(values)

    // 重置分页到第一页
    const newPagination = { ...pagination, current: 1 }
    setPagination(newPagination)

    // 同时加载列表数据和统计数据
    await Promise.all([
      loadBillData({ ...values, page: 1, pageSize: pagination.pageSize }),
      loadStatsData(values)
    ])

    message.success('查询完成')
  }

  // 重置查询
  const handleReset = async () => {
    sharedForm.resetFields()
    setSearchParams({})

    // 重新加载初始数据
    const newPagination = { ...pagination, current: 1 }
    setPagination(newPagination)

    await Promise.all([
      loadBillData({ page: 1, pageSize: pagination.pageSize }),
      loadStatsData({})
    ])

    message.info('已重置查询条件')
  }

  // 分页处理
  const handlePaginationChange = async (page, pageSize) => {
    const newPagination = {
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    }
    setPagination(newPagination)

    // 重新加载当前页数据
    await loadBillData({
      ...searchParams,
      page: page,
      pageSize: pageSize || pagination.pageSize
    })
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
        '账单编号': item.billNumber || '',
        '商家名称': item.merchantName,
        '账单周期开始': item.billPeriodStart ? new Date(item.billPeriodStart).toLocaleDateString() : '',
        '账单周期结束': item.billPeriodEnd ? new Date(item.billPeriodEnd).toLocaleDateString() : '',
        '订单总数': item.orderCount || 0,
        '总金额': item.totalAmount || 0,
        '服务费': item.serviceFee || 0,
        '服务费率': item.serviceFeeRate ? (item.serviceFeeRate * 100).toFixed(2) + '%' : '',
        '实际金额': item.actualAmount || 0,
        '商品总数量': item.totalQuantity || 0,
        '状态': {
          pending: '待确认',
          confirmed: '已确认',
          disputed: '有争议',
          paid: '已支付',
          overdue: '逾期'
        }[item.status] || item.status,
        '创建时间': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
      }))

      const detailSheet = XLSX.utils.json_to_sheet(detailData)
      detailSheet['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 18 },  // 账单编号
        { wch: 20 },  // 商家名称
        { wch: 15 },  // 账单周期开始
        { wch: 15 },  // 账单周期结束
        { wch: 12 },  // 订单总数
        { wch: 15 },  // 总金额
        { wch: 12 },  // 服务费
        { wch: 10 },  // 服务费率
        { wch: 15 },  // 实际金额
        { wch: 12 },  // 商品总数量
        { wch: 10 },  // 状态
        { wch: 15 }   // 创建时间
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

  // 历史表格列定义 - 根据后端数据结构调整
  const historyColumns = [
    {
      title: '账单编号',
      dataIndex: 'billNumber',
      key: 'billNumber',
      width: 150
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150
    },
    {
      title: '账单周期',
      key: 'billPeriod',
      width: 180,
      render: (_, record) => {
        const startDate = record.billPeriodStart ? new Date(record.billPeriodStart).toLocaleDateString() : ''
        const endDate = record.billPeriodEnd ? new Date(record.billPeriodEnd).toLocaleDateString() : ''
        return `${startDate} - ${endDate}`
      }
    },
    {
      title: '订单总数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      align: 'center',
      render: (count) => count || 0
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${(amount || 0).toLocaleString()}`
    },
    {
      title: '服务费',
      dataIndex: 'serviceFee',
      key: 'serviceFee',
      width: 100,
      align: 'right',
      render: (fee) => `¥${(fee || 0).toFixed(2)}`
    },
    {
      title: '实际金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${(amount || 0).toLocaleString()}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusMap = {
          pending: { color: 'blue', text: '待确认' },
          confirmed: { color: 'orange', text: '已确认' },
          disputed: { color: 'red', text: '有争议' },
          paid: { color: 'green', text: '已支付' },
          overdue: { color: 'volcano', text: '逾期' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handlePrint(record)}>
            打印
          </Button>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            详情
          </Button>
        </Space>
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
                      <Select
                        placeholder="请选择"
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          option?.label?.toLowerCase()?.includes(input.toLowerCase())
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

              {/* 数据连接状态提示 */}
              {apiConnected && (
                <div style={{
                  marginBottom: '16px',
                  padding: '8px 12px',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#52c41a'
                }}>
                  ✅ 已连接到后端数据库，显示实时数据
                </div>
              )}

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
                      onClick={async () => {
                        await Promise.all([
                          loadBillData({ ...searchParams, page: pagination.current, pageSize: pagination.pageSize }),
                          loadStatsData(searchParams)
                        ])
                        message.success('刷新完成')
                      }}
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
                rowKey="_id"
                pagination={false}
                loading={loading}
                scroll={{ x: 1200 }}
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