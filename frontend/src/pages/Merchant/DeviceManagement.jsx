import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import MerchantLayout from './MerchantLayout';

const { Option } = Select;

const DeviceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();

  // 模拟设备数据
  const [devices, setDevices] = useState([
    {
      id: 1,
      deviceName: 'POS机001',
      deviceType: 'POS',
      deviceSN: 'POS20240001',
      merchantId: 'M001',
      merchantName: '张三便利店',
      status: 'online',
      lastOnlineTime: '2024-01-15 14:30:00',
      location: '北京市朝阳区建国路88号',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      deviceName: '扫码枪002',
      deviceType: 'Scanner',
      deviceSN: 'SC20240002',
      merchantId: 'M002',
      merchantName: '李四超市',
      status: 'offline',
      lastOnlineTime: '2024-01-14 16:45:00',
      location: '上海市浦东新区陆家嘴环路1000号',
      createTime: '2024-01-02 11:30:00'
    },
    {
      id: 3,
      deviceName: '收银机003',
      deviceType: 'Cashier',
      deviceSN: 'CS20240003',
      merchantId: 'M003',
      merchantName: '王五餐厅',
      status: 'maintenance',
      lastOnlineTime: '2024-01-13 09:20:00',
      location: '广州市天河区体育西路123号',
      createTime: '2024-01-03 09:15:00'
    }
  ]);

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      render: (type) => {
        const typeMap = {
          'POS': 'POS机',
          'Scanner': '扫码枪',
          'Cashier': '收银机'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '设备序列号',
      dataIndex: 'deviceSN',
      key: 'deviceSN',
    },
    {
      title: '所属商家',
      dataIndex: 'merchantName',
      key: 'merchantName',
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'online': { color: 'green', text: '在线' },
          'offline': { color: 'red', text: '离线' },
          'maintenance': { color: 'orange', text: '维护中' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '最后在线时间',
      dataIndex: 'lastOnlineTime',
      key: 'lastOnlineTime',
    },
    {
      title: '设备位置',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<SyncOutlined />}
            onClick={() => handleSync(record)}
          >
            同步
          </Button>
          <Popconfirm
            title="确定要删除这个设备吗？"
            onConfirm={() => handleDelete(record.id)}
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
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDevice(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingDevice(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (id) => {
    setDevices(devices.filter(device => device.id !== id));
    message.success('设备删除成功');
  };

  const handleSync = (record) => {
    setLoading(true);
    // 模拟同步操作
    setTimeout(() => {
      setLoading(false);
      message.success(`设备 ${record.deviceName} 同步成功`);
    }, 1000);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDevice) {
        // 编辑设备
        setDevices(devices.map(device => 
          device.id === editingDevice.id 
            ? { ...device, ...values }
            : device
        ));
        message.success('设备更新成功');
      } else {
        // 新增设备
        const newDevice = {
          id: Date.now(),
          ...values,
          status: 'offline',
          lastOnlineTime: new Date().toLocaleString(),
          createTime: new Date().toLocaleString()
        };
        setDevices([...devices, newDevice]);
        message.success('设备添加成功');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <MerchantLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>设备管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加设备
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          loading={loading}
          pagination={{
            total: devices.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
        />

        <Modal
          title={editingDevice ? '编辑设备' : '添加设备'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              deviceType: 'POS'
            }}
          >
            <Form.Item
              name="deviceName"
              label="设备名称"
              rules={[{ required: true, message: '请输入设备名称' }]}
            >
              <Input placeholder="请输入设备名称" />
            </Form.Item>

            <Form.Item
              name="deviceType"
              label="设备类型"
              rules={[{ required: true, message: '请选择设备类型' }]}
            >
              <Select placeholder="请选择设备类型">
                <Option value="POS">POS机</Option>
                <Option value="Scanner">扫码枪</Option>
                <Option value="Cashier">收银机</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="deviceSN"
              label="设备序列号"
              rules={[{ required: true, message: '请输入设备序列号' }]}
            >
              <Input placeholder="请输入设备序列号" />
            </Form.Item>

            <Form.Item
              name="merchantId"
              label="商家ID"
              rules={[{ required: true, message: '请输入商家ID' }]}
            >
              <Input placeholder="请输入商家ID" />
            </Form.Item>

            <Form.Item
              name="merchantName"
              label="商家名称"
              rules={[{ required: true, message: '请输入商家名称' }]}
            >
              <Input placeholder="请输入商家名称" />
            </Form.Item>

            <Form.Item
              name="location"
              label="设备位置"
              rules={[{ required: true, message: '请输入设备位置' }]}
            >
              <Input placeholder="请输入设备位置" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MerchantLayout>
  );
};

export default DeviceManagement;
