import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Image, 
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Switch,
  Upload,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import GoodsLayout from '../Goods_Layout/Goods_Layout';

const { Option } = Select;

// 模拟商品数据
const mockData = [
  {
    id: 1,
    name: '苹果iPhone 15 Pro',
    category: '数码产品',
    price: 7999,
    stock: 100,
    status: 'active',
    image: 'https://via.placeholder.com/60x60',
    description: '最新款iPhone 15 Pro，性能强劲',
    createTime: '2024-01-15',
  },
  {
    id: 2,
    name: '华为Mate 60 Pro',
    category: '数码产品',
    price: 6999,
    stock: 80,
    status: 'active',
    image: 'https://via.placeholder.com/60x60',
    description: '华为旗舰手机',
    createTime: '2024-01-16',
  },
  {
    id: 3,
    name: '小米13 Ultra',
    category: '数码产品',
    price: 5999,
    stock: 0,
    status: 'inactive',
    image: 'https://via.placeholder.com/60x60',
    description: '小米影像旗舰',
    createTime: '2024-01-17',
  },
];

const ListOfCommodities = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: '',
    status: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 表格列定义
  const columns = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        <Image
          width={60}
          height={60}
          src={image}
          alt="商品图片"
          fallback="https://via.placeholder.com/60x60?text=No+Image"
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格(元)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `${stock}件` : '缺货'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API
      setTimeout(() => {
        setDataSource(mockData);
        setPagination(prev => ({
          ...prev,
          total: mockData.length,
        }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('加载数据失败');
      setLoading(false);
    }
  }, []);

  // 搜索处理
  const handleSearch = () => {
    loadData();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      category: '',
      status: '',
    });
    loadData();
  };

  // 新增商品
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑商品
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 删除商品
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商品"${record.name}"吗？`,
      onOk: () => {
        message.success('删除成功');
        loadData();
      },
    });
  };

  // 表单提交
  const handleSubmit = async (values) => {
    try {
      console.log('提交数据:', values);
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 分页变化
  const handleTableChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize: pageSize,
      total: pagination.total,
    });
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <GoodsLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="商品名称"
            value={searchParams.name}
            onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="选择分类"
            value={searchParams.category}
            onChange={(value) => setSearchParams(prev => ({ ...prev, category: value }))}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="数码产品">数码产品</Option>
            <Option value="服装">服装</Option>
            <Option value="食品">食品</Option>
            <Option value="家居">家居</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="商品状态"
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="active">上架</Option>
            <Option value="inactive">下架</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Space>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增商品
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }}
      />

      {/* 新增/编辑商品弹窗 */}
      <Modal
        title={editingRecord ? '编辑商品' : '新增商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="商品分类"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select placeholder="请选择商品分类">
                  <Option value="数码产品">数码产品</Option>
                  <Option value="服装">服装</Option>
                  <Option value="食品">食品</Option>
                  <Option value="家居">家居</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="商品价格"
                rules={[{ required: true, message: '请输入商品价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入商品价格"
                  min={0}
                  precision={2}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="库存数量"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入库存数量"
                  min={0}
                  addonAfter="件"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea
              placeholder="请输入商品描述"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="商品状态"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="上架" 
              unCheckedChildren="下架"
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="商品图片"
          >
            <Upload
              action="/api/upload"
              listType="picture-card"
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </GoodsLayout>
  );
};

export default ListOfCommodities;
