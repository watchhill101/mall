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
  message,
  Cascader,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../Goods_Layout/Goods_Layout';
import { categoryData } from '../data/data';
import './index.scss';
import { ExportSvg } from '@/pages/Goods_S/icons_svg/IconCom';
import { data } from '@/db_S/data.mjs';
// console.log(data);

const { Option } = Select;

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
      title: '商品ID',
      dataIndex: 'ProductID',
      key: 'ProductID',
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'ProductName',
      key: 'ProductName',
      width: 200,
      render: (text, record) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={record.src} alt="" style={{ width: 60, height: 60 }} />
            <span>{text}</span>
          </div>
        );
      },
    },
    {
      title: '商品分类',
      dataIndex: 'ProductCategory',
      key: 'ProductCategory',
      width: 100,
    },
    {
      title: '销售价',
      dataIndex: 'SellingPrice',
      key: 'SellingPrice',
      width: 100,
    },
    {
      title: '库存商品',
      dataIndex: 'StockCommodities',
      key: 'StockCommodities',
    },
    {
      title: '库存总数',
      dataIndex: 'TotalInventory',
      key: 'TotalInventory',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text, record) => (
        <Tag color={record.status === '1' ? 'green' : 'red'}>
          {record.status === '1' ? '在售' : '未售'}
        </Tag>
      ),
    },
    {
      title: '最后更新时间',
      dataIndex: 'LastUpdateTime',
      key: 'LastUpdateTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link">复制</Button>
          <Button type="link">编辑</Button>
          <Button
            type="link"
            style={{ color: record.status === '1' ? 'red' : 'green' }}
          >
            {record.status === '1' ? '下架' : '上架'}
          </Button>
          <Button type="link">加入回收站</Button>
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
        setDataSource(data.list || []);
        setPagination((prev) => ({
          ...prev,
          total: data.length,
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
  const onChange = (value) => {
    console.log(value);
  };
  const ExportFn = () => {
    message.success('导出成功');
  };
  return (
    <GoodsLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索区域 */}
        <div className="search-bar">
          <Row gutter={20} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Input
                placeholder="商品名称"
                value={searchParams.name}
                onChange={(e) =>
                  setSearchParams((prev) => ({ ...prev, name: e.target.value }))
                }
                allowClear
              />
            </Col>
            <Col span={6}>
              <Cascader
                options={categoryData}
                onChange={onChange}
                placeholder="商品分类"
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="商品状态"
                value={searchParams.status}
                // onChange={(value) =>
                // setSearchParams((prev) => ({ ...prev, status: value }))
                // }
                allowClear
                style={{ width: '100px' }}
                options={[
                  { value: 'active', label: '在售中' },
                  { value: 'inactive', label: '已下架' },
                ]}
              ></Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="库存商品"
                value={searchParams.status}
                // onChange={(value) =>
                // setSearchParams((prev) => ({ ...prev, status: value }))
                // }
                allowClear
                style={{ width: '100px' }}
                options={[
                  { value: '1', label: '是' },
                  { value: '0', label: '否' },
                ]}
              ></Select>
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
              </Space>
            </Col>
          </Row>
        </div>

        {/* 操作按钮 */}
        <div className="operation-button">
          <Button
            className="addBtn"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增
          </Button>
          <Button className="Export " icon={<ExportSvg />} onClick={ExportFn}>
            导出
          </Button>
        </div>

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
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

            <Form.Item name="description" label="商品描述">
              <Input.TextArea placeholder="请输入商品描述" rows={4} />
            </Form.Item>

            <Form.Item name="status" label="商品状态" valuePropName="checked">
              <Switch checkedChildren="上架" unCheckedChildren="下架" />
            </Form.Item>

            <Form.Item name="image" label="商品图片">
              <Upload action="/api/upload" listType="picture-card" maxCount={1}>
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
                <Button onClick={() => setModalVisible(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </GoodsLayout>
  );
};

export default ListOfCommodities;
