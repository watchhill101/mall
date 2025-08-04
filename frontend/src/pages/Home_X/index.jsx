import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { CloseOutlined, PieChartOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Dashboard from './Dashboard'
import './Dashboard.scss'

// 数字滚动动画组件
const AnimatedNumber = ({ targetValue, duration = 2000, formatter = (val) => val }) => {
  const [currentValue, setCurrentValue] = useState(0)

  React.useEffect(() => {
    let start = 0
    const startTime = Date.now()
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      
      // 使用缓动函数让动画更自然
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = start + (targetValue - start) * easeOutExpo
      
      setCurrentValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [targetValue, duration])

  return formatter(currentValue)
}

// 销售总额圆环图组件
const SalesOverviewChart = ({ visible, onClose }) => {
  const [isVisible, setIsVisible] = useState(visible)

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true)
    } else {
      // 延迟隐藏以显示动画
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!isVisible) return null;
    const chartOption = {
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicInOut',
    tooltip: {
      trigger: 'item',
      formatter: '{a}<br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    title: [],
    legend: {
      orient: 'horizontal',
      bottom: '2%',
      left: 'center',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 8
      },
      itemWidth: 5,
      itemHeight: 5,
      itemGap: 6,
      width: '90%'
    },
    series: [
      {
        name: '业务占比',
        type: 'pie',
        radius: ['28%', '48%'],
        center: ['30%', '40%'],
        avoidLabelOverlap: false,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        },
        label: {
          show: false,
          position: 'outside',
          formatter: '{b}: {d}%',
          textStyle: {
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold'
          }
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            formatter: '{d}%',
            position: 'outside',
            textStyle: {
              color: '#fff',
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowBlur: 2
            }
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        labelLine: {
          show: false,
          emphasis: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.9)',
              width: 2,
              type: 'solid'
            },
            length: 10,
            length2: 15
          }
        },
        data: [
          { value: 16.8, name: '西北地区', itemStyle: { color: '#1890ff' } },
          { value: 15.2, name: '华北地区', itemStyle: { color: '#13c2c2' } },
          { value: 12.7, name: '东北地区', itemStyle: { color: '#52c41a' } },
          { value: 18.3, name: '华东地区', itemStyle: { color: '#faad14' } },
          { value: 14.5, name: '华中地区', itemStyle: { color: '#f759ab' } },
          { value: 13.9, name: '华南地区', itemStyle: { color: '#fa8c16' } },
          { value: 8.6, name: '西南地区', itemStyle: { color: '#722ed1' } }
        ]
      }
    ]
  }

      return (
     <div className="sales-overview-chart" style={{
              position: 'fixed',
              top: '210px',
              left: '260px',
                    zIndex: 1000,
      width: '320px',
      height: '220px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '8px',
      padding: '10px',
      pointerEvents: 'auto',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
      transition: 'all 0.3s ease-in-out'
    }}>
            {/* 关闭按钮 */}
      <CloseOutlined 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10,
          padding: '4px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          e.target.style.color = '#fff'
          e.target.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          e.target.style.color = 'rgba(255, 255, 255, 0.8)'
          e.target.style.transform = 'scale(1)'
        }}
      />

      {/* 动画销售总额 */}
      <div style={{
        position: 'absolute',
        left: '70%',
        top: '35%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10
      }}>
        <div style={{
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          marginBottom: '4px'
        }}>
          <AnimatedNumber 
            targetValue={2545124.24} 
            duration={600000}
            formatter={(val) => `${val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}元`}
          />
        </div>
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '13px',
          fontWeight: 'normal'
        }}>
          销售总额
        </div>
      </div>


      
      <ReactECharts 
          option={chartOption}
          style={{ 
            height: '100%', 
            width: '100%'
          }}
          opts={{
            renderer: 'canvas'
          }}
          onEvents={{
            mouseover: (params) => {
              // 鼠标悬停时的效果
              if (params.componentType === 'series') {
                console.log(`悬停在${params.name}: ${params.percent}%`)
              }
            },
            mouseout: (params) => {
              // 鼠标离开时的效果
              if (params.componentType === 'series') {
                console.log(`离开${params.name}`)
              }
            }
          }}
        />
    </div>
  )
}

const Home = () => {
  const [chartVisible, setChartVisible] = useState(true)

  const handleCloseChart = () => {
    setChartVisible(false)
  }

  const handleShowChart = () => {
    setChartVisible(true)
  }

  return (
    <div style={{ position: 'relative' }}>
      <Dashboard />
      <SalesOverviewChart visible={chartVisible} onClose={handleCloseChart} />
      
      {/* 显示图表按钮 */}
      {!chartVisible && (
        <Button
          type="primary"
          icon={<PieChartOutlined />}
          onClick={handleShowChart}
          style={{
            position: 'fixed',
            top: '210px',
            left: '260px',
            zIndex: 1000,
            borderRadius: '8px',
            backgroundColor: 'rgba(24, 144, 255, 0.9)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInScale 0.3s ease-out',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.05)'
            e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          显示地区销售统计
        </Button>
      )}
    </div>
  )
}

export default Home
