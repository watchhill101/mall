import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Tag, Progress, Carousel } from 'antd'
import { ArrowLeftOutlined, EnvironmentOutlined, ClockCircleOutlined, CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons'

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
        
        <Carousel {...carouselSettings} style={{ borderRadius: '8px', overflow: 'hidden' }}>
          {data.images.map((image, index) => (
            <div key={index}>
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
                {/* 模拟监控画面 */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `url(${image}) center/contain no-repeat`
                }}>
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
                  {index + 1} / {data.images.length}
                </div>
              </div>
            </div>
          ))}
        </Carousel>
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
    </div>
  )
}

export default LbtPage
