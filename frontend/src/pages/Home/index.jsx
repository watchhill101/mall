import React, { useState, useEffect, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Pagination,
  Tooltip
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  ColumnHeightOutlined,
  EyeOutlined
} from '@ant-design/icons'
import './Home.module.scss'
import { getData } from './mockdata_P'

const { RangePicker } = DatePicker
const { Option } = Select

const Home = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState([]) // 存储所有数据
  const [filteredData, setFilteredData] = useState([]) // 存储筛选后的数据
  const [searchParams, setSearchParams] = useState({}) // 存储搜索参数
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0
  })

  // 从mockdata_P获取数据并转换为表格格式
  const generateTableData = () => {
    const mockData = getData()
    return mockData.map((item, index) => ({
      id: item.id,
      contact: {
        name: item.name,
        phone: item.phone
      },
      merchantType: item.type,
      city: item.city,
      remarks: item.remarks,
      status: item.status,
      statusText: item.status === 'pending' ? '待审核' : item.status === 'approved' ? '已通过' : '已拒绝',
      applicationTime: item.createTime,
      reviewer: item.status === 'pending' ? '' : item.name, // 待审核时审核人为空
      reviewTime: item.status === 'pending' ? '' : item.updateTime, // 待审核时审核时间为空
      canOperate: item.status === 'pending' // 只有待审核状态才能操作
    }))
  }

  // 筛选数据
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按联系电话筛选
      if (params.phone && !item.contact.phone.includes(params.phone)) {
        return false
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false
      }

      // 按审核时间范围筛选
      if (params.reviewTime && params.reviewTime.length === 2) {
        const [startDate, endDate] = params.reviewTime
        const itemDate = new Date(item.applicationTime)

        if (startDate && itemDate < startDate.startOf('day').toDate()) {
          return false
        }

        if (endDate && itemDate > endDate.endOf('day').toDate()) {
          return false
        }
      }

      return true
    })
  }

  // 计算当前页的数据
  const currentPageData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, pagination.current, pagination.pageSize])

  useEffect(() => {
    const tableData = generateTableData()
    setAllData(tableData)
    setFilteredData(tableData)
    setPagination(prev => ({ ...prev, total: tableData.length }))
  }, [])

  // 搜索处理
  const handleSearch = (values) => {
    console.log('搜索条件:', values)
    setLoading(true)

    // 模拟API调用延迟
    setTimeout(() => {
      const filtered = filterData(allData, values)
      setFilteredData(filtered)
      setSearchParams(values)
      setPagination(prev => ({
        ...prev,
        current: 1,
        total: filtered.length
      }))
      setLoading(false)
    }, 500)
  }

  // 重置处理
  const handleReset = () => {
    form.resetFields()
    setFilteredData(allData)
    setSearchParams({})
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: allData.length
    }))
  }

  // 审核操作
  const handleReview = (id, action) => {
    console.log(`审核操作: ${action}, ID: ${id}`)
    // 这里可以调用API更新状态
    const updatedData = allData.map(item =>
      item.id === id
        ? {
          ...item,
          status: action === 'approve' ? 'approved' : 'rejected',
          statusText: action === 'approve' ? '已通过' : '已拒绝',
          reviewer: '当前用户', // 这里应该是当前登录用户
          reviewTime: new Date().toLocaleString(),
          canOperate: false
        }
        : item
    )

    setAllData(updatedData)
    // 重新应用筛选条件
    const filtered = filterData(updatedData, searchParams)
    setFilteredData(filtered)
    setPagination(prev => ({
      ...prev,
      total: filtered.length
    }))
  }

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center'
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 150,
      render: (contact) => (
        <div>
          <div>{contact.name}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{contact.phone}</div>
        </div>
      )
    },
    {
      title: '商家类型',
      dataIndex: 'merchantType',
      key: 'merchantType',
      width: 120,
      align: 'center'
    },
    {
      title: '所在城市',
      dataIndex: 'city',
      key: 'city',
      width: 200
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      render: () => '备注内容备注内容'
    },
    {
      title: '备注',
      dataIndex: 'remarks2',
      key: 'remarks2',
      width: 150,
      render: () => '备注内容备注内容'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status, record) => {
        let color = ''
        switch (status) {
          case 'pending':
            color = '#1890ff'
            break
          case 'approved':
            color = '#52c41a'
            break
          case 'rejected':
            color = '#ff4d4f'
            break
          default:
            color = '#d9d9d9'
        }
        return <Tag color={color}>{record.statusText}</Tag>
      }
    },
    {
      title: '申请时间',
      dataIndex: 'applicationTime',
      key: 'applicationTime',
      width: 150,
      align: 'center'
    },
    {
      title: '审核人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 100,
      align: 'center'
    },
    {
      title: '审核时间',
      dataIndex: 'reviewTime',
      key: 'reviewTime',
      width: 150,
      align: 'center'
    },
    {
      title: '操作',
      key: 'operation',
      width: 120,
      align: 'center',
      render: (_, record) => (
        record.canOperate ? (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => handleReview(record.id, 'approve')}
            >
              通过
            </Button>
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleReview(record.id, 'reject')}
            >
              拒绝
            </Button>
          </Space>
        ) : null
      )
    }
  ]

  // 分页处理
  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }

  return (
    <div className="home-container">
      {/* 搜索栏 */}
      <Card className="search-card">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          className="search-form"
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item label="审核时间" name="reviewTime">
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="联系电话" name="phone">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="状态" name="status">
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="pending">待审核</Option>
                  <Option value="approved">已通过</Option>
                  <Option value="rejected">已拒绝</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
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
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card className="table-card">
        <div className="table-header">
          <div className="table-title">审核管理</div>
          <div className="table-actions">
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
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={currentPageData}
          rowKey="id"
          pagination={false}
          loading={loading}
          scroll={{ x: 1200 }}
          size="middle"
          className="data-table"
        />

        {/* 分页 */}
        <div className="pagination-container">
          <div className="pagination-info">
            共{pagination.total}条
          </div>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            pageSizeOptions={[2, 4, 6, 8, 10]}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
          />
        </div>
      </Card>
    </div>
  )
}

export default Home
