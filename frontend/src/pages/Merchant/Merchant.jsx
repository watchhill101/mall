import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    Typography,
    Table,
    Button,
    Space,
    Input,
    Select,
    Tag,
    message,
    Popconfirm,
    Modal,
    Form,
    Row,
    Col,
    Descriptions,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from 'react-i18next';
import MerchantLayout from "./MerchantLayout";
import merchantAPI, {
    MERCHANT_STATUS,
    MERCHANT_STATUS_LABELS,
    MERCHANT_STATUS_COLORS,
    MERCHANT_TYPES,
    MERCHANT_TYPE_LABELS
} from '@/api/merchant';
import { maskPhone } from '@/utils/maskUtils';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Merchant = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [modalType, setModalType] = useState("add"); // 'add', 'edit'
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 2,
        total: 0,
    });

    // 商户数据状态
    const [merchantData, setMerchantData] = useState([]);

    // 加载商户数据
    const loadMerchantData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                pageSize: pagination.pageSize,
                searchText,
                status: statusFilter,
                merchantType: typeFilter
            };

            const response = await merchantAPI.getMerchantList(params);

            if (response.code === 200) {
                const merchants = response.data.list.map(item => ({
                    ...item,
                    key: item._id,
                    id: item._id,
                    contact: item.personInCharge?.name || '未设置',
                    createTime: new Date(item.createdAt).toLocaleDateString()
                }));

                setMerchantData(merchants);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total
                }));
            }
        } catch (error) {
            console.error('获取商户列表失败:', error);

            // 处理不同类型的错误
            let errorMessage = '获取商户列表失败';

            if (error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    errorMessage = '登录已过期，请重新登录';
                    // 可以在这里跳转到登录页
                } else if (status === 403) {
                    errorMessage = '权限不足，无法访问';
                } else if (status === 500) {
                    errorMessage = '服务器错误，请稍后重试';
                } else if (data && data.message) {
                    errorMessage = data.message;
                } else {
                    errorMessage = `请求失败 (${status})`;
                }
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = '请求超时，请检查网络连接';
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, searchText, statusFilter, typeFilter]);

    // 测试后端连接
    const testBackendConnection = useCallback(async () => {
        try {
            console.log('🔍 测试后端连接...');
            const response = await fetch('http://localhost:3001/test', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ 后端连接正常:', data);
                return true;
            } else {
                console.error('❌ 后端连接失败:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ 后端连接错误:', error);
            message.error('无法连接到后端服务，请确保后端服务器正在运行在端口3001');
            return false;
        }
    }, []);

    // 初始化加载数据
    useEffect(() => {
        const init = async () => {
            loadMerchantData();

        };
        init();
    }, []);

    // 搜索和筛选变化时重新加载数据
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, current: 1 }));
        }, 500); // 防抖500ms

        return () => clearTimeout(timer);
    }, [searchText, statusFilter, typeFilter]);

    // 表格列配置
    const columns = [
        {
            title: t('merchants.merchantId'),
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: t('merchants.merchantName'),
            dataIndex: "name",
            key: "name",
            width: 150,
        },
        {
            title: t('merchants.merchantType'),
            dataIndex: "merchantType",
            key: "merchantType",
            width: 100,
            render: (type) => MERCHANT_TYPE_LABELS[type] || t('common.unknown'),
        },
        {
            title: t('merchants.contact'),
            dataIndex: "contact",
            key: "contact",
            width: 100,
        },
        {
            title: t('merchants.phone'),
            dataIndex: "phone",
            key: "phone",
            width: 120,
            render: (phone) => (
                <Tooltip title={phone || t('merchants.noPhone')}>
                    <span>{maskPhone(phone)}</span>
                </Tooltip>
            ),
        },
        {
            title: t('merchants.serviceCharge'),
            dataIndex: "serviceCharge",
            key: "serviceCharge",
            width: 100,
            render: (charge) => `${(charge * 100).toFixed(1)}%`,
        },
        {
            title: t('common.status'),
            dataIndex: "status",
            key: "status",
            width: 100,
            render: (status) => (
                <Tag color={MERCHANT_STATUS_COLORS[status]}>
                    {MERCHANT_STATUS_LABELS[status]}
                </Tag>
            ),
        },
        {
            title: t('common.createTime'),
            dataIndex: "createTime",
            key: "createTime",
            width: 120,
        },
        {
            title: t('merchants.address'),
            dataIndex: "address",
            key: "address",
            ellipsis: true,
        },
        {
            title: t('common.operation'),
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        {t('merchants.view')}
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        {t('common.edit')}
                    </Button>
                    <Popconfirm
                        title={t('merchants.deleteConfirm')}
                        description={`${t('merchants.merchant')}：${record.name}，${t('merchants.deleteWarning')}`}
                        onConfirm={() => handleDelete(record)}
                        okText={t('merchants.confirmDelete')}
                        cancelText={t('common.cancel')}
                        okType="danger"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            {t('common.delete')}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 行选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };



    // 处理函数
    const handleAdd = () => {
        setModalType("add");
        setCurrentRecord(null);
        setModalVisible(true);
        form.resetFields();
    };

    const handleView = (record) => {
        setCurrentRecord(record);
        setViewModalVisible(true);
    };

    const handleEdit = (record) => {
        setModalType("edit");
        setCurrentRecord(record);
        setEditModalVisible(true);
        // 设置表单值，将服务费率转换为百分比显示
        const formValues = {
            ...record,
            serviceCharge: record.serviceCharge ? record.serviceCharge * 100 : 10
        };
        form.setFieldsValue(formValues);
    };

    const handleDelete = async (record) => {
        try {
            const response = await merchantAPI.deleteMerchant(record._id);
            if (response.code === 200) {
                message.success(`删除商户成功：${record.name}`);
                // 清除已删除项的选中状态
                setSelectedRowKeys(prev => prev.filter(key => key !== record.key));
                // 重新加载数据
                loadMerchantData();
            }
        } catch (error) {
            console.error('删除商户失败:', error);

            let errorMessage = '删除商户失败';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要删除的商户');
            return;
        }

        try {
            // 获取选中的商户ID（使用_id而不是key）
            const selectedMerchants = merchantData.filter(item => selectedRowKeys.includes(item.key));
            const merchantIds = selectedMerchants.map(item => item._id);

            const response = await merchantAPI.batchDeleteMerchants(merchantIds);
            if (response.code === 200) {
                message.success(`批量删除成功：${response.data.deletedCount} 个商户`);
                setSelectedRowKeys([]);
                // 重新加载数据
                loadMerchantData();
            }
        } catch (error) {
            console.error('批量删除商户失败:', error);

            let errorMessage = '批量删除商户失败';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    };

    // 搜索处理
    const handleSearch = (value) => {
        setSearchText(value);
    };

    // 状态筛选处理
    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    // 类型筛选处理
    const handleTypeFilter = (value) => {
        setTypeFilter(value);
    };

    // 分页处理
    const handleTableChange = (paginationConfig) => {
        setPagination((prev) => ({
            ...prev,
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        }));
    };

    // 模态框确认处理（新增和编辑）
    const handleModalOk = () => {
        form
            .validateFields()
            .then(async (values) => {
                try {
                    setLoading(true);

                    if (modalType === "add") {
                        // 新增逻辑
                        const merchantData = {
                            name: values.name,
                            merchantType: values.merchantType || MERCHANT_TYPES.RETAIL,
                            isSelfOperated: values.isSelfOperated || false,
                            phone: values.phone,
                            address: values.address,
                            logoUrl: values.logoUrl || 'https://via.placeholder.com/100',
                            personInCharge: '507f1f77bcf86cd799439011', // 临时固定值，实际应该选择
                            role: '507f1f77bcf86cd799439012', // 临时固定值，实际应该选择
                            serviceCharge: (values.serviceCharge || 10) / 100, // 转换为小数
                            businessLicense: values.businessLicense,
                            taxNumber: values.taxNumber
                        };

                        const response = await merchantAPI.createMerchant(merchantData);
                        if (response.code === 201) {
                            message.success('添加商户成功');
                            setModalVisible(false);
                            loadMerchantData();
                        }
                    } else {
                        // 编辑逻辑
                        const updateData = {
                            ...values,
                            serviceCharge: (values.serviceCharge || 10) / 100 // 转换为小数
                        };
                        const response = await merchantAPI.updateMerchant(currentRecord._id, updateData);
                        if (response.code === 200) {
                            message.success('编辑商户成功');
                            setEditModalVisible(false);
                            loadMerchantData();
                        }
                    }

                    form.resetFields();
                    setCurrentRecord(null);
                } catch (error) {
                    console.error('操作失败:', error);

                    let errorMessage = modalType === 'add' ? '添加商户失败' : '编辑商户失败';
                    if (error.response && error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    message.error(errorMessage);
                } finally {
                    setLoading(false);
                }
            })
            .catch((info) => {
                console.log("表单验证失败:", info);
            });
    };

    // 模态框取消处理
    const handleModalCancel = () => {
        setModalVisible(false);
        setEditModalVisible(false);
        setViewModalVisible(false);
        form.resetFields();
        setCurrentRecord(null);
    };

    return (
        <MerchantLayout>
            <div style={{ padding: "24px" }}>
                <Card>
                    <div style={{ marginBottom: "16px" }}>
                        <Title level={3} style={{ margin: 0 }}>
                            {t('merchants.title')}
                        </Title>
                        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
                            {t('merchants.description')}
                        </p>
                    </div>

                    {/* 搜索和操作区域 */}
                    <div
                        style={{
                            marginBottom: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "16px",
                        }}
                    >
                        <Space>
                            <Search
                                placeholder={t('merchants.searchPlaceholder')}
                                allowClear
                                style={{ width: 300 }}
                                onSearch={handleSearch}
                                onChange={(e) => !e.target.value && setSearchText("")}
                                enterButton={<SearchOutlined />}
                            />
                            <Select
                                placeholder={t('merchants.statusFilter')}
                                style={{ width: 120 }}
                                allowClear
                                onChange={handleStatusFilter}
                                value={statusFilter || undefined}
                            >
                                {Object.entries(MERCHANT_STATUS_LABELS).map(([value, label]) => (
                                    <Option key={value} value={value}>{label}</Option>
                                ))}
                            </Select>
                            <Select
                                placeholder={t('merchants.typeFilter')}
                                style={{ width: 120 }}
                                allowClear
                                onChange={handleTypeFilter}
                                value={typeFilter || undefined}
                            >
                                {Object.entries(MERCHANT_TYPE_LABELS).map(([value, label]) => (
                                    <Option key={value} value={value}>{label}</Option>
                                ))}
                            </Select>
                        </Space>

                        <Space>
                            {selectedRowKeys.length > 0 && (
                                <Button danger onClick={handleBatchDelete}>
                                    {t('merchants.batchDelete')} ({selectedRowKeys.length})
                                </Button>
                            )}
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                {t('merchants.createMerchant')}
                            </Button>
                        </Space>
                    </div>

                    {/* 搜索结果提示 */}
                    <div style={{ marginBottom: "16px", color: "#666" }}>
                        {(searchText || statusFilter || typeFilter) && (
                            <span>
                                {t('merchants.filterResults')}: {t('merchants.totalRecords', { total: pagination.total })}
                                {searchText && <span>（{t('merchants.keyword')}："{searchText}"）</span>}
                                {statusFilter && <span>（{t('merchants.status')}：{MERCHANT_STATUS_LABELS[statusFilter]}）</span>}
                                {typeFilter && <span>（{t('merchants.type')}：{MERCHANT_TYPE_LABELS[typeFilter]}）</span>}
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
                            showTotal: (total, range) =>
                                t('merchants.pagination.showTotal', { 
                                    start: range[0], 
                                    end: range[1], 
                                    total: total 
                                }),
                            pageSizeOptions: ["2", "5", "10", "20"],
                            onShowSizeChange: (current, size) => {
                                setPagination((prev) => ({
                                    ...prev,
                                    current: 1,
                                    pageSize: size,
                                }));
                            },
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1300 }}
                        locale={{
                            emptyText: loading ? t('common.loading') : t('common.noData')
                        }}
                    />
                </Card>

                {/* 添加商家模态框 */}
                <Modal
                    title={t('merchants.addMerchant')}
                    open={modalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    width={900}
                    okText={t('common.confirm')}
                    cancelText={t('common.cancel')}
                    confirmLoading={loading}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            status: MERCHANT_STATUS.ACTIVE,
                            merchantType: MERCHANT_TYPES.RETAIL,
                            serviceCharge: 10
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label={t('merchants.merchantName')}
                                    name="name"
                                    rules={[
                                        { required: true, message: t('merchants.inputMerchantName') },
                                        { max: 50, message: t('merchants.merchantNameTooLong') },
                                    ]}
                                >
                                    <Input placeholder={t('merchants.inputMerchantName')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t('merchants.merchantType')}
                                    name="merchantType"
                                    rules={[{ required: true, message: t('merchants.selectMerchantType') }]}
                                >
                                    <Select placeholder={t('merchants.selectMerchantType')}>
                                        {Object.entries(MERCHANT_TYPE_LABELS).map(([value, label]) => (
                                            <Option key={value} value={value}>{label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="联系电话"
                                    name="phone"
                                    rules={[
                                        { required: true, message: "请输入联系电话" },
                                        {
                                            pattern: /^1[3-9]\d{9}$/,
                                            message: "请输入正确的手机号码",
                                        },
                                    ]}
                                >
                                    <Input placeholder="请输入联系电话" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="状态"
                                    name="status"
                                    rules={[{ required: true, message: "请选择商家状态" }]}
                                >
                                    <Select placeholder="请选择商家状态">
                                        {Object.entries(MERCHANT_STATUS_LABELS).map(([value, label]) => (
                                            <Option key={value} value={value}>{label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="服务费率"
                                    name="serviceCharge"
                                    rules={[
                                        { required: true, message: "请输入服务费率" },
                                        { type: 'number', min: 0, max: 100, message: "服务费率必须在0-100之间" }
                                    ]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="请输入服务费率"
                                        addonAfter="%"
                                        min={0}
                                        max={100}
                                        step={0.1}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Logo URL"
                                    name="logoUrl"
                                >
                                    <Input placeholder="请输入Logo地址(可选)" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="营业执照号"
                                    name="businessLicense"
                                >
                                    <Input placeholder="请输入营业执照号(可选)" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="税号"
                                    name="taxNumber"
                                >
                                    <Input placeholder="请输入税号(可选)" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label="地址"
                                    name="address"
                                    rules={[
                                        { required: true, message: "请输入商家地址" },
                                        { max: 200, message: "地址不能超过200个字符" },
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
                        <Button
                            key="edit"
                            type="primary"
                            onClick={() => {
                                setViewModalVisible(false);
                                handleEdit(currentRecord);
                            }}
                        >
                            编辑
                        </Button>,
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
                            <Descriptions.Item label="商户类型" span={1}>
                                {MERCHANT_TYPE_LABELS[currentRecord.merchantType] || '未知'}
                            </Descriptions.Item>
                            <Descriptions.Item label="联系人" span={1}>
                                {currentRecord.contact}
                            </Descriptions.Item>
                            <Descriptions.Item label="联系电话" span={1}>
                                {maskPhone(currentRecord.phone)}
                            </Descriptions.Item>
                            <Descriptions.Item label="服务费率" span={1}>
                                {currentRecord.serviceCharge ? `${(currentRecord.serviceCharge * 100).toFixed(1)}%` : '未设置'}
                            </Descriptions.Item>
                            <Descriptions.Item label="状态" span={1}>
                                <Tag color={MERCHANT_STATUS_COLORS[currentRecord.status]}>
                                    {MERCHANT_STATUS_LABELS[currentRecord.status]}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="创建时间" span={1}>
                                {currentRecord.createTime}
                            </Descriptions.Item>
                            <Descriptions.Item label="营业执照" span={1}>
                                {currentRecord.businessLicense || '未提供'}
                            </Descriptions.Item>
                            <Descriptions.Item label="税号" span={1}>
                                {currentRecord.taxNumber || '未提供'}
                            </Descriptions.Item>
                            <Descriptions.Item label="地址" span={2}>
                                {currentRecord.address}
                            </Descriptions.Item>
                            {currentRecord.logoUrl && (
                                <Descriptions.Item label="Logo" span={2}>
                                    <img
                                        src={currentRecord.logoUrl}
                                        alt="商户Logo"
                                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    )}
                </Modal>

                {/* 编辑商家模态框 */}
                <Modal
                    title="编辑商家"
                    open={editModalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    width={900}
                    okText="保存"
                    cancelText="取消"
                    confirmLoading={loading}
                >
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="商家名称"
                                    name="name"
                                    rules={[
                                        { required: true, message: "请输入商家名称" },
                                        { max: 50, message: "商家名称不能超过50个字符" },
                                    ]}
                                >
                                    <Input placeholder="请输入商家名称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="商户类型"
                                    name="merchantType"
                                    rules={[{ required: true, message: "请选择商户类型" }]}
                                >
                                    <Select placeholder="请选择商户类型">
                                        {Object.entries(MERCHANT_TYPE_LABELS).map(([value, label]) => (
                                            <Option key={value} value={value}>{label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="联系电话"
                                    name="phone"
                                    rules={[
                                        { required: true, message: "请输入联系电话" },
                                        {
                                            pattern: /^1[3-9]\d{9}$/,
                                            message: "请输入正确的手机号码",
                                        },
                                    ]}
                                >
                                    <Input placeholder="请输入联系电话" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="状态"
                                    name="status"
                                    rules={[{ required: true, message: "请选择商家状态" }]}
                                >
                                    <Select placeholder="请选择商家状态">
                                        {Object.entries(MERCHANT_STATUS_LABELS).map(([value, label]) => (
                                            <Option key={value} value={value}>{label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="服务费率"
                                    name="serviceCharge"
                                    rules={[
                                        { required: true, message: "请输入服务费率" },
                                        { type: 'number', min: 0, max: 100, message: "服务费率必须在0-100之间" }
                                    ]}
                                >
                                    <Input
                                        type="number"
                                        placeholder="请输入服务费率"
                                        addonAfter="%"
                                        min={0}
                                        max={100}
                                        step={0.1}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Logo URL"
                                    name="logoUrl"
                                >
                                    <Input placeholder="请输入Logo地址(可选)" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="营业执照号"
                                    name="businessLicense"
                                >
                                    <Input placeholder="请输入营业执照号(可选)" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="税号"
                                    name="taxNumber"
                                >
                                    <Input placeholder="请输入税号(可选)" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label="地址"
                                    name="address"
                                    rules={[
                                        { required: true, message: "请输入商家地址" },
                                        { max: 200, message: "地址不能超过200个字符" },
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
    );
};

export default Merchant;
