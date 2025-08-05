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
import * as XLSX from 'xlsx'
import MerchantLayout from './MerchantLayout'
import accountDetailAPI, { MERCHANT_TYPE_LABELS } from '@/api/accountDetail'

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
    pageSize: 10,
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

  // 原模拟数据（保留用于导出Excel时的示例）
  const [mockData] = useState([
    {
      key: '1',
      merchantType: '家政',
      merchantName: '张三家政服务',
      accountBalance: 2400,
      withdrawn: 1200,
      unwithdraw: 800,
      withdrawing: 400,
      serviceFee: 200,
      createTime: '2023-12-20',
      contactPhone: '13800138001',
      businessLicense: 'GL123456789',
      address: '北京市朝阳区XXX街道'
    },
    {
      key: '2',
      merchantType: '食品',
      merchantName: '李四餐饮店',
      accountBalance: 3600,
      withdrawn: 2000,
      unwithdraw: 1200,
      withdrawing: 400,
      serviceFee: 300,
      createTime: '2023-12-18',
      contactPhone: '13800138002',
      businessLicense: 'GL123456790',
      address: '上海市浦东新区XXX路'
    },
    {
      key: '3',
      merchantType: '服装',
      merchantName: '王五服装店',
      accountBalance: 5200,
      withdrawn: 3000,
      unwithdraw: 1800,
      withdrawing: 400,
      serviceFee: 450,
      createTime: '2023-12-15',
      contactPhone: '13800138003',
      businessLicense: 'GL123456791',
      address: '广州市天河区XXX大道'
    },
    {
      key: '4',
      merchantType: '电子',
      merchantName: '赵六电子商城',
      accountBalance: 8900,
      withdrawn: 5000,
      unwithdraw: 3200,
      withdrawing: 700,
      serviceFee: 680,
      createTime: '2023-12-25',
      contactPhone: '13800138004',
      businessLicense: 'GL123456792',
      address: '深圳市南山区XXX路'
    },
    {
      key: '5',
      merchantType: '家政',
      merchantName: '钱七清洁公司',
      accountBalance: 1800,
      withdrawn: 800,
      unwithdraw: 600,
      withdrawing: 400,
      serviceFee: 150,
      createTime: '2023-12-22',
      contactPhone: '13800138005',
      businessLicense: 'GL123456793',
      address: '杭州市西湖区XXX街'
    },
    {
      key: '6',
      merchantType: '食品',
      merchantName: '孙八小吃店',
      accountBalance: 2900,
      withdrawn: 1500,
      unwithdraw: 1000,
      withdrawing: 400,
      serviceFee: 220,
      createTime: '2023-12-26',
      contactPhone: '13800138006',
      businessLicense: 'GL123456794',
      address: '成都市高新区XXX道'
    },
    {
      key: '7',
      merchantType: '服装',
      merchantName: '周九时装店',
      accountBalance: 4200,
      withdrawn: 2500,
      unwithdraw: 1300,
      withdrawing: 400,
      serviceFee: 350,
      createTime: '2023-12-19',
      contactPhone: '13800138007',
      businessLicense: 'GL123456795',
      address: '武汉市武昌区XXX街'
    },
    {
      key: '8',
      merchantType: '电子',
      merchantName: '吴十数码店',
      accountBalance: 6800,
      withdrawn: 4000,
      unwithdraw: 2200,
      withdrawing: 600,
      serviceFee: 520,
      createTime: '2023-12-21',
      contactPhone: '13800138008',
      businessLicense: 'GL123456796',
      address: '西安市雁塔区XXX路'
    },
    {
      key: '9',
      merchantType: '家政',
      merchantName: '郑十一保洁',
      accountBalance: 3100,
      withdrawn: 1800,
      unwithdraw: 900,
      withdrawing: 400,
      serviceFee: 280,
      createTime: '2023-12-23',
      contactPhone: '13800138009',
      businessLicense: 'GL123456797',
      address: '南京市鼓楼区XXX街'
    },
    {
      key: '10',
      merchantType: '食品',
      merchantName: '王十二烘焙店',
      accountBalance: 7500,
      withdrawn: 4200,
      unwithdraw: 2700,
      withdrawing: 600,
      serviceFee: 580,
      createTime: '2023-12-24',
      contactPhone: '13800138010',
      businessLicense: 'GL123456798',
      address: '天津市和平区XXX路'
    }
  ])

  // API调用函数
  const fetchAccountDetailList = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const queryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      }

      // 添加筛选条件
      if (merchantType) queryParams.merchantType = merchantType
      if (merchantName) queryParams.merchantName = merchantName
      if (dateRange && dateRange.length === 2) {
        queryParams.startDate = dateRange[0].format('YYYY-MM-DD')
        queryParams.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      const response = await accountDetailAPI.getAccountDetailList(queryParams)

      if (response && response.data) {
        setAccountDetailData(response.data.list || [])
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0
        }))
      }
    } catch (error) {
      console.error('获取账户明细列表失败:', error)
      message.error('获取账户明细列表失败')
      setAccountDetailData([])
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, merchantType, merchantName, dateRange])

  const fetchAccountDetailStats = useCallback(async (params = {}) => {
    try {
      const queryParams = { ...params }

      // 添加筛选条件
      if (merchantType) queryParams.merchantType = merchantType
      if (merchantName) queryParams.merchantName = merchantName
      if (dateRange && dateRange.length === 2) {
        queryParams.startDate = dateRange[0].format('YYYY-MM-DD')
        queryParams.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      const response = await accountDetailAPI.getAccountDetailStats(queryParams)

      if (response && response.data) {
        setStatisticsData(response.data)
      }
    } catch (error) {
      console.error('获取账户统计信息失败:', error)
      message.error('获取账户统计信息失败')
    }
  }, [merchantType, merchantName, dateRange])

  // 组件加载时获取数据
  useEffect(() => {
    fetchAccountDetailList()
    fetchAccountDetailStats()
  }, [])

  // 当筛选条件或分页变化时重新获取数据
  useEffect(() => {
    fetchAccountDetailList()
    fetchAccountDetailStats()
  }, [pagination.current, pagination.pageSize, merchantType, merchantName, dateRange])

  // 表格列配置
  const columns = [
    {
      title: '商家类型',
      dataIndex: 'merchantType',
      key: 'merchantType',
      width: 120
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
    setPagination(prev => ({ ...prev, current: 1 })) // 重置到第一页
    await Promise.all([fetchAccountDetailList(), fetchAccountDetailStats()])
    message.success(`查询完成，共找到 ${accountDetailData.length} 条记录`)
  }

  // 重置处理
  const handleReset = () => {
    setDateRange([])
    setMerchantType('')
    setMerchantName('')
    setPagination(prev => ({ ...prev, current: 1 }))
    message.info('已重置搜索条件')
  }

  // 分页处理
  const handleTableChange = (paginationConfig, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }))
  }

  // 导出处理
  const handleExport = () => {
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
        '商家类型': item.merchantType,
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
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
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
                    <Option value="家政">家政</Option>
                    <Option value="食品">食品</Option>
                    <Option value="服装">服装</Option>
                    <Option value="电子">电子</Option>
                    <Option value="零售商">零售商</Option>
                    <Option value="批发商">批发商</Option>
                    <Option value="制造商">制造商</Option>
                    <Option value="分销商">分销商</Option>
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
            columns={columns}
            dataSource={accountDetailData}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              pageSizeOptions: ['5', '10', '20', '50', '100'],
              defaultPageSize: 10,
              onShowSizeChange: (current, size) => {
                setPagination(prev => ({
                  ...prev,
                  current: 1,
                  pageSize: size
                }))
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
                {selectedRecord.merchantType}
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