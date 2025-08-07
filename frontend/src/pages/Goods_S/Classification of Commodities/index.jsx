// 修复导入问题
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
  // 扩展搜索参数
  const [searchParams, setSearchParams] = useState({
    name: '',
    categoryLevel: '', // 分类级别
    status: '', // 状态
    businessType: '', // 业务类型
    parentCategory: '', // 父级分类
  });
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
    setproductCategories(data);
  };
  useEffect(() => {
    getlist();
  }, []);

  // 获取分类列表（使用真实API）
  const fetchCategoryList = async () => {
    setLoading(true);
    try {
      // 使用真实API调用，传递所有搜索参数
      const response = await ProductApi.Product.searchProductCategories({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams,
      });

      if (response.success) {
        const filteredData = response.data || [];
        setList(filteredData);
        setproductCategories(filteredData); // 同步更新 productCategories 状态
        setPagination({
          ...pagination,
          total: response.total || filteredData.length,
        });

        // 计算统计数据
        const level1Count = filteredData.filter(
          (item) => item.categoryLevel === 1
        ).length;
        const level2Count = filteredData.filter(
          (item) => item.categoryLevel === 2
        ).length;
        const enabledCount = filteredData.filter(
          (item) => item.status === 'active'
        ).length;

        setStatistics({
          total: filteredData.length,
          level1: level1Count,
          level2: level2Count,
          enabled: enabledCount,
        });
      } else {
        message.error('获取分类列表失败');
      }
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
    setCurrentId(record.categoryId);
    form.setFieldsValue({
      name: record.categoryName,
      parentId: record.parentCategory?.categoryId || '0',
      status: record.status === 'active' ? 1 : 0,
      // 如有其他字段也需要设置
    });
    setVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        categoryId: isEdit ? currentId : undefined,
        categoryName: values.name,
        parentCategory: values.parentId === '0' ? null : values.parentId,
        status: values.status === 1 ? 'active' : 'inactive',
        // 如有其他字段也需要添加
      };

      setLoading(true);
      if (isEdit) {
        // 编辑分类
        const response = await ProductApi.Product.updateProductCategory(data);
        if (response.success) {
          message.success('编辑成功');
          fetchCategoryList(); // 重新获取列表
          setVisible(false);
        } else {
          message.error(response.message || '编辑失败');
        }
      } else {
        // 新增分类
        const response = await ProductApi.Product.addProductCategory(data);
        if (response.success) {
          message.success('新增成功');
          fetchCategoryList(); // 重新获取列表
          setVisible(false);
        } else {
          message.error(response.message || '新增失败');
        }
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除分类
  const handleDelete = (categoryId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该分类吗？删除后不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          // 调用真实删除API
          const response = await ProductApi.Product.deleteProductCategory(
            categoryId
          );
          if (response.success) {
            message.success('删除成功');
            fetchCategoryList(); // 重新获取列表
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete category:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 搜索分类
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchCategoryList();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      categoryLevel: '',
      status: '',
      businessType: '',
      parentCategory: '',
    });
    setPagination({ ...pagination, current: 1 });
    fetchCategoryList();
  };

  // 监听搜索参数变化
  useEffect(() => {
    // 当搜索参数变化时，重新获取列表
    const timer = setTimeout(() => {
      fetchCategoryList();
    }, 500); // 防抖处理

    return () => clearTimeout(timer);
  }, [searchParams, pagination.current, pagination.pageSize]);

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

          {/* 搜索区域 - 优化UI */}
          <Card bordered={true} style={{ marginBottom: 16, padding: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="分类名称"
                  value={searchParams.name}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, name: e.target.value })
                  }
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="分类级别"
                  value={searchParams.categoryLevel}
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, categoryLevel: value })
                  }
                  allowClear
                >
                  <Option value="1">一级分类</Option>
                  <Option value="2">二级分类</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="状态"
                  value={searchParams.status}
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, status: value })
                  }
                  allowClear
                >
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="业务类型"
                  value={searchParams.businessType}
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, businessType: value })
                  }
                  allowClear
                >
                  <Option value="retail">零售</Option>
                  <Option value="wholesale">批发</Option>
                  <Option value="manufacturer">生产</Option>
                  <Option value="distribution">分销</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="父级分类"
                  value={searchParams.parentCategory}
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, parentCategory: value })
                  }
                  allowClear
                >
                  {categoryOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={16} lg={18}></Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Space size="middle">
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    style={{ width: '40%' }}
                  >
                    搜索
                  </Button>
                  <Button onClick={handleReset} style={{ width: '40%' }}>
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 分类表格 - 修复rowKey并完整闭合标签 */}
          <Table
            columns={columns}
            dataSource={productCategories}
            rowKey="categoryId"
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
