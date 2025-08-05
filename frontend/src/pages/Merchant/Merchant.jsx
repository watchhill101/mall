import React, { useState, useMemo } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import MerchantLayout from "./MerchantLayout";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Merchant = () => {
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0,
  });

  // 模拟商家数据 - 增加更多数据来测试分页
  const [merchantData, setMerchantData] = useState([
    {
      key: "1",
      id: "M001",
      name: "张三商店",
      contact: "张三",
      phone: "13800138001",
      email: "zhangsan@example.com",
      status: "active",
      createTime: "2023-01-15",
      address: "北京市朝阳区XXX街道",
    },
    {
      key: "2",
      id: "M002",
      name: "李四超市",
      contact: "李四",
      phone: "13800138002",
      email: "lisi@example.com",
      status: "inactive",
      createTime: "2023-02-20",
      address: "上海市浦东新区XXX路",
    },
    {
      key: "3",
      id: "M003",
      name: "王五百货",
      contact: "王五",
      phone: "13800138003",
      email: "wangwu@example.com",
      status: "active",
      createTime: "2023-03-10",
      address: "广州市天河区XXX大道",
    },
    {
      key: "4",
      id: "M004",
      name: "赵六便利店",
      contact: "赵六",
      phone: "13800138004",
      email: "zhaoliu@example.com",
      status: "active",
      createTime: "2023-04-05",
      address: "深圳市南山区XXX路",
    },
    {
      key: "5",
      id: "M005",
      name: "钱七商贸",
      contact: "钱七",
      phone: "13800138005",
      email: "qianqi@example.com",
      status: "inactive",
      createTime: "2023-05-12",
      address: "杭州市西湖区XXX街",
    },
    {
      key: "6",
      id: "M006",
      name: "孙八零售",
      contact: "孙八",
      phone: "13800138006",
      email: "sunba@example.com",
      status: "active",
      createTime: "2023-06-18",
      address: "成都市高新区XXX道",
    },
    {
      key: "7",
      id: "M007",
      name: "周九商城",
      contact: "周九",
      phone: "13800138007",
      email: "zhoujiu@example.com",
      status: "active",
      createTime: "2023-07-25",
      address: "武汉市武昌区XXX街",
    },
    {
      key: "8",
      id: "M008",
      name: "吴十购物",
      contact: "吴十",
      phone: "13800138008",
      email: "wushi@example.com",
      status: "inactive",
      createTime: "2023-08-30",
      address: "西安市雁塔区XXX路",
    },
  ]);

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return merchantData.filter((item) => {
      // 搜索文本筛选
      const matchSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.contact.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone.includes(searchText);

      // 状态筛选
      const matchStatus = !statusFilter || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [merchantData, searchText, statusFilter]);

  // 当前页数据
  const currentPageData = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination.current, pagination.pageSize]);

  // 当筛选条件变化时，重置分页并更新总数
  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: filteredData.length,
    }));
  }, [filteredData.length]);

  // 表格列配置
  const columns = [
    {
      title: "商家ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "商家名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "联系人",
      dataIndex: "contact",
      key: "contact",
      width: 100,
    },
    {
      title: "联系电话",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 180,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 120,
    },
    {
      title: "地址",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
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
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
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

  // 生成商家ID
  const generateMerchantId = () => {
    const maxId = Math.max(
      ...merchantData.map((item) => parseInt(item.id.substring(1))),
      0
    );
    return `M${String(maxId + 1).padStart(3, "0")}`;
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
    form.setFieldsValue(record);
  };

  const handleDelete = (record) => {
    const updatedData = merchantData.filter((item) => item.key !== record.key);
    setMerchantData(updatedData);
    // 清除已删除项的选中状态
    setSelectedRowKeys((prev) => prev.filter((key) => key !== record.key));
    message.success(`删除商家：${record.name}`);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的商家");
      return;
    }
    const updatedData = merchantData.filter(
      (item) => !selectedRowKeys.includes(item.key)
    );
    setMerchantData(updatedData);
    message.success(`批量删除 ${selectedRowKeys.length} 个商家`);
    setSelectedRowKeys([]);
  };

  // 搜索处理
  const handleSearch = (value) => {
    setSearchText(value);
    message.info(value ? `搜索：${value}` : "已清空搜索条件");
  };

  // 状态筛选处理
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    message.info(
      value
        ? `筛选状态：${value === "active" ? "启用" : "禁用"}`
        : "已清空状态筛选"
    );
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
      .then((values) => {
        if (modalType === "add") {
          // 新增逻辑
          const newMerchant = {
            key: Date.now().toString(),
            id: generateMerchantId(),
            ...values,
            createTime: new Date().toLocaleDateString(),
          };
          setMerchantData([...merchantData, newMerchant]);
          message.success("添加商家成功");
        } else {
          // 编辑逻辑
          const updatedData = merchantData.map((item) =>
            item.key === currentRecord.key ? { ...item, ...values } : item
          );
          setMerchantData(updatedData);
          message.success("编辑商家成功");
        }

        setModalVisible(false);
        setEditModalVisible(false);
        form.resetFields();
        setCurrentRecord(null);
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
              商家管理
            </Title>
            <p style={{ color: "#666", margin: "8px 0 0 0" }}>
              管理平台所有商家信息
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
                placeholder="搜索商家名称、联系人、电话"
                allowClear
                style={{ width: 300 }}
                onSearch={handleSearch}
                onChange={(e) => !e.target.value && setSearchText("")}
                enterButton={<SearchOutlined />}
              />
              <Select
                placeholder="状态筛选"
                style={{ width: 120 }}
                allowClear
                onChange={handleStatusFilter}
                value={statusFilter || undefined}
              >
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Space>

            <Space>
              {selectedRowKeys.length > 0 && (
                <Button danger onClick={handleBatchDelete}>
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
          <div style={{ marginBottom: "16px", color: "#666" }}>
            {(searchText || statusFilter) && (
              <span>
                筛选结果：共找到 {filteredData.length} 条记录
                {searchText && <span>（关键词："{searchText}"）</span>}
                {statusFilter && (
                  <span>
                    （状态：{statusFilter === "active" ? "启用" : "禁用"}）
                  </span>
                )}
              </span>
            )}
          </div>

          {/* 数据表格 */}
          <Table
            columns={columns}
            dataSource={currentPageData}
            rowSelection={rowSelection}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
              pageSizeOptions: ["2", "5", "10", "20", "50"],
              onShowSizeChange: (current, size) => {
                setPagination((prev) => ({
                  ...prev,
                  current: 1,
                  pageSize: size,
                }));
              },
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
            initialValues={{ status: "active" }}
          >
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
                  label="联系人"
                  name="contact"
                  rules={[
                    { required: true, message: "请输入联系人姓名" },
                    { max: 20, message: "联系人姓名不能超过20个字符" },
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
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: "请输入邮箱地址" },
                    { type: "email", message: "请输入正确的邮箱格式" },
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
                  rules={[{ required: true, message: "请选择商家状态" }]}
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
                <Tag
                  color={currentRecord.status === "active" ? "green" : "red"}
                >
                  {currentRecord.status === "active" ? "启用" : "禁用"}
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
                  label="联系人"
                  name="contact"
                  rules={[
                    { required: true, message: "请输入联系人姓名" },
                    { max: 20, message: "联系人姓名不能超过20个字符" },
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
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: "请输入邮箱地址" },
                    { type: "email", message: "请输入正确的邮箱格式" },
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
                  rules={[{ required: true, message: "请选择商家状态" }]}
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
