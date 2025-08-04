import React, { useState } from 'react'
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
  Divider
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const AccountDetail = () => {
  const [dateRange, setDateRange] = useState([
    dayjs('2023-12-26 00:00:00'),
    dayjs('2023-12-26 23:59:59')
  ])
  const [merchantType, setMerchantType] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [loading, setLoading] = useState(false)

  // 模拟统计数据
  const statisticsData = {
    totalAmount: 12200.00,
    accountBalance: 4800.00,
    withdrawn: 200.00,
    unwithdraw: 3400.00,
    withdrawing: 200.00,
    serviceFee: 3400.00,
    commission: 3400.00
  }

  // 模拟表格数据
  const [tableData] = useState([
    {
      key: '1',
      merchantType: '家政',
      merchantName: '商家名称商家名称',
      accountBalance: 2400,
      withdrawn: 2400,
      unwithdraw: 0,
      withdrawing: 500,
      serviceFee: 200
    },
    {
      key: '2',
      merchantType: '食品',
      merchantName: '商家名称商家名称',
      accountBalance: 2400,
      withdrawn: 2400,
      unwithdraw: 0,
      withdrawing: 0,
      serviceFee: 200
    },
    {
      key: '3',
      merchantType: '食品',
      merchantName: '商家名称商家名称',
      accountBalance: 2400,
      withdrawn: 2400,
      unwithdraw: 0,
      withdrawing: 0,
      serviceFee: 200,
    }
  ])

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
      render: (value) => value.toLocaleString()
    },
    {
      title: '已提现（元）',
      dataIndex: 'withdrawn',
      key: 'withdrawn',
      width: 130,
      render: (value) => value.toLocaleString()
    },
    {
      title: '未提现（元）',
      dataIndex: 'unwithdraw',
      key: 'unwithdraw',
      width: 130,
      render: (value) => value.toLocaleString()
    },
    {
      title: '提现中（元）',
      dataIndex: 'withdrawing',
      key: 'withdrawing',
      width: 130,
      render: (value) => value.toLocaleString()
    },
    {
      title: '服务费（元）',
      dataIndex: 'serviceFee',
      key: 'serviceFee',
      width: 130,
      render: (value) => value.toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: () => (
        <Button type="link" style={{ color: '#1890ff' }}>详情</Button>
      )
    }
  ]

  // 查询处理
  const handleQuery = () => {
    setLoading(true)
    // 模拟查询
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  // 重置处理
  const handleReset = () => {
    setDateRange([
      dayjs('2023-12-26 00:00:00'),
      dayjs('2023-12-26 23:59:59')
    ])
    setMerchantType('')
    setMerchantName('')
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
                  title="衣物总额（元）"
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

          {/* 数据表格 */}
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={{
              total: 1000,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `共 ${total} 条`,
              current: 1,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 1000 }}
            size="middle"
            bordered
          />
        </Card>
      </div>
    </MerchantLayout>
  )
}

export default AccountDetail 