import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  InputNumber,
  Form,
  Space,
  Card,
  Typography,
  Tag,
  Divider,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import apiMap from '../../api/Product/index';

const { Option } = Select;
const { Title } = Typography;

const ProductSelector = ({ 
  value = [], 
  onChange, 
  type = 'tally', // 'tally' 或 'sorting'
  disabled = false 
}) => {
  const [products, setProducts] = useState(value || []);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取后端商品数据
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🚀 开始获取商品数据...');
      console.log('🔗 API 映射对象:', apiMap);
      console.log('📡 API 函数:', apiMap.Product.getList);
      
      const response = await apiMap.Product.getList();
      console.log('📦 商品数据响应:', response);
      
      // 处理不同的响应格式
      let products = [];
      if (response && Array.isArray(response.data)) {
        // 格式1: {success: true, data: [...]}
        products = response.data;
      } else if (response && Array.isArray(response)) {
        // 格式2: 直接返回数组
        products = response;
      } else if (response && response.code === 200 && Array.isArray(response.data)) {
        // 格式3: {code: 200, data: [...]}
        products = response.data;
      } else {
        console.warn('❌ 商品数据格式不正确:', response);
        console.log('响应详情:', {
          hasResponse: !!response,
          responseType: typeof response,
          hasData: !!response?.data,
          dataType: typeof response?.data,
          isArray: Array.isArray(response?.data),
          hasCode: !!response?.code,
          code: response?.code
        });
        throw new Error('商品数据格式不正确');
      }
      
      if (products && products.length > 0) {
        // 将后端商品数据转换为组件需要的格式
        const formattedProducts = products.map((product, index) => {
          console.log(`🏷️ 处理商品 ${index + 1}:`, product);
          return {
            code: product.productId || `PRODUCT_${index + 1}`,
            name: product.productName || '未知商品',
            category: product.productCategory?.name || product.category || '未分类',
            unit: product.productInfo?.unit || product.unit || '件',
            // 保留原始数据以备后用
            originalData: product
          };
        });
        
        setAvailableProducts(formattedProducts);
        console.log('✅ 格式化商品数据:', formattedProducts);
        message.success(`成功获取 ${formattedProducts.length} 个商品数据`);
      } else {
        console.warn('⚠️ 后端返回的商品数据为空，使用备用数据');
        throw new Error('商品数据为空');
      }
    } catch (error) {
      console.error('💥 获取商品数据失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      message.warning('获取商品数据失败，使用备用数据');
      
      // 如果API失败，使用备用的模拟数据
      const fallbackProducts = [
        { code: 'IPHCASE001', name: '苹果手机保护壳', category: '手机配件', unit: '件' },
        { code: 'SAMCHARGE001', name: '三星手机充电器', category: '手机配件', unit: '件' },
        { code: 'HWWATCH001', name: '华为智能手表', category: '智能穿戴', unit: '件' },
        { code: 'IPADCASE001', name: 'iPad保护套', category: '平板配件', unit: '件' },
        { code: 'LAPTOPBAG001', name: '笔记本电脑包', category: '电脑配件', unit: '件' },
        { code: 'WMOUSE001', name: '无线鼠标', category: '电脑配件', unit: '件' },
        { code: 'IPHCABLE001', name: 'iPhone数据线', category: '手机配件', unit: '件' },
        { code: 'ANDCABLE001', name: '安卓数据线', category: '手机配件', unit: '件' },
        { code: 'BTSPEAKER001', name: '蓝牙音箱', category: '音响设备', unit: '件' },
        { code: 'PHONESTAND001', name: '手机支架', category: '手机配件', unit: '件' },
      ];
      
      setAvailableProducts(fallbackProducts);
      console.log('🔄 使用备用商品数据:', fallbackProducts);
    } finally {
      setLoading(false);
      console.log('🏁 商品数据加载完成');
    }
  };

  useEffect(() => {
    setProducts(value || []);
  }, [value]);

  const handleProductsChange = (newProducts) => {
    setProducts(newProducts);
    if (onChange) {
      onChange(newProducts);
    }
  };

  // 添加商品
  const handleAddProduct = () => {
    const newProduct = {
      key: Date.now().toString(),
      productCode: '',
      productName: '',
      category: '',
      unit: '件',
      ...(type === 'tally' ? {
        plannedQuantity: 1,
        actualQuantity: 0,
        condition: 'good',
        location: '',
        notes: ''
      } : {
        requiredQuantity: 1,
        pickedQuantity: 0,
        sourceLocation: '',
        targetLocation: '',
        batchNumber: '',
        pickingOrder: products.length + 1,
        notes: ''
      })
    };
    
    const newProducts = [...products, newProduct];
    setEditingKey(newProduct.key);
    handleProductsChange(newProducts);
  };

  // 删除商品
  const handleDeleteProduct = (key) => {
    const newProducts = products.filter(item => item.key !== key);
    handleProductsChange(newProducts);
  };

  // 开始编辑
  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingKey(record.key);
  };

  // 保存编辑
  const handleSave = async (key) => {
    try {
      const values = await form.validateFields();
      const newProducts = [...products];
      const index = newProducts.findIndex(item => key === item.key);
      
      if (index > -1) {
        // 如果选择了商品代码，自动填充商品信息
        if (values.productCode) {
          const selectedProduct = availableProducts.find(p => p.code === values.productCode);
          if (selectedProduct) {
            values.productName = selectedProduct.name;
            values.category = selectedProduct.category;
            values.unit = selectedProduct.unit;
          }
        }
        
        newProducts[index] = { ...newProducts[index], ...values };
        handleProductsChange(newProducts);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setEditingKey('');
  };

  const isEditing = (record) => record.key === editingKey;

  // 理货单商品列定义
  const tallyColumns = [
    {
      title: '商品代码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="productCode"
              style={{ margin: 0 }}
              rules={[{ required: true, message: '请选择商品' }]}
            >
              <Select 
                placeholder={loading ? "正在加载商品..." : availableProducts.length > 0 ? "选择商品" : "暂无可选商品"}
                showSearch
                loading={loading}
                notFoundContent={loading ? '加载中...' : '暂无商品'}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availableProducts.map(product => (
                  <Option key={product.code} value={product.code}>
                    {product.code} - {product.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="plannedQuantity"
              style={{ margin: 0 }}
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '实际数量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 100,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="actualQuantity"
              style={{ margin: 0 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="location"
              style={{ margin: 0 }}
            >
              <Input placeholder="如: A区-01-01" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '商品状态',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="condition"
              style={{ margin: 0 }}
            >
              <Select>
                <Option value="good">良好</Option>
                <Option value="damaged">损坏</Option>
                <Option value="expired">过期</Option>
              </Select>
            </Form.Item>
          );
        }
        const colors = { good: 'green', damaged: 'red', expired: 'orange' };
        const labels = { good: '良好', damaged: '损坏', expired: '过期' };
        return <Tag color={colors[text]}>{labels[text]}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="notes"
              style={{ margin: 0 }}
            >
              <Input placeholder="备注信息" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        if (isEditing(record)) {
          return (
            <Space>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                size="small"
                onClick={() => handleSave(record.key)}
              >
                保存
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="small"
                onClick={handleCancel}
              >
                取消
              </Button>
            </Space>
          );
        }
        
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              disabled={disabled}
            >
              编辑
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteProduct(record.key)}
              disabled={disabled}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  // 分拣单商品列定义
  const sortingColumns = [
    {
      title: '商品代码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="productCode"
              style={{ margin: 0 }}
              rules={[{ required: true, message: '请选择商品' }]}
            >
              <Select 
                placeholder={loading ? "正在加载商品..." : availableProducts.length > 0 ? "选择商品" : "暂无可选商品"}
                showSearch
                loading={loading}
                notFoundContent={loading ? '加载中...' : '暂无商品'}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availableProducts.map(product => (
                  <Option key={product.code} value={product.code}>
                    {product.code} - {product.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '需求数量',
      dataIndex: 'requiredQuantity',
      key: 'requiredQuantity',
      width: 100,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="requiredQuantity"
              style={{ margin: 0 }}
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '已拣数量',
      dataIndex: 'pickedQuantity',
      key: 'pickedQuantity',
      width: 100,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="pickedQuantity"
              style={{ margin: 0 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '源位置',
      dataIndex: 'sourceLocation',
      key: 'sourceLocation',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="sourceLocation"
              style={{ margin: 0 }}
            >
              <Input placeholder="如: A区-01-01" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '目标位置',
      dataIndex: 'targetLocation',
      key: 'targetLocation',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="targetLocation"
              style={{ margin: 0 }}
            >
              <Input placeholder="如: 发货区-01" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="batchNumber"
              style={{ margin: 0 }}
            >
              <Input placeholder="批次号" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '拣选顺序',
      dataIndex: 'pickingOrder',
      key: 'pickingOrder',
      width: 100,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="pickingOrder"
              style={{ margin: 0 }}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="notes"
              style={{ margin: 0 }}
            >
              <Input placeholder="备注信息" />
            </Form.Item>
          );
        }
        return text;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        if (isEditing(record)) {
          return (
            <Space>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                size="small"
                onClick={() => handleSave(record.key)}
              >
                保存
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="small"
                onClick={handleCancel}
              >
                取消
              </Button>
            </Space>
          );
        }
        
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              disabled={disabled}
            >
              编辑
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteProduct(record.key)}
              disabled={disabled}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  const columns = type === 'tally' ? tallyColumns : sortingColumns;

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>商品清单 ({products.length} 种商品)</span>
          <Space>
            {availableProducts.length <= 10 && (
              <Button
                size="small"
                onClick={fetchProducts}
                loading={loading}
                type="link"
              >
                重新获取商品
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleAddProduct}
              disabled={disabled}
            >
              添加商品
            </Button>
          </Space>
        </div>
      }
      size="small"
    >
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          调试: 可选商品数量: {availableProducts.length}, 加载状态: {loading ? '加载中' : '已完成'}
          {availableProducts.length <= 10 && <span style={{ color: '#ff4d4f' }}> (使用备用数据)</span>}
        </div>
      )}
      
      <Form form={form} component={false}>
        <Table
          columns={columns}
          dataSource={products}
          pagination={false}
          scroll={{ x: 1000 }}
          size="small"
          locale={{
            emptyText: '暂无商品，请点击"添加商品"按钮添加'
          }}
        />
      </Form>
      
      {products.length > 0 && (
        <>
          <Divider />
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
            <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>汇总信息</Title>
            <Space split={<Divider type="vertical" />}>
              <span>商品种数: <strong>{products.length}</strong></span>
              {type === 'tally' ? (
                <>
                  <span>计划总数量: <strong>{products.reduce((sum, item) => sum + (item.plannedQuantity || 0), 0)}</strong></span>
                  <span>实际总数量: <strong>{products.reduce((sum, item) => sum + (item.actualQuantity || 0), 0)}</strong></span>
                </>
              ) : (
                <>
                  <span>需求总数量: <strong>{products.reduce((sum, item) => sum + (item.requiredQuantity || 0), 0)}</strong></span>
                  <span>已拣总数量: <strong>{products.reduce((sum, item) => sum + (item.pickedQuantity || 0), 0)}</strong></span>
                </>
              )}
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default ProductSelector;
