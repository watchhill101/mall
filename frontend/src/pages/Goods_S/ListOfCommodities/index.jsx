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
  const [recycleForm] = Form.useForm(); // 添加这行代码声明表单引用

  const getGoodsList = async () => {
    const { success, data } = await ProductApi.Product.getList();
    if (success) {
      // 过滤掉已删除的商品
      // const filteredData = data.filter((item) => item.status !== 'deleted');
      setlist(data);
    }
  };
  useEffect(() => {
    // 初始加载商品列表
    getGoodsList();

    // 监听刷新事件
    const handleRefresh = () => {
      getGoodsList();
    };

    window.addEventListener('refreshProductList', handleRefresh);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('refreshProductList', handleRefresh);
    };
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
        // 处理图片URL，去除多余的空格和反引号
        const imageUrl =
          record?.productInfo?.images[0]?.replace(/[`\s]/g, '') || '';
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* {JSON.stringify(record)} */}

            <>
              <img src={imageUrl} alt="" style={{ width: 60, height: 60 }} />
              <span>{record.productName}</span>
            </>
          </div>
        );
      },
    },
    {
      title: '商品分类',
      dataIndex: 'productCategory',
      key: 'productCategory',
      width: 100,
      render: (text) => {
        // 这里假设你有一个分类映射表
        const categoryMap = {
          '68923655d69c94af5d9ead4c': '智能设备',
          // 其他分类映射...
        };
        return categoryMap[text] || '未知分类';
      },
    },
    {
      title: '销售价',
      dataIndex: ['pricing', 'salePrice'],
      key: 'pricing',
      width: 100,
      render: (text) => {
        // 显示最小值和最大值（如果相同则只显示一个）
        if (text && text.min === text.max) {
          return `¥${text.min}`;
        } else if (text) {
          return `¥${text.min}-¥${text.max}`;
        }
        return '-';
      },
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
          approved: ['已通过', 'approved'],
          rejected: ['已拒绝', ''],
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
          <Button
            type="link"
            onClick={() => {
              setCurrentRecord(record);
              setEditVisible(true);
            }}
          >
            编辑
          </Button>

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
    // 移除随机状态逻辑，根据当前状态设置新状态
    const newStatus = status === 'offSale' ? 'onSale' : 'offSale';

    const { success, message } = await ProductApi.Product.updateProductSta(
      productId,
      newStatus
    );
    if (success) {
      messageApi.open({
        type: 'success',
        content: '商品状态更新成功',
      });
      getGoodsList();
    } else {
      messageApi.open({
        type: 'error',
        content: `更新失败: ${message || '未知错误'}`,
      });
    }
  };
  // 加入回收站
  const AddtoRecycleBin = (record) => {
    Modal.confirm({
      title: '确认加入回收站',
      content: (
        <Form form={recycleForm} layout="vertical">
          <Form.Item
            label="删除原因"
            name="deleteReason"
            rules={[{ required: true, message: '请选择删除原因' }]}
          >
            <Select placeholder="请选择删除原因">
              <Option value="outdated">商品过时</Option>
              <Option value="noStock">库存不足</Option>
              <Option value="qualityIssue">质量问题</Option>
              <Option value="other">其他原因</Option>
            </Select>
          </Form.Item>
          <Form.Item label="详细说明" name="deleteReasonDetail">
            <Input.TextArea rows={4} placeholder="请输入详细删除原因" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          // 获取表单值
          const formValue = await recycleForm.validateFields();
          const { deleteReason, deleteReasonDetail } = formValue;

          // 准备请求数据
          const requestData = {
            originalProduct: record._id,
            merchant: record.merchant?._id || null,
            productSnapshot: record,
            deleteReason,
            deleteReasonDetail,
            deletedBy: '6891c594711bbd8f373159c3', // 假设当前用户是admin，实际应从登录信息获取
            autoDeleteAt: dayjs().add(30, 'day').toISOString(), // 30天后自动删除
          };

          // 调用API6891c594711bbd8f373159c3
          const response = await ProductApi.Product.addToRecycleBin(
            requestData
          );
          console.log(response, 'ressss');

          if (response.success) {
            messageApi.success('商品已成功加入回收站');
            getGoodsList(); // 刷新商品列表
          } else {
            messageApi.error(
              `加入回收站失败: ${response.message || '未知错误'}`
            );
          }
        } catch (error) {
          console.error('加入回收站失败:', error);
          messageApi.error('操作失败，请重试');
        }
      },
      onCancel: () => {
        console.log('取消加入回收站');
      },
    });
  };
  // 新增商品

  const handleAdd = () => {
    addModalRef.current.toggleShowStatus(true);
    setEditingRecord(null);
    form.resetFields();
    // console.log('添加');
    // navigate('/goods/ProductEditor');
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
    try {
      const productInfo = {
        productName: values.productInfo || '未命名商品',
      };

      const submitData = {
        ...values,
        productInfo,
        submitTime: values.submitTime
          ? values.submitTime.toISOString()
          : new Date().toISOString(),
      };

      if (editingRecord) {
        // 编辑模式
        submitData.productId = editingRecord.productId;

        const { success } = await ProductApi.Product.updateProductAudit(
          editingRecord.productId,
          submitData
        );

        if (success) {
          messageApi.success('审核记录更新成功');
          setEditingRecord(null);
          addModalRef.current?.toggleShowStatus(false);
          getGoodsList(); // 重新加载列表
        }
      } else {
        // 新增模式
        const auditId =
          'AUDIT' +
          Date.now().toString().slice(-8) +
          Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');

        const { success } = await ProductApi.Product.addProductAudit({
          ...submitData,
          auditId,
        });

        if (success) {
          messageApi.success('审核记录创建成功');
          addModalRef.current?.toggleShowStatus(false);
          getGoodsList(); // 刷新
        }
      }
    } catch (error) {
      console.error('提交数据时出错:', error);
      messageApi.error('提交失败');
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

  const handleSearch = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const params = {
        name: searchParams.name,
        category: searchParams.category,
        status: searchParams.status,
        inStock: searchParams.inStock,
        page,
        pageSize,
      };

      // 使用searchProducts接口替代getList
      const { success, data, pagination } =
        await ProductApi.Product.searchProducts(params);

      // 添加调试代码，查看返回的数据结构
      console.log('搜索返回数据:', data);
      console.log('分页数据:', pagination);

      if (success) {
        // 直接使用后端返回的分页数据
        setlist(data);
        setPagination({
          current: Number(page), // 确保是数字类型
          pageSize: Number(pageSize), // 确保是数字类型
          total: Number(pagination.total), // 确保是数字类型
        });
      }
    } catch (error) {
      message.error('搜索失败: ' + error.message);
      console.error('搜索商品错误:', error);
    } finally {
      setLoading(false);
    }
  };
  const [editVisible, setEditVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const handleEditSubmit = async (updatedRecord) => {
    console.log(updatedRecord, 'ii');
    try {
      const { success } = await ProductApi.Product.updateProductInfo(
        updatedRecord
      ); // 模拟接口
      if (success) {
        message.success('编辑成功');
        setEditVisible(false);
        getGoodsList();
      }
    } catch (err) {
      console.error('编辑失败:', err);
      message.error('编辑失败');
    }
  };
  const handleReset = () => {
    // 重置搜索参数
    setSearchParams({
      name: '',
      category: '',
      status: '',
      inStock: '',
    });
    // 重新加载第一页数据
    handleSearch(1, pagination.pageSize);
  };

  return (
    <GoodsLayout>
      <div style={{ padding: '24px' }}>
        {/* 搜索区域 - 优化布局 */}
        <div
          className="search-bar"
          style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    width: '80px',
                    textAlign: 'right',
                    marginRight: '12px',
                    fontWeight: 500,
                  }}
                >
                  商品名称:
                </span>
                <Input
                  placeholder="请输入商品名称"
                  value={searchParams.name}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  allowClear
                  onPressEnter={handleSearch}
                  style={{ flex: 1 }}
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    width: '80px',
                    textAlign: 'right',
                    marginRight: '12px',
                    fontWeight: 500,
                  }}
                >
                  商品分类:
                </span>
                <Cascader
                  options={categoryData}
                  onChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      category: value[value.length - 1],
                    }))
                  }
                  placeholder="请选择分类"
                  allowClear
                  style={{ flex: 1 }}
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    width: '80px',
                    textAlign: 'right',
                    marginRight: '12px',
                    fontWeight: 500,
                  }}
                >
                  商品状态:
                </span>
                <Select
                  placeholder="请选择状态"
                  value={searchParams.status}
                  onChange={(value) =>
                    setSearchParams((prev) => ({ ...prev, status: value }))
                  }
                  allowClear
                  style={{ flex: 1 }}
                  options={[
                    { value: 'pending', label: '待审核' },
                    { value: 'approved', label: '已通过' },
                    { value: 'rejected', label: '已拒绝' },
                    { value: 'onSale', label: '在售' },
                    { value: 'offSale', label: '下架' },
                    { value: 'deleted', label: '已删除' },
                  ]}
                ></Select>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    width: '80px',
                    textAlign: 'right',
                    marginRight: '12px',
                    fontWeight: 500,
                  }}
                >
                  库存状态:
                </span>
                <Select
                  placeholder="请选择库存状态"
                  value={searchParams.inStock}
                  onChange={(value) =>
                    setSearchParams((prev) => ({ ...prev, inStock: value }))
                  }
                  allowClear
                  style={{ flex: 1 }}
                  options={[
                    { value: '1', label: '有库存' },
                    { value: '0', label: '无库存' },
                  ]}
                ></Select>
              </div>
            </Col>
            <Col xs={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  style={{ marginRight: '8px' }}
                >
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* 操作按钮 */}
        <div className="operation-button" style={{ marginBottom: '16px' }}>
          <Button
            className="addBtn"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增审核
          </Button>
          <Button
            className="Export "
            icon={<ExportSvg />}
            style={{ marginLeft: '8px' }}
          >
            导出
          </Button>
        </div>
        {JSON.stringify(list)}
        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'], // 添加这一行
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              handleSearch(page, pageSize); // 分页触发搜索
            },
          }}
          // locale={{
          //   emptyText: loading ? '加载中...' : '没有找到匹配的商品',
          // }}
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
        <CustomEditModal
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          onSubmit={handleEditSubmit}
          record={currentRecord}
        ></CustomEditModal>
      </div>
    </GoodsLayout>
  );
};

export default ListOfCommodities;
const CustomEditModal = ({ visible, onClose, onSubmit, record }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...record, ...values });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="编辑商品"
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="productName"
          label="商品名称"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="productCategory"
          label="商品分类"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['pricing', 'salePrice']}
          label="销售价"
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name={['inventory', 'currentStock']} label="当前库存">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name={['inventory', 'totalStock']} label="库存总数">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="商品状态">
          <Select>
            <Option value="onSale">在售</Option>
            <Option value="offSale">下架</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
