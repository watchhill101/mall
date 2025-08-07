import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Card,
  Row,
  Col,
  Space,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import GoodsLayout from '../Goods_Layout/Goods_Layout';
import ProductApi from '@/api/Product';
import {
  getCategoryList,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryOptions,
} from '@/api/Product'; // 假设存在这些API
import { categoryData } from '../data/data'; // 导入模拟数据

const { Option } = Select;
const { Item } = Form;

const ClassificationOfCommodities = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [searchParams, setSearchParams] = useState({ name: '' });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    level1: 0,
    level2: 0,
    enabled: 0,
  });
  const [productCategories, setproductCategories] = useState([]);
  const getlist = async () => {
    const { data, success } = await ProductApi.Product.getproductCategories();
    console.log(success, data, 'response');
    setproductCategories(data);
  };
  useEffect(() => {
    getlist();
  }, []);

  // 模拟API调用 - 获取分类列表
  const fetchCategoryList = async () => {
    setLoading(true);
    try {
      // 实际项目中替换为真实API调用
      // const response = await getCategoryList({
      //   page: pagination.current,
      //   pageSize: pagination.pageSize,
      //   ...searchParams
      // });

      // 使用模拟数据
      let filteredData = categoryData;
      if (searchParams.name) {
        filteredData = filteredData.filter((item) =>
          item.name.includes(searchParams.name)
        );
      }

      setList(filteredData);
      setPagination({ ...pagination, total: filteredData.length });

      // 计算统计数据
      const level1Count = filteredData.filter(
        (item) => item.level === 1
      ).length;
      const level2Count = filteredData.filter(
        (item) => item.level === 2
      ).length;
      const enabledCount = filteredData.filter(
        (item) => item.status === 1
      ).length;

      setStatistics({
        total: filteredData.length,
        level1: level1Count,
        level2: level2Count,
        enabled: enabledCount,
      });
    } catch (error) {
      message.error('获取分类列表失败');
      console.error('Failed to fetch category list:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟API调用 - 获取分类选项(用于父级分类选择)
  const fetchCategoryOptions = async () => {
    try {
      // 实际项目中替换为真实API调用
      // const response = await getCategoryOptions();
      // setCategoryOptions(response.data || []);

      // 使用模拟数据
      const options = categoryData.map((item) => ({
        value: item.id,
        label: item.name,
        level: item.level,
      }));
      setCategoryOptions([{ value: '0', label: '无父级分类' }, ...options]);
    } catch (error) {
      message.error('获取分类选项失败');
      console.error('Failed to fetch category options:', error);
    }
  };

  // 新增分类
  const handleAdd = () => {
    setIsEdit(false);
    setCurrentId('');
    form.resetFields();
    setVisible(true);
  };

  // 编辑分类
  const handleEdit = (record) => {
    setIsEdit(true);
    setCurrentId(record.id);
    form.setFieldsValue({
      name: record.name,
      parentId: record.parentId || '0',
      status: record.status,
    });
    setVisible(true);
  };

  // 删除分类
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该分类吗？删除后不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 实际项目中替换为真实API调用
          // await deleteCategory(id);

          // 模拟删除
          setList(list.filter((item) => item.id !== id));
          message.success('删除成功');
          fetchCategoryList(); // 重新获取列表
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete category:', error);
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        name: values.name,
        parentId: values.parentId === '0' ? null : values.parentId,
        status: values.status,
      };

      if (isEdit) {
        // 编辑分类
        // 实际项目中替换为真实API调用
        // await updateCategory(currentId, data);

        // 模拟更新
        const updatedList = list.map((item) =>
          item.id === currentId ? { ...item, ...data } : item
        );
        setList(updatedList);
        message.success('编辑成功');
      } else {
        // 新增分类
        // 实际项目中替换为真实API调用
        // await addCategory(data);

        // 模拟新增
        const newCategory = {
          id: Date.now().toString(),
          ...data,
          level: data.parentId ? 2 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setList([...list, newCategory]);
        message.success('新增成功');
      }

      setVisible(false);
      fetchCategoryList(); // 重新获取列表
    } catch (error) {
      // 表单验证失败或API调用失败
      console.error('Form submission failed:', error);
    }
  };

  // 搜索分类
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchCategoryList();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({ name: '' });
    setPagination({ ...pagination, current: 1 });
    fetchCategoryList();
  };

  // 分页变化
  const handlePaginationChange = (current, pageSize) => {
    setPagination({ ...pagination, current, pageSize });
    fetchCategoryList();
  };

  useEffect(() => {
    fetchCategoryOptions();
    fetchCategoryList();
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '业务类型',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 120,
      render: (text) => (
        <Tag
          color={
            text === 'retail'
              ? 'blue'
              : text === 'wholesale'
              ? 'green'
              : text === 'manufacturer'
              ? 'purple'
              : 'orange'
          }
        >
          {text === 'retail'
            ? '零售'
            : text === 'wholesale'
            ? '批发'
            : text === 'manufacturer'
            ? '生产'
            : '分销'}
        </Tag>
      ),
    },
    {
      title: '分类ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 100,
    },
    {
      title: '分类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.categoryLevel === 2 && (
            <span style={{ marginRight: 8, color: '#ccc' }}>├─</span>
          )}
          {record.categoryImages?.icon && (
            <img
              src={record.categoryImages.icon}
              alt="分类图标"
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '一级分类',
      dataIndex: 'categoryLevel1',
      key: 'categoryLevel1',
      width: 150,
    },
    {
      title: '父级分类',
      dataIndex: 'parentCategory',
      key: 'parentCategory',
      width: 150,
      render: (text) => {
        if (!text) return <span>无</span>;
        // 如果parentCategory是对象ID，可能需要额外处理
        // 这里假设API返回时已经填充了父分类名称
        return typeof text === 'string' ? text : '未知';
      },
    },
    {
      title: '分类级别',
      dataIndex: 'categoryLevel',
      key: 'categoryLevel',
      width: 80,
      render: (text) => (
        <Tag color={text === 1 ? 'purple' : 'orange'}>
          {text === 1 ? '一级' : '二级'}
        </Tag>
      ),
    },
    {
      title: '商品数量',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => (
        <Tag
          color={
            text === 'active'
              ? 'success'
              : text === 'inactive'
              ? 'default'
              : 'danger'
          }
        >
          {text === 'active' ? '启用' : text === 'inactive' ? '禁用' : '已删除'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.categoryId)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <GoodsLayout>
      <div className="classification-container">
        <Card title="商品分类管理" bordered={false}>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card bordered={true}>
                <p className="stat-title">分类总数</p>
                <p className="stat-value">{statistics.total}</p>
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={true}>
                <p className="stat-title">一级分类</p>
                <p className="stat-value">{statistics.level1}</p>
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={true}>
                <p className="stat-title">二级分类</p>
                <p className="stat-value">{statistics.level2}</p>
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={true}>
                <p className="stat-title">启用分类</p>
                <p className="stat-value">{statistics.enabled}</p>
              </Card>
            </Col>
          </Row>

          {/* 搜索区域 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 10 }}>
              <Input
                placeholder="分类名称"
                value={searchParams.name}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, name: e.target.value })
                }
                style={{ width: 200 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>

            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增分类
            </Button>
          </div>

          {/* 分类表格 */}
          <Table
            columns={columns}
            dataSource={productCategories}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={handlePaginationChange}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        {/* 新增/编辑分类弹窗 */}
        <Modal
          title={isEdit ? '编辑分类' : '新增分类'}
          visible={visible}
          onOk={handleSubmit}
          onCancel={() => setVisible(false)}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Item
              name="name"
              label="分类名称"
              rules={[{ required: true, message: '请输入分类名称' }]}
            >
              <Input placeholder="请输入分类名称" />
            </Item>

            <Item name="parentId" label="父级分类">
              <Select placeholder="请选择父级分类">
                {categoryOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Item>

            <Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Item>
          </Form>
        </Modal>

        <style jsx>
          {`
            .stat-title {
              color: #999;
              margin-bottom: 8px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #1890ff;
            }
          `}
        </style>
      </div>
    </GoodsLayout>
  );
};

export default ClassificationOfCommodities;
