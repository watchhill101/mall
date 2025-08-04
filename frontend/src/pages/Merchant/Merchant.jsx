import React, { useState } from 'react'
import { Card, Typography, Table, Button, Space, Input, Select, Tag, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import MerchantLayout from './MerchantLayout'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const Merchant = () => {
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])

    // 模拟商家数据
    const [merchantData] = useState([
        {
            key: '1',
            id: 'M001',
            name: '张三商店',
            contact: '张三',
            phone: '13800138001',
            email: 'zhangsan@example.com',
            status: 'active',
            createTime: '2023-01-15',
            address: '北京市朝阳区XXX街道'
        },
        {
            key: '2',
            id: 'M002',
            name: '李四超市',
            contact: '李四',
            phone: '13800138002',
            email: 'lisi@example.com',
            status: 'inactive',
            createTime: '2023-02-20',
            address: '上海市浦东新区XXX路'
        },
        {
            key: '3',
            id: 'M003',
            name: '王五百货',
            contact: '王五',
            phone: '13800138003',
            email: 'wangwu@example.com',
            status: 'active',
            createTime: '2023-03-10',
            address: '广州市天河区XXX大道'
        }
    ])

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
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? '启用' : '禁用'}
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
        message.info('添加商家功能')
    }

    const handleView = (record) => {
        message.info(`查看商家：${record.name}`)
    }

    const handleEdit = (record) => {
        message.info(`编辑商家：${record.name}`)
    }

    const handleDelete = (record) => {
        message.success(`删除商家：${record.name}`)
    }

    const handleBatchDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要删除的商家')
            return
        }
        message.success(`批量删除 ${selectedRowKeys.length} 个商家`)
        setSelectedRowKeys([])
    }

    const handleSearch = (value) => {
        message.info(`搜索：${value}`)
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
                                enterButton={<SearchOutlined />}
                            />
                            <Select placeholder="状态筛选" style={{ width: 120 }} allowClear>
                                <Option value="active">启用</Option>
                                <Option value="inactive">禁用</Option>
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

                    {/* 数据表格 */}
                    <Table
                        columns={columns}
                        dataSource={merchantData}
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={{
                            total: merchantData.length,
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`
                        }}
                        scroll={{ x: 1200 }}
                    />
                </Card>
            </div>
        </MerchantLayout>
    )
}

export default Merchant