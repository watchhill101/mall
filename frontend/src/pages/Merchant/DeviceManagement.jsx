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
  Modal,
  message
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FullscreenOutlined,
  ColumnHeightOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { Option } = Select

const DeviceManagement = () => {
  const [form] = Form.useForm()
  const [modalForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchParams, setSearchParams] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0
  })

  // 模态框相关状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' 或 'edit'
  const [selectedRecord, setSelectedRecord] = useState(null)

  // 模拟设备管理数据
  const mockDeviceData = [
    {
      id: 1,
      merchantName: '商家名称商家名称',
      deviceName: '打印机',
      deviceType: '打印机',
      deviceCode: 'SMS992312S092',
      deviceKey: '7xd8pxg',
      status: 'online',
      updateTime: '2023-12-12 12:12:12'
    },
    {
      id: 2,
      merchantName: '商家名称商家名称',
      deviceName: '语音播报',
      deviceType: '语音播报',
      deviceCode: 'SMS992312S092',
      deviceKey: '',
      status: 'online',
      updateTime: '2023-12-12 12:12:12'
    },
    {
      id: 3,
      merchantName: '商家名称商家名称',
      deviceName: '语音播报',
      deviceType: '语音播报',
      deviceCode: 'SMS992312S092',
      deviceKey: '',
      status: 'offline',
      updateTime: '2023-12-12 12:12:12'
    },
    {
      id: 4,
      merchantName: '清风超市',
      deviceName: '收银设备',
      deviceType: '收银机',
      deviceCode: 'SMS992312S093',
      deviceKey: '8xe9qyh',
      status: 'online',
      updateTime: '2023-12-13 10:30:00'
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
    setAllData(mockDeviceData)
    setFilteredData(mockDeviceData)
    setPagination(prev => ({ ...prev, total: mockDeviceData.length }))
  }, [])

  // 筛选数据
  const filterData = (data, params) => {
    return data.filter(item => {
      // 按设备编号筛选
      if (params.deviceCode && !item.deviceCode.toLowerCase().includes(params.deviceCode.toLowerCase())) {
        return false
      }

      // 按商家名称筛选
      if (params.merchantName && !item.merchantName.toLowerCase().includes(params.merchantName.toLowerCase())) {
        return false
      }

      // 按状态筛选
      if (params.status && item.status !== params.status) {
        return false
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

  // 新增设备
  const handleAdd = () => {
    setModalType('add')
    setSelectedRecord(null)
    modalForm.resetFields()
    setModalVisible(true)
  }

  // 修改设备
  const handleEdit = (record) => {
    setModalType('edit')
    setSelectedRecord(record)
    modalForm.setFieldsValue(record)
    setModalVisible(true)
  }

  // 删除设备
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该设备吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      onOk: () => {
        const updatedData = allData.filter(item => item.id !== record.id)
        setAllData(updatedData)

        const filtered = filterData(updatedData, searchParams)
        setFilteredData(filtered)
        setPagination(prev => ({ ...prev, total: filtered.length }))

        message.success('删除成功')
      }
    })
  }

  // 保存模态框数据
  const handleModalOk = (values) => {
    if (modalType === 'add') {
      const newRecord = {
        id: Date.now(),
        ...values,
        status: 'online',
        updateTime: new Date().toLocaleString()
      }
      const updatedData = [...allData, newRecord]
      setAllData(updatedData)

      const filtered = filterData(updatedData, searchParams)
      setFilteredData(filtered)
      setPagination(prev => ({ ...prev, total: filtered.length }))

      message.success('添加成功')
    } else {
      const updatedData = allData.map(item =>
        item.id === selectedRecord.id ? { ...item, ...values, updateTime: new Date().toLocaleString() } : item
      )
      setAllData(updatedData)

      const filtered = filterData(updatedData, searchParams)
      setFilteredData(filtered)

      message.success('修改成功')
    }
    setModalVisible(false)
  }

  // 关闭模态框
  const handleModalCancel = () => {
    setModalVisible(false)
    setSelectedRecord(null)
    modalForm.resetFields()
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '商家名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 150
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 150
    },
    {
      title: '设备密钥',
      dataIndex: 'deviceKey',
      key: 'deviceKey',
      width: 120,
      render: (key) => key || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusMap = {
          online: { color: 'green', text: '正常' },
          offline: { color: 'red', text: '离线' },
          maintenance: { color: 'orange', text: '维护中' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            修改
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索表单 */}
        <Card className="search-card" style={{ marginBottom: '16px' }}>
          <Form form={form} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="设备编号" name="deviceCode">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="所属商家" name="merchantName">
                  <Select placeholder="搜索" showSearch style={{ width: '100%' }}>
                    <Option value="商家名称商家名称">商家名称商家名称</Option>
                    <Option value="清风超市">清风超市</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="状态" name="status">
                  <Select placeholder="请选择" style={{ width: '100%' }}>
                    <Option value="online">正常</Option>
                    <Option value="offline">离线</Option>
                    <Option value="maintenance">维护中</Option>
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增
              </Button>
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
            scroll={{ x: 1100 }}
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
              pageSizeOptions={['2', '5', '10', '20', '50', '100']}
              defaultPageSize={2}
            />
          </div>
        </Card>

        {/* 新增/编辑模态框 */}
        <Modal
          title={modalType === 'add' ? '新增设备' : '编辑设备'}
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
        >
          <Form
            form={modalForm}
            layout="vertical"
            onFinish={handleModalOk}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="商家名称"
                  name="merchantName"
                  rules={[{ required: true, message: '请输入商家名称' }]}
                >
                  <Input placeholder="请输入商家名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="设备名称"
                  name="deviceName"
                  rules={[{ required: true, message: '请输入设备名称' }]}
                >
                  <Input placeholder="请输入设备名称" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="设备类型"
                  name="deviceType"
                  rules={[{ required: true, message: '请选择设备类型' }]}
                >
                  <Select placeholder="请选择设备类型">
                    <Option value="打印机">打印机</Option>
                    <Option value="语音播报">语音播报</Option>
                    <Option value="收银机">收银机</Option>
                    <Option value="扫码设备">扫码设备</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="设备编号"
                  name="deviceCode"
                  rules={[{ required: true, message: '请输入设备编号' }]}
                >
                  <Input placeholder="请输入设备编号" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="设备密钥"
                  name="deviceKey"
                >
                  <Input placeholder="请输入设备密钥" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="设备状态"
                  name="status"
                  rules={[{ required: true, message: '请选择设备状态' }]}
                >
                  <Select placeholder="请选择设备状态">
                    <Option value="online">正常</Option>
                    <Option value="offline">离线</Option>
                    <Option value="maintenance">维护中</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                  <Space>
                    <Button onClick={handleModalCancel}>
                      取消
                    </Button>
                    <Button type="primary" htmlType="submit">
                      确定
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </MerchantLayout>
  )
}

export default DeviceManagement 