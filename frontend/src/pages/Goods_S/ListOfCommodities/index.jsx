import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  DatePicker,
  Switch,
  Upload,
  message,
  Cascader,
} from 'antd';
import CustomModal from '@/components/CustomModal';
import dayjs from 'dayjs';
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
import ProductApi from '@/api/Product';
import { useNavigate } from 'react-router-dom';

// console.log(data);

const { Option } = Select;

const ListOfCommodities = () => {
  const addModalRef = useRef(null);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [list, setlist] = useState([]);
  const getGoodsList = async () => {
    const { success, data } = await ProductApi.Product.getList({
      page: 1,
      pageSize: 1,
    });
    // console.log(success, data);
    if (success) {
      // 过滤掉已删除的商品
      const filteredData = data.filter((item) => item.status !== 'deleted');
      setlist(filteredData);
    }
  };
  useEffect(() => {
    getGoodsList();
  }, []);

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
    inStock: '', // 新增库存商品状态
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // 表格列定义
  const columns = [
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
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
      dataIndex: 'productCategory',
      key: 'productCategory',
      width: 100,
    },
    {
      title: '销售价',
      dataIndex: ['pricing', 'salePrice'],
      key: 'pricing',
      width: 100,
    },
    {
      title: '库存商品',
      dataIndex: ['inventory', 'currentStock'],
      key: 'currentStock',
      width: 100,
    },
    {
      title: '库存总数',
      dataIndex: ['inventory', 'totalStock'],
      key: 'totalStock',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text, record) => {
        // 状态映射：英文状态 -> [中文状态, 标签颜色]
        const statusMap = {
          pending: ['待审核', 'default'],
          approved: ['已通过', 'success'],
          rejected: ['已拒绝', 'error'],
          onSale: ['在售', 'primary'],
          offSale: ['下架', 'warning'],
          deleted: ['已删除', 'danger'],
        };

        // 获取当前状态对应的中文和颜色
        const [statusText, color] = statusMap[record.status] || [
          '未知状态',
          'default',
        ];
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: '最后更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          {/* <Button type="link">编辑</Button> */}
          <Button
            type="link"
            style={{ color: record.status !== 'offSale' ? 'red' : 'green' }}
            onClick={() => {
              handleChangeStatus(record);
            }}
          >
            {record.status === 'offSale' ? '上架' : '下架'}
          </Button>
          <Button type="link" onClick={() => AddtoRecycleBin(record)}>
            加入回收站
          </Button>
        </Space>
      ),
    },
  ];
  //修改商品状态
  const handleChangeStatus = async ({ productId, status }) => {
    console.log(productId, status);
    const statusList = [
      'pending',
      'approved',
      'rejected',
      'onSale',
      'offSale',
      'deleted',
    ];
    const RadomStatus =
      statusList[Math.floor(Math.random() * statusList.length)];

    const { success, message, data } =
      await ProductApi.Product.updateProductSta(productId, RadomStatus);
    // console.log(response);
    if (success) {
      messageApi.open({
        type: 'success',
        content: 'This is a success message',
      });

      getGoodsList();
    }
  };
  // 加入回收站
  const AddtoRecycleBin = (record) => {
    let modalFormRef = null;

    const handleSubmit = async () => {
      try {
        const formValues = await modalFormRef.validateFields(); // 获取表单值

        const formData = {
          originalProduct: record._id || record.id,
          merchant: record.merchant?._id || record.merchantId,
          productSnapshot: {
            productId: record.productId,
            productName: record.productName,
            productCategory: record.productCategory,
            businessType: record.businessType,
            pricing: record.pricing,
            inventory: record.inventory,
            productInfo: record.productInfo,
          },
          deleteReason: formValues.deleteReason,
          deleteReasonDetail: formValues.deleteReasonDetail,
          autoDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        };

        const { success, message } = await ProductApi.Product.addToRecycleBin(
          formData
        );
        if (success) {
          messageApi.success('成功加入回收站');
          getGoodsList(); // 刷新列表
        }
      } catch (err) {
        console.error(err);
      }
    };

    const modal = Modal.confirm({
      title: '确认加入回收站',
      icon: null,
      content: (
        <Form
          layout="vertical"
          ref={(ref) => {
            if (ref) modalFormRef = ref;
          }}
          name="deleteReasonForm"
        >
          <Form.Item
            name="deleteReason"
            label="删除原因"
            rules={[{ required: true, message: '请选择删除原因' }]}
          >
            <Select placeholder="请选择删除原因">
              <Option value="discontinued">停产</Option>
              <Option value="expired">过期</Option>
              <Option value="quality_issue">质量问题</Option>
              <Option value="policy_violation">违规</Option>
              <Option value="merchant_request">商家要求</Option>
              <Option value="system_cleanup">系统清理</Option>
              <Option value="duplicate">重复</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="deleteReasonDetail" label="删除原因详情">
            <Input.TextArea rows={3} placeholder="请输入详细原因（可选）" />
          </Form.Item>
        </Form>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: handleSubmit,
    });
  };

  // 加载数据
  // const loadData = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     // 这里应该调用实际的API
  //     setTimeout(() => {
  //       setDataSource((data.list || []).filter((item) => !item.isDeleted));
  //       setPagination((prev) => ({
  //         ...prev,
  //         total: data.length,
  //       }));
  //       setLoading(false);
  //     }, 1000);
  //   } catch (error) {
  //     message.error('加载数据失败');
  //     setLoading(false);
  //   }
  // }, []);

  // 搜索处理
  // const handleSearch = async () => {
  //   try {
  //     setLoading(true);
  //     // 构建搜索参数，包含 inStock
  //     const params = {
  //       name: searchParams.name,
  //       category: searchParams.category,
  //       status: searchParams.status,
  //       inStock: searchParams.inStock,
  //       // page: pagination.current,
  //       // pageSize: pagination.pageSize,
  //     };

  //     // 调用搜索 API
  //     const {
  //       success,
  //       data,
  //       pagination: resPagination,
  //     } = await ProductApi.Product.getList(params);
  //     console.log(success, data);
  //     if (success) {
  //       // 过滤掉已删除的商品
  //       const filteredData = data.filter((item) => item.status !== 'deleted');
  //       setlist(filteredData); // 更新表格使用的数据源
  //       setPagination((prev) => ({
  //         ...prev,
  //         total: resPagination?.total || filteredData.length,
  //       }));
  //     }
  //   } catch (error) {
  //     message.error('搜索失败: ' + error.message);
  //     console.error('搜索商品错误:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      name: '',
      category: '',
      status: '',
      inStock: '',
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
    getGoodsList(); // 重置后显示全部商品
  };

  // 分页变化处理

  // 新增商品

  const handleAdd = () => {
    addModalRef.current.toggleShowStatus(true);
    setEditingRecord(null);
    form.resetFields();
    // console.log('添加');
    // navigate('/goods/ProductEditor');
  };

  // 编辑商品
  const handleEdit = (record) => {
    // setEditingRecord(record);
    // form.setFieldsValue(record);
    // setModalVisible(true);
  };

  // 删除商品
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商品"${record.name}"吗？`,
      onOk: () => {
        // message.success('删除成功');
        // loadData();
      },
    });
  };

  // 表单提交
  const handleSubmit = async (values) => {
    // console.log(values, '999');
    try {
      console.log('提交数据:', values);
      if (!values) return;

      // 生成审核ID
      const auditId =
        'AUDIT' +
        Date.now().toString().slice(-8) +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');

      // 确保productInfo对象存在并有productName字段
      const productInfo = {
        ...values.productInfo,
        productName:
          values.productInfo?.productName || values.productName || '未命名商品',
      };

      // 构建完整的请求数据
      const submitData = {
        ...values,
        auditId,
        productInfo,
        submitTime: new Date().toISOString(),
      };

      const { success } = await ProductApi.Product.addProductAudit(submitData);
      if (success) {
        messageApi.success('审核记录创建成功');
        addModalRef.current?.toggleShowStatus(false);
      }
    } catch (error) {
      console.error('提交数据时出错:', error);
      messageApi.error('提交数据时出错');
    }
  };

  // 分页变化
  // const handleTableChange = (page, pageSize) => {
  //   setPagination({
  //     current: page,
  //     pageSize: pageSize,
  //     total: pagination.total,
  //   });
  //   loadData();
  // };

  // useEffect(() => {
  //   loadData();
  // }, [loadData]);
  const onChange = (value) => {
    console.log(value);
  };

  // 修改搜索区域组件
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
                onChange={(value) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    category: value[value.length - 1],
                  }))
                }
                placeholder="商品分类"
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="商品状态"
                value={searchParams.status}
                onChange={(value) =>
                  setSearchParams((prev) => ({ ...prev, status: value }))
                }
                allowClear
                style={{ width: '100px' }}
                options={[
                  { value: 'pending', label: '待审核' },
                  { value: 'approved', label: '已通过' },
                  { value: 'rejected', label: '已拒绝' },
                  { value: 'onSale', label: '在售' },
                  { value: 'offSale', label: '下架' },
                  { value: 'deleted', label: '已删除' },
                ]}
              ></Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="库存商品"
                value={searchParams.inStock}
                onChange={(value) =>
                  setSearchParams((prev) => ({ ...prev, inStock: value }))
                }
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
                  // onClick={handleSearch}
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
            新增审核
          </Button>
          <Button className="Export " icon={<ExportSvg />}>
            导出
          </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            // onChange: handleTableChange,
            // onShowSizeChange: handleTableChange,
          }}
        />

        {/* 新增/编辑商品-审核列表弹窗 */}
        <CustomModal
          ref={addModalRef}
          title={editingRecord ? '编辑审核列表' : '新增审核列表'}
          loading={loading}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* 以下内容保持不变 */}
            <Col span={12}>
              <Form.Item
                name="merchant"
                label="所属商家"
                // rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入所属商家" />
              </Form.Item>
            </Col>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="productInfo"
                  label="商品信息"
                  // rules={[{ required: true, message: '请输入商品名称' }]}
                >
                  <Input placeholder="请输入商品信息" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="auditReason"
                  label="审核原因"
                  // rules={[{ required: true, message: '请选择审核原因' }]}
                >
                  <Input placeholder="请输入审核原因" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="auditType"
                  label="审核类型"

                  // rules={[{ required: true, message: '请选择审核原因' }]}
                >
                  <Select
                    defaultValue={'create'}
                    options={[
                      {
                        value: 'create',
                        label: '新增',
                      },
                      {
                        value: 'update',
                        label: '修改',
                      },
                      {
                        value: 'delete',
                        label: '删除',
                      },
                      {
                        value: 'restore',
                        label: '恢复',
                      },
                    ]}
                  ></Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="auditStatus"
                  label="状态"
                  // rules={[{ required: true, message: '请输入商品价格' }]}
                >
                  <Select
                    defaultValue={'pending'}
                    placeholder="请选择状态"
                    options={[
                      {
                        value: 'pending',
                        label: '待审核',
                      },
                      {
                        value: 'approved',
                        label: '已通过',
                      },
                      {
                        value: 'rejected',
                        label: '已拒绝',
                      },
                    ]}
                  ></Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="submitTime"
                  label="提交时间"
                  // rules={[{ required: true, message: '请输入库存数量' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="auditor" label="操作人">
              <Input placeholder="请输入操作人"></Input>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingRecord ? '更新' : '创建'}
                </Button>
                <Button
                  onClick={() => addModalRef.current?.toggleShowStatus(false)}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </CustomModal>
      </div>
    </GoodsLayout>
  );
};

export default ListOfCommodities;
