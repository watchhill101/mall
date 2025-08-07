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
  Collapse,
  Divider,
  Alert,
  Badge
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FullscreenOutlined,
  ColumnHeightOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilterOutlined,
  ClearOutlined,
  SaveOutlined,
  HistoryOutlined
} from '@ant-design/icons'
// import * as XLSX from 'xlsx'  // 临时注释，需要时请安装: npm install xlsx
import dayjs from 'dayjs'
import MerchantLayout from './MerchantLayout'
import { getSettlementOrderList, testSettlementOrderAPI } from '@/api/settlementOrder'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { Panel } = Collapse

const SettlementOrder = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0
  })
  const [forceUpdate, setForceUpdate] = useState(0) // 用于强制重新渲染
  const [merchantOptions, setMerchantOptions] = useState([]) // 商家选项
  const [networkOptions, setNetworkOptions] = useState([]) // 网点选项

  // 时间类型选择状态
  const [selectedTimeType, setSelectedTimeType] = useState('')

  // 详情模态框相关状态
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // 搜索历史相关状态
  const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [savedSearches, setSavedSearches] = useState([])

  // 数据加载函数（优化后的版本）
  const loadSettlementOrderList = async (params = {}) => {
    try {
      setLoading(true)

      // 构建查询参数
      const queryParams = {
        page: params.page || pagination.current,
        pageSize: params.pageSize || pagination.pageSize
      }

      // 处理搜索条件 - 改进条件判断逻辑
      if (params.merchantName && params.merchantName.trim() !== '') {
        queryParams.merchantName = params.merchantName.trim()
      }
      if (params.orderNo && params.orderNo.trim() !== '') {
        queryParams.orderNo = params.orderNo.trim()
      }
      if (params.productName && params.productName.trim() !== '') {
        queryParams.productName = params.productName.trim()
      }
      if (params.settlementStatus && params.settlementStatus !== '') {
        queryParams.settlementStatus = params.settlementStatus
      }
      if (params.networkPoint && params.networkPoint.trim() !== '') {
        queryParams.networkPoint = params.networkPoint.trim()
      }

      // 处理日期参数 - 支持日期范围
      if (params.timeType && params.timeType !== '') {
        queryParams.timeType = params.timeType

        if (params.dateRange && Array.isArray(params.dateRange) && params.dateRange.length === 2) {
          // 日期范围查询
          queryParams.startDate = params.dateRange[0].format('YYYY-MM-DD')
          queryParams.endDate = params.dateRange[1].format('YYYY-MM-DD')
        } else if (params.selectedDate) {
          // 单日查询
          const dateStr = params.selectedDate.format('YYYY-MM-DD')
          queryParams.startDate = dateStr
          queryParams.endDate = dateStr
        }
      }

      console.log('📋 发送API请求参数:', queryParams)

      const response = await getSettlementOrderList(queryParams)

      if (response.code === 200) {
        // 处理数据，确保每条记录都有必要的字段
        const processedData = response.data.list.map(item => ({
          ...item,
          key: item.id || item._id,
          id: item.id || item._id,
        }))

        setDataSource(processedData)
        setPagination(prev => ({
          ...prev,
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: response.data.pagination?.total || 0
        }))
        setForceUpdate(prev => prev + 1) // 强制重新渲染
        console.log('✅ 获取结算订单列表成功，共', processedData.length, '条记录')

        // 计算统计信息
        const stats = processedData.reduce((acc, item) => {
          acc.total += 1
          acc.totalAmount += item.totalPrice || 0
          if (item.settlementStatus === 'unsettled') acc.unsettled += 1
          else if (item.settlementStatus === 'settled') acc.settled += 1
          else if (item.settlementStatus === 'failed') acc.failed += 1
          return acc
        }, { total: 0, totalAmount: 0, unsettled: 0, settled: 0, failed: 0 })

        console.log('📊 当前页面数据统计:', stats)

        // 输出实际应用的搜索条件
        const appliedConditions = Object.keys(queryParams).filter(key =>
          !['page', 'pageSize'].includes(key)
        )
        if (appliedConditions.length > 0) {
          console.log('🔍 实际应用的搜索条件:', appliedConditions.map(key =>
            `${key}: ${queryParams[key]}`
          ).join(', '))
        }

        // 返回搜索结果信息
        return {
          success: true,
          total: response.data.pagination?.total || 0,
          count: processedData.length
        }

      } else {
        message.error(response.message || '获取结算订单列表失败')
        setDataSource([])
        return {
          success: false,
          total: 0,
          count: 0
        }
      }
    } catch (error) {
      console.error('❌ 获取结算订单列表失败:', error)
      message.error('获取结算订单列表失败: ' + (error.message || '网络错误'))
      setDataSource([])
      return {
        success: false,
        total: 0,
        count: 0
      }
    } finally {
      setLoading(false)
    }
  }

  // 加载选项数据
  const loadOptions = async () => {
    try {
      // 获取所有数据来提取选项（这里简化处理，实际项目中可以有专门的选项接口）
      const response = await getSettlementOrderList({ page: 1, pageSize: 100 })
      if (response.code === 200) {
        const orders = response.data.list || []

        // 提取唯一的商家选项
        const merchantSet = new Set()
        const networkSet = new Set()

        orders.forEach(order => {
          if (order.merchantName) merchantSet.add(order.merchantName)
          if (order.networkPoint) networkSet.add(order.networkPoint)
        })

        setMerchantOptions([...merchantSet].map(name => ({ label: name, value: name })))
        setNetworkOptions([...networkSet].map(name => ({ label: name, value: name })))

        console.log('✅ 加载选项数据成功:', {
          merchants: merchantSet.size,
          networks: networkSet.size
        })
      }
    } catch (error) {
      console.error('❌ 加载选项数据失败:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      await loadSettlementOrderList({ page: 1, pageSize: 2 })
      await loadOptions()
    }
    initData()

    // 加载搜索历史
    const savedHistory = localStorage.getItem('settlementOrder_searchHistory')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }

    // 加载保存的搜索
    const savedSearchesData = localStorage.getItem('settlementOrder_savedSearches')
    if (savedSearchesData) {
      setSavedSearches(JSON.parse(savedSearchesData))
    }
  }, [])

  // 监听表单时间类型变化
  useEffect(() => {
    const timeType = form.getFieldValue('timeType')
    if (timeType !== selectedTimeType) {
      setSelectedTimeType(timeType || '')
    }
  }, [form, selectedTimeType])

  // 保存搜索条件
  const saveCurrentSearch = () => {
    const currentValues = form.getFieldsValue()
    const activeConditions = Object.keys(currentValues).filter(key =>
      currentValues[key] !== undefined && currentValues[key] !== null && currentValues[key] !== ''
    )

    if (activeConditions.length === 0) {
      message.warning('没有可保存的搜索条件')
      return
    }

    Modal.confirm({
      title: '保存搜索条件',
      content: (
        <div>
          <p>是否保存当前搜索条件？</p>
          <Input
            placeholder="请输入搜索名称"
            id="searchName"
            style={{ marginTop: 8 }}
          />
        </div>
      ),
      onOk: () => {
        const searchName = document.getElementById('searchName')?.value || '未命名搜索'
        const newSavedSearch = {
          id: Date.now(),
          name: searchName,
          conditions: currentValues,
          createdAt: new Date().toLocaleString('zh-CN')
        }

        const updatedSavedSearches = [...savedSearches, newSavedSearch]
        setSavedSearches(updatedSavedSearches)
        localStorage.setItem('settlementOrder_savedSearches', JSON.stringify(updatedSavedSearches))
        message.success('搜索条件已保存')
      }
    })
  }

  // 应用保存的搜索
  const applySavedSearch = (savedSearch) => {
    form.setFieldsValue(savedSearch.conditions)
    handleSearch(savedSearch.conditions)
    message.info(`已应用搜索条件：${savedSearch.name}`)
  }

  // 搜索处理（增强版）
  const handleSearch = async (values) => {
    try {
      // 获取完整的表单数据，包括基础搜索和高级搜索的所有字段
      const allFormValues = form.getFieldsValue()
      const searchValues = values || allFormValues

      console.log('🔍 原始搜索条件:', searchValues)
      console.log('📋 完整表单数据:', allFormValues)

      // 合并搜索条件，确保所有字段都被包含
      const combinedValues = {
        ...allFormValues,
        ...searchValues
      }

      console.log('🔄 合并后的搜索条件:', combinedValues)

      setSearchParams(combinedValues)
      setPagination(prev => ({ ...prev, current: 1 }))

      // 记录搜索历史
      const searchHistoryItem = {
        id: Date.now(),
        conditions: combinedValues,
        timestamp: new Date().toLocaleString('zh-CN'),
        resultCount: 0
      }

      const searchResult = await loadSettlementOrderList({
        ...combinedValues,
        page: 1,
        pageSize: pagination.pageSize
      })

      // 获取实际的搜索结果数量
      const actualResultCount = searchResult?.total || 0

      // 更新搜索历史中的结果数量
      searchHistoryItem.resultCount = actualResultCount

      // 更新搜索历史
      const updatedHistory = [searchHistoryItem, ...searchHistory.slice(0, 9)] // 保留最近10次搜索
      setSearchHistory(updatedHistory)
      localStorage.setItem('settlementOrder_searchHistory', JSON.stringify(updatedHistory))

      if (actualResultCount === 0) {
        message.info('未找到符合条件的数据')
      } else {
        message.success(`查询完成，找到 ${actualResultCount} 条记录`)
      }
    } catch (error) {
      console.error('❌ 搜索失败:', error)
      message.error('查询失败: ' + error.message)
    }
  }

  // 重置处理
  const handleReset = async () => {
    try {
      form.resetFields()
      setSearchParams({})
      setSelectedTimeType('')
      setPagination(prev => ({ ...prev, current: 1 }))

      await loadSettlementOrderList({
        page: 1,
        pageSize: pagination.pageSize
      })
      message.info('已重置搜索条件')
    } catch (error) {
      message.error('重置失败: ' + error.message)
    }
  }

  // 清空搜索历史
  const clearSearchHistory = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有搜索历史吗？',
      onOk: () => {
        setSearchHistory([])
        localStorage.removeItem('settlementOrder_searchHistory')
        message.success('搜索历史已清空')
      }
    })
  }

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }))

    loadSettlementOrderList({
      ...searchParams,
      page,
      pageSize: pageSize || pagination.pageSize
    })
  }

  // 导出数据
  const handleExport = () => {
    alert('导出功能需要安装xlsx库。请运行: npm install xlsx')
    return
    
    /* 原始导出代码（安装xlsx后取消注释）
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
      console.log('📊 导出统计:', {
        totalOrders: statistics.totalOrders,
        totalAmount: statistics.totalAmount,
        unsettledCount: statistics.unsettledCount,
        settledCount: statistics.settledCount,
        failedCount: statistics.failedCount
      })

    } catch (error) {
      console.error('导出Excel时出错:', error)
      message.error('导出Excel失败，请重试')
    }
    */
  }

  // 刷新数据
  const handleRefresh = async () => {
    try {
      await loadSettlementOrderList({
        ...searchParams,
        page: pagination.current,
        pageSize: pagination.pageSize
      })
      message.info('数据已刷新')
    } catch (error) {
      message.error('刷新失败: ' + error.message)
    }
  }

  // 计算当前搜索条件数量
  const activeSearchConditionsCount = useMemo(() => {
    const values = form.getFieldsValue()
    let count = 0

    // 检查字符串类型的字段
    const stringFields = ['merchantName', 'orderNo', 'productName', 'networkPoint', 'timeType', 'settlementStatus']
    stringFields.forEach(field => {
      if (values[field] && values[field].toString().trim() !== '') {
        count++
      }
    })

    // 检查日期范围
    if (values.dateRange && Array.isArray(values.dateRange) && values.dateRange.length === 2) {
      count++
    }

    return count
  }, [form])

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
      render: (time) => (time && time.trim() !== '') ? time : '-'
    }
  ]

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索表单 */}
        <Card className="search-card" style={{ marginBottom: '16px' }}>
          <Collapse
            defaultActiveKey={['basic']}
            ghost
          >
            <Panel
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <FilterOutlined style={{ marginRight: '8px' }} />
                    基础搜索
                    {activeSearchConditionsCount > 0 && (
                      <Badge count={activeSearchConditionsCount} style={{ marginLeft: '8px' }} />
                    )}
                  </span>
                </div>
              }
              key="basic"
            >
              <Form form={form} onFinish={handleSearch} layout="vertical">
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="所属商家" name="merchantName">
                      <Select
                        placeholder="搜索商家"
                        showSearch
                        allowClear
                        style={{ width: '100%' }}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {merchantOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="所属网点" name="networkPoint">
                      <Select
                        placeholder="搜索网点"
                        showSearch
                        allowClear
                        style={{ width: '100%' }}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {networkOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="订单编号" name="orderNo">
                      <Input placeholder="请输入订单编号" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="商品名称" name="productName">
                      <Input placeholder="请输入商品名称" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="时间类型" name="timeType">
                      <Select
                        placeholder="选择时间类型"
                        allowClear
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          setSelectedTimeType(value || '')
                          // 清空日期选择
                          form.setFieldValue('dateRange', null)
                          form.setFieldValue('selectedDate', null)
                        }}
                      >
                        <Option value="paymentTime">支付时间</Option>
                        <Option value="settlementTime">结算时间</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item label="日期范围" name="dateRange">
                      <RangePicker
                        style={{ width: '100%' }}
                        placeholder={[
                          selectedTimeType === 'paymentTime' ? '支付开始日期' :
                            selectedTimeType === 'settlementTime' ? '结算开始日期' : '开始日期',
                          selectedTimeType === 'paymentTime' ? '支付结束日期' :
                            selectedTimeType === 'settlementTime' ? '结算结束日期' : '结束日期'
                        ]}
                        format="YYYY-MM-DD"
                        disabled={!selectedTimeType}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="结算状态" name="settlementStatus">
                      <Select placeholder="选择状态" allowClear style={{ width: '100%' }}>
                        <Option value="unsettled">未结算</Option>
                        <Option value="settled">已结算</Option>
                        <Option value="failed">结算失败</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Panel>
          </Collapse>

          <Divider style={{ margin: '16px 0' }} />

          <Row>
            <Col span={24}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => form.submit()}
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
                <Button
                  icon={<ClearOutlined />}
                  onClick={() => form.resetFields()}
                >
                  清空
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  onClick={saveCurrentSearch}
                  disabled={activeSearchConditionsCount === 0}
                >
                  保存搜索
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => setAdvancedSearchVisible(true)}
                >
                  搜索历史
                </Button>

                {selectedTimeType && (
                  <Alert
                    message={`当前按${selectedTimeType === 'paymentTime' ? '支付日期' : '结算日期'}筛选${selectedTimeType === 'settlementTime' ? '（仅显示已结算的订单）' : ''}`}
                    type="info"
                    showIcon
                    style={{ display: 'inline-block' }}
                  />
                )}

                {activeSearchConditionsCount > 0 && (
                  <Alert
                    message={`已应用 ${activeSearchConditionsCount} 个筛选条件`}
                    type="success"
                    showIcon
                    style={{ display: 'inline-block' }}
                    onClick={() => {
                      // 调试功能：点击查看当前搜索条件
                      const currentValues = form.getFieldsValue()
                      console.log('🔍 当前表单值:', currentValues)
                      console.log('💾 当前搜索参数:', searchParams)
                    }}
                  />
                )}
              </Space>
            </Col>
          </Row>
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
                <span>结算订单管理</span>
                {loading && (
                  <span style={{ fontSize: '12px', color: '#1890ff' }}>
                    🔄 加载中...
                  </span>
                )}
                {!loading && dataSource.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#52c41a' }}>
                    📊 当前显示 {dataSource.length} 条记录
                    {Object.keys(searchParams).length > 0 && ` (已筛选)`}
                  </span>
                )}
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExport}
                  disabled={dataSource.length === 0}
                >
                  导出 ({dataSource.length})
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
              {dataSource.length > 0 && (
                <span style={{ marginLeft: '16px', color: '#666' }}>
                  当前页: {dataSource.length} 条，
                  总金额: ¥{dataSource.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)}
                </span>
              )}
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
              pageSizeOptions={['2', '5', '10', '20']}
              defaultPageSize={2}
            />
          </div>
        </Card>

        {/* 搜索历史模态框 */}
        <Modal
          title="搜索历史与保存的搜索"
          open={advancedSearchVisible}
          onCancel={() => setAdvancedSearchVisible(false)}
          footer={null}
          width={800}
        >
          <Collapse defaultActiveKey={['history']}>
            <Panel header="搜索历史" key="history">
              {searchHistory.length > 0 ? (
                <div>
                  <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                    <Button size="small" danger onClick={clearSearchHistory}>
                      清空历史
                    </Button>
                  </div>
                  {searchHistory.map(item => (
                    <Card key={item.id} size="small" className="search-history-item" style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {item.timestamp}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {Object.keys(item.conditions).map(key => (
                              item.conditions[key] && (
                                <Tag key={key} size="small">
                                  {key}: {Array.isArray(item.conditions[key]) ?
                                    item.conditions[key].map(d => d.format ? d.format('YYYY-MM-DD') : d).join(' ~ ') :
                                    item.conditions[key]}
                                </Tag>
                              )
                            ))}
                          </div>
                        </div>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            form.setFieldsValue(item.conditions)
                            setAdvancedSearchVisible(false)
                            handleSearch(item.conditions)
                          }}
                        >
                          应用
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  暂无搜索历史
                </div>
              )}
            </Panel>

            <Panel header="保存的搜索" key="saved">
              {savedSearches.length > 0 ? (
                <div>
                  {savedSearches.map(item => (
                    <Card key={item.id} size="small" style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            保存于 {item.createdAt}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {Object.keys(item.conditions).map(key => (
                              item.conditions[key] && (
                                <Tag key={key} size="small">
                                  {key}: {Array.isArray(item.conditions[key]) ?
                                    item.conditions[key].map(d => d.format ? d.format('YYYY-MM-DD') : d).join(' ~ ') :
                                    item.conditions[key]}
                                </Tag>
                              )
                            ))}
                          </div>
                        </div>
                        <Space>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => applySavedSearch(item)}
                          >
                            应用
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => {
                              const updatedSavedSearches = savedSearches.filter(s => s.id !== item.id)
                              setSavedSearches(updatedSavedSearches)
                              localStorage.setItem('settlementOrder_savedSearches', JSON.stringify(updatedSavedSearches))
                              message.success('已删除保存的搜索')
                            }}
                          >
                            删除
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  暂无保存的搜索
                </div>
              )}
            </Panel>
          </Collapse>
        </Modal>
      </div>
    </MerchantLayout>
  )
}

export default SettlementOrder 