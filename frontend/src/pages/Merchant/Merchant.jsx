import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, Typography, Table, Button, Space, Input, Select, Tag, message, Popconfirm, Modal, Form, Row, Col, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'
import merchantAPI, {
    MERCHANT_STATUS,
    MERCHANT_STATUS_LABELS,
    MERCHANT_STATUS_COLORS,
    MERCHANT_TYPES,
    MERCHANT_TYPE_LABELS
} from '@/api/merchant'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const Merchant = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [viewModalVisible, setViewModalVisible] = useState(false)
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [currentRecord, setCurrentRecord] = useState(null)
    const [modalType, setModalType] = useState('add') // 'add', 'edit'
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 2,
        total: 0
    })

    // 商户数据状态
    const [merchantData, setMerchantData] = useState([])

    // 加载商户数据
    const loadMerchantData = useCallback(async () => {
        try {
            setLoading(true)
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                searchText,
                status: statusFilter
            }

            const response = await merchantAPI.getMerchantList(params)

            if (response.code === 200) {
                const merchants = response.data.list.map(item => ({
                    ...item,
                    key: item._id,
                    id: item._id,
                    contact: item.personInCharge?.name || '未设置',
                    createTime: new Date(item.createdAt).toLocaleDateString()
                }))

                setMerchantData(merchants)
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total
                }))
            }
        } catch (error) {
            console.error('获取商户列表失败:', error)
            message.error('获取商户列表失败：' + (error.message || '未知错误'))
        } finally {
            setLoading(false)
        }
    }, [pagination.current, pagination.pageSize, searchText, statusFilter])

    // 初始化加载数据
    useEffect(() => {
        loadMerchantData()
    }, [loadMerchantData])

    // 由于使用API分页，不需要前端筛选和分页逻辑
    // 搜索和筛选变化时重新加载数据
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, current: 1 }))
        }, 500) // 防抖500ms

        return () => clearTimeout(timer)
    }, [searchText, statusFilter])

    // 表格列配置
    const columns = [
        {
            title: '商家ID',
            dataIndex: 'id',
            key: 'id',
            width: 100
        },
        {
            title: '商家名称',
            dataIndex: 'name',
            key: 'name',
            width: 150
        },
        {
            title: '联系人',
            dataIndex: 'contact',
            key: 'contact',
            width: 100
        },
        {
            title: '联系电话',
            dataIndex: 'phone',
            key: 'phone',
            width: 120
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 180
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={MERCHANT_STATUS_COLORS[status]}>
                    {MERCHANT_STATUS_LABELS[status]}
                </Tag>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 120
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        查看
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个商家吗？"
                        onConfirm={() => handleDelete(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    // 行选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE
        ]
    }



    // 处理函数
    const handleAdd = () => {
        setModalType('add')
        setCurrentRecord(null)
        setModalVisible(true)
        form.resetFields()
    }

    const handleView = (record) => {
        setCurrentRecord(record)
        setViewModalVisible(true)
    }

    const handleEdit = (record) => {
        setModalType('edit')
        setCurrentRecord(record)
        setEditModalVisible(true)
        form.setFieldsValue(record)
    }

    const handleDelete = async (record) => {
        try {
            const response = await merchantAPI.deleteMerchant(record._id)
            if (response.code === 200) {
                message.success(`删除商户成功：${record.name}`)
                // 清除已删除项的选中状态
                setSelectedRowKeys(prev => prev.filter(key => key !== record.key))
                // 重新加载数据
                loadMerchantData()
            }
        } catch (error) {
            console.error('删除商户失败:', error)
            message.error('删除商户失败：' + (error.message || '未知错误'))
        }
    }

    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要删除的商户')
            return
        }

        try {
            // 获取选中的商户ID（使用_id而不是key）
            const selectedMerchants = merchantData.filter(item => selectedRowKeys.includes(item.key))
            const merchantIds = selectedMerchants.map(item => item._id)

            const response = await merchantAPI.batchDeleteMerchants(merchantIds)
            if (response.code === 200) {
                message.success(`批量删除成功：${response.data.deletedCount} 个商户`)
                setSelectedRowKeys([])
                // 重新加载数据
                loadMerchantData()
            }
        } catch (error) {
            console.error('批量删除商户失败:', error)
            message.error('批量删除商户失败：' + (error.message || '未知错误'))
        }
    }

    // 搜索处理
    const handleSearch = (value) => {
        setSearchText(value)
    }

    // 状态筛选处理
    const handleStatusFilter = (value) => {
        setStatusFilter(value)
    }

    // 分页处理
    const handleTableChange = (paginationConfig) => {
        setPagination(prev => ({
            ...prev,
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize
        }))
    }

    // 模态框确认处理（新增和编辑）
    const handleModalOk = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    setLoading(true)

                    if (modalType === 'add') {
                        // 新增逻辑
                        const merchantData = {
                            name: values.name,
                            merchantType: values.merchantType || MERCHANT_TYPES.RETAIL,
                            isSelfOperated: values.isSelfOperated || false,
                            phone: values.phone,
                            address: values.address,
                            logoUrl: values.logoUrl || 'https://via.placeholder.com/100',
                            personInCharge: values.personInCharge,
                            role: values.role,
                            serviceCharge: values.serviceCharge || 0.1,
                            businessLicense: values.businessLicense,
                            taxNumber: values.taxNumber
                        }

                        const response = await merchantAPI.createMerchant(merchantData)
                        if (response.code === 201) {
                            message.success('添加商户成功')
                            setModalVisible(false)
                            loadMerchantData()
                        }
                    } else {
                        // 编辑逻辑
                        const response = await merchantAPI.updateMerchant(currentRecord._id, values)
                        if (response.code === 200) {
                            message.success('编辑商户成功')
                            setEditModalVisible(false)
                            loadMerchantData()
                        }
                    }

                    form.resetFields()
                    setCurrentRecord(null)
                } catch (error) {
                    console.error('操作失败:', error)
                    message.error('操作失败：' + (error.message || '未知错误'))
                } finally {
                    setLoading(false)
                }
            })
            .catch(info => {
                console.log('表单验证失败:', info)
            })
    }

    // 模态框取消处理
    const handleModalCancel = () => {
        setModalVisible(false)
        setEditModalVisible(false)
        setViewModalVisible(false)
        form.resetFields()
        setCurrentRecord(null)
    }

    return (
        <MerchantLayout>
            <div style={{ padding: '24px' }}>
                <Card>
                    <div style={{ marginBottom: '16px' }}>
                        <Title level={3} style={{ margin: 0 }}>商家管理</Title>
                        <p style={{ color: '#666', margin: '8px 0 0 0' }}>管理平台所有商家信息</p>
                    </div>

                    {/* 搜索和操作区域 */}
                    <div style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <Space>
                            <Search
                                placeholder="搜索商家名称、联系人、电话"
                                allowClear
                                style={{ width: 300 }}
                                onSearch={handleSearch}
                                onChange={(e) => !e.target.value && setSearchText('')}
                                enterButton={<SearchOutlined />}
                            />
                            <Select
                                placeholder="状态筛选"
                                style={{ width: 120 }}
                                allowClear
                                onChange={handleStatusFilter}
                                value={statusFilter || undefined}
                            >
                                {Object.entries(MERCHANT_STATUS_LABELS).map(([value, label]) => (
                                    <Option key={value} value={value}>{label}</Option>
                                ))}
                            </Select>
                        </Space>

                        <Space>
                            {selectedRowKeys.length > 0 && (
                                <Button
                                    danger
                                    onClick={handleBatchDelete}
                                >
                                    批量删除 ({selectedRowKeys.length})
                                </Button>
                            )}
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                添加商家
                            </Button>
                        </Space>
                    </div>

                    {/* 搜索结果提示 */}
                    <div style={{ marginBottom: '16px', color: '#666' }}>
                        {(searchText || statusFilter) && (
                            <span>
                                筛选结果：共找到 {pagination.total} 条记录
                                {searchText && <span>（关键词："{searchText}"）</span>}
                                {statusFilter && <span>（状态：{MERCHANT_STATUS_LABELS[statusFilter]}）</span>}
                            </span>
                        )}
                    </div>

                    {/* 数据表格 */}
                    <Table
                        columns={columns}
                        dataSource={merchantData}
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
                            pageSizeOptions: ['2', '5', '10', '20', '50'],
                            onShowSizeChange: (current, size) => {
                                setPagination(prev => ({
                                    ...prev,
                                    current: 1,
                                    pageSize: size
                                }))
                            }
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                    />
                </Card>

                {/* 添加商家模态框 */}
                <Modal
                    title="添加商家"
                    open={modalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    width={800}
                    okText="确定"
                    cancelText="取消"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ status: 'active' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="商家名称"
                                    name="name"
                                    rules={[
                                        { required: true, message: '请输入商家名称' },
                                        { max: 50, message: '商家名称不能超过50个字符' }
                                    ]}
                                >
                                    <Input placeholder="请输入商家名称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="联系人"
                                    name="contact"
                                    rules={[
                                        { required: true, message: '请输入联系人姓名' },
                                        { max: 20, message: '联系人姓名不能超过20个字符' }
                                    ]}
                                >
                                    <Input placeholder="请输入联系人姓名" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="联系电话"
                                    name="phone"
                                    rules={[
                                        { required: true, message: '请输入联系电话' },
                                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                                    ]}
                                >
                                    <Input placeholder="请输入联系电话" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="邮箱"
                                    name="email"
                                    rules={[
                                        { required: true, message: '请输入邮箱地址' },
                                        { type: 'email', message: '请输入正确的邮箱格式' }
                                    ]}
                                >
                                    <Input placeholder="请输入邮箱地址" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="状态"
                                    name="status"
                                    rules={[{ required: true, message: '请选择商家状态' }]}
                                >
                                    <Select placeholder="请选择商家状态">
                                        <Option value="active">启用</Option>
                                        <Option value="inactive">禁用</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label="地址"
                                    name="address"
                                    rules={[
                                        { required: true, message: '请输入商家地址' },
                                        { max: 200, message: '地址不能超过200个字符' }
                                    ]}
                                >
                                    <Input.TextArea
                                        placeholder="请输入商家详细地址"
                                        rows={3}
                                        showCount
                                        maxLength={200}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>

                {/* 查看商家详情模态框 */}
                <Modal
                    title="商家详情"
                    open={viewModalVisible}
                    onCancel={handleModalCancel}
                    footer={[
                        <Button key="close" onClick={handleModalCancel}>
                            关闭
                        </Button>,
                        <Button key="edit" type="primary" onClick={() => {
                            setViewModalVisible(false)
                            handleEdit(currentRecord)
                        }}>
                            编辑
                        </Button>
                    ]}
                    width={700}
                >
                    {currentRecord && (
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="商家ID" span={1}>
                                {currentRecord.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="商家名称" span={1}>
                                {currentRecord.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="联系人" span={1}>
                                {currentRecord.contact}
                            </Descriptions.Item>
                            <Descriptions.Item label="联系电话" span={1}>
                                {currentRecord.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="邮箱" span={2}>
                                {currentRecord.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="状态" span={1}>
                                <Tag color={currentRecord.status === 'active' ? 'green' : 'red'}>
                                    {currentRecord.status === 'active' ? '启用' : '禁用'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="创建时间" span={1}>
                                {currentRecord.createTime}
                            </Descriptions.Item>
                            <Descriptions.Item label="地址" span={2}>
                                {currentRecord.address}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>

                {/* 编辑商家模态框 */}
                <Modal
                    title="编辑商家"
                    open={editModalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    width={800}
                    okText="保存"
                    cancelText="取消"
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="商家名称"
                                    name="name"
                                    rules={[
                                        { required: true, message: '请输入商家名称' },
                                        { max: 50, message: '商家名称不能超过50个字符' }
                                    ]}
                                >
                                    <Input placeholder="请输入商家名称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="联系人"
                                    name="contact"
                                    rules={[
                                        { required: true, message: '请输入联系人姓名' },
                                        { max: 20, message: '联系人姓名不能超过20个字符' }
                                    ]}
                                >
                                    <Input placeholder="请输入联系人姓名" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="联系电话"
                                    name="phone"
                                    rules={[
                                        { required: true, message: '请输入联系电话' },
                                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                                    ]}
                                >
                                    <Input placeholder="请输入联系电话" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="邮箱"
                                    name="email"
                                    rules={[
                                        { required: true, message: '请输入邮箱地址' },
                                        { type: 'email', message: '请输入正确的邮箱格式' }
                                    ]}
                                >
                                    <Input placeholder="请输入邮箱地址" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="状态"
                                    name="status"
                                    rules={[{ required: true, message: '请选择商家状态' }]}
                                >
                                    <Select placeholder="请选择商家状态">
                                        <Option value="active">启用</Option>
                                        <Option value="inactive">禁用</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label="地址"
                                    name="address"
                                    rules={[
                                        { required: true, message: '请输入商家地址' },
                                        { max: 200, message: '地址不能超过200个字符' }
                                    ]}
                                >
                                    <Input.TextArea
                                        placeholder="请输入商家详细地址"
                                        rows={3}
                                        showCount
                                        maxLength={200}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        </MerchantLayout>
    )
}

export default Merchant