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
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import MerchantLayout from './MerchantLayout'
import { getSettlementOrderList, testSettlementOrderAPI } from '@/api/settlementOrder'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const SettlementOrder = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 时间类型选择状态
  const [selectedTimeType, setSelectedTimeType] = useState('')

  // 详情模态框相关状态
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // 获取结算订单列表
  const fetchSettlementOrderList = async (params = {}) => {
    try {
      setLoading(true)

      // 处理日期参数
      let apiParams = { ...params }
      if (params.selectedDate && params.timeType) {
        const dateStr = params.selectedDate.format('YYYY-MM-DD')
        apiParams.startDate = dateStr
        apiParams.endDate = dateStr
        delete apiParams.selectedDate
      }

      // 合并分页参数
      apiParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...apiParams
      }

      console.log('📋 发送API请求参数:', apiParams)

      const response = await getSettlementOrderList(apiParams)

      if (response.code === 200) {
        setDataSource(response.data.list || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          current: response.data.pagination?.current || 1,
          pageSize: response.data.pagination?.pageSize || 10
        }))
        console.log('✅ 获取结算订单列表成功:', response.data)
      } else {
        message.error(response.message || '获取结算订单列表失败')
        setDataSource([])
      }
    } catch (error) {
      console.error('❌ 获取结算订单列表失败:', error)
      message.error('获取结算订单列表失败，请重试')
      setDataSource([])
    } finally {
      setLoading(false)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchSettlementOrderList()
  }, [])

  // 监听表单时间类型变化
  useEffect(() => {
    const timeType = form.getFieldValue('timeType')
    if (timeType !== selectedTimeType) {
      setSelectedTimeType(timeType || '')
    }
  }, [form, selectedTimeType])

  // 搜索处理
  const handleSearch = (values) => {
    console.log('搜索条件:', values)
    setSearchParams(values)
    setPagination(prev => ({ ...prev, current: 1 }))

    // 重新获取数据
    setTimeout(() => {
      fetchSettlementOrderList({
        ...values,
        page: 1,
        pageSize: pagination.pageSize
      })
    }, 100)
  }

  // 重置处理
  const handleReset = () => {
    form.resetFields()
    setSearchParams({})
    setSelectedTimeType('')
    setPagination(prev => ({ ...prev, current: 1 }))

    // 重新获取数据
    setTimeout(() => {
      fetchSettlementOrderList({
        page: 1,
        pageSize: pagination.pageSize
      })
    }, 100)
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    const newPagination = {
      current: page,
      pageSize: pageSize || pagination.pageSize
    }
    setPagination(prev => ({ ...prev, ...newPagination }))

    // 重新获取数据
    fetchSettlementOrderList({
      ...searchParams,
      page,
      pageSize: pageSize || pagination.pageSize
    })
  }

  // 导出数据
  const handleExport = () => {
    try {
      // 创建工作簿
      const workBook = XLSX.utils.book_new()

      // 1. 计算统计数据
      const statistics = dataSource.reduce((acc, item) => {
        acc.totalOrders += 1
        acc.totalAmount += item.totalPrice

        if (item.settlementStatus === 'unsettled') {
          acc.unsettledCount += 1
          acc.unsettledAmount += item.totalPrice
        } else if (item.settlementStatus === 'settled') {
          acc.settledCount += 1
          acc.settledAmount += item.totalPrice
        } else if (item.settlementStatus === 'failed') {
          acc.failedCount += 1
          acc.failedAmount += item.totalPrice
        }

        return acc
      }, {
        totalOrders: 0,
        totalAmount: 0,
        unsettledCount: 0,
        unsettledAmount: 0,
        settledCount: 0,
        settledAmount: 0,
        failedCount: 0,
        failedAmount: 0
      })

      // 创建统计数据工作表
      const statisticsData = [
        { '统计项目': '订单总数', '数值': statistics.totalOrders + ' 单' },
        { '统计项目': '订单总金额', '数值': '¥' + statistics.totalAmount.toFixed(2) },
        { '统计项目': '未结算订单数', '数值': statistics.unsettledCount + ' 单' },
        { '统计项目': '未结算金额', '数值': '¥' + statistics.unsettledAmount.toFixed(2) },
        { '统计项目': '已结算订单数', '数值': statistics.settledCount + ' 单' },
        { '统计项目': '已结算金额', '数值': '¥' + statistics.settledAmount.toFixed(2) },
        { '统计项目': '结算失败订单数', '数值': statistics.failedCount + ' 单' },
        { '统计项目': '结算失败金额', '数值': '¥' + statistics.failedAmount.toFixed(2) }
      ]

      const statisticsSheet = XLSX.utils.json_to_sheet(statisticsData)
      statisticsSheet['!cols'] = [
        { wch: 20 },  // 统计项目
        { wch: 20 }   // 数值
      ]
      XLSX.utils.book_append_sheet(workBook, statisticsSheet, '结算统计')

      // 2. 创建详细订单数据工作表
      const detailData = dataSource.map((item, index) => {
        const statusMap = {
          unsettled: '未结算',
          settled: '已结算',
          failed: '结算失败'
        }

        return {
          '序号': index + 1,
          '订单号': item.orderNo,
          '商家名称': item.merchantName,
          '所属网点': item.networkPoint,
          '商品名称': item.productName,
          '规格': item.specifications,
          '供货价(元)': item.supplyPrice,
          '数量': item.quantity,
          '总价(元)': item.totalPrice,
          '结算状态': statusMap[item.settlementStatus] || item.settlementStatus,
          '支付时间': item.paymentTime,
          '结算时间': item.settlementTime || '-'
        }
      })

      const detailSheet = XLSX.utils.json_to_sheet(detailData)
      detailSheet['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 15 },  // 订单号
        { wch: 20 },  // 商家名称
        { wch: 20 },  // 所属网点
        { wch: 20 },  // 商品名称
        { wch: 15 },  // 规格
        { wch: 12 },  // 供货价
        { wch: 8 },   // 数量
        { wch: 12 },  // 总价
        { wch: 12 },  // 结算状态
        { wch: 20 },  // 支付时间
        { wch: 20 }   // 结算时间
      ]
      XLSX.utils.book_append_sheet(workBook, detailSheet, '结算订单明细')

      // 3. 生成文件名
      const now = dayjs().format('YYYY-MM-DD_HH-mm-ss')
      const fileName = `结算订单明细_当前数据_${now}.xlsx`

      // 4. 导出文件
      XLSX.writeFile(workBook, fileName)

      message.success(`成功导出Excel文件：${fileName}，包含 ${dataSource.length} 条订单记录`)

    } catch (error) {
      console.error('导出Excel时出错:', error)
      message.error('导出Excel失败，请重试')
    }
  }

  // 刷新数据
  const handleRefresh = () => {
    fetchSettlementOrderList({
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.pageSize
    })
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
              <Col span={6}>
                <Form.Item label="时间类型" name="timeType">
                  <Select
                    placeholder="选择时间类型"
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      setSelectedTimeType(value)
                      // 清空日期选择
                      form.setFieldValue('selectedDate', null)
                    }}
                  >
                    <Option value="paymentTime">支付时间</Option>
                    <Option value="settlementTime">结算时间</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="选择日期" name="selectedDate">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder={
                      selectedTimeType === 'paymentTime'
                        ? '选择支付日期'
                        : selectedTimeType === 'settlementTime'
                          ? '选择结算日期'
                          : '选择日期'
                    }
                    format="YYYY-MM-DD"
                    disabled={!selectedTimeType}
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
                    {selectedTimeType && (
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        💡 当前按{selectedTimeType === 'paymentTime' ? '支付日期' : '结算日期'}筛选
                        {selectedTimeType === 'settlementTime' && '（仅显示已结算的订单）'}
                      </span>
                    )}
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
            dataSource={dataSource}
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