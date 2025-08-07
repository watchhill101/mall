import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Card,
  Typography,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Input,
  Divider,
  Modal,
  Descriptions,
  message,
  Tooltip
} from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, FileExcelOutlined, FullscreenOutlined, ColumnHeightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
// import * as XLSX from 'xlsx'  // 临时注释，需要时请安装: npm install xlsx
import MerchantLayout from './MerchantLayout'
import accountDetailAPI, { MERCHANT_TYPES, MERCHANT_TYPE_LABELS } from '@/api/accountDetail'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const AccountDetail = () => {
  const [dateRange, setDateRange] = useState([])
  const [merchantType, setMerchantType] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0
  })

  // 真实数据状态
  const [accountDetailData, setAccountDetailData] = useState([])
  const [statisticsData, setStatisticsData] = useState({
    totalAmount: 0,
    accountBalance: 0,
    withdrawn: 0,
    unwithdraw: 0,
    withdrawing: 0,
    serviceFee: 0,
    commission: 0
  })
  const [forceUpdate, setForceUpdate] = useState(0) // 用于确保状态更新后正确渲染

  // 监听统计数据变化
  useEffect(() => {
    console.log('📊 统计数据状态更新:', statisticsData)
  }, [statisticsData])



  // 数据加载函数
  const loadAccountDetailList = async (params = {}) => {
    try {
      setLoading(true)

      const queryParams = {
        page: 1,
        pageSize: 2,
        ...params
      }

      const response = await accountDetailAPI.getAccountDetailList(queryParams)

      if (response && response.data) {
        const newPagination = {
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: response.data.pagination?.total || 0
        }

        const dataList = response.data.list || []
        setAccountDetailData(dataList)
        setPagination(newPagination)
        setForceUpdate(prev => prev + 1) // 确保组件重新渲染

        console.log('✅ 获取账户明细列表成功，共', response.data.list?.length || 0, '条记录')
        console.log('🧪 列表API响应:', response.data)
        return response.data
      }
    } catch (error) {
      console.error('❌ 获取账户明细列表失败:', error)
      message.error('获取账户明细列表失败: ' + (error.message || '网络错误'))
      setAccountDetailData([])
      setPagination({
        current: 1,
        pageSize: 2,
        total: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAccountDetailStats = async (params = {}) => {
    try {
      const response = await accountDetailAPI.getAccountDetailStats(params)

      if (response && response.data) {
        setStatisticsData(response.data)
        setForceUpdate(prev => prev + 1) // 确保统计卡片重新渲染
        console.log('✅ 获取统计信息成功:', response.data)
        return response.data
      }
    } catch (error) {
      console.error('❌ 获取账户统计信息失败:', error)
      message.error('获取账户统计信息失败: ' + (error.message || '网络错误'))
    }
  }

  // 测试函数：直接调用API
  const testDirectAPICall = async () => {
    console.log('🧪 开始测试AccountDetail API调用...')
    try {
      console.log('🧪 测试列表接口...')
      const listResponse = await accountDetailAPI.getAccountDetailList({ page: 1, pageSize: 2 })
      console.log('🧪 列表API响应:', listResponse)

      console.log('🧪 测试统计接口...')
      const statsResponse = await accountDetailAPI.getAccountDetailStats({})
      console.log('🧪 统计API响应:', statsResponse)

      if (listResponse && listResponse.data && listResponse.data.list) {
        console.log('🧪 手动设置列表数据...')
        setAccountDetailData(listResponse.data.list)
        setPagination(prev => ({
          ...prev,
          total: listResponse.data.pagination?.total || 0
        }))
      }

      if (statsResponse && statsResponse.data) {
        console.log('🧪 手动设置统计数据...')
        setStatisticsData(statsResponse.data)
      }

      setForceUpdate(prev => prev + 1)
      console.log('🧪 状态设置完成')
    } catch (error) {
      console.error('🧪 直接API调用失败:', error)
    }
  }



  // 初始化数据获取
  useEffect(() => {
    const initData = async () => {
      try {
        console.log('🚀 AccountDetail组件初始化，开始获取数据...')
        setLoading(true)

        // 先获取统计数据
        console.log('📊 获取统计数据...')
        await loadAccountDetailStats()

        // 再获取列表数据
        console.log('📋 获取列表数据...')
        await loadAccountDetailList({ page: 1, pageSize: 2 })

        console.log('✅ 初始化完成')
      } catch (error) {
        console.error('❌ 初始化数据获取失败:', error)
      }
    }
    initData()
  }, [])

  // 表格列配置
  const columns = [
    {
      title: '商家类型',
      dataIndex: 'merchantType',
      key: 'merchantType',
      width: 120,
      render: (merchantType) => MERCHANT_TYPE_LABELS[merchantType] || merchantType
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 200
    },
    {
      title: '账户余额（元）',
      dataIndex: 'accountBalance',
      key: 'accountBalance',
      width: 150,
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.accountBalance - b.accountBalance
    },
    {
      title: '已提现（元）',
      dataIndex: 'withdrawn',
      key: 'withdrawn',
      width: 130,
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.withdrawn - b.withdrawn
    },
    {
      title: '未提现（元）',
      dataIndex: 'unwithdraw',
      key: 'unwithdraw',
      width: 130,
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.unwithdraw - b.unwithdraw
    },
    {
      title: '提现中（元）',
      dataIndex: 'withdrawing',
      key: 'withdrawing',
      width: 130,
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.withdrawing - b.withdrawing
    },
    {
      title: '服务费（元）',
      dataIndex: 'serviceFee',
      key: 'serviceFee',
      width: 130,
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.serviceFee - b.serviceFee
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          style={{ color: '#1890ff' }}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      )
    }
  ]

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  // 查询处理
  const handleQuery = async () => {
    try {
      setLoading(true)
      setPagination(prev => ({ ...prev, current: 1 })) // 重置到第一页

      // 立即使用当前的筛选条件进行查询
      const queryParams = { page: 1, pageSize: pagination.pageSize || 2 }
      if (merchantType) queryParams.merchantType = merchantType
      if (merchantName) queryParams.merchantName = merchantName
      if (dateRange && dateRange.length === 2) {
        queryParams.startDate = dateRange[0].format('YYYY-MM-DD')
        queryParams.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      await Promise.all([
        loadAccountDetailList(queryParams),
        loadAccountDetailStats(queryParams)
      ])
      message.success('查询完成')
    } catch (error) {
      message.error('查询失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 重置处理
  const handleReset = async () => {
    try {
      setLoading(true)
      setDateRange([])
      setMerchantType('')
      setMerchantName('')
      setPagination(prev => ({ ...prev, current: 1 }))

      // 使用空的筛选条件重新获取数据
      const queryParams = { page: 1, pageSize: pagination.pageSize || 2 }
      await Promise.all([
        loadAccountDetailList(queryParams),
        loadAccountDetailStats(queryParams)
      ])
      message.info('已重置搜索条件')
    } catch (error) {
      message.error('重置失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 分页处理
  const handleTableChange = (paginationConfig, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }))

    // 使用新的分页参数立即获取数据
    const queryParams = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }
    if (merchantType) queryParams.merchantType = merchantType
    if (merchantName) queryParams.merchantName = merchantName
    if (dateRange && dateRange.length === 2) {
      queryParams.startDate = dateRange[0].format('YYYY-MM-DD')
      queryParams.endDate = dateRange[1].format('YYYY-MM-DD')
    }

    loadAccountDetailList(queryParams)
  }

  // 导出处理
  const handleExport = () => {
    alert('导出功能需要安装xlsx库。请运行: npm install xlsx')
    return
    
    /* 原始导出代码（安装xlsx后取消注释）
    try {
      // 创建工作簿
      const workBook = XLSX.utils.book_new()

      // 1. 创建统计数据工作表 - 使用当前统计数据
      const allDataStatistics = {
        totalAmount: statisticsData.totalAmount || 0,
        accountBalance: statisticsData.accountBalance || 0,
        withdrawn: statisticsData.withdrawn || 0,
        unwithdraw: statisticsData.unwithdraw || 0,
        withdrawing: statisticsData.withdrawing || 0,
        serviceFee: statisticsData.serviceFee || 0,
        commission: statisticsData.commission || 0
      }

      const statisticsDataForExport = [
        { '统计项目': '资金总额（元）', '数值': allDataStatistics.totalAmount.toFixed(2) },
        { '统计项目': '商家账户余额', '数值': allDataStatistics.accountBalance.toFixed(2) },
        { '统计项目': '已提现', '数值': allDataStatistics.withdrawn.toFixed(2) },
        { '统计项目': '未提现', '数值': allDataStatistics.unwithdraw.toFixed(2) },
        { '统计项目': '提现中', '数值': allDataStatistics.withdrawing.toFixed(2) },
        { '统计项目': '服务费', '数值': allDataStatistics.serviceFee.toFixed(2) },
        { '统计项目': '分润佣金', '数值': allDataStatistics.commission.toFixed(2) }
      ]

      const statisticsSheet = XLSX.utils.json_to_sheet(statisticsDataForExport)
      statisticsSheet['!cols'] = [
        { wch: 20 },  // 统计项目
        { wch: 15 }   // 数值
      ]
      XLSX.utils.book_append_sheet(workBook, statisticsSheet, '账户统计')

      // 2. 创建详细数据工作表
      const detailData = accountDetailData.map((item, index) => ({
        '序号': index + 1,
        '商家类型': MERCHANT_TYPE_LABELS[item.merchantType] || item.merchantType,
        '商家名称': item.merchantName,
        '联系电话': item.contactPhone,
        '营业执照号': item.businessLicense,
        '注册时间': item.createTime,
        '地址': item.address,
        '账户余额(元)': item.accountBalance,
        '已提现(元)': item.withdrawn,
        '未提现(元)': item.unwithdraw,
        '提现中(元)': item.withdrawing,
        '服务费(元)': item.serviceFee
      }))

      const detailSheet = XLSX.utils.json_to_sheet(detailData)
      detailSheet['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 12 },  // 商家类型
        { wch: 20 },  // 商家名称
        { wch: 15 },  // 联系电话
        { wch: 18 },  // 营业执照号
        { wch: 12 },  // 注册时间
        { wch: 30 },  // 地址
        { wch: 15 },  // 账户余额
        { wch: 12 },  // 已提现
        { wch: 12 },  // 未提现
        { wch: 12 },  // 提现中
        { wch: 12 }   // 服务费
      ]
      XLSX.utils.book_append_sheet(workBook, detailSheet, '商家账户明细')

      // 3. 生成文件名
      const now = dayjs().format('YYYY-MM-DD_HH-mm-ss')
      const fileName = `商家账户明细_全部数据_${now}.xlsx`

      // 4. 导出文件
      XLSX.writeFile(workBook, fileName)

      message.success(`成功导出Excel文件：${fileName}，包含 ${accountDetailData.length} 条记录`)

    } catch (error) {
      console.error('导出Excel时出错:', error)
      message.error('导出Excel失败，请重试')
    }
    */
  }

  // 关闭详情模态框
  const handleDetailModalClose = () => {
    setDetailModalVisible(false)
    setSelectedRecord(null)
  }

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          {/* 账户概况标题 */}
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>账户概况</Title>
          </div>

          {/* 日期筛选区域 */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: '#fafafa',
            borderRadius: '6px'
          }}>
            <Space>
              <span>日期范围：</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['开始时间', '结束时间']}
                style={{ width: 350 }}
              />
              <Button type="primary" onClick={handleQuery}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </div>

          {/* 统计数据卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }} key={`stats-${forceUpdate}`}>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="资金总额（元）"
                  value={statisticsData.totalAmount}
                  precision={2}
                  valueStyle={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="商家账户余额"
                  value={statisticsData.accountBalance}
                  precision={2}
                  valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="已提现"
                  value={statisticsData.withdrawn}
                  precision={2}
                  valueStyle={{ color: '#722ed1', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="未提现"
                  value={statisticsData.unwithdraw}
                  precision={2}
                  valueStyle={{ color: '#fa8c16', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="提现中"
                  value={statisticsData.withdrawing}
                  precision={2}
                  valueStyle={{ color: '#eb2f96', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="服务费"
                  value={statisticsData.serviceFee}
                  precision={2}
                  valueStyle={{ color: '#13c2c2', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col span={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="分润佣金"
                  value={statisticsData.commission}
                  precision={2}
                  valueStyle={{ color: '#a0d911', fontSize: '18px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* 商家账户明细标题 */}
          <div style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>商家账户明细</Title>
          </div>

          {/* 搜索筛选区域 */}
          <div style={{
            marginBottom: '16px',
            padding: '16px',
            background: '#fafafa',
            borderRadius: '6px'
          }}>
            <Row gutter={16} align="middle">
              <Col>
                <Space>
                  <span>商家类型：</span>
                  <Select
                    value={merchantType}
                    onChange={setMerchantType}
                    placeholder="请选择"
                    style={{ width: 120 }}
                    allowClear
                  >
                    <Option value={MERCHANT_TYPES.RETAIL}>{MERCHANT_TYPE_LABELS[MERCHANT_TYPES.RETAIL]}</Option>
                    <Option value={MERCHANT_TYPES.WHOLESALE}>{MERCHANT_TYPE_LABELS[MERCHANT_TYPES.WHOLESALE]}</Option>
                    <Option value={MERCHANT_TYPES.MANUFACTURER}>{MERCHANT_TYPE_LABELS[MERCHANT_TYPES.MANUFACTURER]}</Option>
                    <Option value={MERCHANT_TYPES.DISTRIBUTOR}>{MERCHANT_TYPE_LABELS[MERCHANT_TYPES.DISTRIBUTOR]}</Option>
                  </Select>
                </Space>
              </Col>
              <Col>
                <Space>
                  <span>商家名称：</span>
                  <Input
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="请输入"
                    style={{ width: 200 }}
                    onPressEnter={handleQuery}
                  />
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleQuery}
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
              </Col>
            </Row>
          </div>

          {/* 搜索结果提示 */}
          {((dateRange && dateRange.length > 0) || merchantType || merchantName) && (
            <div style={{ marginBottom: '16px', color: '#666' }}>
              <span>
                筛选结果：共找到 {pagination.total} 条记录
                {(dateRange && dateRange.length === 2) && <span>（日期：{dateRange[0].format('YYYY-MM-DD')} 至 {dateRange[1].format('YYYY-MM-DD')}）</span>}
                {merchantType && <span>（类型：{merchantType}）</span>}
                {merchantName && <span>（名称："{merchantName}"）</span>}
              </span>
            </div>
          )}

          {/* 表格操作栏 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExport}
              >
                导出Excel
              </Button>
              <Button
                style={{ marginLeft: '8px' }}
                onClick={testDirectAPICall}
              >
                🧪 测试API
              </Button>
            </div>
            <div>
              <Space>
                <Tooltip title="刷新">
                  <Button type="text" icon={<ReloadOutlined />} onClick={handleQuery} />
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

          {/* 数据表格 */}
          <Table
            key={`table-${forceUpdate}`}
            columns={columns}
            dataSource={accountDetailData}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条 (实际数据: ${accountDetailData.length} 条)`,
              pageSizeOptions: ['2', '5', '10', '20', '50'],
              defaultPageSize: 2,
              onShowSizeChange: (current, size) => {
                setPagination(prev => ({
                  ...prev,
                  current: 1,
                  pageSize: size
                }))

                // 使用新的页面大小立即获取数据
                const queryParams = { page: 1, pageSize: size }
                if (merchantType) queryParams.merchantType = merchantType
                if (merchantName) queryParams.merchantName = merchantName
                if (dateRange && dateRange.length === 2) {
                  queryParams.startDate = dateRange[0].format('YYYY-MM-DD')
                  queryParams.endDate = dateRange[1].format('YYYY-MM-DD')
                }

                loadAccountDetailList(queryParams)
              }
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            size="middle"
            bordered
          />
        </Card>

        {/* 详情查看模态框 */}
        <Modal
          title="商家账户详情"
          open={detailModalVisible}
          onCancel={handleDetailModalClose}
          footer={[
            <Button key="close" onClick={handleDetailModalClose}>
              关闭
            </Button>
          ]}
          width={800}
        >
          {selectedRecord && (
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="商家名称" span={2}>
                {selectedRecord.merchantName}
              </Descriptions.Item>
              <Descriptions.Item label="商家类型">
                {MERCHANT_TYPE_LABELS[selectedRecord.merchantType] || selectedRecord.merchantType}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {selectedRecord.contactPhone}
              </Descriptions.Item>
              <Descriptions.Item label="营业执照号">
                {selectedRecord.businessLicense}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {selectedRecord.createTime}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                {selectedRecord.address}
              </Descriptions.Item>
              <Descriptions.Item label="账户余额（元)">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ¥{selectedRecord.accountBalance.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="已提现（元）">
                <span style={{ color: '#722ed1', fontWeight: 'bold' }}>
                  ¥{selectedRecord.withdrawn.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="未提现（元）">
                <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                  ¥{selectedRecord.unwithdraw.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="提现中（元）">
                <span style={{ color: '#eb2f96', fontWeight: 'bold' }}>
                  ¥{selectedRecord.withdrawing.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="服务费（元）" span={2}>
                <span style={{ color: '#13c2c2', fontWeight: 'bold' }}>
                  ¥{selectedRecord.serviceFee.toLocaleString()}
                </span>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </MerchantLayout>
  )
}

export default AccountDetail 