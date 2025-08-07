import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Tag, Progress, Carousel, Table, Image, Space, Modal, Form, Input, Select, Upload, message } from 'antd'
import { ArrowLeftOutlined, EnvironmentOutlined, ClockCircleOutlined, CheckCircleOutlined, DashboardOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'

const LbtPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // 从路由state中获取数据
  const pageData = location.state || {}
  const { type, title, centerData } = pageData

  // 默认数据（如果没有传递数据）
  const defaultData = {
    name: '默认指挥中心',
    value: '1240Mb',
    ranking: 1,
    totalCenters: 5,
    images: [
      '/1.jpg',
      '/2.jpg',
      '/3.jpg'
    ],
    description: '这是一个默认的指挥中心展示页面，展示了中心的基本信息和监控数据。',
    details: {
      location: '数据中心大楼',
      capacity: '1240Mb',
      status: '正常运行',
      uptime: '99.9%',
      lastUpdate: new Date().toLocaleString('zh-CN'),
      features: [
        '实时数据监控',
        '智能告警系统',
        '自动故障恢复',
        '24小时值守服务',
        '数据安全保障'
      ],
      performance: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        networkSpeed: 1200
      }
    }
  }

  const data = centerData || defaultData

  // 轮播图管理相关状态
  const [lbtData, setLbtData] = useState([
    {
      key: '1',
      name: '测试文字',
      image: '/1.jpg',
      jumpType: '指定页面',
      jumpPath: '/pages/new-services/new-services?id=4',
      status: '正常',
      order: 1,
      createTime: '2023-11-03 16:57:04'
    },
    {
      key: '2', 
      name: '测试文字',
      image: '/2.jpg',
      jumpType: '指定页面',
      jumpPath: '/pages/new-services/new-services?id=3',
      status: '下架',
      order: 0,
      createTime: '2023-11-03 16:57:04'
    },
    {
      key: '3',
      name: '测试文字', 
      image: '/3.jpg',
      jumpType: '商品',
      jumpPath: '路径名称路径名称名称',
      status: '正常',
      order: 0,
      createTime: '2023-11-03 16:57:04'
    }
  ])

  // 弹窗和表单状态
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()

  // 操作函数
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      name: record.name,
      jumpType: record.jumpType,
      jumpPath: record.jumpPath,
      status: record.status,
      order: record.order,
      image: record.image ? [{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: record.image
      }] : undefined
    })
    setIsModalVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除轮播图 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk() {
        setLbtData(prev => prev.filter(item => item.key !== record.key))
        message.success('删除成功')
      }
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = record.status === '正常' ? '下架' : '正常'
    setLbtData(prev => prev.map(item => 
      item.key === record.key 
        ? { ...item, status: newStatus }
        : item
    ))
    message.success(`已${newStatus === '正常' ? '启用' : '禁用'}`)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingRecord) {
        // 编辑模式
        const newImage = values.image?.[0]?.url || values.image?.[0]?.response?.url || editingRecord.image
        setLbtData(prev => prev.map(item => 
          item.key === editingRecord.key 
            ? { 
                ...item, 
                ...values,
                image: newImage
              }
            : item
        ))
        message.success('编辑成功')
      } else {
        // 新增模式
        const imageUrl = values.image?.[0]?.url || values.image?.[0]?.response?.url || `/${Math.floor(Math.random() * 3) + 1}.jpg`
        const newRecord = {
          key: Date.now().toString(),
          ...values,
          image: imageUrl,
          createTime: new Date().toLocaleString('zh-CN')
        }
        setLbtData(prev => [...prev, newRecord])
        message.success('新增成功')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingRecord(null)
  }

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    listType: 'picture-card',
    maxCount: 1,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!')
        return false
      }
      
      // 创建本地预览URL
      const reader = new FileReader()
      reader.onload = (e) => {
        // 模拟上传成功，创建本地预览
        file.url = e.target.result
        file.status = 'done'
        // 强制更新表单
        form.setFieldsValue({
          image: [file]
        })
      }
      reader.readAsDataURL(file)
      
      return false // 阻止自动上传，使用本地预览
    }
  }

  // 表格列配置
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ color: '#E2E8F0' }}>{text}</span>
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Image
          width={60}
          height={40}
          src={image}
          style={{ borderRadius: '4px' }}
          fallback="/api/placeholder/60/40"
        />
      )
    },
    {
      title: '跳转类型',
      dataIndex: 'jumpType',
      key: 'jumpType',
      render: (text) => <span style={{ color: '#E2E8F0' }}>{text}</span>
    },
    {
      title: '跳转路径',
      dataIndex: 'jumpPath',
      key: 'jumpPath',
      render: (text) => (
        <span style={{ 
          color: '#60A5FA',
          maxWidth: '200px',
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {text}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '正常' ? 'success' : 'error'}>
          {status}
        </Tag>
      )
    },
    {
      title: '序号',
      dataIndex: 'order',
      key: 'order',
      render: (text) => <span style={{ color: '#E2E8F0' }}>{text}</span>
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => <span style={{ color: '#E2E8F0' }}>{text}</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            style={{ color: '#60A5FA', padding: '0 4px' }}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={record.status === '正常' ? <EyeOutlined /> : <CheckCircleOutlined />}
            style={{ color: record.status === '正常' ? '#F59E0B' : '#10B981', padding: '0 4px' }}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '正常' ? '禁用' : '启用'}
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            style={{ color: '#EF4444', padding: '0 4px' }}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  // 返回首页
  const handleGoBack = () => {
    navigate('/')
  }

  // 轮播图自动播放控制
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    afterChange: (current) => setCurrentSlide(current)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
      padding: '20px'
    }}>
      {/* 返回按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleGoBack}
          size="large"
          style={{
            background: 'rgba(59, 130, 246, 0.8)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          返回首页
        </Button>
      </div>

      {/* 页面标题 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: '32px',
          fontWeight: 'bold',
          textShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
          marginBottom: '10px'
        }}>
          {data.name}
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
            排名: {data.ranking}/{data.totalCenters}
          </Tag>
          <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
            容量: {data.value}
          </Tag>
          <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>
            状态: {data.details.status}
          </Tag>
        </div>
      </div>

      {/* 轮播图区域 */}
      <Card 
        style={{
          marginBottom: '30px',
          background: 'rgba(45, 55, 72, 0.8)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <h3 style={{
          color: '#E2E8F0',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '18px'
        }}>
          监控大屏展示
        </h3>
        
        {lbtData.filter(item => item.status === '正常').length > 0 ? (
          <Carousel {...carouselSettings} style={{ borderRadius: '8px', overflow: 'hidden' }}>
            {lbtData.filter(item => item.status === '正常').map((item, index) => (
            <div key={item.key}>
              <div style={{
                height: '400px',
                background: `linear-gradient(45deg, 
                  rgba(59, 130, 246, 0.3) 0%, 
                  rgba(147, 51, 234, 0.3) 50%, 
                  rgba(236, 72, 153, 0.3) 100%
                )`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* 轮播图片 */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `url(${item.image}) center/contain no-repeat`
                }}>
                </div>
                
                {/* 图片标题覆盖层 */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {item.name}
                </div>
                
                {/* 轮播指示器 */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px'
                }}>
                  {index + 1} / {lbtData.filter(item => item.status === '正常').length}
                </div>
              </div>
            </div>
          ))}
          </Carousel>
        ) : (
          <div style={{
            height: '400px',
            background: 'rgba(55, 65, 82, 0.6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(129, 140, 248, 0.5)'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#9CA3AF'
            }}>
              <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div style={{ fontSize: '16px' }}>暂无轮播图</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>请添加状态为"正常"的轮播图</div>
            </div>
          </div>
        )}
      </Card>

      {/* 轮播图管理表格 */}
      <Card 
        style={{
          marginBottom: '30px',
          background: 'rgba(45, 55, 72, 0.8)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#E2E8F0',
            fontSize: '18px',
            margin: 0
          }}>
            轮播图管理
          </h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            新增
          </Button>
        </div>
        
        <Table 
          columns={columns}
          dataSource={lbtData}
          pagination={false}
          size="middle"
          style={{
            background: 'transparent'
          }}
          components={{
            header: {
              cell: (props) => (
                <th 
                  {...props} 
                  style={{
                    ...props.style,
                    background: 'rgba(55, 65, 82, 0.6)',
                    color: '#E2E8F0',
                    borderBottom: '1px solid rgba(129, 140, 248, 0.3)',
                    padding: '12px 16px'
                  }}
                />
              )
            },
            body: {
              cell: (props) => (
                <td 
                  {...props} 
                  style={{
                    ...props.style,
                    background: 'rgba(45, 55, 72, 0.3)',
                    borderBottom: '1px solid rgba(129, 140, 248, 0.2)',
                    padding: '12px 16px'
                  }}
                />
              )
            }
          }}
        />
      </Card>

      {/* 详细信息区域 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* 基本信息 */}
        <Card 
          title={
            <span style={{ color: '#E2E8F0', fontSize: '16px' }}>
              <EnvironmentOutlined style={{ marginRight: '8px', color: '#60A5FA' }} />
              基本信息
            </span>
          }
          style={{
            background: 'rgba(45, 55, 72, 0.8)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '12px'
          }}
          headStyle={{
            background: 'rgba(55, 65, 82, 0.6)',
            border: 'none'
          }}
          bodyStyle={{ background: 'transparent' }}
        >
          <div style={{ color: '#E2E8F0' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#60A5FA' }}>位置：</strong>
              {data.details.location}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#60A5FA' }}>运行状态：</strong>
              <Tag color="success" style={{ marginLeft: '8px' }}>
                <CheckCircleOutlined /> {data.details.status}
              </Tag>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#60A5FA' }}>运行时间：</strong>
              {data.details.uptime}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#60A5FA' }}>最后更新：</strong>
              <ClockCircleOutlined style={{ marginLeft: '8px', marginRight: '4px' }} />
              {data.details.lastUpdate}
            </div>
          </div>
        </Card>

        {/* 性能监控 */}
        <Card 
          title={
            <span style={{ color: '#E2E8F0', fontSize: '16px' }}>
              <DashboardOutlined style={{ marginRight: '8px', color: '#34D399' }} />
              性能监控
            </span>
          }
          style={{
            background: 'rgba(45, 55, 72, 0.8)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '12px'
          }}
          headStyle={{
            background: 'rgba(55, 65, 82, 0.6)',
            border: 'none'
          }}
          bodyStyle={{ background: 'transparent' }}
        >
          <div style={{ color: '#E2E8F0' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>CPU使用率</span>
                <span style={{ color: '#60A5FA' }}>{data.details.performance.cpuUsage}%</span>
              </div>
              <Progress 
                percent={data.details.performance.cpuUsage} 
                strokeColor="#60A5FA"
                trailColor="rgba(129, 140, 248, 0.2)"
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>内存使用率</span>
                <span style={{ color: '#34D399' }}>{data.details.performance.memoryUsage}%</span>
              </div>
              <Progress 
                percent={data.details.performance.memoryUsage} 
                strokeColor="#34D399"
                trailColor="rgba(129, 140, 248, 0.2)"
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>磁盘使用率</span>
                <span style={{ color: '#F59E0B' }}>{data.details.performance.diskUsage}%</span>
              </div>
              <Progress 
                percent={data.details.performance.diskUsage} 
                strokeColor="#F59E0B"
                trailColor="rgba(129, 140, 248, 0.2)"
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>网络速度</span>
                <span style={{ color: '#EF4444' }}>{data.details.performance.networkSpeed} Mb/s</span>
              </div>
              <div style={{
                background: 'rgba(129, 140, 248, 0.2)',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(data.details.performance.networkSpeed / 2000 * 100, 100)}%`,
                  height: '100%',
                  background: '#EF4444',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </Card>

        {/* 服务特性 */}
        <Card 
          title={
            <span style={{ color: '#E2E8F0', fontSize: '16px' }}>
              <CheckCircleOutlined style={{ marginRight: '8px', color: '#10B981' }} />
              服务特性
            </span>
          }
          style={{
            background: 'rgba(45, 55, 72, 0.8)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '12px'
          }}
          headStyle={{
            background: 'rgba(55, 65, 82, 0.6)',
            border: 'none'
          }}
          bodyStyle={{ background: 'transparent' }}
        >
          <div style={{ color: '#E2E8F0' }}>
            {data.details.features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px',
                background: 'rgba(129, 140, 248, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(129, 140, 248, 0.2)'
              }}>
                <CheckCircleOutlined style={{ 
                  color: '#10B981', 
                  marginRight: '10px',
                  fontSize: '16px'
                }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 详细描述 */}
        <Card 
          title={
            <span style={{ color: '#E2E8F0', fontSize: '16px' }}>
              📋 详细描述
            </span>
          }
          style={{
            background: 'rgba(45, 55, 72, 0.8)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '12px',
            gridColumn: 'span 2'
          }}
          headStyle={{
            background: 'rgba(55, 65, 82, 0.6)',
            border: 'none'
          }}
          bodyStyle={{ background: 'transparent' }}
        >
          <p style={{
            color: '#E2E8F0',
            lineHeight: '1.6',
            fontSize: '14px',
            margin: 0
          }}>
            {data.description}
          </p>
        </Card>
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑轮播图' : '新增轮播图'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确认"
        cancelText="取消"
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          content: { 
            background: 'rgba(45, 55, 72, 0.95)',
            borderRadius: '12px',
            border: '1px solid rgba(129, 140, 248, 0.3)'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="name"
            label={<span style={{ color: '#E2E8F0' }}>名称</span>}
            rules={[{ required: true, message: '请输入轮播图名称' }]}
          >
            <Input 
              placeholder="请输入轮播图名称"
              style={{
                background: 'rgba(55, 65, 82, 0.6)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: '#E2E8F0'
              }}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label={<span style={{ color: '#E2E8F0' }}>图片</span>}
          >
            <Upload {...uploadProps}>
              <div style={{ color: '#E2E8F0' }}>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="jumpType"
            label={<span style={{ color: '#E2E8F0' }}>跳转类型</span>}
            rules={[{ required: true, message: '请选择跳转类型' }]}
          >
            <Select 
              placeholder="请选择跳转类型"
              style={{
                color: '#E2E8F0'
              }}
              dropdownStyle={{
                background: 'rgba(45, 55, 72, 0.95)',
                border: '1px solid rgba(129, 140, 248, 0.3)'
              }}
            >
              <Select.Option value="指定页面">指定页面</Select.Option>
              <Select.Option value="商品">商品</Select.Option>
              <Select.Option value="文章">文章</Select.Option>
              <Select.Option value="外部链接">外部链接</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="jumpPath"
            label={<span style={{ color: '#E2E8F0' }}>跳转路径</span>}
            rules={[{ required: true, message: '请输入跳转路径' }]}
          >
            <Input 
              placeholder="请输入跳转路径"
              style={{
                background: 'rgba(55, 65, 82, 0.6)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: '#E2E8F0'
              }}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span style={{ color: '#E2E8F0' }}>状态</span>}
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select 
              placeholder="请选择状态"
              style={{
                color: '#E2E8F0'
              }}
              dropdownStyle={{
                background: 'rgba(45, 55, 72, 0.95)',
                border: '1px solid rgba(129, 140, 248, 0.3)'
              }}
            >
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="下架">下架</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="order"
            label={<span style={{ color: '#E2E8F0' }}>序号</span>}
            rules={[{ required: true, message: '请输入序号' }]}
          >
            <Input 
              type="number"
              placeholder="请输入序号"
              style={{
                background: 'rgba(55, 65, 82, 0.6)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                color: '#E2E8F0'
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LbtPage
